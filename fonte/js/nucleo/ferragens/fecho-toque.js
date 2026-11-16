// FERRAGEM: fecho toque — vão "Sem puxador · fecho toque" (item 29). A frente fica lisa (sem furo de puxador)
// e um fecho de toque vai preso na caixa, atrás da frente, do lado onde se empurra.
const PUXADOR_TOQUE = { ref:'fecho-toque', rot:'Sem puxador · fecho toque', modelo:'toque', furacao:0, comp:0, larg:0, proj:0 };

function fazerFechoToque(ctx, { id, nome, x, y, z0, z1 }) {
  ctx.ferr({ id, nome, ref:'fecho-toque', forma:{ tipo:'cil', eixo:'z' }, box:[x - 8, x + 8, y - 8, y + 8, z0, z1],
    obs:'Empurrar a frente para abrir.' });
}

// um aviso por vão, conforme a frente (o fecho sozinho não basta: a ferragem da frente precisa combinar)
function avisoFechoToque(ctx, fr, V) {
  const t = fr.tipo;
  if (['porta', 'portas', '2portas'].includes(t)) ctx.A.push(`Vão ${V}: fecho toque — use dobradiça sem amortecedor (a com amortecedor segura a porta e o toque não abre).`);
  else if (t === 'gaveta') ctx.A.push(`Vão ${V}: fecho toque — use corrediça com abertura por toque (sem amortecedor de fechamento).`);
  else if (t === 'correr') ctx.A.push(`Vão ${V}: porta de correr não abre por toque; ficou o puxador concha.`);
}
