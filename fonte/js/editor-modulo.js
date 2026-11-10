/* =====================================================================
   5a. EDITOR DO MÓVEL LIVRE — só a lógica (sem tela).
   Muda a árvore de vãos do módulo: dividir, juntar, frente, conteúdo, medida.
   Cada vão é achado pelo seu "caminho": '' é o móvel inteiro, '.0' a 1ª parte,
   '.1.2' a 3ª parte da 2ª parte, e assim por diante.
   ===================================================================== */
const FRENTES_EDITOR = [
  ['nenhuma', 'Nada'], ['porta', 'Porta'], ['2portas', '2 portas'],
  ['gaveta', 'Gaveta'], ['correr', 'Correr'], ['basculante', 'Abre p/ cima'],
];
const CONTEUDOS_EDITOR = [
  ['vazio', 'Vazio'], ['prateleiras', 'Prateleiras'], ['vassoura', 'Vassoura e aspirador'], ['vassoura+sapateira', 'Vassoura + sapateira'],
  ['gavetas', 'Gavetas internas'], ['gavetas+botijao', 'Botijão + gavetas'],
];
const ED = {
  indices: cam => cam.split('.').filter(Boolean).map(Number),
  no(raiz, cam) { return ED.indices(cam).reduce((n, i) => n.partes[i].no, raiz); },
  pai(cam) {
    const a = ED.indices(cam); if (!a.length) return null;
    const i = a.pop(); return { cam: a.map(x => '.' + x).join(''), i };
  },
  parte(m, cam) { const p = ED.pai(cam); return p ? { divisao: ED.no(m.raiz, p.cam), parte: ED.no(m.raiz, p.cam).partes[p.i] } : null; },
  trocar(m, cam, novo) {
    if (!cam) { m.raiz = novo; return; }
    const p = ED.pai(cam); ED.no(m.raiz, p.cam).partes[p.i].no = novo;
  },
  // lista para a árvore da tela: divisões e vãos, na mesma ordem em que o núcleo numera os vãos
  espacos(raiz) {
    const out = []; let k = 0;
    const ir = (n, cam, nivel) => {
      if (n.tipo === 'vao') { out.push({ cam, nivel, num: ++k, no: n }); return; }
      out.push({ cam, nivel, divisao: true, no: n });
      n.partes.forEach((p, i) => ir(p.no, cam + '.' + i, nivel + 1));
    };
    ir(raiz, '', 0); return out;
  },
  vaoNovo: () => ({ tipo: 'vao', frente: { tipo: 'porta', lado: 'auto' }, conteudo: [] }),
  // dividir: na mesma direção da divisão de fora, só ganha mais uma parte; senão vira uma divisão nova
  dividir(m, cam, dir) {
    const no = ED.no(m.raiz, cam), info = ED.parte(m, cam);
    if (info && info.divisao.dir === dir) { info.divisao.partes.splice(ED.pai(cam).i + 1, 0, { medida: 'auto', no: ED.vaoNovo() }); return; }
    ED.trocar(m, cam, { tipo: 'dividir', dir, sep: 'divisoria', partes: [{ medida: 'auto', no }, { medida: 'auto', no: ED.vaoNovo() }] });
  },
  // juntar com o vizinho: tira a parte; se sobrar uma só, a divisão some
  remover(m, cam) {
    const p = ED.pai(cam); if (!p) return false;
    const div = ED.no(m.raiz, p.cam); div.partes.splice(p.i, 1);
    if (div.partes.length === 1) ED.trocar(m, p.cam, div.partes[0].no);
    return true;
  },
  // juntar com o vizinho escolhido (lado -1 = esquerda/baixo, +1 = direita/cima): fica o conteúdo do vão escolhido.
  // Para os outros vãos não mudarem: o vão junto mede a soma dos dois mais a divisória que sai. Só fica "auto"
  // quando não sobra outro vão automático (aí ele absorve a sobra) ou quando não se sabe a medida atual.
  // medidaAtual(caminho) devolve a medida que o vão tem agora (a tela sabe; o editor não calcula geometria).
  juntar(m, cam, lado, medidaAtual = () => null) {
    const p = ED.pai(cam); if (!p) return false;
    const div = ED.no(m.raiz, p.cam), j = p.i + lado; if (j < 0 || j >= div.partes.length) return false;
    const a = div.partes[p.i], b = div.partes[j], t = div.sep === 'divisoria' ? (m.construcao?.espMDF ?? 18) : 0;
    const outrosAuto = div.partes.some((x, k) => k !== p.i && k !== j && x.medida === 'auto');
    const ma = a.medida !== 'auto' ? a.medida : medidaAtual(`${p.cam}.${p.i}`), mb = b.medida !== 'auto' ? b.medida : medidaAtual(`${p.cam}.${j}`);
    a.medida = a.medida !== 'auto' && b.medida !== 'auto' ? a.medida + b.medida + t
      : outrosAuto && ma > 0 && mb > 0 ? Math.round((ma + mb + t) * 10) / 10 : 'auto';
    div.partes.splice(j, 1);
    if (div.partes.length === 1) ED.trocar(m, p.cam, div.partes[0].no);
    return true;
  },
  // parte que manda na largura ('v') ou na altura ('h') deste vão: a divisão mais próxima nessa direção, subindo a árvore
  // (num vão deitado dentro de uma coluna, a largura é a da coluna). null = segue a medida do móvel
  medidaNaDirecao(m, cam, dir) {
    for (let c = cam; c; ) { const p = ED.pai(c), div = ED.no(m.raiz, p.cam);
      if (div.dir === dir) return { cam: c, parte: div.partes[p.i], nPartes: div.partes.length };
      c = p.cam; }
    return null;
  },
  definirMedida(m, cam, texto) {
    const info = ED.parte(m, cam); if (!info) return;
    const v = Number(String(texto).replace(',', '.'));
    info.parte.medida = String(texto).trim() === '' || /auto/i.test(texto) || !(v > 0) ? 'auto' : v;
  },
  definirFrente(m, cam, tipo) {
    const no = ED.no(m.raiz, cam);
    if (tipo === 'gaveta') no.conteudo = [];                       // gaveta de frente ocupa o espaço inteiro
    no.frente = tipo === 'porta' ? { tipo, lado: 'auto' } : tipo === 'correr' ? { tipo, sistema: 'correr-rometal-dominus', n: 'auto' } : { tipo };
  },
  tipoConteudo(no) {
    const t = (no.conteudo || []).map(c => c.tipo);
    if (t.includes('botijao')) return 'gavetas+botijao';
    if (t.includes('gavetas-internas')) return 'gavetas';
    if (t.includes('vassoura')) return (no.conteudo || []).some(c => c.sapateira) ? 'vassoura+sapateira' : 'vassoura';
    if (t.includes('prateleiras')) return 'prateleiras';
    return 'vazio';
  },
  definirConteudo(m, cam, tipo) {
    const no = ED.no(m.raiz, cam), P = TIPOS.armario.padrao;
    const gav = { tipo: 'gavetas-internas', n: P.gavetas, altura: P.alturaGaveta, recuo: 45, puxador: m.puxadorGaveta };
    const acima = { tipo: 'prateleiras-acima', n: P.pratAcimaGavetas, minLivre: 250 };
    no.conteudo = tipo === 'prateleiras' ? [{ tipo: 'prateleiras', n: 3, min: 150 }]
      : tipo === 'vassoura' ? [{ tipo: 'vassoura', alturaPrat: P.alturaPratVassoura }]
      : tipo === 'vassoura+sapateira' ? [{ tipo: 'vassoura', alturaPrat: P.alturaPratVassoura, sapateira: { nivel: P.alturaNivelSapateira, max: P.niveisSapateira } }]
      : tipo === 'gavetas' ? [gav, acima]
      : tipo === 'gavetas+botijao' ? [{ tipo: 'botijao', altura: P.alturaBotijao }, gav, acima] : [];
  },
  // gavetas internas: no mínimo 1 (sem gaveta, escolha outro conteúdo)
  gavetas(m, cam, delta) {
    const c = (ED.no(m.raiz, cam).conteudo || []).find(x => x.tipo === 'gavetas-internas');
    if (c) c.n = Math.max(1, c.n + delta);
  },
  // níveis da sapateira: 0 = quantos couberem; menos que 0 não existe
  niveisSapateira(m, cam, delta) {
    const c = (ED.no(m.raiz, cam).conteudo || []).find(x => x.sapateira);
    if (c) c.sapateira.max = Math.max(0, (c.sapateira.max || 0) + delta);
  },
  prateleiras(m, cam, delta) {
    const c = (ED.no(m.raiz, cam).conteudo || []).find(x => x.tipo === 'prateleiras');
    if (c) c.n = Math.max(0, c.n + delta);
  },
  resumo(no) {
    const fr = (FRENTES_EDITOR.find(f => f[0] === no.frente?.tipo) || ['', 'Nada'])[1];
    const t = ED.tipoConteudo(no), pr = (no.conteudo || []).find(x => x.tipo === 'prateleiras');
    const ct = t === 'prateleiras' ? `${pr.n} prateleira${pr.n === 1 ? '' : 's'}` : (CONTEUDOS_EDITOR.find(c => c[0] === t) || ['', ''])[1].toLowerCase();
    return fr + ' · ' + ct;
  },
  resumoDivisao: no => `Dividido ${no.dir === 'v' ? 'em pé' : 'deitado'} em ${no.partes.length}`,
};
