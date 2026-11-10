/* COMPRAS DO NÚCLEO — conta as ferragens pelas referências da biblioteca e abre os kits nos componentes */
function comprasV3(pecas) {
  const conta = new Map(), soma = (ref, q) => conta.set(ref, (conta.get(ref) || 0) + q);
  const refs = new Map(); pecas.filter(q => q.ref).forEach(q => refs.set(q.ref, (refs.get(q.ref) || 0) + (BIBLIOTECA[q.ref]?.metro && q.comp ? q.comp / 1000 : 1)));
  for (const [ref, n] of refs) if (BIBLIOTECA[ref]?.metro) refs.set(ref, Math.ceil(n * 1.1 * 10) / 10);   // metros, com 10% de perda
  for (const [ref, n] of refs) {
    const it = BIBLIOTECA[ref]; if (!it) { soma(ref, n); continue; }
    const q = Math.ceil(n / (it.contaPor || 1));
    if (it.componentes) it.componentes.forEach(([cr, cq]) => soma(cr, q * cq)); else soma(ref, q);
  }
  return [...conta.entries()].map(([ref, qtd]) => { const it = BIBLIOTECA[ref] || {}; const emb = it.emb || 1;
    return { ref, nome: it.nome || ref, qtd, unid: it.unid || 'un', compra: Math.ceil(qtd / emb) }; }).sort((a, b) => a.nome.localeCompare(b.nome));
}
