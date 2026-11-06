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
  $('form').replaceChildren(ed);
}

function mudarAmbiente(fn) { fn(estado.projeto.parametros); montarFormulario(); atualizar(); }

$('form').addEventListener('click', e => {
  const b = e.target.closest('[data-acao]'); if (!b || !ehAmbiente()) return;
  const a = b.dataset.acao, i = Number(b.dataset.i);
  if (a === 'voltar-ambiente') { estado.modAberto = null; montarFormulario(); atualizarEsquema(); return; }
  if (moduloEmEdicao()) return;                                         // dentro de um módulo: quem cuida é tela-modulo.js
  if (a === 'abrir') { estado.modAberto = i; estado.modSel = i; estado.vaoSel = null; montarFormulario(); atualizarEsquema(); return; }
  mudarAmbiente(amb => {
    if (a === 'add') { const p = Number(estado.paredeAdd || 0), k = b.dataset.modelo;
      amb.modulos.push(AMB.novoModulo(k, p, AMB.proximoX(amb, p, MODELOS_AMBIENTE[k].linha))); estado.modSel = amb.modulos.length - 1; }
    if (a === 'remover-mod') { amb.modulos.splice(i, 1); estado.modSel = null; }
    if (a === 'add-ponto') amb.pontos.push({ tipo:'tomada', parede:0, x:500, altura:1100 });
    if (a === 'remover-ponto') amb.pontos.splice(i, 1);
  });
});
$('form').addEventListener('change', e => {
  if (!ehAmbiente() || moduloEmEdicao()) return;
  const t = e.target, d = t.dataset, v = t.value, i = Number(d.i), n = Number(v);
  if (d.amb === 'paredeAdd') { estado.paredeAdd = n; return; }
  mudarAmbiente(amb => {
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
  const maxX = Math.max(ps[0].comprimento, ...a.modulos.filter(m => m.parede === 1).map(m => m.modulo.profundidade)) + 200;
  const maxZ = (L ? ps[1].comprimento : Math.max(700, ...a.modulos.map(m => m.modulo.profundidade))) + 200;
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
  out.push(el('div', { class:'pl-legenda', text:'Vista de cima · cheio = inferior/torre · tracejado = aéreo · clique num módulo para escolher; "Abrir" no painel para mexer por dentro' }));
  caixa.replaceChildren(...out);
}
$('esquema').addEventListener('click', e => {
  const b = e.target.closest('[data-mod]'); if (!b || !ehAmbiente() || moduloEmEdicao()) return;
  estado.modSel = Number(b.dataset.mod); montarFormulario(); atualizarEsquema();
});
$('esquema').addEventListener('dblclick', e => {
  const b = e.target.closest('[data-mod]'); if (!b || !ehAmbiente() || moduloEmEdicao()) return;
  estado.modAberto = Number(b.dataset.mod); estado.vaoSel = null; montarFormulario(); atualizarEsquema();
});
