/* =====================================================================
   3. GERADOR DO GABINETE — parâmetros → peças, ferragens, erros
   Eixos: x = largura (0 à esquerda), y = altura (0 no chão), z = profundidade (0 na parede)
   ===================================================================== */
function gerarGabinete(p) {
  const E = [], A = [], pecas = [];
  const n = k => Number(p[k]);
  const L=n('largura'), H=n('altura'), P=n('profundidade'), t=n('espMDF'), tf=n('espFundo'), pes=n('pes');
  const faixa = (v,a,b,nome) => { if (!(v>=a && v<=b)) E.push(`${nome}: use de ${a} a ${b} mm (está ${isNaN(v)?'vazio':fmt(v)}).`); };
  faixa(L,300,2400,'Largura'); faixa(H,300,2200,'Altura'); faixa(P,250,800,'Profundidade');
  faixa(t,12,25,'Espessura do MDF'); faixa(tf,3,15,'Espessura do fundo'); faixa(pes,0,200,'Altura dos pés');
  faixa(n('tampoLarg'),0,3000,'Largura do tampo'); faixa(n('tampoProf'),0,1000,'Profundidade do tampo'); faixa(n('tampoEsp'),0,60,'Espessura do tampo');
  faixa(n('puxadorProj'),0,60,'Saliência do puxador'); faixa(n('esgoto'),0,2000,'Altura do esgoto');
  faixa(n('gavetas'),0,6,'Gavetas (un)'); faixa(n('prateleiras'),0,6,'Prateleiras (un)');
  if (E.length) return { pecas, erros:E, avisos:A, ferragens:[], dims:null };

  const eE = (p.paredeEsq && p.enchimento) ? R.enchimento : 0;
  const eD = (p.paredeDir && p.enchimento) ? R.enchimento : 0;
  const xa=eE, xb=L-eD, W=xb-xa, Wi=W-2*t;
  const y0=pes, top=H, Hc=H-pes;
  const zf=tf, Dc=P-t-tf, zFr=zf+Dc;
  const proj = n('puxadorProj');
  if (Wi < 150) E.push(`O vão interno fica com ${fmt(Wi)} mm (mínimo 150). Aumente a largura.`);
  if (Dc < 150) E.push(`A caixa fica com ${fmt(Dc)} mm de fundo (mínimo 150). Aumente a profundidade.`);

  const add = o => {
    const pc = Object.assign({ lista:true, mov:null, obs:'', esp:t, mat:'mdf-ru-branco', fita:[0,0] }, o);
    if (o.a !== undefined) {
      let a=o.a, b=o.b, fa=(o.fita||[0,0])[0], fb=(o.fita||[0,0])[1];
      if (b > a) { [a,b]=[b,a]; [fa,fb]=[fb,fa]; }
      pc.comp=a; pc.larg=b; pc.fita=[fa,fb];
    }
    Object.assign(pc, papelDe(pc.id));
    pecas.push(pc); return pc;
  };
  const ferr = o => add(Object.assign({ cat:'ferragem', mat:'cromado', lista:false }, o));

  // Gavetas
  const nP=Number(p.portas), nG=Math.max(0,Math.round(n('gavetas'))), nS=Math.max(0,Math.round(n('prateleiras')));
  let alts = [];
  if (nG > 0) {
    const lst = String(p.alturasGavetas).split(/[;,\s]+/).filter(Boolean).map(s => Number(s.replace(',','.')));
    if (!lst.length || lst.some(isNaN)) E.push('Altura das gavetas: escreva números separados por vírgula, ex.: 150, 200.');
    else if (lst.length === 1) alts = Array(nG).fill(lst[0]);
    else if (lst.length === nG) alts = lst;
    else E.push(`São ${nG} gavetas, mas há ${lst.length} alturas informadas.`);
  }
  const somaG = alts.reduce((s,v)=>s+v,0);
  const zonaSup = Hc - somaG;
  const temSup = zonaSup > 0.5;
  if (nP > 0 && zonaSup < 200) E.push(`Sobram só ${fmt(zonaSup)} mm para as portas (mínimo 200). Diminua as gavetas.`);
  if (nP === 0 && zonaSup < 0) E.push('As gavetas passam da altura do móvel.');
  alts.forEach((h,i) => { if (h < 100) E.push(`Gaveta ${i+1}: altura ${fmt(h)} mm (mínimo 100).`); });
  const Lc = [...R.corredicas].reverse().find(c => c <= Dc - 10);
  if (nG > 0 && !Lc) E.push(`A caixa tem ${fmt(Dc)} mm de fundo: não cabe a menor corrediça (250 mm).`);

  // CAIXA
  add({ id:'lateral-esq', nome:'Lateral esquerda', nomeLista:'Lateral', cat:'caixa', a:Hc, b:Dc, fita:[1,0], box:[xa,xa+t,y0,top,zf,zFr], obs:'Altura total da caixa.', des:{ w:Dc, h:Hc, fita:['l'], frente:'l', vista:'Vista pela face interna' } });
  add({ id:'lateral-dir', nome:'Lateral direita',  nomeLista:'Lateral', cat:'caixa', a:Hc, b:Dc, fita:[1,0], box:[xb-t,xb,y0,top,zf,zFr], obs:'Altura total da caixa.', des:{ w:Dc, h:Hc, fita:['r'], frente:'r', vista:'Vista pela face interna' } });
  add({ id:'base', nome:'Base', nomeLista:'Base', cat:'caixa', a:Wi, b:Dc, fita:[1,0], box:[xa+t,xb-t,y0,y0+t,zf,zFr], obs:'Entre as laterais.', des:{ w:Wi, h:Dc, fita:['b'], frente:'b', vista:'Vista de cima' } });
  add({ id:'travessa-frontal', nome:'Travessa superior frontal', nomeLista:'Travessa superior frontal', cat:'caixa', a:Wi, b:R.travessa, fita:[1,0], box:[xa+t,xb-t,top-t,top,zFr-R.travessa,zFr], obs:'Apoia o tampo. Confira a folga da cuba.', des:{ w:Wi, h:R.travessa, fita:['b'], frente:'b', vista:'Vista de cima' } });
  add({ id:'travessa-traseira', nome:'Travessa superior traseira', nomeLista:'Travessa superior traseira', cat:'caixa', a:Wi, b:R.travessa, box:[xa+t,xb-t,top-t,top,zf,zf+R.travessa], obs:'Apoia o tampo.', des:{ w:Wi, h:R.travessa, vista:'Vista de cima' } });
  add({ id:'travessa-fixacao', nome:'Travessa de fixação na parede', nomeLista:'Travessa de fixação', cat:'caixa', a:Wi, b:R.travessa, box:[xa+t,xb-t,top-t-R.travessa,top-t,zf,zf+t], obs:'Vertical, atrás. Recebe os parafusos da parede.', des:{ w:Wi, h:R.travessa, vista:'Vista de frente', furos:[50, Wi/2, Wi-50].map(x => ({ x, y:R.travessa/2, d:6, prof:0, tipo:'parede' })) } });
  add({ id:'fundo', nome:'Fundo do móvel', nomeLista:'Fundo do móvel', cat:'fundo', mat:'mdf-branco', esp:tf, a:Hc, b:W, box:[xa,xb,y0,top,0,tf], obs:'Pregado atrás. Recortar para os canos na obra.', des:{ w:W, h:Hc, vista:'Vista de trás' } });

  const yDiv = y0 + somaG;
  if (nG > 0 && temSup) add({ id:'divisoria', nome:'Divisória (piso das portas)', nomeLista:'Divisória', cat:'caixa', a:Wi, b:Dc, fita:[1,0], box:[xa+t,xb-t,yDiv-t,yDiv,zf,zFr], obs:`Topo a ${fmt(yDiv)} mm do chão. Separa gavetas e portas.`, des:{ w:Wi, h:Dc, fita:['b'], frente:'b', vista:'Vista de cima' } });

  // GAVETAS
  let yAc = y0;
  alts.forEach((h,i) => {
    const k=i+1, zy0=yAc, zy1=yAc+h; yAc=zy1;
    const ultima = i === nG-1;
    const mov = { tipo:'gaveta', idx:i, curso:(Lc||0)*0.9 };
    const fy0 = zy0 + (i===0 ? R.borda : R.entre/2);
    const fy1 = zy1 - ((ultima && !temSup) ? R.borda : R.entre/2);
    const sufixo = nG>1 ? ' '+k : '';
    const xm=(xa+xb)/2, ym=(fy0+fy1)/2, wf=W-2*R.borda;
    const frente = add({ id:`gaveta-${k}-frente`, nome:'Frente da gaveta'+sufixo, nomeLista:'Frente da gaveta', cat:'frente', a:W-2*R.borda, b:fy1-fy0, fita:[2,2], box:[xa+R.borda,xb-R.borda,fy0,fy1,zFr,P], mov, obs:'Presa à caixa da gaveta por dentro (parafuso 3,5 × 25).', des:{ w:wf, h:fy1-fy0, fita:['t','b','l','r'], vista:'Vista pela face interna', furos:[-64,64].map(dx => ({ x:wf/2+dx, y:ym-fy0, d:5, prof:0, tipo:'puxador' })) } });
    if (!Lc) return;
    const hb = Math.floor((h - R.folgaAltGaveta)/10)*10;
    if (hb < 60) { if (h >= 100) E.push(`Gaveta ${k}: a caixa ficaria com ${hb} mm de altura (mínimo 60). Aumente a altura dela.`); return; }
    const yb = (i===0 ? y0+t : zy0) + R.folgaPisoGaveta;
    const Wg = Wi - 2*R.corredica, xg0 = xa+t+R.corredica, xg1 = xg0+Wg, zg0 = zFr-Lc;
    const desLatGav = { w:Lc, h:hb, fita:['t'], vista:'Vista de lado', linhas:[{ x1:0, y1:hb/2, x2:Lc, y2:hb/2, txt:'eixo da corrediça' }] };
    const yPx = ym - yb, wInt = Wg-2*t;
    const furosInt = (yPx > 10 && yPx < hb-10) ? [-64,64].map(dx => ({ x:wInt/2+dx, y:yPx, d:5, prof:0, tipo:'puxador' })) : [];
    add({ id:`gaveta-${k}-lateral-esq`, nome:`Lateral esquerda da gaveta${sufixo}`, nomeLista:'Lateral da gaveta', cat:'gaveta', a:Lc, b:hb, fita:[1,0], box:[xg0,xg0+t,yb,yb+hb,zg0,zFr], mov, expPai:frente.id, des:desLatGav });
    add({ id:`gaveta-${k}-lateral-dir`, nome:`Lateral direita da gaveta${sufixo}`, nomeLista:'Lateral da gaveta', cat:'gaveta', a:Lc, b:hb, fita:[1,0], box:[xg1-t,xg1,yb,yb+hb,zg0,zFr], mov, expPai:frente.id, des:desLatGav });
    add({ id:`gaveta-${k}-frente-interna`, nome:`Frente interna da gaveta${sufixo}`, nomeLista:'Frente/traseira da gaveta', cat:'gaveta', a:Wg-2*t, b:hb, fita:[1,0], box:[xg0+t,xg1-t,yb,yb+hb,zFr-t,zFr], mov, expPai:frente.id, obs:'Entre as laterais da gaveta.' + (furosInt.length ? ' Furar o puxador junto com a frente (parafuso M4 longo).' : ''), des:{ w:wInt, h:hb, fita:['t'], vista:'Vista de frente', furos:furosInt } });
    add({ id:`gaveta-${k}-traseira`, nome:`Traseira da gaveta${sufixo}`, nomeLista:'Frente/traseira da gaveta', cat:'gaveta', a:Wg-2*t, b:hb, fita:[1,0], box:[xg0+t,xg1-t,yb,yb+hb,zg0,zg0+t], mov, expPai:frente.id, obs:'Entre as laterais da gaveta.', des:{ w:wInt, h:hb, fita:['t'], vista:'Vista de frente' } });
    add({ id:`gaveta-${k}-fundo`, nome:`Fundo da gaveta${sufixo}`, nomeLista:'Fundo da gaveta', cat:'gaveta', mat:'mdf-branco', esp:tf, a:Wg, b:Lc, box:[xg0,xg1,yb-tf,yb,zg0,zFr], mov, expPai:frente.id, obs:'Pregado por baixo.', des:{ w:Wg, h:Lc, vista:'Vista de cima' } });
    const yc = yb + hb/2;
    ferr({ id:`gaveta-${k}-corredica-esq`, nome:`Corrediça ${Lc} mm esquerda${sufixo}`, box:[xa+t,xg0,yc-22.5,yc+22.5,zg0,zFr], ref:'corr-tel45-amort', obs:'Telescópica 45 mm com amortecedor, extração total.' });
    ferr({ id:`gaveta-${k}-corredica-dir`, nome:`Corrediça ${Lc} mm direita${sufixo}`, box:[xg1,xb-t,yc-22.5,yc+22.5,zg0,zFr], ref:'corr-tel45-amort', obs:'Telescópica 45 mm com amortecedor, extração total.' });
    ferr({ id:`gaveta-${k}-puxador`, nome:`Puxador da gaveta${sufixo}`, forma:{tipo:'puxador',dir:'h'}, box:[xm-R.puxadorComp/2,xm+R.puxadorComp/2,ym-6,ym+6,P,P+proj], mov, expPai:frente.id, obs:'Barra, furação 128 mm.' });
  });

  // PORTAS
  if (nP > 0 && temSup) {
    const yp0 = yDiv + (nG>0 ? R.entre/2 : R.borda), yp1 = top - R.borda, hp = yp1 - yp0;
    const def = nP === 2
      ? [{ lado:'esq', x0:xa+R.borda, x1:xa+W/2-R.entre/2 }, { lado:'dir', x0:xa+W/2+R.entre/2, x1:xb-R.borda }]
      : [{ lado:(p.paredeEsq && !p.paredeDir) ? 'dir' : 'esq', x0:xa+R.borda, x1:xb-R.borda }];
    def.forEach(d => {
      const dw = d.x1 - d.x0;
      const nomeL = nP===2 ? (d.lado==='esq'?' esquerda':' direita') : '';
      if (dw > R.portaMaxLarg) E.push(`Porta${nomeL} com ${fmt(dw)} mm de largura (máximo ${R.portaMaxLarg}). Use 2 portas.`);
      const pivX = d.lado==='esq' ? xa : xb;
      const nd = dobradicasPorAltura(hp);
      const pos = Array.from({length:nd}, (_,j) => R.dobradicaBorda + j*(hp-2*R.dobradicaBorda)/(nd-1));
      const xp = d.lado==='esq' ? d.x1-35 : d.x0+35;
      const ypc = hp > 320 ? yp1-120 : (yp0+yp1)/2;
      const temParede = d.lado==='esq' ? !!p.paredeEsq : !!p.paredeDir;
      const eW = d.lado==='esq' ? eE : eD;
      const lim = limiteAbertura({ temParede, eW, u0:R.borda, u1:R.borda+dw, uPx:Math.abs(xp-pivX), proj, t, P });
      const mov = { tipo:'porta', lado:d.lado, pivX, pivZ:P, angMax:lim.ang };
      const porta = add({ id:`porta-${d.lado}`, nome:'Porta'+nomeL, nomeLista:'Porta', cat:'frente', a:hp, b:dw, fita:[2,2], box:[d.x0,d.x1,yp0,yp1,P-t,P], mov,
        obs:`${nd} dobradiças. Caneco Ø35 com centro a 22 mm da borda, a ${pos.map(fmt).join(' / ')} mm da base da porta. Abre até ${fmt(lim.ang)}°.`,
        des:{ w:dw, h:hp, fita:['t','b','l','r'], vista:'Vista pela face interna', furos:[
          ...pos.map(py => ({ x: d.lado==='esq' ? dw-R.canecoBorda : R.canecoBorda, y:py, d:35, prof:13, tipo:'caneco' })),
          ...[-64,64].map(dy => ({ x: dw-(xp-d.x0), y: ypc-yp0+dy, d:5, prof:0, tipo:'puxador' })) ] } });
      const xc = d.lado==='esq' ? d.x0+R.canecoBorda : d.x1-R.canecoBorda;
      pos.forEach((py,j) => ferr({ id:`porta-${d.lado}-dobradica-${j+1}`, nome:`Dobradiça ${j+1} da porta${nomeL}`, forma:{tipo:'cil',eixo:'z'},
        box:[xc-17.5,xc+17.5,yp0+py-17.5,yp0+py+17.5,P-t-1,P-t+12], mov, expPai:porta.id, obs:'Blum CLIP top BLUMOTION 110°, reta (71B3550). Caneco Ø35 × 13.' }));
      ferr({ id:`porta-${d.lado}-puxador`, nome:'Puxador da porta'+nomeL, forma:{tipo:'puxador',dir:'v'}, box:[xp-6,xp+6,ypc-R.puxadorComp/2,ypc+R.puxadorComp/2,P,P+proj], mov, expPai:porta.id, obs:'Barra, furação 128 mm.' });
      if (temParede && lim.ang < 90) A.push(`Porta${nomeL} abre só até ${fmt(lim.ang)}°: ${lim.motivo}.${eW ? ' Aumente o enchimento ou use puxador mais baixo.' : ' Ligue o enchimento de 25 mm.'}`);
    });
  }

  // PRATELEIRAS
  if (nS > 0 && !temSup) A.push('Não sobra espaço acima das gavetas: as prateleiras foram ignoradas.');
  if (nS > 0 && temSup) {
    const piso = nG>0 ? yDiv : y0+t, teto = top - t;
    const vao = (teto - piso - nS*t)/(nS+1);
    if (vao < 100) E.push(`Com ${nS} prateleira${nS>1?'s':''} o vão fica com ${fmt(vao)} mm (mínimo 100). Diminua as prateleiras ou as gavetas.`);
    const dp = Dc - R.recuoPrat - R.folgaFundoPrat, w = Wi - 2*R.folgaPrat;
    const fx = [n('esgoto')-R.faixaEsgoto, n('esgoto')+R.faixaEsgoto];
    for (let i=0; i<nS; i++) {
      const yb = piso + vao*(i+1) + t*i, yt = yb + t;
      const cruza = yt > fx[0] && yb < fx[1];
      let forma = null, obs = `Topo a ${fmt(yt)} mm do chão. Apoiada em 4 pinos.`;
      if (cruza) {
        const rl=n('recorteLarg'), rp=n('recorteProf');
        if (!(rl > 0 && rp > 0) || rl > w-80 || rp > dp-80) E.push(`Recorte do sifão (${fmt(rl)} × ${fmt(rp)}) não cabe na prateleira de ${fmt(w)} × ${fmt(dp)}.`);
        else { forma = { tipo:'recorte', rl, rp }; obs = `Recorte traseiro ${fmt(rl)} × ${fmt(rp)} mm no centro, para o sifão. ` + obs; }
        A.push(`Prateleira${nS>1?' '+(i+1):''} cruza a faixa do esgoto (${fmt(fx[0])} a ${fmt(fx[1])} mm do chão) e recebeu recorte.`);
      }
      add({ id:`prateleira-${i+1}`, nome:nS>1?`Prateleira ${i+1}`:'Prateleira', nomeLista:forma?'Prateleira com recorte':'Prateleira', cat:'caixa', a:w, b:dp, fita:[1,0],
        box:[xa+t+R.folgaPrat, xb-t-R.folgaPrat, yb, yt, zf+R.folgaFundoPrat, zf+R.folgaFundoPrat+dp], forma, obs,
        des:{ w, h:dp, fita:['b'], frente:'b', vista:'Vista de cima', recortes: forma ? [{ x:(w-forma.rl)/2, w:forma.rl, h:forma.rp }] : [] } });
    }
  }

  // ENCHIMENTO
  [['esq',eE,0,eE],['dir',eD,L-eD,L]].forEach(([lado,e,x0,x1]) => {
    if (!e) return;
    const nomeL = lado==='esq' ? 'esquerdo' : 'direito';
    add({ id:`enchimento-${lado}`, nome:`Enchimento ${nomeL} (frontal)`, nomeLista:'Enchimento frontal', cat:'enchimento', a:Hc, b:e, fita:[1,0], box:[x0,x1,y0,top,P-t,P], obs:`Fecha a folga de ${e} mm entre a caixa e a parede.`, des:{ w:e, h:Hc, fita:[lado==='esq'?'r':'l'], vista:'Vista de frente' } });
    const sx0 = lado==='esq' ? Math.max(0,x1-t) : x0, sx1 = lado==='esq' ? x1 : Math.min(L,x0+t);
    add({ id:`sarrafo-${lado}`, nome:`Sarrafo do enchimento ${nomeL}`, nomeLista:'Sarrafo do enchimento', cat:'enchimento', a:Hc, b:R.sarrafo, box:[sx0,sx1,y0,top,P-t-R.sarrafo,P-t], obs:'Parafusado na lateral; segura o enchimento.', des:{ w:R.sarrafo, h:Hc, vista:'Vista de lado' } });
  });

  // TAMPO
  const tl=n('tampoLarg'), tp=n('tampoProf'), te=n('tampoEsp');
  if (tl > 0 && tp > 0 && te > 0) {
    const tx0 = p.paredeEsq ? 0 : p.paredeDir ? L-tl : (L-tl)/2;
    add({ id:'tampo', nome:'Tampo (existente)', cat:'tampo', mat:'marmore', esp:te, a:tl, b:tp, lista:false, box:[tx0,tx0+tl,top,top+te,0,tp], obs:'Não entra na lista de corte. Colar com silicone neutro.' });
    if (tl < L) A.push(`O tampo (${fmt(tl)} mm) é mais estreito que o móvel (${fmt(L)} mm).`);
    if (tl > L + 60) A.push(`O tampo sobra ${fmt(tl-L)} mm além do móvel.`);
    if (tp < P) A.push(`As frentes ficam ${fmt(P-tp)} mm para fora do tampo.`);
  }

  // FURAÇÃO DAS LATERAIS (depende das outras peças)
  ['esq','dir'].forEach(lado => {
    const lat = pecas.find(q => q.papel === 'lateral' && q.lado === lado); if (!lat) return;
    const X = z => lado==='esq' ? zFr - z : z - zf, Y = y => y - y0;
    const furos = [], linhas = [];
    const furo = (z,y,d,prof,tipo) => furos.push({ x:X(z), y:Y(y), d, prof, tipo });
    const q = id => pecas.find(x => x.id === id);
    ['base','divisoria'].forEach(id => { const b = q(id); if (!b) return; const yc=(b.box[2]+b.box[3])/2; [zFr-50,(zf+zFr)/2,zf+50].forEach(z => furo(z,yc,4,0,'montagem')); });
    [zFr-25, zFr-75, zf+75, zf+25].forEach(z => furo(z, top-t/2, 4, 0, 'montagem'));
    [top-t-75, top-t-25].forEach(y => furo(zf+t/2, y, 4, 0, 'montagem'));
    pecas.filter(x => x.papel === 'prateleira').forEach(s => [s.box[5]-40, s.box[4]+40].forEach(z => furo(z, s.box[2]-5, 5, 10, 'pino')));
    pecas.filter(x => x.papel === 'dobradica' && x.expPai === `porta-${lado}`).forEach(h => { const yc=(h.box[2]+h.box[3])/2; [yc-16, yc+16].forEach(y => furo(zFr-37, y, 3, 10, 'calco')); });
    pecas.filter(x => x.papel === 'corredica' && x.lado === lado).forEach(c => { const yc=(c.box[2]+c.box[3])/2; linhas.push({ x1:X(zFr), y1:Y(yc), x2:X(c.box[4]), y2:Y(yc), txt:'eixo da corrediça' }); [zFr-37, c.box[4]+37].forEach(z => furo(z, yc, 3, 10, 'corredica')); });
    lat.des.furos = furos; lat.des.linhas = linhas;
  });

  // FERRAGENS
  const conta = c => pecas.filter(c).length;
  const nDob = conta(pc => pc.papel === 'dobradica');
  const nPux = conta(pc => pc.papel === 'puxador');
  const nGv = pecas.filter(pc => pc.papel === 'frente-interna-gaveta').length;
  const nPrat = conta(pc => pc.papel === 'prateleira');
  const temDiv = conta(pc => pc.id==='divisoria');
  const nEnch = (eE?1:0) + (eD?1:0);
  const red10 = v => Math.ceil(v*1.2/10)*10;
  const perim = pc => 2*(pc.comp+pc.larg);
  const fundos = pecas.filter(pc => pc.papel === 'fundo' || pc.papel === 'fundo-gaveta');
  const fitaMm = pecas.filter(pc=>pc.lista).reduce((s,pc)=>s + pc.fita[0]*pc.comp + pc.fita[1]*pc.larg, 0);
  const fitaLarg = t <= 19 ? 22 : 35;
  const ferragens = [];
  const F = (ref, qtd, obs='', var_='') => {
    if (!(qtd > 0)) return;
    const b = BIBLIOTECA[ref];
    const nome = b.nome + (var_ ? ' ' + var_ : '');
    ferragens.push({ ref, item: nome + (b.marca ? ` — ${b.marca}${b.codigo ? ' ' + b.codigo : ''}` : ''), nome, marca:b.marca, codigo:b.codigo, qtd, unid: b.metro ? 'm' : (b.unid==='par' ? 'par' : 'un'), obs: b.metro ? 'metros, com 10% de perda' : obs, var:var_ });
  };
  F('dob-blum-71B3550', nDob, 'Caneco Ø35 × 13, centro a 22 mm da borda.');
  F('calco-blum-0', nDob, 'Na lateral, linha a 37 mm da frente.');
  if (nGv) F('corr-tel45-amort', nGv, 'Gaveta 26 mm mais estreita que o vão.', `${Lc} mm`);
  F('pux-barra-128', nPux);
  F('pino-5', nPrat*4);
  F('paraf-40x50', red10(((2 + (temDiv?2:0) + 6) * 3) + nGv*12 + nEnch*6));
  F('paraf-35x14', red10(nDob*4 + nGv*12 + fundos.reduce((s,pc)=>s+Math.ceil(perim(pc)/150),0)));
  F('paraf-35x25', nGv*4);
  F('paraf-50x60-bucha', 3, 'Na travessa de fixação.');
  if (pes > 0) F('sapata', L > 1000 ? 6 : 4, `Altura ${fmt(pes)} mm.`);
  F(fitaLarg === 22 ? 'fita-pvc-22' : 'fita-pvc-35', Math.ceil(fitaMm*R.perdaFita/1000));
  if (pecas.some(pc=>pc.cat==='tampo')) F('silicone', 1, 'Colar o tampo e vedar.');

  return { pecas, erros:E, avisos:A, ferragens, dims:{ L, H, P, t, top, faixaEsgoto:[n('esgoto')-R.faixaEsgoto, n('esgoto')+R.faixaEsgoto], paredeEsq:!!p.paredeEsq, paredeDir:!!p.paredeDir, alturaTampo:top+(te>0?te:0) } };
}


// Sapateira de prateleiras retas: quantos níveis de pelo menos 'min' mm cabem entre y0 (topo do apoio) e y1 (teto do vão);
// 'max' > 0 limita o número de níveis (0 = quantos couberem); os níveis ficam iguais, repartindo a sobra. Devolve a base de cada prateleira que separa os níveis.
function niveisSapateira(y0, y1, t, min, max) {
  const livre = y1 - y0, cabe = Math.max(0, Math.floor((livre + t) / (min + t))), n = max > 0 ? Math.min(cabe, Math.round(max)) : cabe;
  if (!n) return { n, min, cabe, pedido:max, altura:0, ys:[] };
  const altura = (livre - (n-1)*t) / n;
  return { n, min, cabe, pedido:max, altura, ys: Array.from({ length:n-1 }, (_, k) => y0 + altura*(k+1) + t*k) };
}

/* =====================================================================
   3b. GERADOR DO ARMÁRIO — caixa única com divisórias verticais, uma porta por vão.
   Conteúdo por vão: prateleiras | vassoura | gavetas | gavetas+botijao | vazio
   ===================================================================== */
function gerarArmario(p) {
  const E = [], A = [], pecas = [];
  const n = k => Number(p[k]);
  const L=n('largura'), H0=n('altura'), P=n('profundidade'), t=n('espMDF'), tf=n('espFundo'), RD=n('rodape'), rec=n('recuoRodape'), HB=n('alturaBeiral');
  const faixa = (v,a,b,nome) => { if (!(v>=a && v<=b)) E.push(`${nome}: use de ${a} a ${b} mm (está ${isNaN(v)?'vazio':fmt(v)}).`); };
  faixa(L,400,3000,'Largura'); faixa(H0,600,2700,'Altura'); faixa(HB,0,200,'Altura do beiral'); faixa(P,250,700,'Profundidade'); faixa(RD,0,200,'Rodapé'); faixa(rec,0,100,'Recuo do rodapé');
  faixa(t,12,25,'Espessura do MDF'); faixa(tf,3,15,'Espessura do fundo');
  const PxP = PUXADORES[n('puxadorPorta')], PxG = PUXADORES[n('puxadorGaveta')];
  if (!PxP || !PxG) E.push('Escolha os puxadores.');
  const vaos = String(p.vaos).split(',').map(x => x.trim().toLowerCase().replace(/\s+/g,'')).filter(Boolean).map(x => x === 'botijao+gavetas' ? 'gavetas+botijao' : x);
  const validos = ['prateleiras','vassoura','vassoura+sapateira','gavetas','gavetas+botijao','vazio'];
  if (!vaos.length || vaos.length > 8) E.push('Informe de 1 a 8 vãos no conteúdo.');
  vaos.forEach((v,i) => { if (!validos.includes(v)) E.push(`Vão ${i+1}: "${v}" não é reconhecido. Use: ${validos.join(', ')}.`); });
  if (E.length) return { pecas, erros:E, avisos:A, ferragens:[], dims:null };

  const H = H0 - HB;                                           // altura da caixa (o beiral fica em cima)
  const nV = vaos.length, zf = tf, Dc = P - t - tf, zFr = zf + Dc;
  const Wi = L - 2*t, w = (Wi - (nV-1)*t) / nV;
  const yI0 = RD + t, yI1 = H - t, Hi = yI1 - yI0;
  const proj = PxP.proj;
  if (w < 250) E.push(`Cada vão fica com ${fmt(w)} mm (mínimo 250). Diminua o número de vãos ou aumente a largura.`);
  if (w + t > R.portaMaxLarg) E.push(`Portas de ${fmt(w+t)} mm passam do máximo (${R.portaMaxLarg}). Aumente o número de vãos.`);
  const add = o => {
    const pc = Object.assign({ lista:true, mov:null, obs:'', esp:t, mat:'mdf-ru-branco', fita:[0,0] }, o);
    if (o.a !== undefined) { let a=o.a, b=o.b, fa=(o.fita||[0,0])[0], fb=(o.fita||[0,0])[1]; if (b > a) { [a,b]=[b,a]; [fa,fb]=[fb,fa]; } pc.comp=a; pc.larg=b; pc.fita=[fa,fb]; }
    Object.assign(pc, papelDe(pc.id));
    pecas.push(pc); return pc;
  };
  const ferr = o => add(Object.assign({ cat:'ferragem', mat:'cromado', lista:false }, o));
  const xv = i => t + i*(w + t);                               // início do vão i
  const botIdx = vaos.indexOf('gavetas+botijao');

  // ventilação do botijão: rasgos na lateral direita (só se o botijão estiver no último vão)
  let rasgos = null;
  if (botIdx >= 0) {
    if (botIdx !== nV - 1) A.push('O botijão não está no último vão: a ventilação na lateral direita não alcança o compartimento. Coloque "gavetas+botijao" por último.');
    else if (p.paredeDir) E.push('O botijão precisa de ventilação pela lateral direita, mas ela está marcada como encostada na parede.');
    else {
      const hB = n('alturaBotijao'), lista = [], larg = 15, alt = 150, passo = 35;
      const nR = Math.floor((Dc - 80 + passo - larg) / passo), z0 = zf + (Dc - ((nR-1)*passo + larg)) / 2;
      for (const ya of [yI0 + 25, yI0 + hB - 25 - alt]) for (let k = 0; k < nR; k++) lista.push({ z0: z0 + k*passo, z1: z0 + k*passo + larg, y0: ya, y1: ya + alt });
      rasgos = lista;
    }
  }

  // CAIXA
  add({ id:'lateral-esq', nome:'Lateral esquerda', nomeLista:'Lateral', cat:'caixa', a:H, b:Dc, fita:[1,0], box:[0,t,0,H,zf,zFr], obs:'Altura total, até o chão (rodapé recuado).', des:{ w:Dc, h:H, fita:['l'], frente:'l', vista:'Vista pela face interna' } });
  const latD = add({ id:'lateral-dir', nome: rasgos ? 'Lateral direita com ventilação' : 'Lateral direita', nomeLista: rasgos ? 'Lateral com ventilação' : 'Lateral', cat:'caixa', a:H, b:Dc, fita:[1,0], box:[L-t,L,0,H,zf,zFr],
    forma: rasgos ? { tipo:'rasgos', lista:rasgos } : null,
    obs: rasgos ? `Ventilação do botijão: ${rasgos.length} rasgos 15 × 150 passantes, embaixo e em cima do compartimento (usinar na CNC ou com tupia e gabarito). Este lado não pode encostar em parede.` : 'Altura total, até o chão (rodapé recuado).',
    des:{ w:Dc, h:H, fita:['r'], frente:'r', vista:'Vista pela face interna', rasgos: rasgos ? rasgos.map(r => ({ x:r.z0 - zf, y:r.y0, w:r.z1 - r.z0, h:r.y1 - r.y0 })) : [] } });
  add({ id:'topo', nome:'Topo', nomeLista:'Topo', cat:'caixa', a:Wi, b:Dc, fita:[1,0], box:[t,L-t,H-t,H,zf,zFr], obs:'Entre as laterais.', des:{ w:Wi, h:Dc, fita:['b'], frente:'b', vista:'Vista de cima' } });
  add({ id:'base', nome:'Base', nomeLista:'Base', cat:'caixa', a:Wi, b:Dc, fita:[1,0], box:[t,L-t,RD,RD+t,zf,zFr], obs:`Apoiada no rodapé, a ${fmt(RD)} mm do chão.`, des:{ w:Wi, h:Dc, fita:['b'], frente:'b', vista:'Vista de cima' } });
  if (RD > 0) {
    add({ id:'rodape-frontal', nome:'Rodapé frontal', nomeLista:'Rodapé', cat:'caixa', a:Wi, b:RD, box:[t,L-t,0,RD,zFr-rec-t,zFr-rec], obs:`Recuado ${fmt(rec)} mm da frente da caixa.`, des:{ w:Wi, h:RD, vista:'Vista de frente' } });
    add({ id:'rodape-traseiro', nome:'Rodapé traseiro', nomeLista:'Rodapé', cat:'caixa', a:Wi, b:RD, box:[t,L-t,0,RD,zf,zf+t], obs:'Apoio da base atrás.', des:{ w:Wi, h:RD, vista:'Vista de frente' } });
  }
  if (HB > 0) {
    add({ id:'beiral-frontal', nome:'Beiral frontal', nomeLista:'Beiral frontal', cat:'caixa', a:L, b:HB, fita:[1,2], box:[0,L,H,H0,zFr-t,zFr], obs:'Em cima do topo, alinhado com a frente da caixa. Parafusado por baixo do topo; cavilhas nas laterais.', des:{ w:L, h:HB, fita:['t','l','r'], vista:'Vista de frente' } });
    for (const [id, nome, x0] of [['beiral-esq','Beiral lateral esquerdo',0], ['beiral-dir','Beiral lateral direito',L-t]])
      add({ id, nome, nomeLista:'Beiral lateral', cat:'caixa', a:Dc-t, b:HB, fita:[1,0], box:[x0,x0+t,H,H0,zf,zFr-t], obs:'Sobre a lateral: 2 cavilhas Ø8 × 30 com cola no topo da lateral e 2 no beiral frontal.', des:{ w:Dc-t, h:HB, fita:['t'], vista:'Vista lateral' } });
  }
  add({ id:'fundo', nome:'Fundo do móvel', nomeLista:'Fundo do móvel', cat:'fundo', mat:'mdf-branco', esp:tf, a:H-RD, b:L, box:[0,L,RD,H,0,tf], obs:'Parafusado atrás em todo o contorno e nas divisórias.', des:{ w:L, h:H-RD, vista:'Vista de trás' } });
  for (let i = 1; i < nV; i++) {
    const x0 = xv(i) - t;
    add({ id:`divisoria-v-${i}`, nome:`Divisória vertical ${i}`, nomeLista:'Divisória vertical', cat:'caixa', a:Hi, b:Dc, fita:[1,0], box:[x0,x0+t,yI0,yI1,zf,zFr], obs:'Entre base e topo. Recebe dobradiças dos dois lados.', des:{ w:Dc, h:Hi, fita:['l'], frente:'l', vista:'Vista lateral (lado direito)' } });
  }
  for (let i = 0; i < nV; i++) {
    const x0 = xv(i);
    add({ id:`travessa-fixacao-${i+1}`, nome:`Travessa de fixação ${i+1}`, nomeLista:'Travessa de fixação', cat:'caixa', a:w, b:80, box:[x0,x0+w,yI1-80,yI1,zf,zf+t], obs:'Atrás, sob o topo. 2 parafusos na parede.', des:{ w, h:80, vista:'Vista de frente', furos:[50, w-50].map(x => ({ x, y:40, d:6, prof:0, tipo:'parede' })) } });
  }

  // PORTAS (uma por vão; em pares abrindo do centro para fora: esq, dir, esq, dir…)
  const cortes = [0, ...Array.from({length:nV-1}, (_,i) => xv(i+1) - t/2), L];
  const yp0 = RD + R.borda, yp1 = H - R.borda, hp = yp1 - yp0;
  const nd = dobradicasPorAltura(hp);
  const pos = Array.from({length:nd}, (_,j) => R.dobradicaBorda + j*(hp-2*R.dobradicaBorda)/(nd-1));
  const ladoDob = i => (i % 2 === 0) ? 'esq' : 'dir';
  for (let i = 0; i < nV; i++) {
    const lado = ladoDob(i);
    const x0 = cortes[i] + (i === 0 ? R.borda : R.entre/2), x1 = cortes[i+1] - (i === nV-1 ? R.borda : R.entre/2), dw = x1 - x0;
    const pivX = lado === 'esq' ? cortes[i] : cortes[i+1];
    const xp = lado === 'esq' ? x1 - 35 : x0 + 35, ypc = Math.min(Math.max(n('alturaPuxador'), yp0 + PxP.comp/2 + 20), yp1 - PxP.comp/2 - 20);
    const temParede = (i === 0 && lado === 'esq' && p.paredeEsq) || (i === nV-1 && lado === 'dir' && p.paredeDir);
    const lim = limiteAbertura({ temParede, eW:0, u0:R.borda, u1:R.borda+dw, uPx:Math.abs(xp-pivX), proj, t, P });
    const mov = { tipo:'porta', lado, pivX, pivZ:P, angMax:lim.ang };
    const id = `porta-${i+1}`;
    const porta = add({ id, nome:`Porta ${i+1}`, nomeLista:'Porta', cat:'frente', a:hp, b:dw, fita:[2,2], box:[x0,x1,yp0,yp1,P-t,P], mov,
      obs:`${nd} dobradiças do lado ${lado === 'esq' ? 'esquerdo' : 'direito'}. Caneco Ø35 × 13 com centro a 22 mm da borda, a ${pos.map(fmt).join(' / ')} mm da base da porta.`,
      des:{ w:dw, h:hp, fita:['t','b','l','r'], vista:'Vista pela face interna', furos:[
        ...pos.map(py => ({ x: lado === 'esq' ? dw-R.canecoBorda : R.canecoBorda, y:py, d:35, prof:13, tipo:'caneco' })),
        ...[-1,1].map(sn => ({ x: dw-(xp-x0), y: ypc-yp0+sn*PxP.furacao/2, d:5, prof:0, tipo:'puxador' })) ] } });
    const xc = lado === 'esq' ? x0 + R.canecoBorda : x1 - R.canecoBorda;
    pos.forEach((py,j) => ferr({ id:`${id}-dobradica-${j+1}`, nome:`Dobradiça ${j+1} da porta ${i+1}`, forma:{tipo:'cil',eixo:'z'}, box:[xc-17.5,xc+17.5,yp0+py-17.5,yp0+py+17.5,P-t-1,P-t+12], mov, expPai:porta.id, obs:'Blum CLIP top BLUMOTION 110°, reta (71B3550).' }));
    ferr({ id:`${id}-puxador`, nome:`Puxador da porta ${i+1}`, forma:{tipo:'puxador',dir:'v',modelo:PxP.modelo,furacao:PxP.furacao}, cor:PxP.cor, ref:PxP.ref, box:[xp-PxP.larg/2,xp+PxP.larg/2,ypc-PxP.comp/2,ypc+PxP.comp/2,P,P+proj], mov, expPai:porta.id, obs:`${PxP.rot}, furação ${PxP.furacao} mm.` });
    if (temParede && lim.ang < 90) A.push(`Porta ${i+1} abre só até ${fmt(lim.ang)}°: ${lim.motivo}. Use enchimento.`);
  }

  // CONTEÚDO DOS VÃOS
  const dp = Dc - R.recuoPrat - R.folgaFundoPrat;
  const prateleira = (i, k, yb, nome, obs) => add({ id:`prateleira-${i+1}-${k}`, nome, nomeLista:'Prateleira', cat:'caixa', a:w-2*R.folgaPrat, b:dp, fita:[1,0],
    box:[xv(i)+R.folgaPrat, xv(i)+w-R.folgaPrat, yb, yb+t, zf+R.folgaFundoPrat, zf+R.folgaFundoPrat+dp], obs: obs || `Topo a ${fmt(yb+t)} mm do chão. Apoiada em 4 pinos.`,
    des:{ w:w-2*R.folgaPrat, h:dp, fita:['b'], frente:'b', vista:'Vista de cima' } });
  let nGavTotal = 0, nSup = 0, nGancho = 0, Lc = null;
  vaos.forEach((v, i) => {
    const x0 = xv(i), x1 = x0 + w, xm = (x0 + x1)/2;
    if (v === 'prateleiras') {
      const nS = Math.max(0, Math.round(n('prateleiras'))), vao = (Hi - nS*t)/(nS+1);
      if (nS && vao < 150) E.push(`Vão ${i+1}: com ${nS} prateleiras o espaço fica ${fmt(vao)} mm (mínimo 150).`);
      for (let k = 0; k < nS; k++) prateleira(i, k+1, yI0 + vao*(k+1) + t*k, nS > 1 ? `Prateleira ${k+1} do vão ${i+1}` : `Prateleira do vão ${i+1}`);
    }
    if (v === 'vassoura' || v === 'vassoura+sapateira') {
      // com sapateira: a prateleira das vassouras desce ao mínimo (1200 livres) e a sapateira ocupa o resto do vão
      const comSap = v === 'vassoura+sapateira', yb = comSap ? yI0 + 1200 : n('alturaPratVassoura') - t;
      if (yb < yI0 + 1200 || yb + t > yI1 - 100) E.push(`Vão ${i+1}: a prateleira das vassouras deve ficar entre ${fmt(yI0+1200+t)} e ${fmt(yI1-100)} mm.`);
      prateleira(i, 1, yb, `Prateleira do vão ${i+1} (vassouras)`, `Topo a ${fmt(yb+t)} mm. Embaixo fica livre para vassoura, rodo e aspirador.${comSap ? ' Em cima é o 1º nível da sapateira.' : ''}`);
      if (comSap) {
        const sap = niveisSapateira(yb + t, yI1, t, Number(p.alturaNivelSapateira) || 250, Number(p.niveisSapateira) || 0);
        if (sap.n < 1) E.push(`Vão ${i+1}: não cabe sapateira acima das vassouras (sobram ${fmt(yI1 - yb - t)} mm; cada nível precisa de ${fmt(sap.min)}).`);
        else A.push(`Vão ${i+1}: sapateira com ${sap.n} níve${sap.n > 1 ? 'is' : 'l'} de ${fmt(sap.altura)} mm acima das vassouras.`);
        if (sap.pedido > sap.cabe) A.push(`Vão ${i+1}: pediu ${Math.round(sap.pedido)} níveis na sapateira, mas acima das vassouras só cabem ${sap.cabe} de ${fmt(sap.min)} mm.`);
        sap.ys.forEach((ys, k) => prateleira(i, k+2, ys, `Prateleira ${k+2} da sapateira (vão ${i+1})`));
      }
      [x0 + w*0.22, xm, x1 - w*0.22].forEach((xs, k) => ferr({ id:`vao-${i+1}-suporte-${k+1}`, nome:`Suporte de vassoura/rodo ${k+1}`, box:[xs-25, xs+25, 1250, 1300, zf+t, zf+t+45], obs:'Garra de pressão, parafusada na régua de reforço.' }));
      ferr({ id:`vao-${i+1}-gancho`, nome:'Gancho do aspirador', box:[xm-30, xm+30, 880, 920, zf+t, zf+t+70], obs:'Gancho duplo para aspirador e mangueira.' });
      nSup += 3; nGancho += 1;
      // reforço atrás dos suportes (o fundo de 6 mm não segura parafuso)
      add({ id:`reforco-vassoura-${i+1}`, nome:`Régua de reforço do gancho (vão ${i+1})`, nomeLista:'Régua de reforço', cat:'caixa', a:w, b:100, box:[x0, x1, 850, 950, zf, zf+t], obs:'Atrás do fundo não dá para parafusar (6 mm): o gancho é parafusado nesta régua.', des:{ w, h:100, vista:'Vista de frente' } });
      add({ id:`reforco-vassoura-${i+1}b`, nome:`Régua de reforço dos suportes (vão ${i+1})`, nomeLista:'Régua de reforço', cat:'caixa', a:w, b:100, box:[x0, x1, 1225, 1325, zf, zf+t], obs:'Os suportes de vassoura são parafusados nesta régua.', des:{ w, h:100, vista:'Vista de frente' } });
    }
    if (v === 'gavetas' || v === 'gavetas+botijao') {
      let yAc = yI0;
      if (v === 'gavetas+botijao') {
        const hB = n('alturaBotijao');
        if (hB < 520) E.push(`Vão ${i+1}: altura livre do botijão de ${fmt(hB)} mm é pouca (mínimo 520 para P13 + regulador).`);
        if (w < 390) E.push(`Vão ${i+1}: largura de ${fmt(w)} mm não passa o botijão P13 (Ø360 + folga).`);
        if (Dc < 370) E.push(`Profundidade interna de ${fmt(Dc)} mm não comporta o botijão P13 (Ø360).`);
        add({ id:`botijao-${i+1}`, nome:'Botijão P13 (referência)', cat:'referencia', mat:'mdf-branco', lista:false, forma:{ tipo:'cil', eixo:'y' }, box:[xm-180, xm+180, yI0, yI0+480, zf+(Dc-360)/2, zf+(Dc+360)/2], obs:'Só para conferir o espaço. Não é fabricado.' });
        const yf = yI0 + hB;
        add({ id:`prateleira-fixa-${i+1}`, nome:`Tampo do compartimento do botijão (vão ${i+1})`, nomeLista:'Prateleira fixa', cat:'caixa', a:w, b:Dc, fita:[1,0], box:[x0, x1, yf, yf+t, zf, zFr], obs:`Fixa (parafusada), topo a ${fmt(yf+t)} mm do chão.`, des:{ w, h:Dc, fita:['b'], frente:'b', vista:'Vista de cima' } });
        yAc = yf + t;
      }
      const nG = Math.max(0, Math.round(n('gavetas'))), gH = n('alturaGaveta');
      if (nG) {
        const lado = ladoDob(i), esp = t, recG = 45;               // espaçador do lado da dobradiça; frentes recuadas 45 mm
        Lc = [...R.corredicas].reverse().find(c => c <= Dc - recG - t - 10);
        if (!Lc) E.push(`Vão ${i+1}: não cabe corrediça para gaveta interna (fundo útil ${fmt(Dc-recG-t-10)} mm).`);
        const xr0 = lado === 'esq' ? x0 + esp : x0, xr1 = lado === 'esq' ? x1 : x1 - esp;
        const ytop = yAc + nG*gH;
        if (PxG.proj > recG - 8) E.push(`O puxador das gavetas (${PxG.rot}) sai ${PxG.proj} mm e bate na porta: as gavetas ficam ${recG} mm atrás dela. Use um que saia até ${recG-8} mm: ${Object.values(PUXADORES).filter(x => x.proj <= recG-8).map(x => x.rot.split(' · ')[0]).join(', ')}.`);
        if (PxG.comp > xr1 - xr0 - 40) E.push('O puxador das gavetas é maior que a frente da gaveta.');
        if (ytop > yI1 - 50) E.push(`Vão ${i+1}: as ${nG} gavetas de ${fmt(gH)} mm não cabem (sobra ${fmt(yI1-yAc)} mm).`);
        add({ id:`espacador-${i+1}`, nome:`Espaçador das corrediças (vão ${i+1})`, nomeLista:'Espaçador das corrediças', cat:'caixa', a:nG*gH, b:zFr-recG-zf, box:[lado === 'esq' ? x0 : x1-esp, lado === 'esq' ? x0+esp : x1, yAc, ytop, zf, zFr-recG],
          obs:'Afasta as corrediças das dobradiças. Parafusado na lateral/divisória.', des:{ w:zFr-recG-zf, h:nG*gH, vista:'Vista lateral' } });
        if (Lc) for (let k = 0; k < nG; k++) {
          const kk = ++nGavTotal, zy0 = yAc + k*gH, zy1 = zy0 + gH, mov = { tipo:'gaveta', idx:kk-1, curso:Lc*0.9 };
          const fx0 = xr0 + 3, fx1 = xr1 - 3, fy0 = zy0 + 1.5, fy1 = zy1 - 1.5, zF1 = zFr - recG, zF0 = zF1 - t, wf = fx1 - fx0;
          const xmf = (fx0+fx1)/2, ymf = (fy0+fy1)/2;
          const frente = add({ id:`gaveta-${kk}-frente`, nome:`Frente da gaveta ${kk}`, nomeLista:'Frente da gaveta interna', cat:'frente', a:wf, b:fy1-fy0, fita:[2,2], box:[fx0,fx1,fy0,fy1,zF0,zF1], mov,
            obs:'Gaveta interna, atrás da porta (frente recuada 45 mm).', des:{ w:wf, h:fy1-fy0, fita:['t','b','l','r'], vista:'Vista pela face interna', furos:[-1,1].map(sn => ({ x:wf/2+sn*PxG.furacao/2, y:ymf-fy0, d:5, prof:0, tipo:'puxador' })) } });
          const hb = Math.floor((gH - 40)/10)*10, yb = zy0 + R.folgaPisoGaveta;
          if (hb < 60) { E.push(`Gaveta ${kk}: caixa com ${hb} mm (mínimo 60). Aumente a altura das gavetas.`); continue; }
          const Wg = (xr1 - xr0) - 2*R.corredica, xg0 = xr0 + R.corredica, xg1 = xg0 + Wg, zg1 = zF0, zg0 = zg1 - Lc, wInt = Wg - 2*t;
          const desLat = { w:Lc, h:hb, fita:['t'], vista:'Vista de lado', linhas:[{ x1:0, y1:hb/2, x2:Lc, y2:hb/2, txt:'eixo da corrediça' }] };
          add({ id:`gaveta-${kk}-lateral-esq`, nome:`Lateral esquerda da gaveta ${kk}`, nomeLista:'Lateral da gaveta', cat:'gaveta', a:Lc, b:hb, fita:[1,0], box:[xg0,xg0+t,yb,yb+hb,zg0,zg1], mov, expPai:frente.id, des:desLat });
          add({ id:`gaveta-${kk}-lateral-dir`, nome:`Lateral direita da gaveta ${kk}`, nomeLista:'Lateral da gaveta', cat:'gaveta', a:Lc, b:hb, fita:[1,0], box:[xg1-t,xg1,yb,yb+hb,zg0,zg1], mov, expPai:frente.id, des:desLat });
          add({ id:`gaveta-${kk}-frente-interna`, nome:`Frente interna da gaveta ${kk}`, nomeLista:'Frente/traseira da gaveta', cat:'gaveta', a:wInt, b:hb, fita:[1,0], box:[xg0+t,xg1-t,yb,yb+hb,zg1-t,zg1], mov, expPai:frente.id, des:{ w:wInt, h:hb, fita:['t'], vista:'Vista de frente' } });
          add({ id:`gaveta-${kk}-traseira`, nome:`Traseira da gaveta ${kk}`, nomeLista:'Frente/traseira da gaveta', cat:'gaveta', a:wInt, b:hb, fita:[1,0], box:[xg0+t,xg1-t,yb,yb+hb,zg0,zg0+t], mov, expPai:frente.id, des:{ w:wInt, h:hb, fita:['t'], vista:'Vista de frente' } });
          add({ id:`gaveta-${kk}-fundo`, nome:`Fundo da gaveta ${kk}`, nomeLista:'Fundo da gaveta', cat:'gaveta', mat:'mdf-branco', esp:tf, a:Wg, b:Lc, box:[xg0,xg1,yb-tf,yb,zg0,zg1], mov, expPai:frente.id, des:{ w:Wg, h:Lc, vista:'Vista de cima' } });
          const yc = yb + hb/2;
          ferr({ id:`gaveta-${kk}-corredica-esq`, nome:`Corrediça ${Lc} mm esquerda da gaveta ${kk}`, box:[xr0,xg0,yc-22.5,yc+22.5,zg0,zg1], ref:'corr-tel45-amort', obs:'Telescópica 45 mm com amortecedor.' });
          ferr({ id:`gaveta-${kk}-corredica-dir`, nome:`Corrediça ${Lc} mm direita da gaveta ${kk}`, box:[xg1,xr1,yc-22.5,yc+22.5,zg0,zg1], ref:'corr-tel45-amort', obs:'Telescópica 45 mm com amortecedor.' });
          ferr({ id:`gaveta-${kk}-puxador`, nome:`Puxador da gaveta ${kk}`, forma:{tipo:'puxador',dir:'h',modelo:PxG.modelo,furacao:PxG.furacao}, cor:PxG.cor, ref:PxG.ref, box:[xmf-PxG.comp/2,xmf+PxG.comp/2,ymf-PxG.larg/2,ymf+PxG.larg/2,zF1,zF1+PxG.proj], mov, expPai:frente.id, obs:`${PxG.rot}. Fica ${fmt(recG-PxG.proj)} mm atrás da porta.` });
        }
        const nAc = Math.max(0, Math.round(n('pratAcimaGavetas'))), livre = yI1 - ytop;
        if (nAc && livre > 250) { const vao = (livre - nAc*t)/(nAc+1); for (let k = 0; k < nAc; k++) prateleira(i, k+1, ytop + vao*(k+1) + t*k, `Prateleira ${k+1} acima das gavetas (vão ${i+1})`); }
      }
    }
  });

  // FERRAGENS
  const conta = c => pecas.filter(c).length;
  const nDob = conta(pc => pc.papel === 'dobradica');
  const nPux = conta(pc => pc.papel === 'puxador');
  const nPrat = conta(pc => pc.papel === 'prateleira');
  const juntas = 2 /*topo*/ + 2 /*base*/ + (RD > 0 ? 4 : 0) + 2*(nV-1) + 2*nV /*travessas*/ + 2*conta(pc => pc.papel === 'prateleira-fixa') + 2*conta(pc => pc.papel === 'reforco');
  const fundos = pecas.filter(pc => pc.papel === 'fundo' || pc.papel === 'fundo-gaveta');
  const perim = pc => 2*(pc.comp + pc.larg);
  const fitaMm = pecas.filter(pc => pc.lista).reduce((s,pc) => s + pc.fita[0]*pc.comp + pc.fita[1]*pc.larg, 0);
  const fitaLarg = t <= 19 ? 22 : 35;
  const red10 = v => Math.ceil(v*1.2/10)*10;
  const ferragens = [];
  const F = (ref, qtd, obs='', var_='') => {
    if (!(qtd > 0)) return; const b = BIBLIOTECA[ref], nome = b.nome + (var_ ? ' ' + var_ : '');
    ferragens.push({ ref, item: nome + (b.marca ? ` — ${b.marca}${b.codigo ? ' ' + b.codigo : ''}` : ''), nome, marca:b.marca, codigo:b.codigo, qtd, unid: b.metro ? 'm' : (b.unid==='par' ? 'par' : 'un'), obs: b.metro ? 'metros, com 10% de perda' : obs, var:var_ });
  };
  F('dob-blum-71B3550', nDob, `${nd} por porta. Caneco Ø35 × 13, centro a 22 mm da borda.`);
  F('calco-blum-0', nDob, 'Linha a 37 mm da frente da lateral/divisória.');
  if (nGavTotal) F('corr-tel45-amort', nGavTotal, 'Gaveta interna: 26 mm mais estreita que o espaço entre espaçador e lateral.', `${Lc} mm`);
  const porRef = {}; pecas.filter(pc => pc.papel === 'puxador').forEach(pc => porRef[pc.ref] = (porRef[pc.ref]||0) + 1);
  for (const [ref, q] of Object.entries(porRef)) { const px = Object.values(PUXADORES).find(x => x.ref === ref); F(ref, q, `Furação ${px.furacao} mm, parafuso M4 (vem com o puxador).` + (px.conf ? ` [Suposição] ${px.conf} estimadas: confirmar na loja.` : '')); }
  F('pino-5', nPrat*4);
  F('suporte-vassoura', nSup); F('gancho-aspirador', nGancho);
  const fx = calcularFixacoes(pecas), nF = tipo => fx.filter(f => f.tipo === tipo).length;
  F('paraf-40x50', red10(nF('paraf-40x50')), `${nF('paraf-40x50')} nas juntas (ver "Fixações" no 3D) + reserva.`);
  F('paraf-40x30', red10(nF('paraf-40x30')));
  F('paraf-35x14', red10(nF('paraf-35x14') + nDob*4 + nGavTotal*12 + nSup*2 + nGancho*2), 'Fundos, dobradiças, corrediças e suportes.');
  F('paraf-35x25', nF('paraf-35x25'));
  F('cavilha-8x30', Math.ceil(nF('cavilha-8x30')*1.2), 'Com cola PVA.');
  F('paraf-50x60-bucha', nF('paraf-50x60-bucha'), 'Nas travessas de fixação, 2 por vão.');
  F(fitaLarg === 22 ? 'fita-pvc-22' : 'fita-pvc-35', Math.ceil(fitaMm*R.perdaFita/1000));
  if (H > 1800) A.push('Móvel alto: fixe na parede antes de colocar peso (risco de tombar).');
  return { pecas, erros:E, avisos:A, ferragens, fixacoes:fx, dims:{ L, H:H0, P, t, top:H0, faixaEsgoto:null, paredeEsq:!!p.paredeEsq, paredeDir:!!p.paredeDir, alturaTampo:H0 } };
}


/* =====================================================================
   3c. FIXAÇÕES — calculadas pelo contato entre as peças (vale para qualquer tipo)
   Face de uma peça encostada no topo de outra: parafuso atravessa a primeira e entra no topo da segunda.
   Topo com topo: cavilha. Fundo: parafuso 3,5 × 14 a cada ~150 mm.
   Cada item: { tipo, p:[x,y,z] entrada, dir:[x,y,z], comp, d, dono }
   ===================================================================== */
function calcularFixacoes(pecas) {
  const F = [], ext = pc => [0,1,2].map(i => pc.box[2*i+1] - pc.box[2*i]);
  const fino = pc => { const e = ext(pc); return e.indexOf(Math.min(...e)); };
  const P = pecas.filter(pc => pc.lista && ['caixa','gaveta','enchimento','fundo','frente'].includes(pc.cat) && pc.box);
  const linha = (a, b, margem, passo) => { const L = b - a, m = Math.min(margem, L*0.25); if (L < 60) return [(a+b)/2];
    const n = Math.max(2, Math.ceil((L - 2*m)/passo) + 1); return Array.from({ length:n }, (_, i) => a + m + (L - 2*m)*i/(n-1)); };
  const add = (tipo, p, dir, comp, d, dono) => F.push({ tipo, p, dir, comp, d, dono });
  for (const A of P) for (const B of P) {
    if (A === B) continue;
    for (let ax = 0; ax < 3; ax++) {
      const lado = Math.abs(A.box[2*ax+1] - B.box[2*ax]) < 0.6 ? 1 : Math.abs(A.box[2*ax] - B.box[2*ax+1]) < 0.6 ? -1 : 0;
      if (!lado) continue;
      const o = [0,1,2].filter(i => i !== ax), ov = {};
      o.forEach(i => ov[i] = [Math.max(A.box[2*i], B.box[2*i]), Math.min(A.box[2*i+1], B.box[2*i+1])]);
      if (o.some(i => ov[i][1] - ov[i][0] < 1)) continue;
      const fA = fino(A), fB = fino(B), dir = [0,0,0]; dir[ax] = lado;
      const xEntrada = lado === 1 ? A.box[2*ax] : A.box[2*ax+1], xContato = lado === 1 ? A.box[2*ax+1] : A.box[2*ax];
      const pt = (vAx, vals) => { const q = [0,0,0]; q[ax] = vAx; o.forEach(i => q[i] = vals[i]); return q; };
      const ehBeiral = pc => pc.papel === 'beiral-frontal' || pc.papel === 'beiral-lateral', bordaBeiral = ehBeiral(A) || ehBeiral(B);
      if (fA === ax && fB !== ax && A.cat !== 'frente' && B.cat !== 'frente') {
        // A atravessada, entra no topo de B; linha ao longo do eixo do plano que não é a espessura de B
        const q = o.find(i => i !== fB), meio = (ov[fB][0] + ov[fB][1]) / 2;
        if (A.cat === 'fundo') { for (const v of linha(ov[q][0], ov[q][1], 40, 150)) add('paraf-35x14', pt(xEntrada, { [q]:v, [fB]:meio }), dir, 14, 3.5, B.id); }
        else if (bordaBeiral && ehBeiral(A)) { for (const v of linha(ov[q][0], ov[q][1], 50, 300)) add('cavilha-8x30', pt(xContato - lado*15, { [q]:v, [fB]:meio }), dir, 30, 8, B.id); }
        else for (const v of linha(ov[q][0], ov[q][1], 50, 250)) add('paraf-40x50', pt(xEntrada, { [q]:v, [fB]:meio }), dir, 50, 4, B.id);
      } else if (fA === ax && fB === ax) {
        // face com face: frente da gaveta (pela frente interna) e espaçador das corrediças
        const [i, j] = o;
        if (B.cat === 'frente' && /-frente-interna$/.test(A.id)) {
          for (const u of linha(ov[i][0], ov[i][1], 60, 1e9)) for (const v of linha(ov[j][0], ov[j][1], 30, 1e9)) add('paraf-35x25', pt(xEntrada, { [i]:u, [j]:v }), dir, 25, 3.5, B.id);
        } else if (A.papel === 'espacador' && B.cat !== 'frente') {
          for (const u of linha(ov[i][0], ov[i][1], 60, 300)) for (const v of linha(ov[j][0], ov[j][1], 50, 1e9)) add('paraf-40x30', pt(xEntrada, { [i]:u, [j]:v }), dir, 30, 4, B.id);
        }
      } else if (fA !== ax && fB !== ax && A.id < B.id && bordaBeiral) {
        // topo com topo (beiral sobre a lateral): cavilhas
        const q = o.find(i => i !== fA), meio = (ov[fA][0] + ov[fA][1]) / 2;
        for (const v of linha(ov[q][0], ov[q][1], 50, 300)) add('cavilha-8x30', pt(xContato - lado*15, { [q]:v, [fA]:meio }), dir, 30, 8, B.id);
      }
    }
  }
  // parafusos de parede nas travessas
  for (const pc of pecas.filter(pc => pc.papel === 'travessa-fixacao')) for (const f of (pc.des?.furos || []).filter(f => f.tipo === 'parede'))
    add('paraf-50x60-bucha', [pc.box[0] + f.x, pc.box[2] + f.y, pc.box[5]], [0,0,-1], 60 + pc.box[5] - pc.box[4], 5, pc.id);
  // pinos das prateleiras soltas (4 por prateleira, nas paredes do vão)
  for (const pc of pecas.filter(pc => pc.papel === 'prateleira')) {
    const [x0,x1,y0,,z0,z1] = pc.box;
    for (const [x, dx] of [[x0 - 1, 1], [x1 + 1, -1]]) for (const z of [z0 + 40, z1 - 40]) add('pino-5', [x - dx*8, y0 - 3, z], [dx,0,0], 18, 5, pc.id);
  }
  return F;
}

