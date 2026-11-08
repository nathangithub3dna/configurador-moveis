/* =====================================================================
   TELA DA SITUAÇÃO DO PROJETO — rótulo no cabeçalho (estudo / aprovado /
   liberado), botão "Liberar para corte" e quadro "o que mudou".
   Lógica em revisao.js; estrutura em pagina.html (#situacao, #mudancas).
   ===================================================================== */
function mostrarSituacao() {
  const p = estado.projeto, s = situacaoProjeto(p), r = rotuloDocumento(p), caixa = $('situacao');
  caixa.dataset.estado = s.estado;
  preencherModelo(caixa, { rotulo: r.longo, podeLiberar: s.estado === 'aprovado' && estado.res && !estado.res.erros.length });
  const m = $('mudancas'), dif = estado.res ? diferencasDesdeRevisao(p, estado.res, estado.compras, orcDoProjeto().entradas) : null;
  m.hidden = !dif; if (!dif) return;
  const tabela = (cab, linhas) => linhas.length ? el('table', {}, el('thead', {}, el('tr', {}, ...cab.map(t => el('th', { text:t })))), el('tbody', {}, ...linhas.map(l => el('tr', {}, ...l.map(v => el('td', { text:String(v) })))))) : el('p', { class:'vazio', text:'Sem mudanças aqui.' });
  preencherModelo(m, { titulo: `O que mudou desde a Rev. ${dif.ref}${dif.aprovada ? ' (aprovada pelo cliente)' : ''}`,
    custo: dif.erro || (dif.diferenca == null ? '' : `Total: ${reais(dif.totalAntes)} → ${reais(dif.totalAgora)} (${dif.diferenca >= 0 ? '+' : ''}${reais(dif.diferenca)}). Para valer, congele uma nova revisão.`) });
  m.querySelector('[data-lista="pecas"]').replaceChildren(tabela(['Peça', 'Mudança', 'Antes', 'Agora'], (dif.pecas || []).map(x => [x.nome, x.tipo, x.antes || '—', x.agora || '—'])));
  m.querySelector('[data-lista="ferragens"]').replaceChildren(tabela(['Ferragem', 'Antes', 'Agora'], (dif.ferragens || []).map(x => [x.nome, x.antes, x.agora])));
}
$('btnLiberar').addEventListener('click', () => {
  const r = liberarParaCorte(estado.projeto, estado.res);
  toast(r.ok ? 'Liberado para corte: lista, desenhos, etiquetas e pedido saem sem o aviso de estudo.' : r.motivo);
  salvarLocal(); atualizar();
});
mostrarSituacao();
