/* =====================================================================
   3e. NÚCLEO NOVO (sub-etapa 4a) — módulo + árvore de vãos + frentes → peças
   Um gerador só para qualquer móvel de caixa. Ainda não é usado pela tela:
   roda ao lado dos geradores antigos e é conferido pelos testes.
   Módulo: { largura, altura, profundidade, construcao, ambiente, raiz }
   Nó DIVIDIR: { tipo:'dividir', dir:'v'|'h', sep:'divisoria'|'nenhum', partes:[{ medida:'auto'|mm, no }] }
   Nó VÃO:     { tipo:'vao', frente:{ tipo:'porta'|'2portas'|'gaveta'|'nenhuma', lado }, conteudo:[...] }
   ===================================================================== */

function gerarModuloV3(m) {
  const E = [], A = [], pecas = [];
  const c = resolverMetodo(m), amb = m.ambiente || {};
  const entre = c.lateral === 'entre';                                 // topo e base passantes, laterais entre eles
  const t = c.espMDF, tf = c.espFundo, L = m.largura, H0 = m.altura, P = m.profundidade;
  const HB = c.beiral || 0, H = H0 - HB;
  // TRANSPORTE: limite do projeto (padrão em regras); módulo montado vai inteiro, então as peças não têm limite próprio
  const montado = m.entrega === 'montado', limT = m.transporte?.menorLadoMax ?? R.transporteMenorLado ?? Infinity, Tpeca = montado ? Infinity : limT;
  const eE = (c.paredeEsq && c.enchimento) ? R.enchimento : 0, eD = (c.paredeDir && c.enchimento) ? R.enchimento : 0;
  const xa = eE, xb = L - eD, W = xb - xa, Wi = W - 2*t;
  const rod = c.apoio === 'rodape', RD = rod ? c.rodape.altura : 0;
  const yBase = rod ? RD : c.pes, yApoio = rod ? 0 : c.pes;
  const yLat0 = entre ? yBase + t : yApoio, yLat1 = entre ? H - t : H;
  // fundo sobreposto: caixa começa atrás do fundo; fundo em rasgo: caixa vai até a parede e o fundo entra recuado
  const rasgo = c.fundo.tipo === 'rasgo', zFundo = rasgo ? c.fundo.recuo : 0;
  const zfC = rasgo ? 0 : tf, zFr = P - t, DcC = zFr - zfC;           // peças da caixa
  const zf = rasgo ? zFundo + tf : tf, Dc = zFr - zf;                  // espaço útil (na frente do fundo)
  const add = o => {
    const pc = Object.assign({ lista:true, mov:null, obs:'', esp:t, mat:'mdf-ru-branco', fita:[0,0] }, o);
    if (o.a !== undefined) { let a=o.a, b=o.b, fa=(o.fita||[0,0])[0], fb=(o.fita||[0,0])[1]; if (b > a) { [a,b]=[b,a]; [fa,fb]=[fb,fa]; } pc.comp=a; pc.larg=b; pc.fita=[fa,fb]; }
    Object.assign(pc, papelDe(pc.id));
    pecas.push(pc); return pc;
  };
  const ferr = o => add(Object.assign({ cat:'ferragem', mat:'cromado', lista:false }, o));
  const cont = { porta:0, gaveta:0, vao:0, divV:0, divH:0, trav:0 };

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

  // ÁRVORE DE VÃOS
  const colunas = [], juntasFundo = [];                                            // vãos de 1º nível na horizontal (travessas de fixação)
  const ventilacao = [];
  const regiao0 = { ix0:xa+t, ix1:xb-t, iy0:yBase+t, iy1:H-t, fx0:xa, fx1:xb, fy0:yBase, fy1:H, b:{ esq:'externa', dir:'externa', baixo:'externa', cima:'externa' } };
  const folga = tipo => tipo === 'externa' ? R.borda : R.entre/2;
  const dp = Dc - R.recuoPrat - R.folgaFundoPrat;

  const regioes = [];                                                   // vãos com posição (para a tela clicar)
  function percorrer(no, g, nivel, cam = '') {
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
        const iy0 = i === 0 ? g.iy0 : Math.max(y0, g.iy0), iy1 = temSep ? y1 - t : (i === n-1 ? g.iy1 : Math.min(y1, g.iy1));
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

  // eixos das portas já feitas: para a dobradiça automática não cair na mesma divisória da vizinha (as portas bateriam)
  const eixos = [];
  const mesmoEixo = (a, b) => Math.abs(a.pivX - b.pivX) < 40 && Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0) > 50;
  const porta = (...a) => fazerPorta(ctx, ...a);   // em nucleo/frentes/giro.js

  const prateleira = (...a) => fazerPrateleira(ctx, ...a);   // em nucleo/conteudos/prateleiras.js

  function vao(no, g) {
    const V = ++cont.vao, fr = no.frente || { tipo:'nenhuma' };
    // FRENTE e CONTEÚDO (de baixo para cima) vêm do registro: nucleo/frentes/*.js e nucleo/conteudos/*.js
    const ladoFrente = FRENTES[fr.tipo] ? FRENTES[fr.tipo].gerar(ctx, g, fr, V) || null : null;
    const est = { g, V, y:g.iy0, kPrat:0, ladoFrente, x0:g.ix0, x1:g.ix1, w:g.ix1 - g.ix0, xm:(g.ix0 + g.ix1)/2 };
    for (const ct of (no.conteudo || [])) CONTEUDOS[ct.tipo]?.gerar(ctx, ct, est);
  }

  const portasCorrer = (...a) => fazerPortasCorrer(ctx, ...a);   // em nucleo/frentes/correr.js

  const basculante = (...a) => fazerBasculante(ctx, ...a);   // em nucleo/frentes/basculante.js

  const gavetaExterna = (...a) => fazerGavetaExterna(ctx, ...a);   // em nucleo/frentes/gaveta.js

  const gavetasInternas = (...a) => fazerGavetasInternas(ctx, ...a);   // em nucleo/conteudos/gavetas-internas.js

  // o que as frentes e os conteúdos registrados enxergam do módulo
  const ctx = { m, c, t, P, Dc, zf, zFr, E, A, add, ferr, cont, folga, eixos, mesmoEixo, regiao0,
    ventilacao, porta, prateleira, portasCorrer, basculante, gavetaExterna, gavetasInternas, amb, dp, eD, eE, entre, tf };
  percorrer(m.raiz, regiao0, 0);

  // FUNDO SOBREPOSTO — peças limitadas pelo transporte; usa a chapa de mercado que dá menos chapas; emenda sobre divisória ou, sem divisória, com perfil H plástico
  if (fundoPendente) {
    const matF = c.fundo.material || 'mdf-branco', espF = matF.startsWith('hdf') ? 3 : tf, hF = H - yBase;
    const PH = BIBLIOTECA['perfil-h-emenda-fundo-3'], alma = matF.startsWith('hdf') && PH ? PH.dados.alma : 0;
    const dividir = dim => {                                         // cortes [x0,x1,emendaH?] para uma chapa
      const LU = dim[0] - 2*R.refilo, WU = dim[1] - 2*R.refilo;
      if (hF > LU) return null;
      const T = Tpeca;                                                  // transporte: o menor lado da peça não passa de T
      const maxW = Math.min(hF <= WU ? LU : WU, hF > T ? T : Infinity), cortes = []; let ini = xa;
      while (xb - ini > maxW) {
        const opc = juntasFundo.filter(x => x > ini + 1 && x <= ini + maxW);
        if (opc.length) { const x = Math.max(...opc); cortes.push([ini, x, false]); ini = x; continue; }
        if (!matF.startsWith('hdf')) return null;                    // MDF sem divisória: não há emenda padrão
        const prox = juntasFundo.find(x => x > ini + maxW) ?? xb, n = Math.ceil((prox - ini) / maxW), w = (prox - ini) / n;
        for (let k = 0; k < n; k++) cortes.push([ini + k*w, ini + (k+1)*w, k < n-1]);
        ini = prox;
      }
      if (ini < xb) cortes.push([ini, xb, false]);
      return cortes;
    };
    const nChapas = (dim, cortes) => {                               // quantas chapas os pedaços do fundo ocupam (faixas lado a lado)
      const LU = dim[0] - 2*R.refilo, WU = dim[1] - 2*R.refilo, ws = cortes.map(([a, b]) => b - a);
      const conta = (lado, cabeH) => { if (!cabeH) return Infinity; let n = 0, livre = -1; for (const w of ws) { if (w > lado) return Infinity; if (livre < w) { n++; livre = lado; } livre -= w + R.serra; } return n; };
      return Math.min(conta(WU, hF <= LU), conta(LU, hF <= WU));
    };
    const opcoes = chapasDe(matF, espF).map(ref => { const dim = BIBLIOTECA[ref].dim, cortes = dividir(dim); return { ref, dim, cortes, n: cortes ? nChapas(dim, cortes) : Infinity }; }).filter(o => o.cortes)
      .sort((a, b) => a.n - b.n || a.dim[0]*a.dim[1]*a.n - b.dim[0]*b.dim[1]*b.n || a.cortes.length - b.cortes.length);
    const esc = opcoes[0] || (chapasDe(matF, espF).length ? null : { ref:null, dim:R.chapa, cortes:dividir(R.chapa) });
    if (!esc || !esc.cortes) E.push(`O fundo (${fmt(W)} × ${fmt(hF)} mm) não cabe em nenhuma chapa de ${MATERIAIS[matF].nome} disponível, nem dividido sobre as divisórias.`);
    else {
      const cortes = esc.cortes, nF = cortes.length;
      cortes.forEach(([x0, x1, emH], k) => {
        const antH = k > 0 && cortes[k-1][2], g0 = antH ? alma/2 : 0, g1 = emH ? alma/2 : 0, id = nF > 1 ? `fundo-${k+1}` : 'fundo', w = x1 - x0 - g0 - g1;
        add({ id, nome: nF > 1 ? `Fundo do móvel ${k+1} de ${nF}` : 'Fundo do móvel', nomeLista:'Fundo do móvel', cat:'fundo', mat:matF, esp:espF, a:hF, b:w, chapaRef:esc.ref, box:[x0+g0,x1-g1,yBase,H,tf-espF,tf], des:{ w, h:hF, vista:'Vista de trás' },
          obs: nF > 1 ? ((antH || emH) ? 'Emenda com perfil H plástico onde não há divisória; nas divisórias, parafusar as duas peças nelas.' : 'Emenda no meio da divisória: parafusar as duas peças nela.') : '' });
        if (emH) ferr({ id:`perfil-h-fundo-${k+1}`, nome:`Perfil H de emenda do fundo ${k+1}`, ref:'perfil-h-emenda-fundo-3', mat:'hdf-branco', box:[x1-6, x1+6, yBase, H, tf-espF-0.5, tf+0.5] });
      });
      if (cortes.some(x => x[2])) A.push('O fundo não cabe numa chapa e não há divisória no ponto da emenda: emenda com perfil H plástico.');
    }
  }

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

  // AJUSTE POR PEÇA (passo 1c): desligar ou mudar a medida — antes da furação, para os furos saírem na peça real
  aplicarAjustesPecas(pecas, m.pecasAjuste, E, A);

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
    const pino = (z, y) => { if (y < ly0 + t + 10 || y > ly1 - t - 10) return; const k = Math.round(z) + ':' + Math.round(y*10); if (vistos.has(k)) return; vistos.add(k); furo(z, y, 5, 10, 'pino'); };
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

  // TRANSPORTE: avisos (peças que não podem ser divididas não mudam)
  if (montado) { const ml = Math.min(L, H0, P); if (ml > limT) A.push(`Transporte: o módulo montado tem o menor lado de ${fmt(ml)} mm (limite do projeto ${fmt(limT)}).`); }
  else pecas.filter(q => q.lista && q.papel !== 'fundo' && Math.min(q.comp, q.larg) > limT)
    .forEach(q => A.push(`Transporte: ${q.nome} tem ${fmt(q.comp)} × ${fmt(q.larg)} mm (menor lado acima do limite de ${fmt(limT)}).`));
  const fundosT = pecas.filter(q => q.papel === 'fundo').length;
  if (!montado && fundosT > 3) A.push(`Transporte: com o limite de ${fmt(limT)} mm o fundo ficou em ${fundosT} peças (${fundosT - 1} emendas). Confira se o limite não está baixo demais.`);
  acabamentoPecas(pecas, m.materiais || {});
  const volumes = volumesDe(pecas, { montado, L, H:H0, P, A });
  // portas que se atravessariam ao abrir (ex.: dobradiça na mesma divisória, uma de cada lado): o lado fica como escolhido
  // e as duas abrem só até o ângulo em que ainda não se tocam (o "Abrir portas" do 3D abre todas juntas)
  limitarPortasQueBatem(pecas, A);
  return { pecas, erros:E, avisos:A, volumes, compras: comprasV3(pecas), vaos: regioes };
}
