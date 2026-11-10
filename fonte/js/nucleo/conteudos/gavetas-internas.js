// CONTEÚDO DO VÃO: gavetas-internas — gavetas internas atrás da porta (a função mora no gerador por enquanto)
// ctx = medidas e funções do módulo (nucleo/gerar-modulo.js); est = o vão e o que já foi ocupado de baixo para cima
registrarConteudo({ id:'gavetas-internas', gerar(ctx, ct, est) {
  const { gavetasInternas } = ctx;
  const { g, V, ladoFrente } = est;
  let { y } = est;
    y = gavetasInternas(ct, g, y, ladoFrente, V);
  est.y = y;
} });
