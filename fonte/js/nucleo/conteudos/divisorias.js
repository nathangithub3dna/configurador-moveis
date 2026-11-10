// CONTEÚDO DO VÃO: divisorias — divisórias em pé dentro do vão; largura de cada espaço digitada ou repartida por igual
// ctx = medidas e funções do módulo (nucleo/gerar-modulo.js); est = o vão e o que já foi ocupado de baixo para cima
registrarConteudo({ id:'divisorias', gerar(ctx, ct, est) {
  const { t, Dc, zf, zFr, E, add } = ctx;
  const { g, V, x0, w } = est;
  let { y } = est;
    // divisórias em pé dentro do vão (atrás da mesma porta): repartem a largura por igual, do piso ao teto do vão
    const nD = Math.max(0, Math.round(ct.n) || 0), livre = (w - nD*t)/(nD + 1);
    // largura de cada espaço (da esquerda para a direita): vazio = automático, reparte o que sobra por igual.
    // Sem nenhuma largura digitada, fica tudo igual (como sempre foi). Tudo digitado: o último espaço fica com a sobra.
    const fix = Array.from({ length:nD + 1 }, (_, i) => Number(ct.larguras?.[i]) > 0 ? Number(ct.larguras[i]) : null);
    if (nD && fix.every(v => v !== null)) fix[nD] = null;
    const nAuto = fix.filter(v => v === null).length, sobra = w - nD*t - fix.reduce((s, v) => s + (v || 0), 0);
    const larg = fix.map(v => v ?? sobra / nAuto);
    if (nD && fix.some(v => v !== null)) {
      if (larg.some(v => v < 100)) E.push(`Vão ${V}: com as larguras digitadas, um espaço entre as divisórias fica com ${fmt(Math.min(...larg))} mm (mínimo 100; por dentro o vão tem ${fmt(w)} mm).`);
    } else if (nD && livre < 100) E.push(`Vão ${V}: com ${nD} divisória${nD === 1 ? '' : 's'} em pé cada espaço fica ${fmt(livre)} mm (mínimo 100).`);
    const xDiv = k => fix.some(v => v !== null) ? x0 + larg.slice(0, k + 1).reduce((s, v) => s + v, 0) + t*k : x0 + livre*(k + 1) + t*k;
    for (let k = 0; k < nD; k++) { const xa = xDiv(k), hD = g.iy1 - y;
      add({ id:`divisoria-int-${V}-${k + 1}`, nome:`Divisória interna ${k + 1} do vão ${V}`, nomeLista:'Divisória interna', cat:'caixa', a:hD, b:Dc, fita:[1,0], box:[xa, xa + t, y, g.iy1, zf, zFr],
        des:{ w:Dc, h:hD, fita:['l'], frente:'l', vista:'Vista lateral (lado direito)' } }); }
  est.y = y;
} });

registrarEscolha({ grupo:'conteudo', id:'divisorias', rotulo:'Divisórias em pé', ordem:20, prioridade:40, icone:'<rect x="4" y="3" width="26" height="34"/><line x1="13" y1="3" x2="13" y2="37"/><line x1="21" y1="3" x2="21" y2="37"/>',
  reconhece: no => (no.conteudo || []).some(c => c.tipo === 'divisorias'),
  aplicar(no) { no.conteudo = [{ tipo: 'divisorias', n: 1 }]; } });
