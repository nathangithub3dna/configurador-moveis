/* =====================================================================
   5c. TELA DO PEDIDO PARA A LOJA — código do projeto, tabela de códigos,
   botões de etiquetas (PDF com QR) e pedido CorteCloud. Lógica em saidas-loja.js.
   ===================================================================== */
function codigoDoProjeto() { return estado.projeto.codigo || (estado.projeto.codigo = codigoProjetoPadrao()); }
function mostrarLoja() {
  const r = estado.res; if (!r) return;
  $('codProjeto').value = codigoDoProjeto();
  const cods = codigosDasPecas(r.pecas, codigoDoProjeto()); estado.codigos = cods;
  const linhas = r.pecas.filter(p => cods.has(p.id)).sort((a, b) => cods.get(a.id).codigo.localeCompare(cods.get(b.id).codigo));
  const ok = r.erros.length === 0;
  $('btnEtiquetas').disabled = !ok || !window.jspdf; $('btnCorteCloud').disabled = !ok;
  $('tabCodigos').replaceChildren(el('table', {},
    el('thead', {}, el('tr', {}, ...['Código', 'Peça', 'Medida para a loja', 'Material'].map(t => el('th', { text:t })))),
    el('tbody', {}, ...linhas.map(p => { const [c, l] = medidaLoja(p);
      return el('tr', {}, el('td', { class:'mono', text:cods.get(p.id).codigo }), el('td', { text:p.nomeLista || p.nome }),
        el('td', { class:'n', text:`${fmt(c)} × ${fmt(l)} × ${fmt(p.esp)}` }), el('td', { text:MATERIAIS[p.mat]?.nome || p.mat })); }))));
}
$('codProjeto').addEventListener('change', e => { estado.projeto.codigo = e.target.value.trim() || codigoProjetoPadrao(); salvarLocal(); mostrarLoja(); });
$('btnEtiquetas').addEventListener('click', () => {
  if (!downloads || estado.res.erros.length || !window.jspdf) return;
  try { salvar(slug() + '-etiquetas.pdf', etiquetasPDF(estado.res.pecas, estado.codigos, estado.projeto.nome)); } catch (e) { toast('Falha ao montar as etiquetas.'); }
});
$('btnCorteCloud').addEventListener('click', () => {
  if (!downloads || estado.res.erros.length) return;
  salvar(slug() + '-cortecloud.json', JSON.stringify(pedidoCorteCloud(estado.res.pecas, estado.codigos), null, 2));
});
mostrarLoja();

/* ---------- Folha A3 da peça (5c parte 2): prévia e PDF de todas ---------- */
function extraFolha(pc) { return { projeto: estado.projeto.nome, codigo: estado.codigos?.get(pc.id)?.codigo || '' }; }
function pecasComFolha() { const r = estado.res; return r ? listaDesenhos(r.pecas).map(it => it.pc) : []; }
function mostrarFolha() {
  const r = estado.res, sel = $('selFolha'); if (!r) return;
  if (r.erros.length) { $('folhaSvg').replaceChildren(el('p', { class:'vazio', text:'Corrija os erros para ver as folhas.' })); $('btnFolhas').disabled = true; return; }
  const ps = pecasComFolha(), atual = ps.some(p => p.id === estado.folhaSel) ? estado.folhaSel : ps[0]?.id;
  sel.replaceChildren(...ps.map(p => el('option', { value:p.id, selected:p.id === atual }, `${estado.codigos?.get(p.id)?.codigo || ''} — ${p.nome}`)));
  estado.folhaSel = atual; $('btnFolhas').disabled = !window.jspdf || !window.svg2pdf && !window.jspdf?.jsPDF?.API?.svg;
  const pc = ps.find(p => p.id === atual); $('folhaSvg').innerHTML = pc ? folhaPecaSVG(pc, extraFolha(pc)) : '';
}
$('selFolha').addEventListener('change', e => { estado.folhaSel = e.target.value; mostrarFolha(); });
$('btnFolhas').addEventListener('click', async () => {
  if (!downloads || estado.res.erros.length) return;
  toast('Montando as folhas…');
  try { salvar(slug() + '-folhas-A3.pdf', await folhasPDF(pecasComFolha(), extraFolha)); } catch (e) { toast('Falha ao montar as folhas.'); }
});
mostrarFolha();
