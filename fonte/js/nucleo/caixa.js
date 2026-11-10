/* CAIXA DO MÓDULO — laterais, base, topo (inteiro ou travessas), rodapé, beiral e fundo em rasgo.
   Devolve true quando o fundo é sobreposto (ele sai depois da árvore, em fundo.js, dividido conforme a chapa). */

function fazerCaixa(ctx) {
  const { DcC, H, H0, HB, RD, W, add, c, entre, rasgo, rod, t, tf, xa, xb, yBase, yLat0, yLat1, zFr, zFundo, zfC } = ctx;
  let fundoPendente = false;
  // CAIXA
  const Hl = yLat1 - yLat0, xC0 = entre ? xa : xa + t, xC1 = entre ? xb : xb - t, WC = xC1 - xC0;
  add({ id:'lateral-esq', nome:'Lateral esquerda', nomeLista:'Lateral', cat:'caixa', a:Hl, b:DcC, fita:[1,0], box:[xa,xa+t,yLat0,yLat1,zfC,zFr], des:{ w:DcC, h:Hl, fita:['l'], frente:'l', vista:'Vista pela face interna' } });
  add({ id:'lateral-dir', nome:'Lateral direita', nomeLista:'Lateral', cat:'caixa', a:Hl, b:DcC, fita:[1,0], box:[xb-t,xb,yLat0,yLat1,zfC,zFr], des:{ w:DcC, h:Hl, fita:['r'], frente:'r', vista:'Vista pela face interna' } });
  add({ id:'base', nome:'Base', nomeLista:'Base', cat:'caixa', a:WC, b:DcC, fita:entre ? [1,2] : [1,0], box:[xC0,xC1,yBase,yBase+t,zfC,zFr], des:{ w:WC, h:DcC, fita:['b'], frente:'b', vista:'Vista de cima' } });
  if (c.topo === 'travessas') {
    add({ id:'travessa-frontal', nome:'Travessa superior frontal', nomeLista:'Travessa superior frontal', cat:'caixa', a:WC, b:R.travessa, fita:[1,0], box:[xC0,xC1,H-t,H,zFr-R.travessa,zFr], des:{ w:WC, h:R.travessa, fita:['b'], frente:'b', vista:'Vista de cima' } });
    add({ id:'travessa-traseira', nome:'Travessa superior traseira', nomeLista:'Travessa superior traseira', cat:'caixa', a:WC, b:R.travessa, box:[xC0,xC1,H-t,H,zfC,zfC+R.travessa], des:{ w:WC, h:R.travessa, vista:'Vista de cima' } });
  } else add({ id:'topo', nome:'Topo', nomeLista:'Topo', cat:'caixa', a:WC, b:DcC, fita:entre ? [1,2] : [1,0], box:[xC0,xC1,H-t,H,zfC,zFr], des:{ w:WC, h:DcC, fita:['b'], frente:'b', vista:'Vista de cima' } });
  if (rod && RD > 0) {
    const rec = c.rodape.recuo;
    add({ id:'rodape-frontal', nome:'Rodapé frontal', nomeLista:'Rodapé', cat:'caixa', a:WC, b:RD, box:[xC0,xC1,0,RD,zFr-rec-t,zFr-rec], des:{ w:WC, h:RD, vista:'Vista de frente' } });
    add({ id:'rodape-traseiro', nome:'Rodapé traseiro', nomeLista:'Rodapé', cat:'caixa', a:WC, b:RD, box:[xC0,xC1,0,RD,zfC,zfC+t], des:{ w:WC, h:RD, vista:'Vista de frente' } });
  }
  if (HB > 0) {
    add({ id:'beiral-frontal', nome:'Beiral frontal', nomeLista:'Beiral frontal', cat:'caixa', a:W, b:HB, fita:[1,2], box:[xa,xb,H,H0,zFr-t,zFr], des:{ w:W, h:HB, fita:['t','l','r'], vista:'Vista de frente' } });
    for (const [id, nome, x0] of [['beiral-esq','Beiral lateral esquerdo',xa], ['beiral-dir','Beiral lateral direito',xb-t]])
      add({ id, nome, nomeLista:'Beiral lateral', cat:'caixa', a:DcC-t, b:HB, fita:[1,0], box:[x0,x0+t,H,H0,zfC,zFr-t], des:{ w:DcC-t, h:HB, fita:['t'], vista:'Vista lateral' } });
  }
  if (rasgo) {
    // fundo encaixado: entra 'prof' mm no rasgo das laterais, base e topo (com folga), recuado da parede
    const pr = c.fundo.prof, fo = c.fundo.folga, fx0 = xa + t - pr + fo, fx1 = xb - t + pr - fo, fy0 = yBase + t - pr + fo, fy1 = H - t + pr - fo;
    add({ id:'fundo', nome:'Fundo do móvel (em rasgo)', nomeLista:'Fundo do móvel', cat:'fundo', mat:'mdf-branco', esp:tf, a:fy1-fy0, b:fx1-fx0, box:[fx0,fx1,fy0,fy1,zFundo,zFundo+tf], des:{ w:fx1-fx0, h:fy1-fy0, vista:'Vista de trás' } });
  } else fundoPendente = true;   // fundo sobreposto: criado depois da árvore, dividido conforme a chapa
  return fundoPendente;
}
