// FRENTE: basculante — porta que abre para cima com pistão a gás (a função mora neste mesmo arquivo)
registrarFrente({ id:'basculante', gerar(ctx, g, fr) { ctx.basculante(g, fr); } });

// BASCULANTE — porta que abre para cima, dobradiças em cima, pistão a gás pelo peso (regra Soprano/Completa)
function fazerBasculante(ctx, g, fr) {
  const { E, t, P, zFr, add, ferr, cont, folga, porta, m } = ctx;
  const k = ++cont.porta, id = `porta-basculante-${k}`, Rb = R.basculante;
  const x0 = g.fx0 + folga(g.b.esq), x1 = g.fx1 - folga(g.b.dir), y0 = g.fy0 + folga(g.b.baixo), y1 = g.fy1 - folga(g.b.cima), w = x1 - x0, h = y1 - y0;
  const peso = pesoPeca({ comp:Math.max(w,h), larg:Math.min(w,h), esp:t, mat:'mdf' });
  const nP = w >= Rb.larguraDoisPistoes ? 2 : 1, forcaKg = peso * ((h/2) / Rb.cursoPistao) * Rb.fatorSeguranca, porPistaoN = forcaKg * 10 / nP;
  const forca = Rb.forcas.find(f => f >= porPistaoN);
  if (!forca) E.push(`Basculante ${k}: precisa de ${fmt(porPistaoN)} N por pistão (máximo de mercado ${Rb.forcas.at(-1)} N). Use articulador (ex.: Blum AVENTOS) ou divida a porta.`);
  const nd = dobradicasRegra(w, h, t).n, pos = Array.from({length:nd}, (_,j) => R.dobradicaBorda + j*(w - 2*R.dobradicaBorda)/(nd - 1));
  const px = m.puxadorPorta, xm = (x0 + x1)/2, yp = y0 + 40, perfilB = px.modelo === 'perfil', yb0 = perfilB ? y0 + px.reducao : y0, hB = y1 - yb0;   // perfil G: na borda de baixo (por onde se puxa)
  const movB = { tipo:'basculante', eixo:'x', pivY:y1, pivZ:P, angMax:90 };
  const pt = add({ id, nome:`Porta basculante ${k}`, nomeLista:'Porta basculante', cat:'frente', a:w, b:hB, fita:[2,2], box:[x0, x1, yb0, y1, zFr, P],
    mov:movB, obs:`Peso ${fmt(peso)} kg; ${nP} pistão(ões) de ${forca || '?'} N.`,
    des:{ w, h:hB, fita:['t','b','l','r'], vista:'Vista pela face interna', furos:[
      ...pos.map(px_ => ({ x:px_, y:hB - R.canecoBorda, d:35, prof:13, tipo:'caneco' })),
      ...(perfilB ? [] : [-1,1].map(sn => ({ x:w/2 + sn*px.furacao/2, y:yp - y0, d:5, prof:0, tipo:'puxador' }))) ] } });
  pos.forEach((px_, j) => ferr({ id:`${id}-dobradica-${j+1}`, nome:`Dobradiça ${j+1} da basculante ${k}`, ref:'kit-dobradica-blum-reta', forma:{tipo:'cil',eixo:'z'}, box:[x0+px_-17.5, x0+px_+17.5, y1-R.canecoBorda-17.5, y1-R.canecoBorda+17.5, zFr-1, zFr+12], mov:movB, expPai:id }));
  for (let j = 0; j < nP; j++) { const xs = nP === 1 ? (fr.ladoPistao === 'dir' ? g.ix1 - 30 : g.ix0 + 30) : (j ? g.ix1 - 30 : g.ix0 + 30);
    ferr({ id:`${id}-pistao-${j+1}`, nome:`Pistão a gás ${j+1} da basculante ${k}`, ref: forca ? `pistao-gas-${forca}` : null, box:[xs - 10, xs + 10, y1 - 255, y1 - 30, zFr - 120, zFr - 100], expPai:id, obs: forca ? `${forca} N` : 'força fora de mercado' }); }
  if (perfilB) ferr({ id:`${id}-puxador`, nome:`Perfil puxador da basculante ${k}`, forma:{ tipo:'puxador', dir:'h', modelo:'perfil', saida:'baixo', embaixo:true }, cor:px.cor, ref:px.ref, comp:w, larg:px.reducao, box:[x0, x1, y0, yb0, zFr, P], mov:movB, expPai:id, obs:`${px.rot}: cortar com ${fmt(w)} mm.` });
  else ferr({ id:`${id}-puxador`, nome:`Puxador da basculante ${k}`, forma:{ tipo:'puxador', dir:'h', modelo:px.modelo, furacao:px.furacao }, cor:px.cor, ref:px.ref, box:[xm-px.comp/2, xm+px.comp/2, yp-px.larg/2, yp+px.larg/2, P, P+px.proj], mov:movB, expPai:id });
  return pt;
}

registrarEscolha({ grupo:'frente', id:'basculante', rotulo:'Abre p/ cima', ordem:50, icone:'<rect x="4" y="11" width="26" height="22"/><path d="M17 9V2m-3 3 3-3 3 3"/>',
  aplicar(no) { no.frente = { tipo:'basculante' }; } });
