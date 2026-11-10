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
  const rLocal = noAmbiente ? resultadoLocal() : (resultadoLocal() || estado.res);   // calculado agora: o editor é montado antes do atualizar() geral
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

  // vão escolhido
  const tipoCt = ED.tipoConteudo(no), prat = (no.conteudo || []).find(c => c.tipo === 'prateleiras');
  preencherModelo(ed, {
    titulo: 'Vão ' + sel.num,
    medida: reg ? `${fmt(reg.x1 - reg.x0)} × ${fmt(reg.y1 - reg.y0)} mm (por dentro)` : '',
    rotLarg: 'Largura por dentro (mm ou auto)', rotAlt: 'Altura na frente (mm ou auto)',   // é assim que o núcleo lê cada uma (coluna: vão livre; faixa deitada: altura da frente)
    porta: no.frente?.tipo === 'porta', correr: no.frente?.tipo === 'correr',
    perfil: m.puxadorPorta?.modelo === 'perfil' && ['porta', '2portas', 'portas', 'correr'].includes(no.frente?.tipo),   // campo "Perfil na borda" só com o perfil G
    prateleiras: tipoCt === 'prateleiras', nPrat: prat ? prat.n : 0, podeRemover: false,
    ...(() => { const pa = info ? ED.pai(sel.cam) : null, n = pa ? info.divisao.partes.length : 0, v = info?.divisao.dir === 'v';
      return { podeAnt: !!pa && pa.i > 0, podeProx: !!pa && pa.i < n - 1, podeJuntar: !!pa && n > 1, rotAnt: v ? '← Esquerda' : '↓ De baixo', rotProx: v ? 'Direita →' : '↑ De cima' }; })(),
    gavetas: tipoCt === 'gavetas' || tipoCt === 'gavetas+botijao', botijao: tipoCt === 'gavetas+botijao',
    nGav: (no.conteudo || []).find(c => c.tipo === 'gavetas-internas')?.n ?? 0,
    sapateira: tipoCt === 'vassoura+sapateira', nSap: (() => { const s = (no.conteudo || []).find(c => c.sapateira)?.sapateira; return s?.max ? String(s.max) : 'máx'; })(),
    resumoMovel: espacos[0]?.divisao ? ED.resumoDivisao(espacos[0].no) : 'um vão só', resumoVao: `Vão ${sel.num}: ${ED.resumo(no)}`,
    dentroAmbiente: noAmbiente, nomeModulo: noAmbiente ? `M${estado.modAberto + 1} · ${estado.projeto.parametros.modulos[estado.modAberto].nome}` : '',
  });
  // espaços: mini desenho de frente (pedido do Nathan, 09/11) — um botão por vão na posição real; os textos (resumo) vão no preencherModelo acima
  const rNovo = rLocal, rDes = rNovo?.dims ? rNovo : estado.valido,   // calculado agora: o editor é montado antes do atualizar()
        mini = ed.querySelector('[data-lista="miniVaos"]');
  const L = rDes?.dims?.L, H = rDes?.dims?.H, regs = rDes?.vaos || [];
  const desenha = !!(L && H) && vaos.every(v => regs.some(x => x.caminho === v.cam));
  const botao = v => { const r = regs.find(x => x.caminho === v.cam);
    const b = el('button', { type:'button', class:'mini-vao', 'data-acao':'selecionar', 'data-cam':v.cam, title:`Vão ${v.num} · ${ED.resumo(v.no)}`, 'aria-label':`Vão ${v.num}: ${ED.resumo(v.no)}` }, String(v.num));
    if (v.cam === estado.vaoSel) b.setAttribute('aria-current', 'true');
    if (r && desenha) Object.assign(b.style, { left: r.x0 / L * 100 + '%', top: (H - r.y1) / H * 100 + '%', width: (r.x1 - r.x0) / L * 100 + '%', height: (r.y1 - r.y0) / H * 100 + '%' });
    return b; };
  mini.classList.toggle('mini-lista', !desenha);                       // sem o desenho (erro sem medidas): botões em fila
  if (desenha) mini.style.setProperty('--rw', (L / H).toFixed(4));
  // puxadores no mini desenho: um traço na posição real (para ver de que lado a porta abre)
  const marcas = desenha ? (rDes.pecas || []).filter(p => p.papel === 'puxador' && p.box && p.mov?.tipo === 'porta').map(p => { const d = el('span', { class:'mini-pux' });
    Object.assign(d.style, { left: p.box[0] / L * 100 + '%', top: (H - p.box[3]) / H * 100 + '%', width: Math.max(0.6, (p.box[1] - p.box[0]) / L * 100) + '%', height: Math.max(0.6, (p.box[3] - p.box[2]) / H * 100) + '%' }); return d; }) : [];
  mini.replaceChildren(...vaos.map(botao), ...marcas);

  // largura e altura do vão: cada campo mexe na divisão que manda naquela medida; sem divisão nessa direção, é a do móvel (só leitura)
  for (const [k, dir, rotulo] of [['larg', 'v', 'largura'], ['alt', 'h', 'altura']]) {
    const inp = ed.querySelector(`[data-vao="${k}"]`), md = ED.medidaNaDirecao(m, sel.cam, dir);
    if (md && md.nPartes > 1) { inp.value = md.parte.medida; inp.dataset.cam = md.cam; inp.title = md.cam === sel.cam ? '' : `Muda a ${rotulo} da parte de fora que contém este vão.`; }
    else { inp.value = ''; inp.disabled = true; inp.placeholder = `= ${rotulo} do móvel`; inp.title = `Este vão ocupa a ${rotulo} toda: mude a ${rotulo} do móvel em Medidas.`; }
  }
  // um campo por prateleira; o automático aparece como sugestão (posição calculada agora)
  if (prat) {
    const pecasVao = (rLocal?.pecas || []).filter(p => p.papel === 'prateleira' && reg && p.box[0] >= reg.x0 - 1 && p.box[1] <= reg.x1 + 1 && p.box[2] >= reg.y0 - 1 && p.box[3] <= reg.y1 + 1).sort((a, b) => a.box[2] - b.box[2]);
    ed.querySelector('[data-lista="alturasPrat"]').replaceChildren(...Array.from({ length:prat.n }, (_, k) => {
      const inp = el('input', { type:'number', inputmode:'decimal', placeholder: pecasVao[k] ? `auto (${Math.round(pecasVao[k].box[2] - reg.y0)})` : 'auto' });
      inp.dataset.vao = 'prat'; inp.dataset.k = k; const vv = prat.alturas?.[k]; if (vv) inp.value = vv;
      return el('label', { class:'ed-campo' }, `Prateleira ${k+1}`, inp);
    }));
  }
  const gavNo = (no.conteudo || []).find(c => c.tipo === 'gavetas-internas'), botNo = (no.conteudo || []).find(c => c.tipo === 'botijao');
  if (gavNo) ed.querySelector('[data-vao="altGav"]').value = gavNo.altura;
  if (botNo) ed.querySelector('[data-vao="altBot"]').value = botNo.altura;
  const sapNo = (no.conteudo || []).find(c => c.sapateira); if (sapNo) ed.querySelector('[data-vao="nivelSap"]').value = sapNo.sapateira.nivel;
  // campo "Puxador": o valor guardado continua sendo o lado da dobradiça (puxador à esquerda = dobradiça à direita);
  // no automático, o texto diz para que lado o puxador ficou
  const selLado = ed.querySelector('[data-vao="lado"]'); selLado.value = no.frente?.lado || 'auto';
  const regN = (rNovo?.vaos || []).find(r => r.caminho === sel.cam), portaVao = regN && (rNovo?.pecas || []).find(p => p.mov?.tipo === 'porta' && p.cat === 'frente' && p.box[0] >= regN.fx0 - 1 && p.box[1] <= regN.fx1 + 1 && p.box[2] >= regN.fy0 - 1 && p.box[3] <= regN.fy1 + 1);
  if (portaVao) selLado.options[0].textContent = `Automático (à ${portaVao.mov.lado === 'esq' ? 'direita' : 'esquerda'})`;
  ed.querySelector('[data-vao="abrirCorrer"]').value = no.frente?.abrir === 'dir' ? 'dir' : 'esq';
  ed.querySelector('[data-vao="perfil"]').value = no.frente?.perfil || 'auto';
  ed.querySelector('[data-vao="sistema"]').value = no.frente?.sistema || 'correr-rometal-dominus';
  const selCt = ed.querySelector('[data-vao="conteudo"]');
  selCt.replaceChildren(...CONTEUDOS_EDITOR.map(([v, r]) => el('option', { value:v }, r))); selCt.value = tipoCt;
  ed.querySelector('[data-lista="frentes"]').replaceChildren(...FRENTES_EDITOR.map(([v, r]) => {
    const b = modeloDe('tplOpcao').querySelector('button'); b.textContent = r; b.dataset.valor = v;
    b.setAttribute('aria-pressed', String(no.frente?.tipo === v)); return b;
  }));
  preencherAjustesEditor(ed, m);                                       // peças ajustadas (tela-ajuste.js)
  // "Construção e peças ajustadas" fica recolhido; abre sozinho se há peça ajustada e lembra se você abriu
  const mais = ed.querySelector('.ed-mais');
  if (mais) { mais.open = !!estado.edMaisAberto || Object.keys(m.pecasAjuste || {}).length > 0; mais.addEventListener('toggle', () => { estado.edMaisAberto = mais.open; }); }
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
  if (a.startsWith('ajuste-')) return;                                  // tela-ajuste.js cuida
  if (a === 'selecionar') { estado.vaoSel = b.dataset.cam; montarEditorModulo(); atualizarEsquema(); return; }
  mudarModulo(m => {
    if (a === 'frente') ED.definirFrente(m, cam, b.dataset.valor);
    if (a === 'prat-mais') ED.prateleiras(m, cam, 1);
    if (a === 'prat-menos') ED.prateleiras(m, cam, -1);
    if (a === 'gav-mais') ED.gavetas(m, cam, 1);
    if (a === 'gav-menos') ED.gavetas(m, cam, -1);
    if (a === 'sap-mais') ED.niveisSapateira(m, cam, 1);
    if (a === 'sap-menos') ED.niveisSapateira(m, cam, -1);
    if (a === 'dividir-v') ED.dividir(m, cam, 'v');
    if (a === 'dividir-h') ED.dividir(m, cam, 'h');
    if (a === 'remover' && ED.remover(m, cam)) estado.vaoSel = null;
    if (a === 'juntar-ant' || a === 'juntar-prox') {
      const dirV = ED.parte(m, cam)?.divisao.dir === 'v';
      const medidaAtual = c => { const r = ((TIPOS[estado.projeto.tipo].editor === 'ambiente' ? resultadoLocal() : estado.res)?.vaos || []).find(x => x.caminho === c); return r ? (dirV ? r.x1 - r.x0 : r.y1 - r.y0) : null; };
      if (ED.juntar(m, cam, a === 'juntar-ant' ? -1 : 1, medidaAtual)) estado.vaoSel = null;
    }
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
    if (k === 'puxador') { m.puxadorPorta = { ...PUXADORES[v], altura: m.puxadorPorta?.altura ?? 1050 }; m.puxadorGaveta = { ...PUXADORES[v] }; }   // o mesmo modelo nas portas e nas gavetas (o perfil de borda corre nas duas)
    if (k === 'materialFrentes') m.materiais = { ...m.materiais, frentes: v };
  });
  if (kv) mudarModulo(m => {
    const no = ED.no(m.raiz, cam);
    if (kv === 'larg' || kv === 'alt') ED.definirMedida(m, e.target.dataset.cam, v);
    if (kv === 'lado') no.frente.lado = v;
    if (kv === 'perfil') { if (v === 'auto') delete no.frente.perfil; else no.frente.perfil = v; }
    if (kv === 'sistema') no.frente.sistema = v;
    if (kv === 'abrirCorrer') { if (v === 'dir') no.frente.abrir = 'dir'; else delete no.frente.abrir; }
    if (kv === 'conteudo') ED.definirConteudo(m, cam, v);
    if (kv === 'prat') { const c = (no.conteudo || []).find(x => x.tipo === 'prateleiras'); if (c) { c.alturas = [...(c.alturas || [])]; c.alturas[Number(e.target.dataset.k)] = Number(v) > 0 ? Number(v) : null; } }
    if (kv === 'altGav') { const c = (no.conteudo || []).find(x => x.tipo === 'gavetas-internas'); if (c && Number(v) > 0) c.altura = Number(v); }
    if (kv === 'altBot') { const c = (no.conteudo || []).find(x => x.tipo === 'botijao'); if (c && Number(v) > 0) c.altura = Number(v); }
    if (kv === 'nivelSap') { const c = (no.conteudo || []).find(x => x.sapateira); if (c && Number(v) > 0) c.sapateira.nivel = Number(v); }
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
  // enquadra pelo módulo e por peças que saem dele (medida mudada à mão — 1c)
  const bx = r.pecas.filter(p => p.box && p.lista), xMin = Math.min(0, ...bx.map(p => p.box[0])), yMin = Math.min(0, ...bx.map(p => p.box[2]));
  const xMax = Math.max(r.dims.L, ...bx.map(p => p.box[1])), yMax = Math.max(r.dims.H, ...bx.map(p => p.box[3]));
  const L = xMax - xMin, H = yMax - yMin, margem = 32;
  const esc = Math.min((caixa.clientWidth - 2*margem) / L, (caixa.clientHeight - 2*margem) / H) || 0.25;
  const x0 = (caixa.clientWidth - L*esc) / 2 - xMin*esc, y0 = (caixa.clientHeight - H*esc) / 2;
  const ret = (b, cls) => { const d = el('div', { class: cls });
    Object.assign(d.style, { left: x0 + b[0]*esc + 'px', top: y0 + (yMax - b[3])*esc + 'px', width: (b[1] - b[0])*esc + 'px', height: (b[3] - b[2])*esc + 'px' }); return d; };
  const escondidas = ['porta', 'porta-correr', 'porta-basculante', 'fundo', 'emenda-fundo', 'travessa-fixacao'];
  const pecas = r.pecas.filter(p => p.box && p.lista && !escondidas.includes(p.papel)).sort((a, b) => a.box[5] - b.box[5]);
  const nos = pecas.map(p => ret(p.box, 'esq-peca esq-' + p.cat));
  const vaos = (r.vaos || []).map(v => {
    const b = ret([v.x0, v.x1, v.y0, v.y1], 'esq-vao'), bt = el('button', { type:'button', class:'esq-vao', 'aria-label':'Editar o vão ' + v.num, 'data-cam':v.caminho }, el('span', { text:'Vão ' + v.num }));
    bt.style.cssText = b.style.cssText; if (v.caminho === estado.vaoSel) bt.setAttribute('aria-current', 'true'); return bt;
  });
  const puxadores = r.pecas.filter(p => p.papel === 'puxador' && p.box).map(p => ret(p.box, 'esq-puxador'));   // mostra o lado do puxador (as portas não são desenhadas)
  caixa.replaceChildren(...nos, ...puxadores, ...vaos);
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
