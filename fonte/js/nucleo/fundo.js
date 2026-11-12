/* FUNDO SOBREPOSTO — peças limitadas pelo transporte; escolhe a chapa de mercado que dá menos chapas;
   emenda sobre divisória ou, sem divisória, com perfil H plástico. */

function fazerFundoSobreposto(ctx) {
  const { A, E, H, Tpeca, W, add, c, ferr, fundoPendente, juntasFundo, tf, xa, xb, yBase } = ctx;
  // FUNDO SOBREPOSTO — peças limitadas pelo transporte; usa a chapa de mercado que dá menos chapas; emenda sobre divisória ou, sem divisória, com perfil H plástico
  if (fundoPendente && ctx.contrato.fundoInteiro) {
    add({ id:'fundo', nome:'Fundo do móvel', nomeLista:'Fundo do móvel', cat:'fundo', mat:'mdf-branco', esp:tf, a:H-yBase, b:W, box:[xa,xb,yBase,H,0,tf], des:{ w:W, h:H-yBase, vista:'Vista de trás' } });
    return;
  }
  if (fundoPendente) {
    const matF = c.fundo.material || 'mdf-branco', espF = matF.startsWith('hdf') ? 3 : tf, hF = H - yBase;
    const PH = BIBLIOTECA['perfil-h-emenda-fundo-3'], alma = matF.startsWith('hdf') && PH ? PH.dados.alma : 0;
    const dividir = dim => {                                         // cortes [x0,x1,emendaH?] para uma chapa
      const LU = dim[0] - 2*R.refilo, WU = dim[1] - 2*R.refilo;
      if (hF > LU) return null;
      const T = Tpeca;                                                  // transporte: o menor lado da peça não passa de T
      const maxW = Math.min(hF <= WU ? LU : WU, hF > T ? T : Infinity), cortes = []; let ini = xa;
      while (xb - ini > maxW) {
        const opc = juntasFundo.filter(x => x > ini + 1 && x <= ini + maxW);
        if (opc.length) { const x = Math.max(...opc); cortes.push([ini, x, false]); ini = x; continue; }
        if (!matF.startsWith('hdf')) return null;                    // MDF sem divisória: não há emenda padrão
        const prox = juntasFundo.find(x => x > ini + maxW) ?? xb, n = Math.ceil((prox - ini) / maxW), w = (prox - ini) / n;
        for (let k = 0; k < n; k++) cortes.push([ini + k*w, ini + (k+1)*w, k < n-1]);
        ini = prox;
      }
      if (ini < xb) cortes.push([ini, xb, false]);
      return cortes;
    };
    const nChapas = (dim, cortes) => {                               // quantas chapas os pedaços do fundo ocupam (faixas lado a lado)
      const LU = dim[0] - 2*R.refilo, WU = dim[1] - 2*R.refilo, ws = cortes.map(([a, b]) => b - a);
      const conta = (lado, cabeH) => { if (!cabeH) return Infinity; let n = 0, livre = -1; for (const w of ws) { if (w > lado) return Infinity; if (livre < w) { n++; livre = lado; } livre -= w + R.serra; } return n; };
      return Math.min(conta(WU, hF <= LU), conta(LU, hF <= WU));
    };
    const opcoes = chapasDe(matF, espF).map(ref => { const dim = BIBLIOTECA[ref].dim, cortes = dividir(dim); return { ref, dim, cortes, n: cortes ? nChapas(dim, cortes) : Infinity }; }).filter(o => o.cortes)
      .sort((a, b) => a.n - b.n || a.dim[0]*a.dim[1]*a.n - b.dim[0]*b.dim[1]*b.n || a.cortes.length - b.cortes.length);
    const esc = opcoes[0] || (chapasDe(matF, espF).length ? null : { ref:null, dim:R.chapa, cortes:dividir(R.chapa) });
    if (!esc || !esc.cortes) E.push(`O fundo (${fmt(W)} × ${fmt(hF)} mm) não cabe em nenhuma chapa de ${MATERIAIS[matF].nome} disponível, nem dividido sobre as divisórias.`);
    else {
      const cortes = esc.cortes, nF = cortes.length;
      cortes.forEach(([x0, x1, emH], k) => {
        const antH = k > 0 && cortes[k-1][2], g0 = antH ? alma/2 : 0, g1 = emH ? alma/2 : 0, id = nF > 1 ? `fundo-${k+1}` : 'fundo', w = x1 - x0 - g0 - g1;
        add({ id, nome: nF > 1 ? `Fundo do móvel ${k+1} de ${nF}` : 'Fundo do móvel', nomeLista:'Fundo do móvel', cat:'fundo', mat:matF, esp:espF, a:hF, b:w, chapaRef:esc.ref, box:[x0+g0,x1-g1,yBase,H,tf-espF,tf], des:{ w, h:hF, vista:'Vista de trás' },
          obs: nF > 1 ? ((antH || emH) ? 'Emenda com perfil H plástico onde não há divisória; nas divisórias, parafusar as duas peças nelas.' : 'Emenda no meio da divisória: parafusar as duas peças nela.') : '' });
        if (emH) ferr({ id:`perfil-h-fundo-${k+1}`, nome:`Perfil H de emenda do fundo ${k+1}`, ref:'perfil-h-emenda-fundo-3', mat:'hdf-branco', box:[x1-6, x1+6, yBase, H, tf-espF-0.5, tf+0.5] });
      });
      if (cortes.some(x => x[2])) A.push('O fundo não cabe numa chapa e não há divisória no ponto da emenda: emenda com perfil H plástico.');
    }
  }
}
