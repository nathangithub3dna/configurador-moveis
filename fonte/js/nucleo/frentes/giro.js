// PORTA DE GIRO — a peça da porta, dobradiças, puxador e o limite de abertura (usada por porta, portas, 2portas, basculante e gavetas internas)

function fazerPorta(ctx, g, lado, x0, x1, pivX, puxador, borda = 'auto') {
  const { E, A, c, t, P, eE, eD, add, ferr, cont, folga, eixos } = ctx;
  const k = ++cont.porta, id = `porta-${k}`, perfil = puxador?.modelo === 'perfil' && ctx.contrato.perfilDeBorda !== false;
  let y0 = g.fy0 + folga(g.b.baixo), y1 = g.fy1 - folga(g.b.cima);
  // perfil de borda (cava): a porta fica mais curta e o perfil ocupa a sobra, em cima, embaixo ou na lateral do lado do puxador (oposta à dobradiça).
  // Automático: embaixo no aéreo (puxador no quarto de baixo da porta), em cima nos outros
  const bordaPerfil = !perfil ? null : borda === 'cima' || borda === 'baixo' ? borda : borda === 'lateral' ? (lado === 'esq' ? 'dir' : 'esq')
    : (puxador.altura === 'topo-120' || !(Number(puxador.altura) < y0 + (y1 - y0) / 4)) ? 'cima' : 'baixo';
  const red = perfil ? puxador.reducao : 0;
  if (bordaPerfil === 'cima') y1 -= red; else if (bordaPerfil === 'baixo') y0 += red; else if (bordaPerfil === 'dir') x1 -= red; else if (bordaPerfil === 'esq') x0 += red;
  const hp = y1 - y0, dw = x1 - x0;
  eixos.push({ k, V:cont.vao, lado, pivX, y0, y1 });
  if (dw > R.portaMaxLarg) E.push(`Vão ${cont.vao}: porta com ${fmt(dw)} mm de largura (máximo ${R.portaMaxLarg}). Use 2 portas, porta de correr ou divida o vão.`);
  const dr = ctx.contrato.dobradicas ? { n:ctx.contrato.dobradicas(hp, dw, t) } : dobradicasRegra(hp, dw, t), nd = dr.n;
  if (dr.acimaTabela) A.push(`Porta ${k}: ${fmt(dr.peso)} kg passa da tabela de dobradiças (32 kg) — conferir com o fabricante.`);
  const pos = Array.from({length:nd}, (_,j) => R.dobradicaBorda + j*(hp-2*R.dobradicaBorda)/(nd-1));
  const px = puxador, proj = px.proj;
  const xp = bordaPerfil === 'dir' ? x1 + red/2 : bordaPerfil === 'esq' ? x0 - red/2 : lado === 'esq' ? x1 - 35 : x0 + 35;
  const ypc = px.altura === 'topo-120' ? (hp > 320 ? y1 - 120 : (y0 + y1)/2) : Math.min(Math.max(px.altura, y0 + px.comp/2 + 20), y1 - px.comp/2 - 20);
  const naBorda = lado === 'esq' ? g.b.esq === 'externa' : g.b.dir === 'externa';
  const temParede = naBorda && (lado === 'esq' ? !!c.paredeEsq : !!c.paredeDir), eW = naBorda ? (lado === 'esq' ? eE : eD) : 0;
  const lim = limiteAbertura({ temParede, eW, u0:R.borda, u1:R.borda+dw, uPx:Math.abs(xp-pivX), proj, t, P });
  const mov = { tipo:'porta', lado, pivX, pivZ:P, angMax:lim.ang };
  const pt = add({ id, nome:`Porta ${k}`, nomeLista:'Porta', cat:'frente', a:hp, b:dw, fita:[2,2], box:[x0,x1,y0,y1,P-t,P], mov,
    des:{ w:dw, h:hp, fita:['t','b','l','r'], vista:'Vista pela face interna', furos:[
      ...pos.map(py => ({ x: lado === 'esq' ? dw-R.canecoBorda : R.canecoBorda, y:py, d:35, prof:13, tipo:'caneco' })),
      ...(perfil ? [] : [-1,1].map(sn => ({ x: dw-(xp-x0), y: ypc-y0+sn*px.furacao/2, d:5, prof:0, tipo:'puxador' }))) ] } });
  const xc = lado === 'esq' ? x0 + R.canecoBorda : x1 - R.canecoBorda;
  pos.forEach((py,j) => ferr({ id:`${id}-dobradica-${j+1}`, nome:`Dobradiça ${j+1} da porta ${k}`, ref:'kit-dobradica-blum-reta', forma:{tipo:'cil',eixo:'z'}, box:[xc-17.5,xc+17.5,y0+py-17.5,y0+py+17.5,P-t-1,P-t+12], mov, expPai:id }));
  if (perfil) { const deLado = bordaPerfil === 'esq' || bordaPerfil === 'dir', compP = deLado ? hp : dw;
    const boxP = { cima:[x0,x1,y1,y1+red,P-t,P], baixo:[x0,x1,y0-red,y0,P-t,P], dir:[x1,x1+red,y0,y1,P-t,P], esq:[x0-red,x0,y0,y1,P-t,P] }[bordaPerfil];
    ferr({ id:`${id}-puxador`, nome:`Perfil puxador da porta ${k}`, forma:{ tipo:'puxador', dir: deLado ? 'v' : 'h', modelo:'perfil', saida:bordaPerfil, embaixo: bordaPerfil === 'baixo' }, cor:px.cor, ref:px.ref, comp:compP, larg:red,
      box:boxP, mov, expPai:id, obs:`${px.rot}: cortar com ${fmt(compP)} mm.` }); }
  else ferr({ id:`${id}-puxador`, nome:`Puxador da porta ${k}`, forma:{ tipo:'puxador', dir:'v', modelo:px.modelo, furacao:px.furacao }, cor:px.cor, ref:px.ref, box:[xp-px.larg/2,xp+px.larg/2,ypc-px.comp/2,ypc+px.comp/2,P,P+proj], mov, expPai:id });
  if (temParede && lim.ang < 90) A.push(`Porta ${k} abre só até ${fmt(lim.ang)}°: ${lim.motivo}.`);
  return pt;
}
