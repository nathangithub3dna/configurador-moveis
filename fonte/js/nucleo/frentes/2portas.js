// FRENTE: 2portas — duas portas de giro que se encontram no meio do vão
registrarFrente({ id:'2portas', gerar(ctx, g, fr) {
  const { m, folga, porta } = ctx;
  const meio = (g.fx0 + g.fx1)/2;
  porta(g, 'esq', g.fx0 + folga(g.b.esq), meio - R.entre/2, g.fx0, m.puxadorPorta, fr.perfil);
  porta(g, 'dir', meio + R.entre/2, g.fx1 - folga(g.b.dir), g.fx1, m.puxadorPorta, fr.perfil);
} });
