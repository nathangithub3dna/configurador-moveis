// CONTEÚDO DO VÃO: prateleiras — prateleiras soltas: automáticas (repartidas por igual) ou com a altura de cada uma
// ctx = medidas e funções do módulo (nucleo/gerar-modulo.js); est = o vão e o que já foi ocupado de baixo para cima
registrarConteudo({ id:'prateleiras', gerar(ctx, ct, est) {
  const { t, E, A, prateleira } = ctx;
  const { g, V } = est;
  let { y, kPrat } = est;
    const nS = ct.n, alt = (ct.alturas || []).slice(0, nS).map(v => Number(v) > 0 ? Number(v) : null);
    if (!alt.some(v => v != null)) {                              // todas automáticas: distribuídas por igual (como sempre foi)
      const vaoP = (g.iy1 - y - nS*t)/(nS+1);
      if (nS && vaoP < ct.min) E.push(`Vão ${V}: com ${nS} prateleiras o espaço fica ${fmt(vaoP)} mm (mínimo ${ct.min}).`);
      for (let k = 0; k < nS; k++) prateleira(g, V, ++kPrat, y + vaoP*(k+1) + t*k, `Prateleira ${kPrat}`);
    } else {
      // altura de cada prateleira = espaço livre do piso do vão até ela; as vazias se repartem por igual entre as vizinhas
      const H = g.iy1 - y, base = new Array(nS).fill(null);
      alt.forEach((v, k) => { base[k] = v; });
      let k = 0;
      while (k < nS) {
        if (base[k] != null) { k++; continue; }
        let f = k; while (f < nS && base[f] == null) f++;            // k..f-1 automáticas
        const ini = k ? base[k-1] + t : 0, fim = f < nS ? base[f] : H, m = f - k, gap = (fim - ini - m*t)/(m+1);
        for (let i = 0; i < m; i++) base[k+i] = ini + gap*(i+1) + t*i;
        k = f;
      }
      const ruim = base.some((b, i) => b < 0 || b + t > H || (i && b < base[i-1] + t));
      if (ruim) E.push(`Vão ${V}: as alturas das prateleiras estão fora de ordem ou passam do vão (por dentro: ${fmt(H)} mm).`);
      else base.forEach((b, i) => { const livre = b - (i ? base[i-1] + t : 0); if (livre < 50) A.push(`Vão ${V}: prateleira ${i+1} fica só ${fmt(livre)} mm acima da de baixo.`); });
      base.forEach(b => prateleira(g, V, ++kPrat, y + b, `Prateleira ${kPrat}`));
    }
  est.y = y; est.kPrat = kPrat;
} });

function fazerPrateleira(ctx, g, V, k, yb, nome) {
  const { E, A, amb, t, zf, add, dp } = ctx;
  const w = g.ix1 - g.ix0 - 2*R.folgaPrat;
  let forma = null;
  const esg = amb.esgoto;
  if (esg) {
    const f0 = esg.altura - R.faixaEsgoto, f1 = esg.altura + R.faixaEsgoto;
    if (yb + t > f0 && yb < f1) {
      if (!(esg.recorteLarg > 0 && esg.recorteProf > 0) || esg.recorteLarg > w-80 || esg.recorteProf > dp-80) E.push('Recorte do sifão não cabe na prateleira.');
      else forma = { tipo:'recorte', rl:esg.recorteLarg, rp:esg.recorteProf };
      A.push(`Prateleira cruza a faixa do esgoto e recebeu recorte.`);
    }
  }
  add({ id:`prateleira-${V}-${k}`, nome, nomeLista: forma ? 'Prateleira com recorte' : 'Prateleira', cat:'caixa', a:w, b:dp, fita:[1,0], forma,
    box:[g.ix0+R.folgaPrat, g.ix1-R.folgaPrat, yb, yb+t, zf+R.folgaFundoPrat, zf+R.folgaFundoPrat+dp],
    des:{ w, h:dp, fita:['b'], frente:'b', vista:'Vista de cima', recortes: forma ? [{ x:(w-forma.rl)/2, w:forma.rl, h:forma.rp }] : [] } });
}

registrarEscolha({ grupo:'conteudo', id:'prateleiras', rotulo:'Prateleiras', ordem:10, prioridade:50, icone:'<rect x="4" y="3" width="26" height="34"/><line x1="4" y1="12" x2="30" y2="12"/><line x1="4" y1="20" x2="30" y2="20"/><line x1="4" y1="28" x2="30" y2="28"/>',
  reconhece: no => (no.conteudo || []).some(c => c.tipo === 'prateleiras'),
  aplicar(no) { no.conteudo = [{ tipo: 'prateleiras', n: 3, min: 150 }]; } });
