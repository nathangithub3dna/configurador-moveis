/* ACABAMENTO DAS PEÇAS (4e) — material por grupo, veio, fita por lado (C1/C2/L1/L2) e medida de corte.
   C = lados do comprimento (a fita neles diminui a largura de corte); L = lados da largura. */
function acabamentoPecas(pecas, mats, loja = R.lojaPadrao) {
  for (const q of pecas.filter(p => p.lista)) {
    if (q.cat === 'frente' && mats.frentes) q.mat = mats.frentes;
    else if (['caixa','enchimento','gaveta'].includes(q.cat) && mats.caixa && q.mat !== 'mdf-branco') q.mat = mats.caixa;
    const temVeio = !!MATERIAIS[q.mat]?.veio;
    // veio: frentes de porta na vertical (altura da peça); demais peças no comprimento
    const alt = q.box ? q.box[3] - q.box[2] : null, vertical = q.cat === 'frente' && q.mov?.tipo !== 'gaveta' && alt !== null;
    q.veio = !temVeio ? null : (vertical ? (Math.abs(alt - q.comp) < 0.6 ? 'comp' : 'larg') : 'comp');
    const [nC, nL] = q.fita || [0, 0], e = R.fitaEsp;
    q.fitaLados = { C1: nC >= 1 ? e : 0, C2: nC >= 2 ? e : 0, L1: nL >= 1 ? e : 0, L2: nL >= 2 ? e : 0 };
    q.corte = { comp: q.comp - e*nL, larg: q.larg - e*nC };
    q.medidaLoja = loja.descontaFita ? { comp: q.comp, larg: q.larg, tipo:'final' } : { ...q.corte, tipo:'corte' };
  }
}
