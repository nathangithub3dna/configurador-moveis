// TELA — formulário gerado a partir do tipo de móvel (parte do antigo tela.js, na mesma ordem: ver pagina.html)
/* ---------- Formulário gerado a partir do tipo ---------- */
function montarFormulario() {
  const tipo = TIPOS[estado.projeto.tipo], form = $('form'), par = estado.projeto.parametros;
  $('btnParaLivre').hidden = !CONVERSORES_V3[estado.projeto.tipo];
  // móvel convertido pelo "Editar no esquema" continua com o nome do tipo de origem (pedido do Nathan)
  const origem = estado.projeto.tipo === 'modulo' && TIPOS[par.origem] ? par.origem : null;
  $('tipoMovel').replaceChildren(...Object.entries(TIPOS).map(([k,t]) => el('option', { value:k, selected:k===estado.projeto.tipo }, k === 'modulo' && origem ? `${TIPOS[origem].nome.split(' (')[0]} — esquema` : t.nome)));
  if (tipo.editor === 'ambiente' && !moduloEmEdicao()) { montarEditorAmbiente(); return; }   // ambiente (tela/paineis/ambiente.js)
  if (tipo.editor) { montarEditorModulo(); return; }                  // móvel livre ou módulo aberto do ambiente (tela/paineis/modulo.js)
  form.replaceChildren(...tipo.grupos.map(g => el('fieldset', {}, el('legend', { text:g.titulo }), ...g.campos.map(c => {
    const id = 'p-'+c.id;
    if (c.tipo === 'sim') return el('div', { class:'campo sim' }, el('input', { type:'checkbox', id, checked:!!par[c.id], 'data-c':c.id }), el('label', { for:id, text:c.rot }));
    let inp;
    if (c.tipo === 'sel') inp = el('select', { id, 'data-c':c.id }, ...c.opcoes.map(([v,r]) => el('option', { value:v, selected:Number(par[c.id])===v }, r)));
    else inp = el('input', { type:c.tipo==='txt'?'text':'number', id, 'data-c':c.id, value:par[c.id], inputmode:c.tipo==='txt'?'text':'decimal', step:'any' });
    return el('div', { class:'campo' }, el('label', { for:id, text:c.rot }), el('div', { class:'entrada' }, inp, c.unid ? el('span', { class:'unid', text:c.unid }) : null), c.ajuda ? el('span', { class:'ajuda', text:c.ajuda }) : null);
  }))));
}
let debounceT;
$('form').addEventListener('input', e => {
  const c = e.target.dataset.c; if (!c) return;
  const campo = TIPOS[estado.projeto.tipo].grupos.flatMap(g=>g.campos).find(x=>x.id===c);
  estado.projeto.parametros[c] = e.target.type==='checkbox' ? e.target.checked : (campo.tipo==='txt' ? e.target.value : (e.target.value==='' ? NaN : Number(e.target.value)));
  clearTimeout(debounceT); debounceT = setTimeout(atualizar, 120);
});
$('nomeProjeto').addEventListener('input', e => { estado.projeto.nome = e.target.value; salvarLocal(); });
