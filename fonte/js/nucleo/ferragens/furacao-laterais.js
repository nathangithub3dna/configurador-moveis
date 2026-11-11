/* FURAÇÃO — laterais (montagem, minifix/cavilha, pinos de prateleira, dobradiças, corrediças), base e topo passantes,
   e os rasgos do fundo encaixado. Roda depois do ajuste por peça, para os furos saírem na peça real. */

function fazerFuracao(ctx) {
  const { H, c, entre, ferr, pecas, rasgo, t, tf, xa, xb, zFr, zFundo, zf } = ctx;
  // FURAÇÃO DAS LATERAIS (montagem, pinos, calços, corrediças)
  if (c.furarLaterais) ['esq','dir'].forEach(lado => {
    const lat = pecas.find(q => q.papel === 'lateral' && q.lado === lado); if (!lat) return;
    const [lz0, lz1, ly0, ly1] = [lat.box[4], lat.box[5], lat.box[2], lat.box[3]];   // a própria lateral (pode ter medida mudada — 1c)
    const X = z => lado === 'esq' ? lz1 - z : z - lz0, Y = y => y - ly0;
    const furos = [], linhas = [], furo = (z,y,d,prof,tipo) => furos.push({ x:X(z), y:Y(y), d, prof, tipo });
    const xIn = lado === 'esq' ? xa + t : xb - t, encosta = pc => Math.abs((lado === 'esq' ? pc.box[0] : pc.box[1]) - xIn) < 0.6;
    pecas.filter(q => ((q.papel === 'base' && !entre) || q.papel === 'divisoria' || (q.papel === 'topo' && !entre)) && encosta(q)).forEach(b => {
      const za = Math.max(lz0, b.box[4]), zb = Math.min(lz1, b.box[5]);
      const yc = (b.box[2]+b.box[3])/2, zs = [zb-50,(za+zb)/2,za+50], J = c.juncao || 'parafuso';
      if (J === 'parafuso') { if (b.papel !== 'topo') zs.forEach(z => furo(z,yc,4,0,'montagem')); return; }
      // JUNÇÃO por minifix e/ou cavilha: furos na lateral (face) e na peça que encosta (face + topo)
      const mf = R.minifix, cv = R.cavilha, fb = b.des.furos = b.des.furos || [], eixoX = lado === 'esq' ? 0 : b.box[1] - b.box[0], dirX = lado === 'esq' ? 1 : -1;
      const pontaB = lado === 'esq' ? 'topo-esq' : 'topo-dir', faceB = b.papel === 'topo' ? 'inferior' : 'superior';
      const minifixEm = J.includes('minifix') ? (J.includes('cavilha') ? [zs[0], zs[2]] : zs) : [];
      const cavilhaEm = J === 'cavilha' ? zs : J.includes('cavilha') ? [zs[0] - cv.desvio, (zs[0]+zs[2])/2, zs[2] + cv.desvio] : [];
      minifixEm.forEach(z => {
        furos.push({ x:X(z), y:Y(yc), d:mf.pinoFaceDiam, prof:mf.pinoFaceProf, tipo:'minifix-pino', face:'interna' });
        fb.push({ x:eixoX + dirX*mf.distancia, y:b.box[5] - z, d:mf.tamborDiam, prof:mf.tamborProf[t >= 18 ? '18' : '15'], tipo:'minifix-tambor', face:faceB });
        fb.push({ x:eixoX, y:b.box[5] - z, d:mf.canalTopoDiam, prof:mf.distancia, tipo:'minifix-canal', face:pontaB });
        ferr({ id:`minifix-${b.id}-${lado}-${Math.round(z)}`, nome:`Minifix ${b.nome} × lateral ${lado}`, ref:'kit-minifix-15', box:[(lado === 'esq' ? xIn : xIn) - 7.5 + dirX*mf.distancia, xIn + 7.5 + dirX*mf.distancia, yc - 7.5, yc + 7.5, z - 7.5, z + 7.5] });
      });
      cavilhaEm.forEach(z => {
        furos.push({ x:X(z), y:Y(yc), d:cv.diam, prof:cv.profFace, tipo:'cavilha', face:'interna' });
        fb.push({ x:eixoX, y:b.box[5] - z, d:cv.diam, prof:cv.profTopo, tipo:'cavilha', face:pontaB });
        ferr({ id:`cavilha-${b.id}-${lado}-${Math.round(z)}`, nome:`Cavilha ${b.nome} × lateral ${lado}`, ref:'cavilha-8x30', box:[xIn - (lado === 'esq' ? cv.profFace : cv.profTopo), xIn + (lado === 'esq' ? cv.profTopo : cv.profFace), yc - 4, yc + 4, z - 4, z + 4] });
      });
    });
    if (c.topo === 'travessas' && !entre) [lz1-25, lz1-75, lz0+75, lz0+25].forEach(z => furo(z, H-t/2, 4, 0, 'montagem'));
    pecas.filter(q => q.papel === 'travessa-fixacao' && encosta(q)).forEach(tr => { const yc = (tr.box[2]+tr.box[3])/2; [yc-25, yc+25].forEach(y => furo(zf+t/2, y, 4, 0, 'montagem')); });
    const pf = c.prateleira.furacao, vistos = new Set();
    const pino = (z, y) => {
      // Formulários também desenham a furação fora do limite quando há erro
      // nas medidas; o editor livre mantém o recorte e evita furos repetidos.
      if (ctx.contrato.limitarInterior !== false) {
        if (y < ly0 + t + 10 || y > ly1 - t - 10) return;
        const k = Math.round(z) + ':' + Math.round(y*10); if (vistos.has(k)) return; vistos.add(k);
      }
      furo(z, y, 5, 10, 'pino');
    };
    pecas.filter(q => q.papel === 'prateleira' && Math.abs((lado === 'esq' ? q.box[0] - R.folgaPrat : q.box[1] + R.folgaPrat) - xIn) < 0.6).forEach(s => [s.box[5]-40, s.box[4]+40].forEach(z => {
      const y0 = s.box[2] - 5;
      if (pf === '4-furos') pino(z, y0);
      else if (pf === 'faixa32') for (let k = -c.prateleira.faixa; k <= c.prateleira.faixa; k++) pino(z, y0 + 32*k);
      else for (let y = y0 - 32*Math.floor((y0 - ly0)/32); y < ly1; y += 32) pino(z, y);
    }));
    pecas.filter(q => q.papel === 'dobradica' && q.mov?.lado === lado && Math.abs(q.mov.pivX - (lado === 'esq' ? xa : xb)) < 0.6).forEach(h => { const yc = (h.box[2]+h.box[3])/2; [yc-16, yc+16].forEach(y => furo(zFr-37, y, 3, 10, 'calco')); });
    pecas.filter(q => q.papel === 'corredica' && q.lado === lado && Math.abs((lado === 'esq' ? q.box[0] : q.box[1]) - xIn) < 0.6).forEach(cr => { const yc = (cr.box[2]+cr.box[3])/2; linhas.push({ x1:X(zFr), y1:Y(yc), x2:X(cr.box[4]), y2:Y(yc), txt:'eixo da corrediça' }); [zFr-37, cr.box[4]+37].forEach(z => furo(z, yc, 3, 10, 'corredica')); });
    lat.des.furos = furos; lat.des.linhas = linhas;
  });
  if (c.furarLaterais && entre) ['base','topo'].forEach(pp => { const pc = pecas.find(q => q.papel === pp); if (!pc) return;
    const fur = [];
    for (const xx of [t/2, pc.box[1]-pc.box[0]-t/2]) for (const z of [pc.box[5]-50, (pc.box[4]+pc.box[5])/2, pc.box[4]+50]) fur.push({ x:xx, y:pc.box[5] - z, d:4, prof:0, tipo:'montagem' });
    pc.des.furos = fur; });
  // rasgos (canais) para o fundo encaixado
  if (rasgo) pecas.filter(q => ['lateral','base','topo','travessa'].includes(q.papel) && q.box[4] <= zFundo).forEach(q =>
    (q.des.canais = q.des.canais || []).push({ dist:zFundo, larg:tf + 2*c.fundo.folga, prof:c.fundo.prof, face:'interna', txt:'rasgo do fundo' }));
}
