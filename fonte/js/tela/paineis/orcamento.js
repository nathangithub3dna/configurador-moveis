/* =====================================================================
   5c (parte 3). TELA DO ORÇAMENTO — campos, resumo, revisões e aceite.
   Estrutura em pagina.html (seção .orcamento); lógica em orcamento.js.
   ===================================================================== */
function orcDoProjeto() {
  const p = estado.projeto;
  if (!p.orcamento) p.orcamento = { entradas: entradasOrcamentoPadrao(), revisoes: [] };
  p.orcamento.entradas = { ...entradasOrcamentoPadrao(), ...p.orcamento.entradas };
  return p.orcamento;
}
function mostrarOrcamento() {
  const orc = orcDoProjeto(), e = orc.entradas, r = estado.res, ok = r && !r.erros.length && estado.compras;
  document.querySelectorAll('[data-orc]').forEach(inp => { if (document.activeElement !== inp) inp.value = e[inp.dataset.orc] ?? ''; });
  const c = ok ? calcularOrcamento(estado.compras, e) : null;
  const caixa = (rot, v, cls = '') => el('div', { class:'orc-caixa ' + cls }, el('span', { text:rot }), el('strong', { text: v == null ? '—' : reais(v) }));
  $('orcResumo').replaceChildren(...(c ? [caixa('Material (lista de compras)', c.material), caixa('Serviços da loja', c.servicos), caixa(`Despesas fixas (${reais(c.fixoHora)}/h)`, c.fixas), caixa('Móvel', c.blocos.movel), caixa('Instalação', c.blocos.instalacao),
    caixa('Total', c.total, 'total'), caixa(`Sinal (${e.sinal}%)`, c.sinal), caixa('Conferência: material × 3', c.conferencia),
    c.avisos.length ? el('ul', { class:'orc-avisos' }, ...c.avisos.map(a => el('li', { text:a }))) : null] : [el('p', { class:'vazio', text:'Corrija os erros do projeto para orçar.' })]));
  $('btnCongelar').disabled = !ok; $('btnPdfOrc').disabled = !orc.revisoes.length || !window.jspdf;
  const dia = iso => new Date(iso).toLocaleDateString('pt-BR');
  $('tabRevisoes').replaceChildren(orc.revisoes.length ? el('table', {},
    el('thead', {}, el('tr', {}, ...['Rev.', 'Data', 'Cliente', 'Total', 'Diferença', 'Aceite', ''].map(t => el('th', { text:t })))),
    el('tbody', {}, ...orc.revisoes.map((rv, i) => el('tr', {},
      el('td', { class:'mono', text:rv.rev }), el('td', { text:dia(rv.data) }), el('td', { text:rv.entradas.cliente || '—' }),
      el('td', { class:'n', text:reais(rv.resultado.total) }), el('td', { class:'n', text: rv.diferenca == null ? '—' : (rv.diferenca >= 0 ? '+' : '') + reais(rv.diferenca) }),
      el('td', { text: rv.aceite ? `${rv.aceite.nome} · ${dia(rv.aceite.data)}` : (rv.aposAceite ? 'mudança após aceite' : '—') }),
      el('td', {}, i === orc.revisoes.length - 1 && !rv.aceite ? el('button', { type:'button', class:'btn', 'data-aceite':rv.rev, text:'Registrar aceite' }) : null))))) :
    el('p', { class:'vazio', text:'Nenhuma revisão congelada ainda.' }));
}
document.querySelector('.orcamento').addEventListener('change', e => {
  const k = e.target.dataset.orc; if (!k) return;
  const en = orcDoProjeto().entradas; en[k] = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
  if (CAMPOS_OFICINA_ORC.includes(k)) gravarOficinaOrc(en); salvarLocal(); mostrarOrcamento();
});
document.querySelector('.orcamento').addEventListener('click', e => {
  const b = e.target.closest('[data-aceite]'); if (!b) return;
  const nome = orcDoProjeto().entradas.cliente || 'cliente';
  registrarAceite(estado.projeto, b.dataset.aceite, nome); salvarLocal(); atualizar(); toast(`Aceite da Rev. ${b.dataset.aceite} registrado.`);
});
$('btnCongelar').addEventListener('click', () => {
  if (!estado.compras || estado.res.erros.length) return;
  const rv = congelarRevisao(estado.projeto, estado.res, estado.compras, orcDoProjeto().entradas); salvarLocal(); atualizar(); toast(`Revisão ${rv.rev} congelada.`);
});
$('btnPdfOrc').addEventListener('click', () => {
  const rv = orcDoProjeto().revisoes.at(-1); if (!rv) return;
  salvar(`${slug()}-orcamento-rev-${rv.rev}.pdf`, orcamentoPDF(rv));
});
mostrarOrcamento();
