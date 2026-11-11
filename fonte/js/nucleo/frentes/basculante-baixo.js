// FRENTE: basculante-baixo — porta que abre para baixo (tampa que tomba para a frente, como em escrivaninha ou bar):
// dobradiças na borda de baixo, pistão a gás inverso pelo peso, puxador em cima. A função é a da basculante (basculante.js).
registrarFrente({ id:'basculante-baixo', fachada:true, gerar(ctx, g, fr) { fazerBasculante(ctx, g, fr, 'baixo'); } });

registrarEscolha({ grupo:'frente', id:'basculante-baixo', rotulo:'Abre p/ baixo', ordem:60, icone:'<rect x="4" y="7" width="26" height="22"/><path d="M17 31v7m-3-3 3 3 3-3"/>',
  aplicar(no) { no.frente = { tipo:'basculante-baixo' }; } });
