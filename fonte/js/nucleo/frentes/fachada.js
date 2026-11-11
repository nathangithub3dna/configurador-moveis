// FECHAMENTO INDEPENDENTE — frente do módulo inteiro, separada da árvore interna.
// Só frentes com apoio nas bordas externas declaram fachada:true no registro.
function gerarFachada(ctx) {
  const no=ctx.m.fachada; if (!no) return;
  const fr=no.frente, registro=FRENTES[fr?.tipo];
  if (!registro?.fachada) { ctx.E.push('Escolha um fechamento válido para o móvel inteiro.'); return; }
  const original=ctx.m;
  try {
    if (PUXADORES[no.puxador]) ctx.m={...original,puxadorPorta:{...PUXADORES[no.puxador],altura:original.puxadorPorta?.altura ?? 1050}};
    registro.gerar(ctx,ctx.regiao0,fr,0);
  } finally {ctx.m=original;}
}
function ladoSobFachada(ctx,g) {
  const portas=ctx.pecas.filter(p=>p.cat==='frente' && p.mov?.tipo==='porta');
  const esq=portas.some(p=>p.mov.lado==='esq' && p.mov.pivX>=g.ix0-ctx.t-1 && p.mov.pivX<=g.ix1+1);
  const dir=portas.some(p=>p.mov.lado==='dir' && p.mov.pivX<=g.ix1+ctx.t+1 && p.mov.pivX>=g.ix0-1);
  return esq && dir ? 'ambos' : esq ? 'esq' : dir ? 'dir' : 'nenhum';
}
