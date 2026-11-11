// CONTEÚDO DO VÃO: gavetas-internas — gavetas internas atrás da porta (a função mora neste mesmo arquivo)
// ctx = medidas e funções do módulo (nucleo/gerar-modulo.js); est = o vão e o que já foi ocupado de baixo para cima
registrarConteudo({ id:'gavetas-internas', gerar(ctx, ct, est) {
  const { gavetasInternas } = ctx;
  const { g, V, ladoFrente } = est;
  let { y } = est;
    y = gavetasInternas(ct, g, y, ladoFrente, V);
  est.y = y;
} });

function fazerGavetasInternas(ctx, ct, g, yAc, lado, V) {
  const { E, t, tf, zFr, zf, Dc, add, ferr, cont, porta } = ctx;
  const nG = ct.n, gH = ct.altura, recG = ct.recuo, esp = t, PxG = ct.puxador;
  const x0 = g.ix0, x1 = g.ix1;
  if (!nG) return yAc;
  const Lc = [...R.corredicas].reverse().find(cc => cc <= Dc - recG - t - 10);
  if (!Lc) E.push(`Vão ${V}: não cabe corrediça para gaveta interna.`);
  const recEsq = lado === 'esq' || lado === 'ambos', recDir = lado === 'dir' || lado === 'ambos' || !lado;
  const xr0 = recEsq ? x0 + esp : x0, xr1 = recDir ? x1 - esp : x1;
  if (ctx.m.fachada?.frente?.tipo === 'correr') E.push('Vão '+V+': confira o acesso das gavetas atrás das portas de correr; use fechamento por vão para liberar a fabricação.');
  const ytop = yAc + nG*gH;
  if (PxG.proj > recG - 8) E.push(`O puxador das gavetas sai ${PxG.proj} mm e bate na porta (máximo ${recG-8}).`);
  if (ytop > g.iy1 - 50) E.push(`Vão ${V}: as ${nG} gavetas de ${fmt(gH)} mm não cabem.`);
  for (const sd of [...(recEsq ? ['esq'] : []), ...(recDir ? ['dir'] : [])]) add({ id:`espacador-${V}${lado === 'ambos' && sd === 'dir' ? '-dir' : ''}`, nome:'Espaçador das corrediças', nomeLista:'Espaçador das corrediças', cat:'caixa', a:nG*gH, b:zFr-recG-zf, box:[sd === 'esq' ? x0 : x1-esp, sd === 'esq' ? x0+esp : x1, yAc, ytop, zf, zFr-recG], des:{ w:zFr-recG-zf, h:nG*gH, vista:'Vista lateral' } });
  if (Lc) for (let k = 0; k < nG; k++) {
    const i = cont.gaveta++, kk = i + 1, zy0 = yAc + k*gH, zy1 = zy0 + gH, mov = { tipo:'gaveta', idx:i, curso:Lc*0.9 };
    const pfI = PxG.modelo === 'perfil' && ctx.contrato.perfilDeBorda !== false;
    const fx0 = xr0 + 3, fx1 = xr1 - 3, fy0 = zy0 + 1.5, fy1 = zy1 - 1.5 - (pfI ? PxG.reducao : 0), zF1 = zFr - recG, zF0 = zF1 - t, wf = fx1 - fx0, xmf = (fx0+fx1)/2, ymf = (fy0+fy1)/2;
    const frente = add({ id:`gaveta-${kk}-frente`, nome:`Frente da gaveta ${kk}`, nomeLista:'Frente da gaveta interna', cat:'frente', a:wf, b:fy1-fy0, fita:[2,2], box:[fx0,fx1,fy0,fy1,zF0,zF1], mov,
      des:{ w:wf, h:fy1-fy0, fita:['t','b','l','r'], vista:'Vista pela face interna', furos: pfI ? [] : [-1,1].map(sn => ({ x:wf/2+sn*PxG.furacao/2, y:ymf-fy0, d:5, prof:0, tipo:'puxador' })) } });
    const hb = Math.floor((gH - 40)/10)*10, yb = zy0 + R.folgaPisoGaveta;
    if (hb < 60) { E.push(`Gaveta ${kk}: caixa com ${hb} mm (mínimo 60).`); continue; }
    const Wg = (xr1 - xr0) - 2*R.corredica, xg0 = xr0 + R.corredica, xg1 = xg0 + Wg, zg1 = zF0, zg0 = zg1 - Lc, wInt = Wg - 2*t;
    const desLat = { w:Lc, h:hb, fita:['t'], vista:'Vista de lado', linhas:[{ x1:0, y1:hb/2, x2:Lc, y2:hb/2, txt:'eixo da corrediça' }] };
    add({ id:`gaveta-${kk}-lateral-esq`, nome:`Lateral esquerda da gaveta ${kk}`, nomeLista:'Lateral da gaveta', cat:'gaveta', a:Lc, b:hb, fita:[1,0], box:[xg0,xg0+t,yb,yb+hb,zg0,zg1], mov, expPai:frente.id, des:desLat });
    add({ id:`gaveta-${kk}-lateral-dir`, nome:`Lateral direita da gaveta ${kk}`, nomeLista:'Lateral da gaveta', cat:'gaveta', a:Lc, b:hb, fita:[1,0], box:[xg1-t,xg1,yb,yb+hb,zg0,zg1], mov, expPai:frente.id, des:desLat });
    add({ id:`gaveta-${kk}-frente-interna`, nome:`Frente interna da gaveta ${kk}`, nomeLista:'Frente/traseira da gaveta', cat:'gaveta', a:wInt, b:hb, fita:[1,0], box:[xg0+t,xg1-t,yb,yb+hb,zg1-t,zg1], mov, expPai:frente.id, des:{ w:wInt, h:hb, fita:['t'], vista:'Vista de frente' } });
    add({ id:`gaveta-${kk}-traseira`, nome:`Traseira da gaveta ${kk}`, nomeLista:'Frente/traseira da gaveta', cat:'gaveta', a:wInt, b:hb, fita:[1,0], box:[xg0+t,xg1-t,yb,yb+hb,zg0,zg0+t], mov, expPai:frente.id, des:{ w:wInt, h:hb, fita:['t'], vista:'Vista de frente' } });
    add({ id:`gaveta-${kk}-fundo`, nome:`Fundo da gaveta ${kk}`, nomeLista:'Fundo da gaveta', cat:'gaveta', mat:'mdf-branco', esp:tf, a:Wg, b:Lc, box:[xg0,xg1,yb-tf,yb,zg0,zg1], mov, expPai:frente.id, des:{ w:Wg, h:Lc, vista:'Vista de cima' } });
    const yc = yb + hb/2;
    ferr({ id:`gaveta-${kk}-corredica-esq`, nome:`Corrediça ${Lc} mm esquerda`, box:[xr0,xg0,yc-22.5,yc+22.5,zg0,zg1], ref:'kit-corredica-45' });
    ferr({ id:`gaveta-${kk}-corredica-dir`, nome:`Corrediça ${Lc} mm direita`, box:[xg1,xr1,yc-22.5,yc+22.5,zg0,zg1], ref:'kit-corredica-45' });
    if (pfI) ferr({ id:`gaveta-${kk}-puxador`, nome:`Perfil puxador da gaveta ${kk}`, forma:{ tipo:'puxador', dir:'h', modelo:'perfil' }, cor:PxG.cor, ref:PxG.ref, comp:wf, larg:PxG.reducao, box:[fx0,fx1,fy1,fy1+PxG.reducao,zF0,zF1], mov, expPai:frente.id, obs:`${PxG.rot}: cortar com ${fmt(wf)} mm.` });
    else ferr({ id:`gaveta-${kk}-puxador`, nome:`Puxador da gaveta ${kk}`, forma:{ tipo:'puxador', dir:'h', modelo:PxG.modelo, furacao:PxG.furacao }, cor:PxG.cor, ref:PxG.ref, box:[xmf-PxG.comp/2,xmf+PxG.comp/2,ymf-PxG.larg/2,ymf+PxG.larg/2,zF1,zF1+PxG.proj], mov, expPai:frente.id });
  }
  return ytop;
}

// gavetas internas + prateleiras acima (o que sobra em cima vira prateleiras)
function gavetasEAcima(m) {
  const P = TIPOS.armario.padrao;
  return [{ tipo: 'gavetas-internas', n: P.gavetas, altura: P.alturaGaveta, recuo: 45, puxador: m.puxadorGaveta }, { tipo: 'prateleiras-acima', n: P.pratAcimaGavetas, minLivre: 250 }];
}
registrarEscolha({ grupo:'conteudo', id:'gavetas', rotulo:'Gavetas internas', ordem:50, prioridade:20, icone:'<rect x="4" y="3" width="26" height="34"/><rect x="7" y="18" width="20" height="5"/><rect x="7" y="25" width="20" height="5"/><rect x="7" y="32" width="20" height="4"/>',
  reconhece: no => (no.conteudo || []).some(c => c.tipo === 'gavetas-internas'),
  aplicar(no, m) { no.conteudo = gavetasEAcima(m); } });
