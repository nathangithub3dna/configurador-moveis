// CONTEÚDO DO VÃO: vassoura — vão de vassouras: prateleira alta (ou sapateira embaixo), suportes, gancho e réguas de reforço
// ctx = medidas e funções do módulo (nucleo/gerar-modulo.js); est = o vão e o que já foi ocupado de baixo para cima
registrarConteudo({ id:'vassoura', gerar(ctx, ct, est) {
  const { t, zf, E, A, add, ferr, prateleira } = ctx;
  const { g, V, x0, x1, w, xm } = est;
  let { kPrat } = est;
    let dy = 0;
    if (ct.sapateira) {                                          // sapateira embaixo, vassouras em pé sobre ela
      const sap = sapateiraEmbaixo(g.iy0, g.iy1, t, ct.sapateira.nivel, ct.sapateira.max || 0);
      if (sap.n < 1) E.push(`Vão ${V}: não cabe sapateira embaixo das vassouras (as vassouras precisam de ${fmt(sap.livreVassoura)} mm).`);
      else A.push(...avisoSapateira(V, sap));
      sap.ys.forEach(ys => prateleira(g, V, ++kPrat, ys, `Prateleira ${kPrat} da sapateira`));
      dy = sap.piso - g.iy0;
    } else {
      const yb = ct.alturaPrat - t;
      if (yb < g.iy0 + 1200 || yb + t > g.iy1 - 100) E.push(`Vão ${V}: a prateleira das vassouras deve ficar entre ${fmt(g.iy0+1200+t)} e ${fmt(g.iy1-100)} mm.`);
      prateleira(g, V, ++kPrat, yb, 'Prateleira das vassouras');
    }
    [x0 + w*0.22, xm, x1 - w*0.22].forEach((xs, k) => ferr({ id:`vao-${V}-suporte-${k+1}`, nome:`Suporte de vassoura/rodo ${k+1}`, box:[xs-25, xs+25, 1250+dy, 1300+dy, zf+t, zf+t+45] }));
    ferr({ id:`vao-${V}-gancho`, nome:'Gancho do aspirador', box:[xm-30, xm+30, 880+dy, 920+dy, zf+t, zf+t+70] });
    add({ id:`reforco-vassoura-${V}`, nome:'Régua de reforço do gancho', nomeLista:'Régua de reforço', cat:'caixa', a:w, b:100, box:[x0, x1, 850+dy, 950+dy, zf, zf+t], des:{ w, h:100, vista:'Vista de frente' } });
    add({ id:`reforco-vassoura-${V}b`, nome:'Régua de reforço dos suportes', nomeLista:'Régua de reforço', cat:'caixa', a:w, b:100, box:[x0, x1, 1225+dy, 1325+dy, zf, zf+t], des:{ w, h:100, vista:'Vista de frente' } });
  est.kPrat = kPrat;
} });

registrarEscolha({ grupo:'conteudo', id:'vassoura', rotulo:'Vassoura e aspirador', ordem:30, prioridade:31, icone:'<rect x="4" y="3" width="26" height="34"/><line x1="4" y1="9" x2="30" y2="9"/><line x1="12" y1="12" x2="12" y2="34"/><path d="M9 34h6"/><line x1="22" y1="12" x2="22" y2="30"/>',
  reconhece: no => (no.conteudo || []).some(c => c.tipo === 'vassoura'),
  aplicar(no) { const P = TIPOS.armario.padrao; no.conteudo = [{ tipo: 'vassoura', alturaPrat: P.alturaPratVassoura }]; } });
registrarEscolha({ grupo:'conteudo', id:'vassoura+sapateira', legado:true, rotulo:'Vassoura + sapateira', ordem:40, prioridade:30, icone:'<rect x="4" y="3" width="26" height="34"/><line x1="12" y1="5" x2="12" y2="22"/><line x1="4" y1="25" x2="30" y2="25"/><line x1="4" y1="31" x2="30" y2="31"/>',
  reconhece: no => (no.conteudo || []).some(c => c.tipo === 'vassoura') && (no.conteudo || []).some(c => c.sapateira),
  aplicar(no) { const P = TIPOS.armario.padrao; no.conteudo = [{ tipo: 'vassoura', alturaPrat: P.alturaPratVassoura, sapateira: { nivel: P.alturaNivelSapateira, max: P.niveisSapateira } }]; } });
