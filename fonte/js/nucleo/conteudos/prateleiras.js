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
