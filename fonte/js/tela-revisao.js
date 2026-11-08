/* =====================================================================
   TELA DA SITUAÇÃO DO PROJETO — rótulo no cabeçalho (estudo / aprovado /
   liberado), botão "Liberar para corte" e quadro "o que mudou".
   Lógica em revisao.js; estrutura em pagina.html (#situacao, #mudancas).
   ===================================================================== */
function mostrarSituacao() {
  const p = estado.projeto, s = situacaoProjeto(p), r = rotuloDocumento(p), caixa = $('situacao');
  caixa.dataset.estado = s.estado; mostrarConferencia();
  preencherModelo(caixa, { rotulo: r.longo, podeLiberar: s.estado === 'aprovado' && estado.res && !estado.res.erros.length });
  const m = $('mudancas'), dif = estado.res ? diferencasDesdeRevisao(p, estado.res, estado.compras, orcDoProjeto().entradas) : null;
  m.hidden = !dif; if (!dif) return;
  const tabela = (cab, linhas) => linhas.length ? el('table', {}, el('thead', {}, el('tr', {}, ...cab.map(t => el('th', { text:t })))), el('tbody', {}, ...linhas.map(l => el('tr', {}, ...l.map(v => el('td', { text:String(v) })))))) : el('p', { class:'vazio', text:'Sem mudanças aqui.' });
  preencherModelo(m, { titulo: `O que mudou desde a Rev. ${dif.ref}${dif.aprovada ? ' (aprovada pelo cliente)' : ''}`,
    custo: dif.erro || (dif.diferenca == null ? '' : `Total: ${reais(dif.totalAntes)} → ${reais(dif.totalAgora)} (${dif.diferenca >= 0 ? '+' : ''}${reais(dif.diferenca)}). Para valer, congele uma nova revisão.`) });
  m.querySelector('[data-lista="pecas"]').replaceChildren(tabela(['Peça', 'Mudança', 'Antes', 'Agora'], (dif.pecas || []).map(x => [x.nome, x.tipo, x.antes || '—', x.agora || '—'])));
  m.querySelector('[data-lista="ferragens"]').replaceChildren(tabela(['Ferragem', 'Antes', 'Agora'], (dif.ferragens || []).map(x => [x.nome, x.antes, x.agora])));
}
$('btnLiberar').addEventListener('click', () => tentarLiberar());
mostrarSituacao();

/* ---------- Conferência antes de liberar (aba Lista de corte) ---------- */
function mostrarConferencia() {
  const p = estado.projeto, itens = conferenciaFabricacao(p, estado.res, estado.compras), cfg = lerConfigOficina();
  $('confLista').replaceChildren(...itens.map(i => { const li = el('li', { text: i.texto + (i.obrigatorio ? '' : ' (não impede liberar)') }); li.dataset.ok = i.ok ? 'sim' : 'nao'; if (!i.obrigatorio) li.dataset.opcional = '1'; return li; }));
  $('confAvisos').checked = !!estado.res && p.conferencia?.avisosVistos === textoAvisos(estado.res) && !!estado.res.avisos.length;
  $('confAvisos').disabled = !estado.res?.avisos.length;
  document.querySelectorAll('input[name="confFur"]').forEach(r => { r.checked = r.value === (cfg.furacao || ''); });
  $('btnLiberar2').disabled = situacaoProjeto(p).estado !== 'aprovado';
}
function tentarLiberar() {
  const r = liberarParaCorte(estado.projeto, estado.res);
  if (!r.ok) { toast(r.motivo); document.querySelector('#etapas [data-etapa="corte"]').click(); return; }
  toast('Liberado para corte: lista, desenhos, etiquetas e pedido saem sem o aviso de estudo.'); salvarLocal(); atualizar();
}
$('btnLiberar2').addEventListener('click', tentarLiberar);
$('confAvisos').addEventListener('change', e => { estado.projeto.conferencia = { ...estado.projeto.conferencia, avisosVistos: e.target.checked ? textoAvisos(estado.res) : null }; salvarLocal(); mostrarSituacao(); });
document.querySelectorAll('input[name="confFur"]').forEach(r => r.addEventListener('change', () => { gravarConfigOficina({ ...lerConfigOficina(), furacao: r.value || null, data: new Date().toISOString() }); mostrarSituacao(); }));
$('btnTesteJson').addEventListener('click', () => { const pc = pecaDeTeste(); salvar('peca-de-teste-cortecloud.json', JSON.stringify(pedidoCorteCloud([pc], new Map([[pc.id, { codigo:'TESTE-FURACAO' }]]), 'TESTE'), null, 2)); });
$('btnTestePdf').addEventListener('click', async () => { try { salvar('peca-de-teste-folha-A3.pdf', await folhasPDF([pecaDeTeste()], () => ({ projeto:'Peça de teste de furação', codigo:'TESTE-FURACAO', rev:'—' }))); } catch (e) { toast('Falha ao montar a folha.'); } });
mostrarConferencia();
