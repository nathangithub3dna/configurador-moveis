// FRENTE: 2portas — duas portas de giro que se encontram no meio do vão
registrarFrente({ id:'2portas', fachada:true, gerar(ctx, g, fr) {
  const { m, folga, porta } = ctx;
  const meio = (g.fx0 + g.fx1)/2;
  porta(g, 'esq', g.fx0 + folga(g.b.esq), meio - R.entre/2, g.fx0, m.puxadorPorta, fr.perfil);
  porta(g, 'dir', meio + R.entre/2, g.fx1 - folga(g.b.dir), g.fx1, m.puxadorPorta, fr.perfil);
} });

registrarEscolha({ grupo:'frente', id:'2portas', rotulo:'2 portas', ordem:20, icone:'<rect x="4" y="3" width="12.5" height="34"/><rect x="17.5" y="3" width="12.5" height="34"/><line x1="13" y1="16" x2="13" y2="24" stroke-width="2.5"/><line x1="21" y1="16" x2="21" y2="24" stroke-width="2.5"/>',
  aplicar(no) { no.frente = { tipo:'2portas' }; } });
