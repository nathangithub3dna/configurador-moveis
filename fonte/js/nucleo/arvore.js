/* ÁRVORE DE VÃOS — percorre DIVIDIR (em pé / deitado, com ou sem divisória) até cada VÃO; o vão pede a frente e os conteúdos ao registro. */

function percorrerArvore(ctx, no, g, nivel, cam = '') {
  const { Dc, E, add, colunas, cont, juntasFundo, regioes, t, vao, zFr, zf, percorrer } = ctx;
  if (no.tipo === 'dividir' && no.dir === 'v') {
    const n = no.partes.length, iw = g.ix1 - g.ix0, ns = no.sep === 'divisoria' ? n - 1 : 0;
    const fixas = no.partes.filter(p => p.medida !== 'auto').reduce((s,p) => s + p.medida, 0), nAuto = no.partes.filter(p => p.medida === 'auto').length;
    const wAuto = nAuto ? (iw - ns*t - fixas) / nAuto : 0;
    if (nAuto && wAuto <= 0) { E.push('As medidas fixas dos vãos passam da largura disponível.'); return; }
    let x = g.ix0;
    no.partes.forEach((p, i) => {
      const w = p.medida === 'auto' ? wAuto : p.medida, x0 = x, x1 = x + w;
      const fx0 = i === 0 ? g.fx0 : x0 - t/2, fx1 = i === n-1 ? g.fx1 : x1 + (ns ? t/2 : 0);
      const sub = { ...g, ix0:x0, ix1:x1, fx0, fx1, b:{ ...g.b, esq: i === 0 ? g.b.esq : 'interna', dir: i === n-1 ? g.b.dir : 'interna' } };
      if (nivel === 0) colunas.push([x0, x1]);
      percorrer(p.no, sub, nivel + 1, cam + '.' + i);
      x = x1;
      if (ns && i < n-1) {
        const k = ++cont.divV; juntasFundo.push(x + t/2);
        add({ id:`divisoria-v-${k}`, nome:`Divisória vertical ${k}`, nomeLista:'Divisória vertical', cat:'caixa', a:g.iy1-g.iy0, b:Dc, fita:[1,0], box:[x,x+t,g.iy0,g.iy1,zf,zFr], des:{ w:Dc, h:g.iy1-g.iy0, fita:['l'], frente:'l', vista:'Vista lateral (lado direito)' } });
        x += t;
      }
    });
    return;
  }
  if (no.tipo === 'dividir' && no.dir === 'h') {
    // medidas na face (frentes), de baixo para cima; a divisória fica dentro do topo da parte de baixo
    const n = no.partes.length, fh = g.fy1 - g.fy0;
    const fixas = no.partes.filter(p => p.medida !== 'auto').reduce((s,p) => s + p.medida, 0), nAuto = no.partes.filter(p => p.medida === 'auto').length;
    const hAuto = nAuto ? (fh - fixas) / nAuto : 0;
    let y = g.fy0;
    no.partes.forEach((p, i) => {
      const h = p.medida === 'auto' ? hAuto : p.medida, y0 = y, y1 = y + h; y = y1;
      const temSep = no.sep === 'divisoria' && i < n-1;
      const iy0 = i === 0 ? g.iy0 : ctx.contrato.limitarInterior === false ? y0 : Math.max(y0, g.iy0), iy1 = temSep ? y1 - t : (i === n-1 ? g.iy1 : Math.min(y1, g.iy1));
      const sub = { ...g, iy0, iy1, fy0:y0, fy1:y1, b:{ ...g.b, baixo: i === 0 ? g.b.baixo : 'interna', cima: i === n-1 ? g.b.cima : 'interna' } };
      percorrer(p.no, sub, nivel + 1, cam + '.' + i);
      if (temSep) {
        const k = ++cont.divH, id = k === 1 ? 'divisoria' : `divisoria-h-${k}`;
        add({ id, nome:'Divisória horizontal', nomeLista:'Divisória', cat:'caixa', a:g.ix1-g.ix0, b:Dc, fita:[1,0], box:[g.ix0,g.ix1,y1-t,y1,zf,zFr], des:{ w:g.ix1-g.ix0, h:Dc, fita:['b'], frente:'b', vista:'Vista de cima' } });
      }
    });
    return;
  }
  if (no.tipo === 'vao') { regioes.push({ caminho:cam, num:cont.vao + 1, x0:g.ix0, x1:g.ix1, y0:g.iy0, y1:g.iy1, fx0:g.fx0, fx1:g.fx1, fy0:g.fy0, fy1:g.fy1 }); vao(no, g, nivel); }
}

function vaoDaArvore(ctx, no, g) {
  const { cont } = ctx;
  const V = ++cont.vao, fr = no.frente || { tipo:'nenhuma' };
  // FRENTE e CONTEÚDO (de baixo para cima) vêm do registro: nucleo/frentes/*.js e nucleo/conteudos/*.js
  const ladoFrente = FRENTES[fr.tipo] ? FRENTES[fr.tipo].gerar(ctx, g, fr, V) || null : null;
  const est = { g, V, y:g.iy0, kPrat:0, ladoFrente, x0:g.ix0, x1:g.ix1, w:g.ix1 - g.ix0, xm:(g.ix0 + g.ix1)/2 };
  for (const ct of (no.conteudo || [])) CONTEUDOS[ct.tipo]?.gerar(ctx, ct, est);
}
