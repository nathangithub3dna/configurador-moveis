/* =====================================================================
   5a. TELA DO MÓVEL LIVRE — liga a estrutura (modelos em pagina.html) à
   lógica (js/editor-modulo.js). Aqui só se preenche e se reage a cliques;
   aparência fica em estilos/editor.css.
   Também: abas das etapas (Montar, Lista de corte, Plano, Compras, Desenhos)
   e o esquema de frente onde se clica nos vãos.
   ===================================================================== */

// preenche [data-texto] com textos e mostra/esconde [data-se] conforme os dados
function preencherModelo(raiz, dados) {
  raiz.querySelectorAll('[data-texto]').forEach(e => { e.textContent = dados[e.dataset.texto] ?? ''; });
  raiz.querySelectorAll('[data-se]').forEach(e => { e.hidden = !dados[e.dataset.se]; });
}
function modeloDe(id) { return $(id).content.cloneNode(true); }

// o módulo que está sendo editado: o próprio projeto (móvel livre) ou um módulo aberto dentro do ambiente
function moduloEmEdicao() {
  const p = estado.projeto.parametros;
  return TIPOS[estado.projeto.tipo].editor === 'ambiente' ? (p.modulos?.[estado.modAberto]?.modulo || null) : p;
}
function montarEditorModulo() {
  const m = moduloEmEdicao(), ed = modeloDe('tplEditor'), noAmbiente = TIPOS[estado.projeto.tipo].editor === 'ambiente';
  const espacos = ED.espacos(m.raiz), vaos = espacos.filter(e => !e.divisao);
  if (!vaos.some(v => v.cam === estado.vaoSel)) estado.vaoSel = vaos[0]?.cam ?? '';
  const sel = vaos.find(v => v.cam === estado.vaoSel), no = sel.no, info = ED.parte(m, sel.cam);
  const rLocal = noAmbiente ? resultadoLocal() : estado.res;
  const reg = (rLocal?.vaos || []).find(r => r.caminho === sel.cam);

  // medidas e construção do módulo
  const valor = { largura:m.largura, altura:m.altura, profundidade:m.profundidade, beiral:m.construcao?.beiral ?? 0,
    metodo:m.metodo, entrega:m.entrega || 'desmontado', puxador:Object.keys(PUXADORES).find(k => PUXADORES[k].ref === m.puxadorPorta?.ref) || '1',
    materialFrentes:m.materiais?.frentes || 'mdf-ru-branco' };
  const opcoes = {
    metodo: Object.entries(METODOS_CONSTRUCAO.metodos).map(([k, v]) => [k, v.nome]),
    puxador: Object.entries(PUXADORES).map(([k, v]) => [k, v.rot]),
    materialFrentes: Object.entries(MATERIAIS).filter(([k]) => k.startsWith('mdf')).map(([k, v]) => [k, v.nome]),
  };
  ed.querySelectorAll('[data-modulo]').forEach(e => {
    const k = e.dataset.modulo;
    if (opcoes[k]) e.replaceChildren(...opcoes[k].map(([v, r]) => el('option', { value:v }, r)));
    e.value = valor[k];
  });

  // árvore de espaços
  ed.querySelector('[data-lista="espacos"]').replaceChildren(...espacos.map(e => {
    const li = modeloDe('tplEspaco'), b = li.querySelector('button');
    preencherModelo(li, e.divisao ? { nome: e.cam ? 'Divisão' : 'Móvel inteiro', desc: ED.resumoDivisao(e.no) } : { nome: 'Vão ' + e.num, desc: ED.resumo(e.no) });
    b.dataset.cam = e.cam; b.style.setProperty('--nivel', e.nivel);
    if (e.divisao) { b.disabled = true; b.classList.add('divisao'); }
    if (!e.divisao && e.cam === estado.vaoSel) b.setAttribute('aria-current', 'true');
    return li;
  }));

  // vão escolhido
  const tipoCt = ED.tipoConteudo(no), prat = (no.conteudo || []).find(c => c.tipo === 'prateleiras');
  preencherModelo(ed, {
    titulo: 'Vão ' + sel.num,
    medida: reg ? `${fmt(reg.x1 - reg.x0)} × ${fmt(reg.y1 - reg.y0)} mm (por dentro)` : '',
    temMedida: !!info, rotMedida: info?.divisao.dir === 'v' ? 'Largura (mm ou auto)' : 'Altura (mm ou auto)',
    porta: no.frente?.tipo === 'porta', correr: no.frente?.tipo === 'correr',
    prateleiras: tipoCt === 'prateleiras', nPrat: prat ? prat.n : 0, podeRemover: !!info,
    dentroAmbiente: noAmbiente, nomeModulo: noAmbiente ? `M${estado.modAberto + 1} · ${estado.projeto.parametros.modulos[estado.modAberto].nome}` : '',
  });
  const inpMed = ed.querySelector('[data-vao="medida"]'); if (info) inpMed.value = info.parte.medida;
  ed.querySelector('[data-vao="lado"]').value = no.frente?.lado || 'auto';
  ed.querySelector('[data-vao="sistema"]').value = no.frente?.sistema || 'correr-rometal-dominus';
  const selCt = ed.querySelector('[data-vao="conteudo"]');
  selCt.replaceChildren(...CONTEUDOS_EDITOR.map(([v, r]) => el('option', { value:v }, r))); selCt.value = tipoCt;
  ed.querySelector('[data-lista="frentes"]').replaceChildren(...FRENTES_EDITOR.map(([v, r]) => {
    const b = modeloDe('tplOpcao').querySelector('button'); b.textContent = r; b.dataset.valor = v;
    b.setAttribute('aria-pressed', String(no.frente?.tipo === v)); return b;
  }));
  $('form').replaceChildren(ed);
}

// toda mudança: altera o módulo, refaz o editor e as peças
function mudarModulo(fn) { fn(moduloEmEdicao()); montarFormulario(); atualizar(); }
// resultado só do módulo aberto (no ambiente, as peças do projeto são do ambiente todo)
function resultadoLocal() { const m = moduloEmEdicao(); try { return resultadoModulo(gerarModuloV3(m), m); } catch (e) { return null; } }
function ehModulo() { const ed = TIPOS[estado.projeto.tipo].editor; return ed === 'modulo' || (ed === 'ambiente' && !!moduloEmEdicao()); }   // funções (não const): a tela chama antes deste arquivo terminar de carregar

$('form').addEventListener('click', e => {
  const b = e.target.closest('[data-acao]'); if (!b || !ehModulo()) return;
  const cam = estado.vaoSel, a = b.dataset.acao;
  if (a === 'voltar-ambiente') return;                                 // tela-ambiente.js cuida
  if (a === 'selecionar') { estado.vaoSel = b.dataset.cam; montarEditorModulo(); atualizarEsquema(); return; }
  mudarModulo(m => {
    if (a === 'frente') ED.definirFrente(m, cam, b.dataset.valor);
    if (a === 'prat-mais') ED.prateleiras(m, cam, 1);
    if (a === 'prat-menos') ED.prateleiras(m, cam, -1);
    if (a === 'dividir-v') ED.dividir(m, cam, 'v');
    if (a === 'dividir-h') ED.dividir(m, cam, 'h');
    if (a === 'remover' && ED.remover(m, cam)) estado.vaoSel = null;
  });
});
$('form').addEventListener('change', e => {
  if (!ehModulo()) return;
  const k = e.target.dataset.modulo, kv = e.target.dataset.vao, v = e.target.value, cam = estado.vaoSel;
  if (k) mudarModulo(m => {
    if (['largura', 'altura', 'profundidade'].includes(k)) m[k] = Number(v);
    if (k === 'beiral') m.construcao = { ...m.construcao, beiral: Number(v) || 0 };
    if (k === 'metodo') { m.metodo = v; m.metodoAjustes = {}; }
    if (k === 'entrega') m.entrega = v;
    if (k === 'puxador') m.puxadorPorta = { ...PUXADORES[v], altura: m.puxadorPorta?.altura ?? 1050 };
    if (k === 'materialFrentes') m.materiais = { ...m.materiais, frentes: v };
  });
  if (kv) mudarModulo(m => {
    const no = ED.no(m.raiz, cam);
    if (kv === 'medida') ED.definirMedida(m, cam, v);
    if (kv === 'lado') no.frente.lado = v;
    if (kv === 'sistema') no.frente.sistema = v;
    if (kv === 'conteudo') ED.definirConteudo(m, cam, v);
  });
});

/* ---------- Esquema de frente (clicar nos vãos) ---------- */
estado.esquema = true;
function atualizarEsquema() {
  const caixa = $('esquema'), amb = TIPOS[estado.projeto.tipo].editor === 'ambiente', mod = ehModulo();
  $('grupoEsquema').hidden = !(mod || amb);
  caixa.hidden = !((mod || amb) && estado.esquema);
  $('palco').classList.toggle('com-esquema', !caixa.hidden);
  $('bEsquema').setAttribute('aria-pressed', String(estado.esquema)); $('b3D').setAttribute('aria-pressed', String(!estado.esquema));
  if (caixa.hidden) return;
  if (amb && !mod) { desenharPlanta(caixa); return; }                  // ambiente: planta vista de cima (js/tela-ambiente.js)
  const r = amb ? resultadoLocal() : (estado.res?.dims ? estado.res : estado.valido); if (!r?.dims) { caixa.replaceChildren(); return; }   // mesmo com erro, mostra os vãos para corrigir
  const L = r.dims.L, H = r.dims.H, margem = 32;
  const esc = Math.min((caixa.clientWidth - 2*margem) / L, (caixa.clientHeight - 2*margem) / H) || 0.25;
  const x0 = (caixa.clientWidth - L*esc) / 2, y0 = (caixa.clientHeight - H*esc) / 2;
  const ret = (b, cls) => { const d = el('div', { class: cls });
    Object.assign(d.style, { left: x0 + b[0]*esc + 'px', top: y0 + (H - b[3])*esc + 'px', width: (b[1] - b[0])*esc + 'px', height: (b[3] - b[2])*esc + 'px' }); return d; };
  const escondidas = ['porta', 'porta-correr', 'porta-basculante', 'fundo', 'emenda-fundo', 'travessa-fixacao'];
  const pecas = r.pecas.filter(p => p.box && p.lista && !escondidas.includes(p.papel)).sort((a, b) => a.box[5] - b.box[5]);
  const nos = pecas.map(p => ret(p.box, 'esq-peca esq-' + p.cat));
  const vaos = (r.vaos || []).map(v => {
    const b = ret([v.x0, v.x1, v.y0, v.y1], 'esq-vao'), bt = el('button', { type:'button', class:'esq-vao', 'aria-label':'Editar o vão ' + v.num, 'data-cam':v.caminho }, el('span', { text:'Vão ' + v.num }));
    bt.style.cssText = b.style.cssText; if (v.caminho === estado.vaoSel) bt.setAttribute('aria-current', 'true'); return bt;
  });
  caixa.replaceChildren(...nos, ...vaos);
}
$('esquema').addEventListener('click', e => {
  const b = e.target.closest('[data-cam]'); if (!b) return;
  estado.vaoSel = b.dataset.cam; montarEditorModulo(); atualizarEsquema();
});
$('bEsquema').addEventListener('click', () => { estado.esquema = true; atualizarEsquema(); });
$('b3D').addEventListener('click', () => { estado.esquema = false; atualizarEsquema(); });
new ResizeObserver(() => atualizarEsquema()).observe($('palco'));

/* ---------- Abas das etapas ---------- */
$('etapas').addEventListener('click', e => {
  const b = e.target.closest('[data-etapa]'); if (!b) return;
  document.querySelectorAll('#etapas [data-etapa]').forEach(x => x.toggleAttribute('aria-current', x === b));
  document.querySelectorAll('[data-secao]').forEach(s => { s.hidden = s.dataset.secao !== b.dataset.etapa; });
  if (b.dataset.etapa === 'montar') { redimensionar(); atualizarEsquema(); }
});
atualizarEsquema();
