// FRENTE: gaveta — gaveta externa ocupando o vão (a função mora neste mesmo arquivo)
registrarFrente({ id:'gaveta', gerar(ctx, g) { ctx.gavetaExterna(g); } });

function fazerGavetaExterna(ctx, g) {
  const { E, t, tf, P, zFr, Dc, add, ferr, cont, folga, m } = ctx;
  const i = cont.gaveta++, k = i + 1;
  const h = g.fy1 - g.fy0, Lc = [...R.corredicas].reverse().find(cc => cc <= Dc - 10), px = m.puxadorGaveta, proj = px.proj;
  const mov = { tipo:'gaveta', idx:i, curso:(Lc||0)*0.9 };
  const perfil = px.modelo === 'perfil';   // perfil de borda: frente mais curta, perfil em cima
  const fy0 = g.fy0 + folga(g.b.baixo), fy1 = g.fy1 - folga(g.b.cima) - (perfil ? px.reducao : 0), fx0 = g.fx0 + folga(g.b.esq), fx1 = g.fx1 - folga(g.b.dir);
  const wf = fx1 - fx0, xm = (g.fx0 + g.fx1)/2, ym = (fy0 + fy1)/2;
  const frente = add({ id:`gaveta-${k}-frente`, nome:`Frente da gaveta ${k}`, nomeLista:'Frente da gaveta', cat:'frente', a:wf, b:fy1-fy0, fita:[2,2], box:[fx0,fx1,fy0,fy1,zFr,P], mov,
    des:{ w:wf, h:fy1-fy0, fita:['t','b','l','r'], vista:'Vista pela face interna', furos: perfil ? [] : [-1,1].map(sn => ({ x:wf/2+sn*px.furacao/2, y:ym-fy0, d:5, prof:0, tipo:'puxador' })) } });
  if (!Lc) { E.push('Não cabe corrediça na profundidade da caixa.'); return; }
  const hb = Math.floor((h - R.folgaAltGaveta)/10)*10;
  if (hb < 60) { E.push(`Gaveta ${k}: caixa com ${hb} mm (mínimo 60).`); return; }
  const yb = g.iy0 + R.folgaPisoGaveta;
  const Wg = (g.ix1 - g.ix0) - 2*R.corredica, xg0 = g.ix0 + R.corredica, xg1 = xg0 + Wg, zg0 = zFr - Lc, wInt = Wg - 2*t;
  const desLat = { w:Lc, h:hb, fita:['t'], vista:'Vista de lado', linhas:[{ x1:0, y1:hb/2, x2:Lc, y2:hb/2, txt:'eixo da corrediça' }] };
  const yPx = ym - yb, furosInt = (!perfil && yPx > 10 && yPx < hb-10) ? [-1,1].map(sn => ({ x:wInt/2+sn*px.furacao/2, y:yPx, d:5, prof:0, tipo:'puxador' })) : [];
  add({ id:`gaveta-${k}-lateral-esq`, nome:`Lateral esquerda da gaveta ${k}`, nomeLista:'Lateral da gaveta', cat:'gaveta', a:Lc, b:hb, fita:[1,0], box:[xg0,xg0+t,yb,yb+hb,zg0,zFr], mov, expPai:frente.id, des:desLat });
  add({ id:`gaveta-${k}-lateral-dir`, nome:`Lateral direita da gaveta ${k}`, nomeLista:'Lateral da gaveta', cat:'gaveta', a:Lc, b:hb, fita:[1,0], box:[xg1-t,xg1,yb,yb+hb,zg0,zFr], mov, expPai:frente.id, des:desLat });
  add({ id:`gaveta-${k}-frente-interna`, nome:`Frente interna da gaveta ${k}`, nomeLista:'Frente/traseira da gaveta', cat:'gaveta', a:wInt, b:hb, fita:[1,0], box:[xg0+t,xg1-t,yb,yb+hb,zFr-t,zFr], mov, expPai:frente.id, des:{ w:wInt, h:hb, fita:['t'], vista:'Vista de frente', furos:furosInt } });
  add({ id:`gaveta-${k}-traseira`, nome:`Traseira da gaveta ${k}`, nomeLista:'Frente/traseira da gaveta', cat:'gaveta', a:wInt, b:hb, fita:[1,0], box:[xg0+t,xg1-t,yb,yb+hb,zg0,zg0+t], mov, expPai:frente.id, des:{ w:wInt, h:hb, fita:['t'], vista:'Vista de frente' } });
  add({ id:`gaveta-${k}-fundo`, nome:`Fundo da gaveta ${k}`, nomeLista:'Fundo da gaveta', cat:'gaveta', mat:'mdf-branco', esp:tf, a:Wg, b:Lc, box:[xg0,xg1,yb-tf,yb,zg0,zFr], mov, expPai:frente.id, des:{ w:Wg, h:Lc, vista:'Vista de cima' } });
  const yc = yb + hb/2;
  ferr({ id:`gaveta-${k}-corredica-esq`, nome:`Corrediça ${Lc} mm esquerda`, box:[g.ix0,xg0,yc-22.5,yc+22.5,zg0,zFr], ref:'kit-corredica-45' });
  ferr({ id:`gaveta-${k}-corredica-dir`, nome:`Corrediça ${Lc} mm direita`, box:[xg1,g.ix1,yc-22.5,yc+22.5,zg0,zFr], ref:'kit-corredica-45' });
  if (perfil) ferr({ id:`gaveta-${k}-puxador`, nome:`Perfil puxador da gaveta ${k}`, forma:{ tipo:'puxador', dir:'h', modelo:'perfil' }, cor:px.cor, ref:px.ref, comp:wf, larg:px.reducao, box:[fx0,fx1,fy1,fy1+px.reducao,zFr,P], mov, expPai:frente.id, obs:`${px.rot}: cortar com ${fmt(wf)} mm.` });
  else ferr({ id:`gaveta-${k}-puxador`, nome:`Puxador da gaveta ${k}`, forma:{ tipo:'puxador', dir:'h', modelo:px.modelo, furacao:px.furacao }, cor:px.cor, ref:px.ref, box:[xm-px.comp/2,xm+px.comp/2,ym-px.larg/2,ym+px.larg/2,P,P+proj], mov, expPai:frente.id });
}

// gaveta de frente ocupa o espaço inteiro: tira o conteúdo do vão
registrarEscolha({ grupo:'frente', id:'gaveta', rotulo:'Gaveta', ordem:30, icone:'<rect x="4" y="3" width="26" height="10"/><rect x="4" y="14" width="26" height="11"/><rect x="4" y="26" width="26" height="11"/><line x1="13" y1="8" x2="21" y2="8" stroke-width="2"/>',
  aplicar(no) { no.conteudo = []; no.frente = { tipo:'gaveta' }; } });
