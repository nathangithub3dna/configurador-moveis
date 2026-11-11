/* =====================================================================
   5a. EDITOR DO MÓVEL LIVRE — só a lógica (sem tela).
   Muda a árvore de vãos do módulo: dividir, juntar, frente, conteúdo, medida.
   Cada vão é achado pelo seu "caminho": '' é o móvel inteiro, '.0' a 1ª parte,
   '.1.2' a 3ª parte da 2ª parte, e assim por diante.
   ===================================================================== */
// listas do painel do vão: vêm das escolhas registradas (nucleo/registro.js, frentes/*.js, conteudos/*.js)
const FRENTES_EDITOR = escolhasDe('frente').map(e => [e.id, e.rotulo]);
const CONTEUDOS_EDITOR = escolhasDe('conteudo').filter(e => !e.legado).map(e => [e.id, e.rotulo]);
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
    if (info && info.divisao.dir === dir) { info.divisao.partes.splice(ED.pai(cam).i + 1, 0, { medida: 'auto', no: ED.copiaVao(no) }); return cam; }
    ED.trocar(m, cam, { tipo: 'dividir', dir, sep: 'divisoria', partes: [{ medida: 'auto', no }, { medida: 'auto', no: ED.copiaVao(no) }] });
    return cam + '.0';
  },
  // a parte nova de uma divisão nasce igual ao vão dividido (frente e conteúdo), para não perder o que já foi escolhido
  copiaVao(no) { return no?.tipo === 'vao' ? JSON.parse(JSON.stringify(no)) : ED.vaoNovo(); },
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
  // JUNTAR COM VIZINHO DE OUTRA COLUNA/FAIXA (10/11): a árvore é refeita a partir das posições dos vãos.
  // regs = vãos do resultado ({ caminho, x0, x1 (largura por dentro), y1 (altura por dentro no topo), fy0, fy1 (altura na frente) }).
  // Só junta quando a união é um retângulo (mesma altura lado a lado, ou mesma largura um sobre o outro).
  vizinhoGeo(regs, cam, lado, t) {
    const a = regs.find(r => r.caminho === cam); if (!a) return null;
    const perto = (u, v) => Math.abs(u - v) < 0.6, cola = (u, v) => perto(u, v) || perto(u + t, v);
    return regs.find(b => b !== a && (
      lado === 'dir' ? cola(a.x1, b.x0) && perto(a.fy0, b.fy0) && perto(a.fy1, b.fy1)
      : lado === 'esq' ? cola(b.x1, a.x0) && perto(a.fy0, b.fy0) && perto(a.fy1, b.fy1)
      : lado === 'cima' ? perto(a.fy1, b.fy0) && perto(a.x0, b.x0) && perto(a.x1, b.x1)
      : perto(b.fy1, a.fy0) && perto(a.x0, b.x0) && perto(a.x1, b.x1))) || null;
  },
  // refaz a árvore com os vãos `cam` e `camB` juntos (fica a frente e o conteúdo de `cam`); os outros vãos mantêm o que têm.
  // Medidas: em cada divisão nova, a maior parte fica "auto" e as outras com a medida que já tinham.
  juntarGeo(m, regs, cam, camB, t) {
    const A = regs.find(r => r.caminho === cam), B = regs.find(r => r.caminho === camB); if (!A || !B) return false;
    const folha = r => ({ x0:r.x0, x1:r.x1, y1:r.y1, fy0:r.fy0, fy1:r.fy1, no: JSON.parse(JSON.stringify(ED.no(m.raiz, r.caminho))) });
    const juntos = { x0:Math.min(A.x0, B.x0), x1:Math.max(A.x1, B.x1), fy0:Math.min(A.fy0, B.fy0), fy1:Math.max(A.fy1, B.fy1),
      y1: (A.fy1 >= B.fy1 ? A : B).y1, no: JSON.parse(JSON.stringify(ED.no(m.raiz, cam))) };
    const rects = regs.filter(r => r !== A && r !== B).map(folha).concat([juntos]);
    const perto = (u, v) => Math.abs(u - v) < 0.6, r1 = v => Math.round(v * 10) / 10;
    const montar = rs => {
      if (rs.length === 1) return rs[0].no;
      const comMedidas = (dir, grupos, sep) => { const tam = grupos.map(g => dir === 'v' ? Math.max(...g.map(r => r.x1)) - Math.min(...g.map(r => r.x0)) : Math.max(...g.map(r => r.fy1)) - Math.min(...g.map(r => r.fy0)));
        const maior = tam.indexOf(Math.max(...tam));
        return { tipo:'dividir', dir, sep, partes: grupos.map((g, i) => ({ medida: i === maior ? 'auto' : r1(tam[i]), no: montar(g) })) }; };
      // corte em pé: uma linha vertical que não atravessa nenhum vão
      const xs = [...new Set(rs.map(r => r.x1))].sort((u, v) => u - v).slice(0, -1).filter(c => rs.every(r => r.x1 <= c + 0.6 || r.x0 >= c - 0.6));
      if (xs.length) {
        const gap = c => Math.min(...rs.filter(r => r.x0 >= c - 0.6).map(r => r.x0)) - c, sep = gap(xs[0]) > t / 2 ? 'divisoria' : 'nenhum';
        const cortes = xs.filter(c => (gap(c) > t / 2) === (sep === 'divisoria'));
        const grupos = []; cortes.concat([Infinity]).reduce((ini, c) => { grupos.push(rs.filter(r => r.x0 >= ini - 0.6 && r.x1 <= c + 0.6)); return c + 0.1; }, -Infinity);
        return comMedidas('v', grupos.filter(g => g.length), sep);
      }
      // corte deitado: uma linha horizontal na frente que não atravessa nenhum vão
      const ys = [...new Set(rs.map(r => r.fy1))].sort((u, v) => u - v).slice(0, -1).filter(c => rs.every(r => r.fy1 <= c + 0.6 || r.fy0 >= c - 0.6));
      if (ys.length) {
        const sepDe = c => rs.filter(r => perto(r.fy1, c)).some(r => r.fy1 - r.y1 > t / 2) ? 'divisoria' : 'nenhum', sep = sepDe(ys[0]);
        const cortes = ys.filter(c => sepDe(c) === sep);
        const grupos = []; cortes.concat([Infinity]).reduce((ini, c) => { grupos.push(rs.filter(r => r.fy0 >= ini - 0.6 && r.fy1 <= c + 0.6)); return c + 0.1; }, -Infinity);
        return comMedidas('h', grupos.filter(g => g.length), sep);
      }
      return null;   // arrumação que não se faz só com divisórias inteiras
    };
    const nova = montar(rects); if (!nova) return false;
    m.raiz = nova; return true;
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
    const no = m.fachada || ED.no(m.raiz, cam), e = ESCOLHAS.frente[tipo];
    if (m.fachada && !FRENTES[tipo]?.fachada) return;
    if (e) e.aplicar(no, m); else no.frente = { tipo };
  },
  // a escolha de conteúdo que um vão já montado mostra: a primeira (por prioridade) que o reconhece
  tipoConteudo(no) {
    return Object.values(ESCOLHAS.conteudo).sort((a, b) => a.prioridade - b.prioridade).find(e => e.reconhece(no)).id;
  },
  definirConteudo(m, cam, tipo) {
    const no = ED.no(m.raiz, cam), e = ESCOLHAS.conteudo[tipo];
    if (e) e.aplicar(no, m); else no.conteudo = [];
  },
  // gavetas internas: no mínimo 1 (sem gaveta, escolha outro conteúdo)
  gavetas(m, cam, delta) {
    const c = (ED.no(m.raiz, cam).conteudo || []).find(x => x.tipo === 'gavetas-internas');
    if (c) c.n = Math.max(1, c.n + delta);
  },
  // níveis da sapateira: 0 = quantos couberem; menos que 0 não existe
  niveisSapateira(m, cam, delta) {
    const c = sapateiraDoVao(ED.no(m.raiz, cam));
    if (c) c.max = Math.max(0, (c.max || 0) + delta);
  },
  // divisórias em pé dentro do vão: no mínimo 1 (sem divisória, escolha outro conteúdo)
  divisorias(m, cam, delta) {
    const c = (ED.no(m.raiz, cam).conteudo || []).find(x => x.tipo === 'divisorias');
    if (c) c.n = Math.max(1, (c.n || 1) + delta);
  },
  prateleiras(m, cam, delta) {
    const c = (ED.no(m.raiz, cam).conteudo || []).find(x => x.tipo === 'prateleiras');
    if (c) c.n = Math.max(0, c.n + delta);
  },
  resumo(no, soInterior = false) {
    const fr = (FRENTES_EDITOR.find(f => f[0] === no.frente?.tipo) || ['', 'Nada'])[1];
    const t = ED.tipoConteudo(no), pr = (no.conteudo || []).find(x => x.tipo === 'prateleiras');
    const dv = (no.conteudo || []).find(x => x.tipo === 'divisorias');
    const ct = t === 'divisorias' ? `${dv.n} divisória${dv.n === 1 ? '' : 's'} em pé` : t === 'prateleiras' ? `${pr.n} prateleira${pr.n === 1 ? '' : 's'}` : (ESCOLHAS.conteudo[t]?.rotulo || '').toLowerCase();
    return soInterior ? ct : fr + ' · ' + ct;
  },
  resumoDivisao: no => `Dividido ${no.dir === 'v' ? 'em pé' : 'deitado'} em ${no.partes.length}`,
};
