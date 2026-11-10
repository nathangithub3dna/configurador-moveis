// CONTEÚDO DO VÃO: divisorias — divisórias em pé dentro do vão, repartindo a largura por igual
// ctx = medidas e funções do módulo (nucleo/gerar-modulo.js); est = o vão e o que já foi ocupado de baixo para cima
registrarConteudo({ id:'divisorias', gerar(ctx, ct, est) {
  const { t, Dc, zf, zFr, E, add } = ctx;
  const { g, V, x0, w } = est;
  let { y } = est;
    // divisórias em pé dentro do vão (atrás da mesma porta): repartem a largura por igual, do piso ao teto do vão
    const nD = Math.max(0, Math.round(ct.n) || 0), livre = (w - nD*t)/(nD + 1);
    if (nD && livre < 100) E.push(`Vão ${V}: com ${nD} divisória${nD === 1 ? '' : 's'} em pé cada espaço fica ${fmt(livre)} mm (mínimo 100).`);
    for (let k = 0; k < nD; k++) { const xa = x0 + livre*(k + 1) + t*k, hD = g.iy1 - y;
      add({ id:`divisoria-int-${V}-${k + 1}`, nome:`Divisória interna ${k + 1} do vão ${V}`, nomeLista:'Divisória interna', cat:'caixa', a:hD, b:Dc, fita:[1,0], box:[xa, xa + t, y, g.iy1, zf, zFr],
        des:{ w:Dc, h:hD, fita:['l'], frente:'l', vista:'Vista lateral (lado direito)' } }); }
  est.y = y;
} });
