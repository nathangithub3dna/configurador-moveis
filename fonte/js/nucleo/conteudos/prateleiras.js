// CONTEÚDO DO VÃO: prateleiras — prateleiras soltas: automáticas (repartidas por igual) ou com a altura de cada uma.
// Tipo (item 19): comum (MDF, pino 5 mm), vidro (temperado 6 mm, feito na vidraçaria, suporte de vidro) ou pino escondido (MDF, suporte oculto)
// ctx = medidas e funções do módulo (nucleo/gerar-modulo.js); est = o vão e o que já foi ocupado de baixo para cima
registrarConteudo({ id:'prateleiras', gerar(ctx, ct, est) {
  const { E, A, prateleira } = ctx;
  const { g, V } = est;
  const modelo = MODELOS_PRAT[ct.modelo] ? ct.modelo : 'comum', t = modelo === 'vidro' ? R.espVidroPrat : ctx.t;   // espessura da prateleira (o vidro é mais fino que o MDF)
  let { y, kPrat } = est;
    const nS = ct.n, alt = (ct.alturas || []).slice(0, nS).map(v => Number(v) > 0 ? Number(v) : null);
    if (!alt.some(v => v != null)) {                              // todas automáticas: distribuídas por igual (como sempre foi)
      const vaoP = (g.iy1 - y - nS*t)/(nS+1);
      if (nS && vaoP < ct.min) E.push(`Vão ${V}: com ${nS} prateleiras o espaço fica ${fmt(vaoP)} mm (mínimo ${ct.min}).`);
      for (let k = 0; k < nS; k++) prateleira(g, V, ++kPrat, y + vaoP*(k+1) + t*k, `Prateleira ${kPrat}`, modelo);
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
      base.forEach(b => prateleira(g, V, ++kPrat, y + b, `Prateleira ${kPrat}`, modelo));
    }
  est.y = y; est.kPrat = kPrat;
} });

// tipos de prateleira: suporte que vai nas compras e nas fixações (4 por prateleira)
const MODELOS_PRAT = {
  comum: { rot:'Comum (MDF, pino 5 mm)', suporte:'pino-5' },
  vidro: { rot:'Vidro temperado 6 mm', suporte:'suporte-vidro-5' },
  oculto: { rot:'Pino escondido (MDF)', suporte:'pino-oculto' },
};
function fazerPrateleira(ctx, g, V, k, yb, nome, modelo = 'comum') {
  const { E, A, amb, zf, add, dp } = ctx;
  const vidro = modelo === 'vidro', t = vidro ? R.espVidroPrat : ctx.t, folga = vidro ? R.folgaPratVidro : R.folgaPrat;
  const w = g.ix1 - g.ix0 - 2*folga;
  let forma = null;
  const esg = amb.esgoto;
  if (esg && vidro) {
    if (yb + t > esg.altura - R.faixaEsgoto && yb < esg.altura + R.faixaEsgoto) E.push(`Vão ${V}: prateleira de vidro cruza a faixa do esgoto; vidro não leva recorte do sifão (use prateleira comum).`);
  } else if (esg) {
    const f0 = esg.altura - R.faixaEsgoto, f1 = esg.altura + R.faixaEsgoto;
    if (yb + t > f0 && yb < f1) {
      if (!(esg.recorteLarg > 0 && esg.recorteProf > 0) || esg.recorteLarg > w-80 || esg.recorteProf > dp-80) E.push('Recorte do sifão não cabe na prateleira.');
      else forma = { tipo:'recorte', rl:esg.recorteLarg, rp:esg.recorteProf };
      A.push(`Prateleira cruza a faixa do esgoto e recebeu recorte.`);
    }
  }
  const box = [g.ix0+folga, g.ix1-folga, yb, yb+t, zf+R.folgaFundoPrat, zf+R.folgaFundoPrat+dp];
  if (vidro) {   // fora do plano de corte: vai para as compras (vidraçaria) com a medida
    add({ id:`prateleira-${V}-${k}`, nome: nome + ' (vidro)', nomeLista:'Prateleira de vidro', cat:'vidro', mat:'vidro-temperado', esp:t, lista:false, ref:'vidro-temperado-6',
      a:w, b:dp, fita:[0,0], apoio:modelo, folga, box, obs:`Vidro temperado ${fmt(t)} mm, ${fmt(w)} × ${fmt(dp)} mm, bordas lapidadas — pedir na vidraçaria. Apoiada em 4 suportes de vidro.` });
    return;
  }
  const oculto = modelo === 'oculto';
  add({ id:`prateleira-${V}-${k}`, nome, nomeLista: forma ? 'Prateleira com recorte' : oculto ? 'Prateleira (pino escondido)' : 'Prateleira', cat:'caixa', a:w, b:dp, fita:[1,0], forma, apoio:modelo, folga, box,
    obs: oculto ? 'Pino escondido: furar o topo das duas pontas (2 furos por ponta, a 40 mm da frente e do fundo) para o suporte oculto.' : '',
    des:{ w, h:dp, fita:['b'], frente:'b', vista:'Vista de cima', recortes: forma ? [{ x:(w-forma.rl)/2, w:forma.rl, h:forma.rp }] : [] } });
}

registrarEscolha({ grupo:'conteudo', id:'prateleiras', rotulo:'Prateleiras', ordem:10, prioridade:50, icone:'<rect x="4" y="3" width="26" height="34"/><line x1="4" y1="12" x2="30" y2="12"/><line x1="4" y1="20" x2="30" y2="20"/><line x1="4" y1="28" x2="30" y2="28"/>',
  reconhece: no => (no.conteudo || []).some(c => c.tipo === 'prateleiras'),
  aplicar(no) { no.conteudo = [{ tipo: 'prateleiras', n: 3, min: 150 }]; } });
