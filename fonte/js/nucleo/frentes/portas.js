// FRENTE: portas — várias portas de giro iguais; quantidade automática pela largura máxima de porta, em pares que se encontram no meio
registrarFrente({ id:'portas', gerar(ctx, g, fr) {
  const { m, folga, porta } = ctx;
  const x0 = g.fx0 + folga(g.b.esq), x1 = g.fx1 - folga(g.b.dir);
  const n = fr.n && fr.n !== 'auto' ? fr.n : Math.max(1, Math.ceil((x1 - x0) / R.portaMaxLarg)), w = (x1 - x0 - (n - 1)*R.entre) / n;
  for (let i = 0; i < n; i++) {
    const a = x0 + i*(w + R.entre), b = a + w, lado = n === 1 ? 'esq' : (i % 2 === 0 ? 'esq' : 'dir');
    porta(g, lado, a, b, lado === 'esq' ? a - (i === 0 ? folga(g.b.esq) : R.entre/2) : b + (i === n-1 ? folga(g.b.dir) : R.entre/2), m.puxadorPorta, fr.perfil);
  }
} });
