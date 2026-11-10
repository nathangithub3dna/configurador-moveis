/* COMPLEMENTOS DA CAIXA — fixação na parede, ventilação do botijão, pés reguláveis + rodapé de encaixe, enchimento e tampo de referência. */

function fazerComplementos(ctx) {
  const { Dc, E, H, L, P, W, Wi, add, c, colunas, eD, eE, ferr, folga, pecas, rod, t, ventilacao, xa, xb, yApoio, yBase, yLat0, zFr, zf, zfC } = ctx;
  // FIXAÇÃO NA PAREDE
  if (c.fixacao === 'unica') {
    add({ id:'travessa-fixacao', nome:'Travessa de fixação na parede', nomeLista:'Travessa de fixação', cat:'caixa', a:Wi, b:R.travessa, box:[xa+t,xb-t,H-t-R.travessa,H-t,zf,zf+t], des:{ w:Wi, h:R.travessa, vista:'Vista de frente', furos:[50, Wi/2, Wi-50].map(x => ({ x, y:R.travessa/2, d:6, prof:0, tipo:'parede' })) } });
  } else {
    const cols = colunas.length ? colunas : [[xa+t, xb-t]];
    cols.forEach(([x0, x1], i) => { const w = x1 - x0;
      add({ id:`travessa-fixacao-${i+1}`, nome:`Travessa de fixação ${i+1}`, nomeLista:'Travessa de fixação', cat:'caixa', a:w, b:80, box:[x0,x1,H-t-80,H-t,zf,zf+t], des:{ w, h:80, vista:'Vista de frente', furos:[50, w-50].map(x => ({ x, y:40, d:6, prof:0, tipo:'parede' })) } }); });
  }

  // VENTILAÇÃO (rasgos na lateral externa ao lado do botijão)
  for (const v of ventilacao) {
    const lat = pecas.find(q => q.papel === 'lateral' && q.lado === v.lado);
    if ((v.lado === 'dir' && c.paredeDir) || (v.lado === 'esq' && c.paredeEsq)) { E.push('O botijão precisa de ventilação pela lateral, mas ela está encostada na parede.'); continue; }
    const lista = [], larg = 15, alt = 150, passo = 35;
    const nR = Math.floor((Dc - 80 + passo - larg) / passo), z0 = zf + (Dc - ((nR-1)*passo + larg)) / 2;
    for (const ya of [v.y0 + 25, v.y0 + v.hB - 25 - alt]) for (let k = 0; k < nR; k++) lista.push({ z0: z0 + k*passo, z1: z0 + k*passo + larg, y0: ya, y1: ya + alt });
    lat.forma = { tipo:'rasgos', lista }; lat.nome = 'Lateral direita com ventilação'; lat.nomeLista = 'Lateral com ventilação';
    lat.des.rasgos = lista.map(r => ({ x:r.z0 - zfC, y:r.y0 - yLat0, w:r.z1 - r.z0, h:r.y1 - r.y0 }));
  }

  // PÉS REGULÁVEIS + RODAPÉ DE ENCAIXE
  if (!rod && c.rodapeEncaixe && yBase > 0) {
    const nx = Math.max(2, Math.ceil(W / 600) + 1), recR = c.rodapeEncaixe.recuo;
    let kp = 0;
    for (let i = 0; i < nx; i++) for (const z of [zf + 60, zFr - recR - 40]) {
      const x = xa + 50 + i * (W - 100) / (nx - 1);
      ferr({ id:`pe-regulavel-${++kp}`, nome:`Pé regulável ${kp}`, forma:{ tipo:'cil', eixo:'y' }, box:[x-20, x+20, 0, yBase, z-20, z+20], ref:'pe-regulavel' });
    }
    add({ id:'rodape-encaixe', nome:'Rodapé de encaixe', nomeLista:'Rodapé', cat:'caixa', a:W, b:yBase-3, box:[xa, xb, 3, yBase, zFr-recR-t, zFr-recR], obs:`Preso nos pés com clip; recuado ${recR} mm; 3 mm de folga do piso.`, des:{ w:W, h:yBase-3, vista:'Vista de frente' } });
  }

  // ENCHIMENTO
  [['esq',eE,0,eE],['dir',eD,L-eD,L]].forEach(([lado,e,x0,x1]) => {
    if (!e) return;
    add({ id:`enchimento-${lado}`, nome:`Enchimento ${lado === 'esq' ? 'esquerdo' : 'direito'} (frontal)`, nomeLista:'Enchimento frontal', cat:'enchimento', a:H-yApoio, b:e, fita:[1,0], box:[x0,x1,yApoio,H,P-t,P], des:{ w:e, h:H-yApoio, fita:[lado==='esq'?'r':'l'], vista:'Vista de frente' } });
    const sx0 = lado === 'esq' ? Math.max(0,x1-t) : x0, sx1 = lado === 'esq' ? x1 : Math.min(L,x0+t);
    add({ id:`sarrafo-${lado}`, nome:`Sarrafo do enchimento`, nomeLista:'Sarrafo do enchimento', cat:'enchimento', a:H-yApoio, b:R.sarrafo, box:[sx0,sx1,yApoio,H,P-t-R.sarrafo,P-t], des:{ w:R.sarrafo, h:H-yApoio, vista:'Vista de lado' } });
  });

  // TAMPO (referência, ex.: mármore existente)
  if (c.tampo && c.tampo.larg > 0 && c.tampo.prof > 0 && c.tampo.esp > 0) {
    const tl = c.tampo.larg, tp = c.tampo.prof, te = c.tampo.esp;
    const tx0 = c.paredeEsq ? 0 : c.paredeDir ? L-tl : (L-tl)/2;
    add({ id:'tampo', nome:'Tampo (existente)', cat:'tampo', mat:'marmore', esp:te, a:tl, b:tp, lista:false, box:[tx0,tx0+tl,H,H+te,0,tp] });
  }
}
