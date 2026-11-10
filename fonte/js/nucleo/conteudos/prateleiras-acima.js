// CONTEÚDO DO VÃO: prateleiras-acima — tampo fixo acima das gavetas + prateleiras no espaço que sobra
// ctx = medidas e funções do módulo (nucleo/gerar-modulo.js); est = o vão e o que já foi ocupado de baixo para cima
registrarConteudo({ id:'prateleiras-acima', gerar(ctx, ct, est) {
  const { t, Dc, zf, zFr, add, prateleira } = ctx;
  const { g, V, x0, x1, w } = est;
  let { y, kPrat } = est;
    // tampo fixo logo acima da última gaveta (pedido do Nathan: a gaveta não fica aberta por cima), se sobrar espaço
    if (g.iy1 - y > t + 100) {
      add({ id:`prateleira-fixa-g${V}`, nome:'Tampo das gavetas', nomeLista:'Prateleira fixa', cat:'caixa', a:w, b:Dc, fita:[1,0], box:[x0, x1, y, y+t, zf, zFr], des:{ w, h:Dc, fita:['b'], frente:'b', vista:'Vista de cima' } });
      y += t;
    }
    const livre = g.iy1 - y;
    if (ct.n && livre > ct.minLivre) { const vaoP = (livre - ct.n*t)/(ct.n+1); for (let k = 0; k < ct.n; k++) prateleira(g, V, ++kPrat, y + vaoP*(k+1) + t*k, `Prateleira ${kPrat} acima das gavetas`); }
  est.y = y; est.kPrat = kPrat;
} });
