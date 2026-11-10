/* =====================================================================
   5b. TELA DO AMBIENTE — preenche os modelos de pagina.html (tplAmbiente…)
   e reage a cliques. A lógica fica em js/ambiente.js; a aparência em
   estilos/ambiente.css. A planta (vista de cima) usa a área do esquema.
   ===================================================================== */
estado.modAberto = null; estado.modSel = null;
function ehAmbiente() { return TIPOS[estado.projeto.tipo].editor === 'ambiente'; }
function paredesAtivas(a) { return a.formato === 'L' ? a.paredes.slice(0, 2) : a.paredes.slice(0, 1); }

function montarEditorAmbiente() {
  const a = estado.projeto.parametros, ed = modeloDe('tplAmbiente'), ps = paredesAtivas(a);
  const NOME_LINHA = { inferior:'inferior', aereo:'aéreo', torre:'torre' };
  const opParedes = () => ps.map((p, i) => el('option', { value:i }, 'Parede ' + p.nome));
  ed.querySelector('[data-amb="formato"]').value = a.formato;
  const selAdd = ed.querySelector('[data-amb="paredeAdd"]'); selAdd.replaceChildren(...opParedes()); selAdd.value = Math.min(estado.paredeAdd || 0, ps.length - 1);
  ed.querySelector('[data-amb="tampoEsp"]').value = a.tampo.esp; ed.querySelector('[data-amb="tampoBalanco"]').value = a.tampo.balanco;
  ed.querySelector('[data-lista="paredes"]').replaceChildren(...ps.map((p, i) => {
    const t = modeloDe('tplParede'); preencherModelo(t, { nome: 'Parede ' + p.nome + (i === 0 ? ' (fundo)' : ' (lado esquerdo, a 90°)') });
    t.querySelectorAll('[data-parede]').forEach(e => { e.value = p[e.dataset.parede]; e.dataset.i = i; }); return t;
  }));
  ed.querySelector('[data-lista="modulos"]').replaceChildren(...a.modulos.map((m, i) => {
    const t = modeloDe('tplModuloAmb'), item = t.querySelector('.amb-item');
    preencherModelo(t, { nome: `M${i + 1} · ${m.nome}`, onde: `parede ${ps[m.parede]?.nome || '?'} · ${NOME_LINHA[m.linha]} · ${m.modulo.largura} × ${m.modulo.altura} × ${m.modulo.profundidade}` });
    t.querySelectorAll('[data-mod]').forEach(e => { e.value = e.dataset.mod === 'largura' ? m.modulo.largura : m[e.dataset.mod]; });
    t.querySelectorAll('[data-mod],[data-acao]').forEach(e => e.dataset.i = i);
    if (estado.modSel === i) item.setAttribute('aria-current', 'true');
    return t;
  }));
  ed.querySelector('[data-lista="pontos"]').replaceChildren(...a.pontos.map((p, i) => {
    const t = modeloDe('tplPonto'); t.querySelector('[data-ponto="parede"]').replaceChildren(...opParedes());
    t.querySelectorAll('[data-ponto],[data-acao]').forEach(e => { e.dataset.i = i; if (e.dataset.ponto) e.value = p[e.dataset.ponto]; }); return t;
  }));
  montarLivres(ed, a, ps);
  $('form').replaceChildren(ed);
}

/* ---------- 1b. Peças livres (lógica em js/livres.js) ---------- */
estado.livreSel = null; estado.grpDelta = {};
// medidas iniciais de cada função (o Nathan ajusta depois)
const LIVRE_PADRAO = {
  'painel':             { comp:900,  larg:2400, esp:18, apoio:'frente',  pos:{ parede:0, x:0, y:0, afast:0 },      fita:{ C1:1, C2:1, L1:1, L2:1 } },
  'forro':              { comp:900,  larg:600,  esp:18, apoio:'deitada', pos:{ parede:0, x:0, y:2400, afast:0 },   fita:{ C2:1, L1:1, L2:1 } },
  'cortineiro':         { comp:1200, larg:150,  esp:18, apoio:'frente',  pos:{ parede:0, x:0, y:2300, afast:150 }, fita:{ C1:1 } },
  'tamponamento':       { comp:580,  larg:850,  esp:18, apoio:'lado',    pos:{ parede:0, x:0, y:0, afast:0 },      fita:{ C2:1, L2:1 } },
  'lateral-acabamento': { comp:580,  larg:850,  esp:18, apoio:'lado',    pos:{ parede:0, x:0, y:0, afast:0 },      fita:{ C2:1, L2:1 } },
  'tampo-mesa':         { comp:1200, larg:700,  esp:25, apoio:'deitada', pos:{ solta:true, x:500, y:735, z:1000 }, fita:{ C1:1, C2:1, L1:1, L2:1 } },
  'pe-painel':          { comp:700,  larg:735,  esp:25, apoio:'lado',    pos:{ solta:true, x:500, y:0, z:1000 },   fita:{ C2:1, L1:1, L2:1 } },
  'prateleira-parede':  { comp:800,  larg:250,  esp:18, apoio:'deitada', pos:{ parede:0, x:0, y:1600, afast:0 },   fita:{ C2:1, L1:1, L2:1 } },
  'bancada':            { comp:1200, larg:400,  esp:25, apoio:'deitada', pos:{ parede:0, x:0, y:900, afast:0 },    fita:{ C2:1, L1:1, L2:1 } },
  'peca-generica':      { comp:600,  larg:400,  esp:18, apoio:'frente',  pos:{ solta:true, x:500, y:0, z:1000 },   fita:{} },
};
function novaLivre(funcao) {
  const P = LIVRE_PADRAO[funcao] || LIVRE_PADRAO['peca-generica'];
  return { funcao, nome:'', grupo:'', comp:P.comp, larg:P.larg, esp:P.esp, mat:'mdf-branco', veio:null, fita:{ ...P.fita }, apoio:P.apoio,
    pos:{ ...P.pos }, giro:[0, 0, 0], recortes:[], furos:[], ferragens:[{ ref:'paraf-50x60-bucha', qtd:2 }] };
}
// nome de cada borda conforme a peça nasce (antes do giro): C = bordas da medida 1, L = bordas da medida 2
function nomesFita(lv) {
  const solta = !!lv.pos?.solta, b = lv.pos?.parede === 1;
  const ini = solta ? 'esquerda' : (b ? 'direita (lado do canto)' : 'esquerda (lado do canto)'), fim = solta ? 'direita' : (b ? 'esquerda' : 'direita');
  if (lv.apoio === 'frente') return { C1:'de baixo', C2:'de cima', L1:ini, L2:fim };
  if (lv.apoio === 'lado')   return { C1:'de baixo', C2:'de cima', L1:'de trás', L2:'da frente' };
  return { C1:'de trás', C2:'da frente', L1:ini, L2:fim };
}
function gruposDe(a) { return [...new Set((a.livres || []).map(l => (l.grupo || '').trim()).filter(Boolean))]; }   // função (não const): ao abrir com um Ambiente guardado, a tela chama antes deste arquivo terminar de carregar

function montarLivres(ed, a, ps) {
  const livres = a.livres || [], res = estado.res;
  const selF = ed.querySelector('[data-amb="funcaoAdd"]');
  selF.replaceChildren(...Object.entries(FUNCOES_LIVRE).map(([k, v]) => el('option', { value:k }, v))); selF.value = estado.funcaoAdd || 'painel';
  const opMat = () => Object.entries(MATERIAIS).filter(([k]) => /^(mdf|hdf)/.test(k)).map(([k, v]) => el('option', { value:k }, v.nome));
  const opFer = () => Object.entries(BIBLIOTECA).filter(([k, b]) => b.unid !== 'chapa' && !b.metro && !/^fita-/.test(k)).map(([k, b]) => el('option', { value:k }, b.nome));
  const grupos = gruposDe(a);
  ed.append(el('datalist', { id:'listaGrupos' }, ...grupos.map(g => el('option', { value:g }))));
  ed.querySelector('[data-lista="livres"]').replaceChildren(...livres.map((lv, i) => {
    const t = modeloDe('tplLivre'), aberta = estado.livreSel === i, solta = !!lv.pos?.solta, pos = lv.pos || {};
    const nome = lv.nome || FUNCOES_LIVRE[lv.funcao] || 'Peça livre', onde = solta ? 'solta' : 'parede ' + (ps[pos.parede || 0]?.nome || '?');
    const giro = (lv.giro || []).some(g => Number(g)) ? ' · girada' : '';
    preencherModelo(t, { titulo:`L${i + 1} · ${nome}`, resumo:`${lv.comp} × ${lv.larg} × ${lv.esp} · ${onde}${giro}${lv.grupo ? ' · grupo ' + lv.grupo : ''}`,
      botaoEditar: aberta ? 'Fechar' : 'Editar', aberta, comVeio: !!MATERIAIS[lv.mat]?.veio, naParede: !solta, solta,
      ajudaPos: solta ? 'X ao longo da parede A, Z saindo dela, a partir do canto das paredes; vale o canto da peça mais perto do canto, antes do giro.' : 'Canto da peça do lado do canto, embaixo e junto à parede, antes do giro.' });
    const item = t.querySelector('.amb-item'); if (aberta) item.setAttribute('aria-current', 'true');
    t.querySelector('[data-livre="funcao"]').replaceChildren(...Object.entries(FUNCOES_LIVRE).map(([k, v]) => el('option', { value:k }, v)));
    t.querySelector('[data-livre="mat"]').replaceChildren(...opMat());
    t.querySelector('[data-livre="onde"]').replaceChildren(...ps.map((p, k) => el('option', { value:String(k) }, 'Parede ' + p.nome)), el('option', { value:'solta' }, 'Solta no ambiente'));
    const val = { nome:lv.nome || '', funcao:lv.funcao, grupo:lv.grupo || '', comp:lv.comp, larg:lv.larg, esp:lv.esp, mat:lv.mat, veio:lv.veio === 'larg' ? 'larg' : 'comp', apoio:lv.apoio || 'deitada',
      onde: solta ? 'solta' : String(pos.parede || 0), x:pos.x ?? 0, y:pos.y ?? 0, afast:pos.afast ?? 0, sx:pos.x ?? 0, sy:pos.y ?? 0, sz:pos.z ?? 0,
      gx:lv.giro?.[0] || 0, gy:lv.giro?.[1] || 0, gz:lv.giro?.[2] || 0 };
    t.querySelectorAll('[data-livre]').forEach(e => { e.value = val[e.dataset.livre]; });
    const nf = nomesFita(lv);
    t.querySelector('[data-lista="fita"]').replaceChildren(...['C1', 'C2', 'L1', 'L2'].map(k => el('label', { class:'amb-check' },
      el('input', { type:'checkbox', 'data-fita':k, checked: Number(lv.fita?.[k]) > 0 }), (k[0] === 'C' ? 'Medida 1, ' : 'Medida 2, ') + nf[k])));
    t.querySelector('[data-lista="recortes"]').replaceChildren(...(lv.recortes || []).map((r, j) => {
      const s = modeloDe('tplLivreRec'); s.querySelectorAll('[data-rec],[data-acao]').forEach(e => { e.dataset.j = j; if (e.dataset.rec) e.value = r[e.dataset.rec]; }); return s; }));
    t.querySelector('[data-lista="furos"]').replaceChildren(...(lv.furos || []).map((f, j) => {
      const s = modeloDe('tplLivreFuro'); s.querySelectorAll('[data-furo],[data-acao]').forEach(e => { e.dataset.j = j; if (e.dataset.furo) e.value = f[e.dataset.furo] ?? 0; }); return s; }));
    t.querySelector('[data-lista="ferragens"]').replaceChildren(...(lv.ferragens || []).map((f, j) => {
      const s = modeloDe('tplLivreFer'); s.querySelector('[data-fer="ref"]').replaceChildren(...opFer());
      s.querySelectorAll('[data-fer],[data-acao]').forEach(e => { e.dataset.j = j; if (e.dataset.fer) e.value = f[e.dataset.fer]; }); return s; }));
    t.querySelectorAll('[data-livre],[data-fita],[data-rec],[data-furo],[data-fer],[data-acao]').forEach(e => e.dataset.i = i);
    return t;
  }));
  ed.querySelector('[data-lista="grupos"]').replaceChildren(...grupos.map(g => {
    const t = modeloDe('tplGrupo'), n = livres.filter(l => (l.grupo || '').trim() === g).length, d = estado.grpDelta[g] || [0, 0, 0];
    preencherModelo(t, { titulo:'Grupo ' + g, pecas:`${n} peça${n > 1 ? 's' : ''} · X ao longo da parede A, Y para cima, Z saindo da parede A` });
    t.querySelectorAll('[data-gdelta],[data-acao]').forEach(e => { e.dataset.g = g; if (e.dataset.gdelta) e.value = d[Number(e.dataset.gdelta)]; });
    return t;
  }));
}
// move uma peça livre em coordenadas do ambiente (X ao longo da A, Y para cima, Z saindo da A), na regra de cada parede
function moverLivre(lv, [dx, dy, dz]) {
  const p = lv.pos = { ...(lv.pos || { parede:0, x:0, y:0, afast:0 }) };
  p.y = (Number(p.y) || 0) + dy;
  if (p.solta) { p.x = (Number(p.x) || 0) + dx; p.z = (Number(p.z) || 0) + dz; }
  else if ((p.parede || 0) === 0) { p.x = (Number(p.x) || 0) + dx; p.afast = (Number(p.afast) || 0) + dz; }
  else { p.x = (Number(p.x) || 0) + dz; p.afast = (Number(p.afast) || 0) + dx; }   // parede B corre em Z a partir do canto; o afastamento é em X
}
// largura em X que a peça (ou o grupo) ocupa no ambiente — para a cópia nascer ao lado
function larguraX(idx) {
  const bs = (estado.res?.pecas || []).filter(p => p.cat === 'livre' && idx.includes(p.livre)).map(p => p.box);
  return bs.length ? Math.max(...bs.map(b => b[1])) - Math.min(...bs.map(b => b[0])) : 100;
}
function nomeGrupoNovo(a, g) { let k = 2; while (gruposDe(a).includes(`${g} ${k}`)) k++; return `${g} ${k}`; }
function trocarOnde(lv, v) {
  const p = lv.pos || { parede:0, x:0, y:0, afast:0 };
  const mundo = p.solta ? [p.x || 0, p.y || 0, p.z || 0] : (p.parede || 0) === 0 ? [p.x || 0, p.y || 0, p.afast || 0] : [p.afast || 0, p.y || 0, p.x || 0];
  if (v === 'solta') lv.pos = { solta:true, x:mundo[0], y:mundo[1], z:mundo[2] };
  else if (v === '0') lv.pos = { parede:0, x:mundo[0], y:mundo[1], afast:mundo[2] };
  else lv.pos = { parede:Number(v), x:mundo[2], y:mundo[1], afast:mundo[0] };
  if ((p.parede === 1 && !p.solta) !== (v === '1')) toast('Na parede B a peça nasce virada 90°: confira o giro.');
}
function acaoLivre(amb, a, i, j, g) {
  amb.livres = amb.livres || [];
  const L = amb.livres, lv = L[i];
  if (a === 'add-livre') { const f = estado.funcaoAdd || 'painel'; L.push(novaLivre(f)); estado.livreSel = L.length - 1; return true; }
  if (a === 'dup-livre') { const c = JSON.parse(JSON.stringify(lv)); moverLivre(c, [larguraX([i]), 0, 0]); L.splice(i + 1, 0, c); estado.livreSel = i + 1; return true; }
  if (a === 'rem-livre') { L.splice(i, 1); estado.livreSel = null; return true; }
  if (a === 'add-rec') { (lv.recortes = lv.recortes || []).push({ u:0, v:0, w:100, h:100 }); return true; }
  if (a === 'rem-rec') { lv.recortes.splice(j, 1); return true; }
  if (a === 'add-furo') { (lv.furos = lv.furos || []).push({ u:50, v:50, d:8, prof:0 }); return true; }
  if (a === 'rem-furo') { lv.furos.splice(j, 1); return true; }
  if (a === 'add-fer') { (lv.ferragens = lv.ferragens || []).push({ ref:'paraf-50x60-bucha', qtd:2 }); return true; }
  if (a === 'rem-fer') { lv.ferragens.splice(j, 1); return true; }
  if (a === 'mover-grupo') { const d = (estado.grpDelta[g] || [0, 0, 0]).map(Number); L.filter(l => (l.grupo || '').trim() === g).forEach(l => moverLivre(l, d)); estado.grpDelta[g] = [0, 0, 0]; return true; }
  if (a === 'dup-grupo') {
    const idx = L.map((l, k) => [l, k]).filter(([l]) => (l.grupo || '').trim() === g).map(([, k]) => k), novo = nomeGrupoNovo(amb, g), dx = larguraX(idx) + 100;
    idx.forEach(k => { const c = JSON.parse(JSON.stringify(L[k])); c.grupo = novo; moverLivre(c, [dx, 0, 0]); L.push(c); }); return true;
  }
  return false;
}
function mudarLivre(amb, d, t) {
  const lv = amb.livres[Number(d.i)], v = t.value, n = v === '' ? 0 : Number(v);
  if (d.livre) {
    const k = d.livre;
    if (k === 'nome' || k === 'grupo') lv[k] = v.trim();
    else if (k === 'funcao' || k === 'mat' || k === 'apoio') lv[k] = v;
    else if (k === 'veio') lv.veio = v;
    else if (k === 'onde') trocarOnde(lv, v);
    else if (k === 'comp' || k === 'larg' || k === 'esp') lv[k] = n;
    else if (k === 'gx' || k === 'gy' || k === 'gz') { lv.giro = [0, 1, 2].map(q => Number(lv.giro?.[q]) || 0); lv.giro['xyz'.indexOf(k[1])] = n; }
    else { const p = lv.pos = { ...(lv.pos || {}) }, campo = { sx:'x', sy:'y', sz:'z' }[k] || k; p[campo] = n; }
  }
  if (d.fita) { lv.fita = { ...(lv.fita || {}) }; lv.fita[d.fita] = t.checked ? 1 : 0; }
  if (d.rec) lv.recortes[Number(d.j)][d.rec] = n;
  if (d.furo) lv.furos[Number(d.j)][d.furo] = n;
  if (d.fer) lv.ferragens[Number(d.j)][d.fer] = d.fer === 'ref' ? v : n;
}
function selecionarLivre(i, abrirSempre) {
  estado.livreSel = abrirSempre || estado.livreSel !== i ? i : null; estado.modSel = null;
  montarFormulario(); atualizarEsquema();
  if (estado.livreSel !== null) requestAnimationFrame(() => document.querySelector(`#form .amb-livre[aria-current]`)?.scrollIntoView({ block:'nearest' }));
}

function mudarAmbiente(fn) { fn(estado.projeto.parametros); montarFormulario(); atualizar(); }

$('form').addEventListener('click', e => {
  const b = e.target.closest('[data-acao]'); if (!b || !ehAmbiente()) return;
  const a = b.dataset.acao, i = Number(b.dataset.i);
  if (a === 'voltar-ambiente') { estado.modAberto = null; montarFormulario(); atualizarEsquema(); return; }
  if (moduloEmEdicao()) return;                                         // dentro de um módulo: quem cuida é tela/paineis/modulo.js
  if (a === 'abrir') { estado.modAberto = i; estado.modSel = i; estado.vaoSel = null; montarFormulario(); atualizarEsquema(); return; }
  if (a === 'sel-livre') { selecionarLivre(i); return; }
  mudarAmbiente(amb => {
    if (acaoLivre(amb, a, i, Number(b.dataset.j), b.dataset.g)) return;
    if (a === 'add') { const p = Number(estado.paredeAdd || 0), k = b.dataset.modelo;
      amb.modulos.push(AMB.novoModulo(k, p, AMB.proximoX(amb, p, MODELOS_AMBIENTE[k].linha))); estado.modSel = amb.modulos.length - 1; }
    if (a === 'remover-mod') { amb.modulos.splice(i, 1); estado.modSel = null; }
    if (a === 'add') estado.livreSel = null;
    if (a === 'add-ponto') amb.pontos.push({ tipo:'tomada', parede:0, x:500, altura:1100 });
    if (a === 'remover-ponto') amb.pontos.splice(i, 1);
  });
});
$('form').addEventListener('change', e => {
  if (!ehAmbiente() || moduloEmEdicao()) return;
  const t = e.target, d = t.dataset, v = t.value, i = Number(d.i), n = Number(v);
  if (d.amb === 'paredeAdd') { estado.paredeAdd = n; return; }
  if (d.amb === 'funcaoAdd') { estado.funcaoAdd = v; return; }
  if (d.gdelta !== undefined) { (estado.grpDelta[d.g] = estado.grpDelta[d.g] || [0, 0, 0])[Number(d.gdelta)] = n || 0; return; }
  mudarAmbiente(amb => {
    if (d.livre || d.fita || d.rec || d.furo || d.fer) { mudarLivre(amb, d, t); return; }
    if (d.amb === 'formato') amb.formato = v;
    if (d.amb === 'tampoEsp') amb.tampo.esp = n;
    if (d.amb === 'tampoBalanco') amb.tampo.balanco = n;
    if (d.parede) amb.paredes[i][d.parede] = n;
    if (d.mod === 'largura') amb.modulos[i].modulo.largura = n;
    else if (d.mod) amb.modulos[i][d.mod] = n;
    if (d.ponto) amb.pontos[i][d.ponto] = d.ponto === 'tipo' ? v : n;
  });
});
$('tipoMovel').addEventListener('change', () => { estado.modAberto = null; estado.modSel = null; montarFormulario(); atualizarEsquema(); });

/* ---------- Planta (vista de cima): paredes, módulos e pontos; clique escolhe o módulo ---------- */
function desenharPlanta(caixa) {
  const a = estado.projeto.parametros, ps = paredesAtivas(a), L = a.formato === 'L';
  const livres = contornosLivres();
  const maxX = Math.max(ps[0].comprimento, ...a.modulos.filter(m => m.parede === 1).map(m => m.modulo.profundidade), ...livres.flatMap(l => l.pts.map(q => q[0]))) + 200;
  const maxZ = Math.max(L ? ps[1].comprimento : Math.max(700, ...a.modulos.map(m => m.modulo.profundidade)), ...livres.flatMap(l => l.pts.map(q => q[1]))) + 200;
  const margem = 40, esc = Math.min((caixa.clientWidth - 2*margem) / maxX, (caixa.clientHeight - 2*margem) / maxZ) || 0.15;
  const ox = margem + 120*esc, oz = margem + 120*esc;
  const ret = (x0, x1, z0, z1, cls) => { const d = el('div', { class:cls }); Object.assign(d.style, { left: ox + x0*esc + 'px', top: oz + z0*esc + 'px', width: (x1 - x0)*esc + 'px', height: (z1 - z0)*esc + 'px' }); return d; };
  const out = [];
  const pa = ret(-120, ps[0].comprimento, -120, 0, 'pl-parede'); pa.append(el('span', { text:'Parede A · ' + ps[0].comprimento })); out.push(pa);
  if (L) { const pb = ret(-120, 0, 0, ps[1].comprimento, 'pl-parede pl-vertical'); pb.append(el('span', { text:'Parede B · ' + ps[1].comprimento })); out.push(pb); }
  // primeiro os inferiores e torres, depois os aéreos por cima (tracejados)
  const ordem = a.modulos.map((m, i) => [m, i]).sort((p, q) => (p[0].linha === 'aereo') - (q[0].linha === 'aereo'));
  for (const [m, i] of ordem) {
    if (!ps[m.parede]) continue;
    const W = m.modulo.largura, P = m.modulo.profundidade;
    const [x0, x1, z0, z1] = m.parede === 0 ? [m.x, m.x + W, 0, P] : [0, P, m.x, m.x + W];
    const b = el('button', { type:'button', class:'pl-modulo pl-' + m.linha, 'data-mod':i, 'aria-label':`Módulo M${i + 1}, ${m.nome}` }, el('span', { text:'M' + (i + 1) }));
    const r = ret(x0, x1, z0, z1, ''); b.style.cssText = r.style.cssText;
    if (estado.modSel === i) b.setAttribute('aria-current', 'true');
    out.push(b);
  }
  a.pontos.forEach(p => { if (!ps[p.parede]) return;
    const [x, z] = p.parede === 0 ? [p.x, -60] : [-60, p.x];
    const d = ret(x - 40, x + 40, z - 40, z + 40, 'pl-ponto pl-' + p.tipo); d.title = p.tipo + ' a ' + p.altura + ' mm do chão'; out.push(d); });
  // peças livres: contorno visto de cima (vale girada), por cima dos módulos
  if (livres.length) {
    const NS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'pl-livres'); svg.setAttribute('width', caixa.clientWidth); svg.setAttribute('height', caixa.clientHeight);
    for (const l of livres) {
      const g = document.createElementNS(NS, 'g'); g.setAttribute('data-livre', l.k); g.setAttribute('class', 'pl-livre' + (estado.livreSel === l.k ? ' pl-livre-sel' : ''));
      const pol = document.createElementNS(NS, 'polygon'); pol.setAttribute('points', l.pts.map(([x, z]) => `${ox + x*esc},${oz + z*esc}`).join(' '));
      const tit = document.createElementNS(NS, 'title'); tit.textContent = l.nome; pol.append(tit);
      const cx = l.pts.reduce((s, q) => s + q[0], 0) / l.pts.length, cz = l.pts.reduce((s, q) => s + q[1], 0) / l.pts.length;
      const tx = document.createElementNS(NS, 'text'); tx.setAttribute('x', ox + cx*esc); tx.setAttribute('y', oz + cz*esc); tx.textContent = 'L' + (l.k + 1);
      g.append(pol, tx); svg.append(g);
    }
    out.push(svg);
  }
  out.push(el('div', { class:'pl-legenda', text:'Vista de cima · cheio = inferior/torre · tracejado = aéreo · L = peça livre · clique num módulo ou peça para escolher; "Abrir" no painel para mexer por dentro' }));
  caixa.replaceChildren(...out);
}
// contorno de cada peça livre visto de cima: as 8 quinas da peça (já no ambiente) projetadas no chão, casco convexo
function contornosLivres() {
  const out = [];
  for (const p of (estado.res?.pecas || []).filter(q => q.cat === 'livre' && q.forma?.tipo === 'livre')) {
    const f = p.forma, q = [];
    for (const a of [0, f.W]) for (const b of [0, f.H]) for (const c of [0, -p.esp]) { const v = V3.soma(f.origem, V3.mult(f.du, a), V3.mult(f.dv, b), V3.mult(f.n, c)); q.push([v[0], v[2]]); }
    out.push({ k: p.livre, nome: p.nome, pts: cascoConvexo(q) });
  }
  return out;
}
function cascoConvexo(pts) {
  const P = [...new Map(pts.map(p => [p.map(v => Math.round(v * 100) / 100).join(','), p])).values()].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (P.length < 3) return P;
  const giro = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), baixo = [], cima = [];
  for (const p of P) { while (baixo.length > 1 && giro(baixo.at(-2), baixo.at(-1), p) <= 1e-9) baixo.pop(); baixo.push(p); }
  for (const p of [...P].reverse()) { while (cima.length > 1 && giro(cima.at(-2), cima.at(-1), p) <= 1e-9) cima.pop(); cima.push(p); }
  return baixo.slice(0, -1).concat(cima.slice(0, -1));
}
$('esquema').addEventListener('click', e => {
  const lv = e.target.closest('[data-livre]'); if (lv && ehAmbiente() && !moduloEmEdicao()) { selecionarLivre(Number(lv.dataset.livre), true); return; }
  const b = e.target.closest('[data-mod]'); if (!b || !ehAmbiente() || moduloEmEdicao()) return;
  estado.modSel = Number(b.dataset.mod); estado.livreSel = null; montarFormulario(); atualizarEsquema();
});
$('esquema').addEventListener('dblclick', e => {
  const b = e.target.closest('[data-mod]'); if (!b || !ehAmbiente() || moduloEmEdicao()) return;
  estado.modAberto = Number(b.dataset.mod); estado.vaoSel = null; montarFormulario(); atualizarEsquema();
});
