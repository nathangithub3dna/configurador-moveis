/* =====================================================================
   3e. NÚCLEO NOVO (sub-etapa 4a) — módulo + árvore de vãos + frentes → peças
   Um gerador só para qualquer móvel de caixa. Ainda não é usado pela tela:
   roda ao lado dos geradores antigos e é conferido pelos testes.
   Módulo: { largura, altura, profundidade, construcao, ambiente, raiz }
   Nó DIVIDIR: { tipo:'dividir', dir:'v'|'h', sep:'divisoria'|'nenhum', partes:[{ medida:'auto'|mm, no }] }
   Nó VÃO:     { tipo:'vao', frente:{ tipo:'porta'|'2portas'|'gaveta'|'nenhuma', lado }, conteudo:[...] }
   ===================================================================== */

// MÉTODO DE CONSTRUÇÃO — níveis: padrão → método com nome → ajustes do projeto → ajustes do módulo
const unirFundo = (a, b) => { const r = { ...a }; for (const [k, v] of Object.entries(b || {})) r[k] = (v && typeof v === 'object' && !Array.isArray(v) && typeof r[k] === 'object') ? unirFundo(r[k], v) : v; return r; };
function resolverMetodo(m) {
  const cat = METODOS_CONSTRUCAO, nome = m.metodo || cat.metodoPadrao;
  if (!cat.metodos[nome]) throw new Error(`Método de construção "${nome}" não existe no catálogo.`);
  const origem = {};
  let c = unirFundo({}, cat.padrao); Object.keys(c).forEach(k => origem[k] = 'padrão');
  for (const [nivel, aj] of [[`método "${cat.metodos[nome].nome}"`, cat.metodos[nome].ajustes], ['projeto', m.metodoProjeto], ['módulo', m.metodoAjustes]])
    if (aj) { c = unirFundo(c, aj); Object.keys(aj).forEach(k => origem[k] = nivel); }
  c = { ...c, ...m.construcao };                 // medidas próprias do módulo (espessuras, paredes, tampo…)
  c.origem = origem;
  return c;
}
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

  function porta(g, lado, x0, x1, pivX, puxador) {
    const k = ++cont.porta, id = `porta-${k}`;
    const y0 = g.fy0 + folga(g.b.baixo), y1 = g.fy1 - folga(g.b.cima), hp = y1 - y0, dw = x1 - x0;
    if (dw > R.portaMaxLarg) E.push(`Porta ${k} com ${fmt(dw)} mm de largura (máximo ${R.portaMaxLarg}).`);
    const dr = dobradicasRegra(hp, dw, t), nd = dr.n;
    if (dr.acimaTabela) A.push(`Porta ${k}: ${fmt(dr.peso)} kg passa da tabela de dobradiças (32 kg) — conferir com o fabricante.`);
    const pos = Array.from({length:nd}, (_,j) => R.dobradicaBorda + j*(hp-2*R.dobradicaBorda)/(nd-1));
    const px = puxador, proj = px.proj;
    const xp = lado === 'esq' ? x1 - 35 : x0 + 35;
    const ypc = px.altura === 'topo-120' ? (hp > 320 ? y1 - 120 : (y0 + y1)/2) : Math.min(Math.max(px.altura, y0 + px.comp/2 + 20), y1 - px.comp/2 - 20);
    const naBorda = lado === 'esq' ? g.b.esq === 'externa' : g.b.dir === 'externa';
    const temParede = naBorda && (lado === 'esq' ? !!c.paredeEsq : !!c.paredeDir), eW = naBorda ? (lado === 'esq' ? eE : eD) : 0;
    const lim = limiteAbertura({ temParede, eW, u0:R.borda, u1:R.borda+dw, uPx:Math.abs(xp-pivX), proj, t, P });
    const mov = { tipo:'porta', lado, pivX, pivZ:P, angMax:lim.ang };
    const pt = add({ id, nome:`Porta ${k}`, nomeLista:'Porta', cat:'frente', a:hp, b:dw, fita:[2,2], box:[x0,x1,y0,y1,P-t,P], mov,
      des:{ w:dw, h:hp, fita:['t','b','l','r'], vista:'Vista pela face interna', furos:[
        ...pos.map(py => ({ x: lado === 'esq' ? dw-R.canecoBorda : R.canecoBorda, y:py, d:35, prof:13, tipo:'caneco' })),
        ...[-1,1].map(sn => ({ x: dw-(xp-x0), y: ypc-y0+sn*px.furacao/2, d:5, prof:0, tipo:'puxador' })) ] } });
    const xc = lado === 'esq' ? x0 + R.canecoBorda : x1 - R.canecoBorda;
    pos.forEach((py,j) => ferr({ id:`${id}-dobradica-${j+1}`, nome:`Dobradiça ${j+1} da porta ${k}`, ref:'kit-dobradica-blum-reta', forma:{tipo:'cil',eixo:'z'}, box:[xc-17.5,xc+17.5,y0+py-17.5,y0+py+17.5,P-t-1,P-t+12], mov, expPai:id }));
    ferr({ id:`${id}-puxador`, nome:`Puxador da porta ${k}`, forma:{ tipo:'puxador', dir:'v', modelo:px.modelo, furacao:px.furacao }, cor:px.cor, ref:px.ref, box:[xp-px.larg/2,xp+px.larg/2,ypc-px.comp/2,ypc+px.comp/2,P,P+proj], mov, expPai:id });
    if (temParede && lim.ang < 90) A.push(`Porta ${k} abre só até ${fmt(lim.ang)}°: ${lim.motivo}.`);
    return pt;
  }

  function prateleira(g, V, k, yb, nome) {
    const w = g.ix1 - g.ix0 - 2*R.folgaPrat;
    let forma = null;
    const esg = amb.esgoto;
    if (esg) {
      const f0 = esg.altura - R.faixaEsgoto, f1 = esg.altura + R.faixaEsgoto;
      if (yb + t > f0 && yb < f1) {
        if (!(esg.recorteLarg > 0 && esg.recorteProf > 0) || esg.recorteLarg > w-80 || esg.recorteProf > dp-80) E.push('Recorte do sifão não cabe na prateleira.');
        else forma = { tipo:'recorte', rl:esg.recorteLarg, rp:esg.recorteProf };
        A.push(`Prateleira cruza a faixa do esgoto e recebeu recorte.`);
      }
    }
    add({ id:`prateleira-${V}-${k}`, nome, nomeLista: forma ? 'Prateleira com recorte' : 'Prateleira', cat:'caixa', a:w, b:dp, fita:[1,0], forma,
      box:[g.ix0+R.folgaPrat, g.ix1-R.folgaPrat, yb, yb+t, zf+R.folgaFundoPrat, zf+R.folgaFundoPrat+dp],
      des:{ w, h:dp, fita:['b'], frente:'b', vista:'Vista de cima', recortes: forma ? [{ x:(w-forma.rl)/2, w:forma.rl, h:forma.rp }] : [] } });
  }

  function vao(no, g) {
    const V = ++cont.vao, fr = no.frente || { tipo:'nenhuma' };
    let ladoFrente = null;
    // FRENTE
    if (fr.tipo === 'porta') {
      const x0 = g.fx0 + folga(g.b.esq), x1 = g.fx1 - folga(g.b.dir);
      // lado automático: dobradiça longe da parede (a porta abre sem bater nela)
      const lado = fr.lado && fr.lado !== 'auto' ? fr.lado : ((g.b.esq === 'externa' && c.paredeEsq) ? 'dir' : 'esq');
      ladoFrente = lado;
      porta(g, lado, x0, x1, lado === 'esq' ? g.fx0 : g.fx1, m.puxadorPorta);
    } else if (fr.tipo === 'portas') {
      // quantidade automática pela largura máxima de porta; portas iguais, em pares que se encontram no meio
      const x0 = g.fx0 + folga(g.b.esq), x1 = g.fx1 - folga(g.b.dir);
      const n = fr.n && fr.n !== 'auto' ? fr.n : Math.max(1, Math.ceil((x1 - x0) / R.portaMaxLarg)), w = (x1 - x0 - (n - 1)*R.entre) / n;
      for (let i = 0; i < n; i++) {
        const a = x0 + i*(w + R.entre), b = a + w, lado = n === 1 ? 'esq' : (i % 2 === 0 ? 'esq' : 'dir');
        porta(g, lado, a, b, lado === 'esq' ? a - (i === 0 ? folga(g.b.esq) : R.entre/2) : b + (i === n-1 ? folga(g.b.dir) : R.entre/2), m.puxadorPorta);
      }
    } else if (fr.tipo === 'correr') portasCorrer(g, fr, V);
    else if (fr.tipo === 'basculante') basculante(g, fr);
    else if (fr.tipo === '2portas') {
      const meio = (g.fx0 + g.fx1)/2;
      porta(g, 'esq', g.fx0 + folga(g.b.esq), meio - R.entre/2, g.fx0, m.puxadorPorta);
      porta(g, 'dir', meio + R.entre/2, g.fx1 - folga(g.b.dir), g.fx1, m.puxadorPorta);
    } else if (fr.tipo === 'gaveta') gavetaExterna(g);
    // CONTEÚDO (de baixo para cima)
    let y = g.iy0;
    const x0 = g.ix0, x1 = g.ix1, w = x1 - x0, xm = (x0 + x1)/2;
    let kPrat = 0;
    for (const ct of (no.conteudo || [])) {
      if (ct.tipo === 'prateleiras') {
        const nS = ct.n, vaoP = (g.iy1 - y - nS*t)/(nS+1);
        if (nS && vaoP < ct.min) E.push(`Vão ${V}: com ${nS} prateleiras o espaço fica ${fmt(vaoP)} mm (mínimo ${ct.min}).`);
        for (let k = 0; k < nS; k++) prateleira(g, V, ++kPrat, y + vaoP*(k+1) + t*k, `Prateleira ${kPrat}`);
      }
      if (ct.tipo === 'prateleiras-acima') {
        const livre = g.iy1 - y;
        if (ct.n && livre > ct.minLivre) { const vaoP = (livre - ct.n*t)/(ct.n+1); for (let k = 0; k < ct.n; k++) prateleira(g, V, ++kPrat, y + vaoP*(k+1) + t*k, `Prateleira ${kPrat} acima das gavetas`); }
      }
      if (ct.tipo === 'vassoura') {
        let dy = 0;
        if (ct.sapateira) {                                          // sapateira embaixo, vassouras em pé sobre ela
          const sap = sapateiraEmbaixo(g.iy0, g.iy1, t, ct.sapateira.nivel, ct.sapateira.max || 0);
          if (sap.n < 1) E.push(`Vão ${V}: não cabe sapateira embaixo das vassouras (as vassouras precisam de ${fmt(sap.livreVassoura)} mm).`);
          else A.push(...avisoSapateira(V, sap));
          sap.ys.forEach(ys => prateleira(g, V, ++kPrat, ys, `Prateleira ${kPrat} da sapateira`));
          dy = sap.piso - g.iy0;
        } else {
          const yb = ct.alturaPrat - t;
          if (yb < g.iy0 + 1200 || yb + t > g.iy1 - 100) E.push(`Vão ${V}: a prateleira das vassouras deve ficar entre ${fmt(g.iy0+1200+t)} e ${fmt(g.iy1-100)} mm.`);
          prateleira(g, V, ++kPrat, yb, 'Prateleira das vassouras');
        }
        [x0 + w*0.22, xm, x1 - w*0.22].forEach((xs, k) => ferr({ id:`vao-${V}-suporte-${k+1}`, nome:`Suporte de vassoura/rodo ${k+1}`, box:[xs-25, xs+25, 1250+dy, 1300+dy, zf+t, zf+t+45] }));
        ferr({ id:`vao-${V}-gancho`, nome:'Gancho do aspirador', box:[xm-30, xm+30, 880+dy, 920+dy, zf+t, zf+t+70] });
        add({ id:`reforco-vassoura-${V}`, nome:'Régua de reforço do gancho', nomeLista:'Régua de reforço', cat:'caixa', a:w, b:100, box:[x0, x1, 850+dy, 950+dy, zf, zf+t], des:{ w, h:100, vista:'Vista de frente' } });
        add({ id:`reforco-vassoura-${V}b`, nome:'Régua de reforço dos suportes', nomeLista:'Régua de reforço', cat:'caixa', a:w, b:100, box:[x0, x1, 1225+dy, 1325+dy, zf, zf+t], des:{ w, h:100, vista:'Vista de frente' } });
      }
      if (ct.tipo === 'botijao') {
        const hB = ct.altura;
        if (hB < 520) E.push(`Vão ${V}: altura livre do botijão de ${fmt(hB)} mm é pouca (mínimo 520).`);
        if (w < 390) E.push(`Vão ${V}: largura de ${fmt(w)} mm não passa o botijão P13.`);
        if (Dc < 370) E.push(`Profundidade interna de ${fmt(Dc)} mm não comporta o botijão P13.`);
        add({ id:`botijao-${V}`, nome:'Botijão P13 (referência)', cat:'referencia', mat:'mdf-branco', lista:false, forma:{ tipo:'cil', eixo:'y' }, box:[xm-180, xm+180, y, y+480, zf+(Dc-360)/2, zf+(Dc+360)/2] });
        const yf = y + hB;
        add({ id:`prateleira-fixa-${V}`, nome:'Tampo do compartimento do botijão', nomeLista:'Prateleira fixa', cat:'caixa', a:w, b:Dc, fita:[1,0], box:[x0, x1, yf, yf+t, zf, zFr], des:{ w, h:Dc, fita:['b'], frente:'b', vista:'Vista de cima' } });
        if (Math.abs(x1 - regiao0.ix1) < 0.5) ventilacao.push({ lado:'dir', y0:y, hB }); else A.push('O botijão não encosta na lateral externa: a ventilação não alcança o compartimento.');
        y = yf + t;
      }
      if (ct.tipo === 'gavetas-internas') y = gavetasInternas(ct, g, y, ladoFrente, V);
    }
  }

  // PORTA DE CORRER — sistema da biblioteca: desconto de altura, transpasse, peso máximo, desempenador
  function portasCorrer(g, fr, V) {
    const sisRef = fr.sistema || 'correr-rometal-ro27', sis = BIBLIOTECA[sisRef];
    if (!sis) { E.push(`Vão ${V}: sistema de correr "${sisRef}" não está na biblioteca.`); return; }
    const d = sis.dados, emb = (fr.montagem || 'embutido') === 'embutido', tp = t;
    if (tp < d.espMin || tp > d.espMax) E.push(`Vão ${V}: o sistema ${sis.nome} aceita porta de ${d.espMin} a ${d.espMax} mm (a porta tem ${fmt(tp)}).`);
    // embutido: dentro do vão (entre laterais, base e topo); sobreposto: cobre a frente do vão
    const X0 = emb ? g.ix0 : g.fx0, X1 = emb ? g.ix1 : g.fx1, Y0 = emb ? g.iy0 : g.fy0, Y1 = emb ? g.iy1 : g.fy1;
    const n = fr.n && fr.n !== 'auto' ? fr.n : Math.max(2, Math.ceil((X1 - X0) / 1000)), tr = d.transpasse;
    const w = (X1 - X0 + (n - 1)*tr) / n, h = (Y1 - Y0) - d.descAltura[emb ? 'embutido' : 'sobreposto'];
    const z1 = emb ? zFr : P, gapTr = 5;                               // 2 trilhos: frente e trás [Suposição: 5 mm entre as folhas — conferir no sistema]
    if (d.largMin && w < d.largMin) E.push(`Vão ${V}: porta de correr com ${fmt(w)} mm de largura (mínimo ${d.largMin} no ${sis.nome}).`);
    if (d.proporcaoMax && h > d.proporcaoMax * w) E.push(`Vão ${V}: porta de correr ${fmt(h)} × ${fmt(w)} passa da proporção máxima ${d.proporcaoMax}:1.`);
    if (!emb) A.push(`Vão ${V}: portas de correr sobrepostas — a folha de trás fica no plano das frentes e a da frente ${fmt(tp + gapTr)} mm à frente do móvel.`);
    for (let i = 0; i < n; i++) {
      const k = ++cont.porta, id = `porta-correr-${k}`, xa0 = X0 + i*(w - tr), frenteTr = i % 2 === 1;
      const zz1 = frenteTr ? z1 + (emb ? 0 : tp + gapTr) : z1 - (emb ? tp + gapTr : 0), zz0 = zz1 - tp;
      const peso = pesoPeca({ comp:h, larg:w, esp:tp, mat:'mdf' });
      if (peso > d.pesoMax) E.push(`Porta de correr ${k}: ${fmt(peso)} kg passa do máximo de ${d.pesoMax} kg do ${sis.nome}.`);
      add({ id, nome:`Porta de correr ${k}`, nomeLista:'Porta de correr', cat:'frente', a:h, b:w, fita:[2,2], box:[xa0, xa0 + w, Y0 + (emb ? d.descAltura.embutido/2 : 0), Y0 + (emb ? d.descAltura.embutido/2 : 0) + h, zz0, zz1],
        mov:{ tipo:'correr', eixo:'x', curso: (X1 - X0) - w, sentido: i === 0 ? 1 : -1 }, obs:`${sis.nome}. Peso ${fmt(peso)} kg. Trilho da ${frenteTr ? 'frente' : 'trás'}.`,
        des:{ w, h, fita:['t','b','l','r'], vista:'Vista pela face interna' } });
      { const pc = Object.values(PUXADORES).find(x => x.modelo === 'concha'), ypc = Y0 + h/2, xpc = i === 0 ? xa0 + 50 : xa0 + w - 50;
        if (pc) ferr({ id:`${id}-puxador`, nome:`Puxador concha da porta de correr ${k}`, forma:{ tipo:'puxador', dir:'v', modelo:pc.modelo, furacao:pc.furacao }, cor:pc.cor, ref:pc.ref, box:[xpc-pc.larg/2, xpc+pc.larg/2, ypc-pc.comp/2, ypc+pc.comp/2, zz1, zz1 + Math.min(pc.proj, 5)], expPai:id, obs:'Concha: na porta de correr o puxador não pode sair da face (bate na outra folha).' }); }
      ferr({ id:`${id}-kit-correr`, nome:`Kit do sistema de correr da porta ${k}`, ref:sisRef, box:[xa0 + 40, xa0 + w - 40, Y0, Y0 + 20, zz0, zz1], expPai:id, obs:d.kitPorPorta || '' });
      const nDes = d.desempenadorObrigatorio || h > 2*w ? 2 : 0;
      for (let j = 0; j < nDes; j++) ferr({ id:`${id}-desempenador-${j+1}`, nome:`Desempenador ${j+1} da porta ${k}`, ref:'desempenador-dp100', box:[xa0 + w*(j ? 0.75 : 0.25) - 10, xa0 + w*(j ? 0.75 : 0.25) + 10, Y0 + 100, Y0 + h - 100, zz0 - 8, zz0], expPai:id });
    }
    ['superior','inferior'].forEach(q => ferr({ id:`trilho-${q}-${V}`, nome:`Trilho ${q} do vão ${V}`, ref:sisRef, box:[X0, X1, q === 'superior' ? Y1 - 10 : Y0, q === 'superior' ? Y1 : Y0 + 10, z1 - 2*tp - gapTr - (emb ? 0 : -tp - gapTr), z1 + (emb ? 0 : tp + gapTr)] }));
  }

  // BASCULANTE — porta que abre para cima, dobradiças em cima, pistão a gás pelo peso (regra Soprano/Completa)
  function basculante(g, fr) {
    const k = ++cont.porta, id = `porta-basculante-${k}`, Rb = R.basculante;
    const x0 = g.fx0 + folga(g.b.esq), x1 = g.fx1 - folga(g.b.dir), y0 = g.fy0 + folga(g.b.baixo), y1 = g.fy1 - folga(g.b.cima), w = x1 - x0, h = y1 - y0;
    const peso = pesoPeca({ comp:Math.max(w,h), larg:Math.min(w,h), esp:t, mat:'mdf' });
    const nP = w >= Rb.larguraDoisPistoes ? 2 : 1, forcaKg = peso * ((h/2) / Rb.cursoPistao) * Rb.fatorSeguranca, porPistaoN = forcaKg * 10 / nP;
    const forca = Rb.forcas.find(f => f >= porPistaoN);
    if (!forca) E.push(`Basculante ${k}: precisa de ${fmt(porPistaoN)} N por pistão (máximo de mercado ${Rb.forcas.at(-1)} N). Use articulador (ex.: Blum AVENTOS) ou divida a porta.`);
    const nd = dobradicasRegra(w, h, t).n, pos = Array.from({length:nd}, (_,j) => R.dobradicaBorda + j*(w - 2*R.dobradicaBorda)/(nd - 1));
    const px = m.puxadorPorta, xm = (x0 + x1)/2, yp = y0 + 40;
    const pt = add({ id, nome:`Porta basculante ${k}`, nomeLista:'Porta basculante', cat:'frente', a:w, b:h, fita:[2,2], box:[x0, x1, y0, y1, zFr, P],
      mov:{ tipo:'basculante', eixo:'x', pivY:y1, pivZ:P, angMax:90 }, obs:`Peso ${fmt(peso)} kg; ${nP} pistão(ões) de ${forca || '?'} N.`,
      des:{ w, h, fita:['t','b','l','r'], vista:'Vista pela face interna', furos:[
        ...pos.map(px_ => ({ x:px_, y:h - R.canecoBorda, d:35, prof:13, tipo:'caneco' })),
        ...[-1,1].map(sn => ({ x:w/2 + sn*px.furacao/2, y:yp - y0, d:5, prof:0, tipo:'puxador' })) ] } });
    pos.forEach((px_, j) => ferr({ id:`${id}-dobradica-${j+1}`, nome:`Dobradiça ${j+1} da basculante ${k}`, ref:'kit-dobradica-blum-reta', forma:{tipo:'cil',eixo:'z'}, box:[x0+px_-17.5, x0+px_+17.5, y1-R.canecoBorda-17.5, y1-R.canecoBorda+17.5, zFr-1, zFr+12], expPai:id }));
    for (let j = 0; j < nP; j++) { const xs = nP === 1 ? (fr.ladoPistao === 'dir' ? g.ix1 - 30 : g.ix0 + 30) : (j ? g.ix1 - 30 : g.ix0 + 30);
      ferr({ id:`${id}-pistao-${j+1}`, nome:`Pistão a gás ${j+1} da basculante ${k}`, ref: forca ? `pistao-gas-${forca}` : null, box:[xs - 10, xs + 10, y1 - 255, y1 - 30, zFr - 120, zFr - 100], expPai:id, obs: forca ? `${forca} N` : 'força fora de mercado' }); }
    ferr({ id:`${id}-puxador`, nome:`Puxador da basculante ${k}`, forma:{ tipo:'puxador', dir:'h', modelo:px.modelo, furacao:px.furacao }, cor:px.cor, ref:px.ref, box:[xm-px.comp/2, xm+px.comp/2, yp-px.larg/2, yp+px.larg/2, P, P+px.proj], expPai:id });
    return pt;
  }

  function gavetaExterna(g) {
    const i = cont.gaveta++, k = i + 1;
    const h = g.fy1 - g.fy0, Lc = [...R.corredicas].reverse().find(cc => cc <= Dc - 10), px = m.puxadorGaveta, proj = px.proj;
    const mov = { tipo:'gaveta', idx:i, curso:(Lc||0)*0.9 };
    const fy0 = g.fy0 + folga(g.b.baixo), fy1 = g.fy1 - folga(g.b.cima), fx0 = g.fx0 + folga(g.b.esq), fx1 = g.fx1 - folga(g.b.dir);
    const wf = fx1 - fx0, xm = (g.fx0 + g.fx1)/2, ym = (fy0 + fy1)/2;
    const frente = add({ id:`gaveta-${k}-frente`, nome:`Frente da gaveta ${k}`, nomeLista:'Frente da gaveta', cat:'frente', a:wf, b:fy1-fy0, fita:[2,2], box:[fx0,fx1,fy0,fy1,zFr,P], mov,
      des:{ w:wf, h:fy1-fy0, fita:['t','b','l','r'], vista:'Vista pela face interna', furos:[-1,1].map(sn => ({ x:wf/2+sn*px.furacao/2, y:ym-fy0, d:5, prof:0, tipo:'puxador' })) } });
    if (!Lc) { E.push('Não cabe corrediça na profundidade da caixa.'); return; }
    const hb = Math.floor((h - R.folgaAltGaveta)/10)*10;
    if (hb < 60) { E.push(`Gaveta ${k}: caixa com ${hb} mm (mínimo 60).`); return; }
    const yb = g.iy0 + R.folgaPisoGaveta;
    const Wg = (g.ix1 - g.ix0) - 2*R.corredica, xg0 = g.ix0 + R.corredica, xg1 = xg0 + Wg, zg0 = zFr - Lc, wInt = Wg - 2*t;
    const desLat = { w:Lc, h:hb, fita:['t'], vista:'Vista de lado', linhas:[{ x1:0, y1:hb/2, x2:Lc, y2:hb/2, txt:'eixo da corrediça' }] };
    const yPx = ym - yb, furosInt = (yPx > 10 && yPx < hb-10) ? [-1,1].map(sn => ({ x:wInt/2+sn*px.furacao/2, y:yPx, d:5, prof:0, tipo:'puxador' })) : [];
    add({ id:`gaveta-${k}-lateral-esq`, nome:`Lateral esquerda da gaveta ${k}`, nomeLista:'Lateral da gaveta', cat:'gaveta', a:Lc, b:hb, fita:[1,0], box:[xg0,xg0+t,yb,yb+hb,zg0,zFr], mov, expPai:frente.id, des:desLat });
    add({ id:`gaveta-${k}-lateral-dir`, nome:`Lateral direita da gaveta ${k}`, nomeLista:'Lateral da gaveta', cat:'gaveta', a:Lc, b:hb, fita:[1,0], box:[xg1-t,xg1,yb,yb+hb,zg0,zFr], mov, expPai:frente.id, des:desLat });
    add({ id:`gaveta-${k}-frente-interna`, nome:`Frente interna da gaveta ${k}`, nomeLista:'Frente/traseira da gaveta', cat:'gaveta', a:wInt, b:hb, fita:[1,0], box:[xg0+t,xg1-t,yb,yb+hb,zFr-t,zFr], mov, expPai:frente.id, des:{ w:wInt, h:hb, fita:['t'], vista:'Vista de frente', furos:furosInt } });
    add({ id:`gaveta-${k}-traseira`, nome:`Traseira da gaveta ${k}`, nomeLista:'Frente/traseira da gaveta', cat:'gaveta', a:wInt, b:hb, fita:[1,0], box:[xg0+t,xg1-t,yb,yb+hb,zg0,zg0+t], mov, expPai:frente.id, des:{ w:wInt, h:hb, fita:['t'], vista:'Vista de frente' } });
    add({ id:`gaveta-${k}-fundo`, nome:`Fundo da gaveta ${k}`, nomeLista:'Fundo da gaveta', cat:'gaveta', mat:'mdf-branco', esp:tf, a:Wg, b:Lc, box:[xg0,xg1,yb-tf,yb,zg0,zFr], mov, expPai:frente.id, des:{ w:Wg, h:Lc, vista:'Vista de cima' } });
    const yc = yb + hb/2;
    ferr({ id:`gaveta-${k}-corredica-esq`, nome:`Corrediça ${Lc} mm esquerda`, box:[g.ix0,xg0,yc-22.5,yc+22.5,zg0,zFr], ref:'kit-corredica-45' });
    ferr({ id:`gaveta-${k}-corredica-dir`, nome:`Corrediça ${Lc} mm direita`, box:[xg1,g.ix1,yc-22.5,yc+22.5,zg0,zFr], ref:'kit-corredica-45' });
    ferr({ id:`gaveta-${k}-puxador`, nome:`Puxador da gaveta ${k}`, forma:{ tipo:'puxador', dir:'h', modelo:px.modelo, furacao:px.furacao }, cor:px.cor, ref:px.ref, box:[xm-px.comp/2,xm+px.comp/2,ym-px.larg/2,ym+px.larg/2,P,P+proj], mov, expPai:frente.id });
  }

  function gavetasInternas(ct, g, yAc, lado, V) {
    const nG = ct.n, gH = ct.altura, recG = ct.recuo, esp = t, PxG = ct.puxador;
    const x0 = g.ix0, x1 = g.ix1;
    if (!nG) return yAc;
    const Lc = [...R.corredicas].reverse().find(cc => cc <= Dc - recG - t - 10);
    if (!Lc) E.push(`Vão ${V}: não cabe corrediça para gaveta interna.`);
    const xr0 = lado === 'esq' ? x0 + esp : x0, xr1 = lado === 'esq' ? x1 : x1 - esp;
    const ytop = yAc + nG*gH;
    if (PxG.proj > recG - 8) E.push(`O puxador das gavetas sai ${PxG.proj} mm e bate na porta (máximo ${recG-8}).`);
    if (ytop > g.iy1 - 50) E.push(`Vão ${V}: as ${nG} gavetas de ${fmt(gH)} mm não cabem.`);
    add({ id:`espacador-${V}`, nome:'Espaçador das corrediças', nomeLista:'Espaçador das corrediças', cat:'caixa', a:nG*gH, b:zFr-recG-zf, box:[lado === 'esq' ? x0 : x1-esp, lado === 'esq' ? x0+esp : x1, yAc, ytop, zf, zFr-recG], des:{ w:zFr-recG-zf, h:nG*gH, vista:'Vista lateral' } });
    if (Lc) for (let k = 0; k < nG; k++) {
      const i = cont.gaveta++, kk = i + 1, zy0 = yAc + k*gH, zy1 = zy0 + gH, mov = { tipo:'gaveta', idx:i, curso:Lc*0.9 };
      const fx0 = xr0 + 3, fx1 = xr1 - 3, fy0 = zy0 + 1.5, fy1 = zy1 - 1.5, zF1 = zFr - recG, zF0 = zF1 - t, wf = fx1 - fx0, xmf = (fx0+fx1)/2, ymf = (fy0+fy1)/2;
      const frente = add({ id:`gaveta-${kk}-frente`, nome:`Frente da gaveta ${kk}`, nomeLista:'Frente da gaveta interna', cat:'frente', a:wf, b:fy1-fy0, fita:[2,2], box:[fx0,fx1,fy0,fy1,zF0,zF1], mov,
        des:{ w:wf, h:fy1-fy0, fita:['t','b','l','r'], vista:'Vista pela face interna', furos:[-1,1].map(sn => ({ x:wf/2+sn*PxG.furacao/2, y:ymf-fy0, d:5, prof:0, tipo:'puxador' })) } });
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
      ferr({ id:`gaveta-${kk}-puxador`, nome:`Puxador da gaveta ${kk}`, forma:{ tipo:'puxador', dir:'h', modelo:PxG.modelo, furacao:PxG.furacao }, cor:PxG.cor, ref:PxG.ref, box:[xmf-PxG.comp/2,xmf+PxG.comp/2,ymf-PxG.larg/2,ymf+PxG.larg/2,zF1,zF1+PxG.proj], mov, expPai:frente.id });
    }
    return ytop;
  }

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
  return { pecas, erros:E, avisos:A, volumes, compras: comprasV3(pecas), vaos: regioes };
}

/* AJUSTE POR PEÇA (passo 1c) — em qualquer módulo: desligar uma peça ou mudar a medida dela.
   m.pecasAjuste = { '<id da peça>': { desligar:true } | { medidas:{ x|y|z: { valor, fixo:'ini'|'fim'|'centro' } } } }
   Eixos do módulo: x = largura (esquerda → direita), y = altura (chão → cima), z = profundidade (parede → frente).
   fixo = o lado que não se mexe: 'ini' = esquerda/embaixo/atrás, 'fim' = direita/em cima/na frente.
   Desligar leva junto o que é da peça (dobradiças e puxador da porta; caixa da gaveta). O resto segue a regra. */
const EIXOS_AJUSTE = { x:{ i:0, nome:'largura' }, y:{ i:1, nome:'altura' }, z:{ i:2, nome:'profundidade' } };
// eixo do desenho (w, h) de uma peça: pela medida; empate (peça quadrada) pela vista
function eixosDoDesenho(pc) {
  const ext = [0,1,2].map(i => pc.box[2*i+1] - pc.box[2*i]), esp = [0,1,2].reduce((a, i) => Math.abs(ext[i] - pc.esp) < Math.abs(ext[a] - pc.esp) ? i : a, 0);
  const planos = [0,1,2].filter(i => i !== esp), igual = (v, i) => Math.abs(ext[i] - v) < 0.6;
  const pelaVista = /lateral|lado|face interna/i.test(pc.des?.vista || '') && planos.includes(2) && pc.cat !== 'frente' ? [2, 1] : /cima/i.test(pc.des?.vista || '') ? [0, 2] : [0, 1];
  let w = planos.find(i => igual(pc.des?.w, i)), h = planos.find(i => i !== w);
  if (w === undefined || (igual(pc.des?.w, planos[0]) && igual(pc.des?.w, planos[1]))) [w, h] = planos.includes(pelaVista[0]) && planos.includes(pelaVista[1]) ? pelaVista : planos;
  return { esp, w, h, ext };
}
function aplicarAjustesPecas(pecas, ajustes, E, A) {
  if (!ajustes) return;
  const ids = new Set(pecas.map(p => p.id));
  for (const [id, aj] of Object.entries(ajustes)) {
    if (!aj) continue;
    const pc = pecas.find(p => p.id === id);
    if (!pc) { A.push(`Ajuste da peça "${id}": a peça não existe mais neste módulo — o ajuste ficou sem efeito (confira ou remova).`); continue; }
    if (aj.desligar) {
      const fora = new Set([id]); let mudou = true;
      while (mudou) { mudou = false; for (const p of pecas) if (p.expPai && fora.has(p.expPai) && !fora.has(p.id)) { fora.add(p.id); mudou = true; } }
      for (let k = pecas.length - 1; k >= 0; k--) if (fora.has(pecas[k].id)) pecas.splice(k, 1);
      continue;
    }
    const meds = Object.entries(aj.medidas || {}).filter(([, v]) => v && v.valor !== undefined && v.valor !== '');
    if (!meds.length) continue;
    const rot = pc.nome;
    if (pc.cat === 'ferragem' || pc.cat === 'referencia' || pc.cat === 'tampo') { E.push(`${rot}: ferragem e referência não mudam de medida (só dá para desligar).`); continue; }
    if (pc.cat === 'frente' || pc.cat === 'gaveta' || pc.mov) { E.push(`${rot}: porta e gaveta não mudam de medida por ajuste — mude o vão ou a frente no módulo.`); continue; }
    if ((pc.des?.furos || []).length || pc.forma?.tipo === 'recorte') { E.push(`${rot}: a peça tem furos ou recorte próprios; mudar a medida aqui deixaria a furação errada.`); continue; }
    const d = eixosDoDesenho(pc), box = [...pc.box];
    let ok = true;
    for (const [eixo, v] of meds) {
      const ex = EIXOS_AJUSTE[eixo], val = Number(v.valor);
      if (!ex) { E.push(`${rot}: eixo "${eixo}" não existe.`); ok = false; continue; }
      if (ex.i === d.esp) { E.push(`${rot}: a ${ex.nome} desta peça é a espessura da chapa — troque a chapa, não a medida.`); ok = false; continue; }
      if (!(val > 0)) { E.push(`${rot}: ${ex.nome} inválida.`); ok = false; continue; }
      const a = box[2*ex.i], b = box[2*ex.i+1];
      if (v.fixo === 'fim') box[2*ex.i] = b - val; else if (v.fixo === 'centro') { box[2*ex.i] = (a + b - val) / 2; box[2*ex.i+1] = (a + b + val) / 2; } else box[2*ex.i+1] = a + val;
      if (v.fixo === 'fim') box[2*ex.i+1] = b;
    }
    if (!ok) continue;
    const novo = [0,1,2].map(i => box[2*i+1] - box[2*i]), mudouC = Math.abs(novo[d.w] - d.ext[d.w]) > 0.01 || Math.abs(novo[d.h] - d.ext[d.h]) > 0.01;
    if (!mudouC) continue;
    // comp = maior medida; a fita acompanha o lado (se a peça "virar", troca de posição)
    const compEra = d.ext[d.w] >= d.ext[d.h] ? d.w : d.h, compAgora = novo[d.w] >= novo[d.h] ? d.w : d.h;
    if (compEra !== compAgora) pc.fita = [pc.fita[1], pc.fita[0]];
    pc.box = box; pc.comp = Math.max(novo[d.w], novo[d.h]); pc.larg = Math.min(novo[d.w], novo[d.h]);
    if (pc.des) { pc.des.w = novo[d.w]; pc.des.h = novo[d.h]; }
    if (pc.forma?.tipo === 'rasgos' && pc.des) {
      pc.des.rasgos = pc.forma.lista.map(r => ({ x:r.z0 - box[4], y:r.y0 - box[2], w:r.z1 - r.z0, h:r.y1 - r.y0 }));
      if (pc.forma.lista.some(r => r.z0 < box[4] || r.z1 > box[5] || r.y0 < box[2] || r.y1 > box[3])) E.push(`${rot}: com a medida nova os rasgos de ventilação ficam fora da peça.`);
    }
    pc.ajustada = true;
    pc.obs = [pc.obs, 'Medida mudada à mão (ajuste da peça).'].filter(Boolean).join(' ');
  }
}

/* ACABAMENTO DAS PEÇAS (4e) — material por grupo, veio, fita por lado (C1/C2/L1/L2) e medida de corte.
   C = lados do comprimento (a fita neles diminui a largura de corte); L = lados da largura. */
function acabamentoPecas(pecas, mats, loja = R.lojaPadrao) {
  for (const q of pecas.filter(p => p.lista)) {
    if (q.cat === 'frente' && mats.frentes) q.mat = mats.frentes;
    else if (['caixa','enchimento','gaveta'].includes(q.cat) && mats.caixa && q.mat !== 'mdf-branco') q.mat = mats.caixa;
    const temVeio = !!MATERIAIS[q.mat]?.veio;
    // veio: frentes de porta na vertical (altura da peça); demais peças no comprimento
    const alt = q.box ? q.box[3] - q.box[2] : null, vertical = q.cat === 'frente' && q.mov?.tipo !== 'gaveta' && alt !== null;
    q.veio = !temVeio ? null : (vertical ? (Math.abs(alt - q.comp) < 0.6 ? 'comp' : 'larg') : 'comp');
    const [nC, nL] = q.fita || [0, 0], e = R.fitaEsp;
    q.fitaLados = { C1: nC >= 1 ? e : 0, C2: nC >= 2 ? e : 0, L1: nL >= 1 ? e : 0, L2: nL >= 2 ? e : 0 };
    q.corte = { comp: q.comp - e*nL, larg: q.larg - e*nC };
    q.medidaLoja = loja.descontaFita ? { comp: q.comp, larg: q.larg, tipo:'final' } : { ...q.corte, tipo:'corte' };
  }
}

/* COMPRAS DO NÚCLEO — conta as ferragens pelas referências da biblioteca e abre os kits nos componentes */
function comprasV3(pecas) {
  const conta = new Map(), soma = (ref, q) => conta.set(ref, (conta.get(ref) || 0) + q);
  const refs = new Map(); pecas.filter(q => q.ref).forEach(q => refs.set(q.ref, (refs.get(q.ref) || 0) + 1));
  for (const [ref, n] of refs) {
    const it = BIBLIOTECA[ref]; if (!it) { soma(ref, n); continue; }
    const q = Math.ceil(n / (it.contaPor || 1));
    if (it.componentes) it.componentes.forEach(([cr, cq]) => soma(cr, q * cq)); else soma(ref, q);
  }
  return [...conta.entries()].map(([ref, qtd]) => { const it = BIBLIOTECA[ref] || {}; const emb = it.emb || 1;
    return { ref, nome: it.nome || ref, qtd, unid: it.unid || 'un', compra: Math.ceil(qtd / emb) }; }).sort((a, b) => a.nome.localeCompare(b.nome));
}

/* VOLUMES — embalagem simulada (versão simples): frentes num volume próprio, caixa em pilhas
   (a maior peça embaixo define a base; pilha nova acima do peso ou da altura), ferragens numa caixa. */
const pesoPeca = q => q.comp * q.larg * q.esp * ((q.mat || '').startsWith('hdf') ? R.densidade.hdf : R.densidade.mdf) / 1e9;
function volumesDe(pecas, { montado, L, H, P, A }) {
  const Em = R.embalagem, mg = Em.margem, vol = [];
  const mdf = pecas.filter(q => q.lista), ferr = pecas.filter(q => !q.lista);
  if (montado) {
    vol.push({ tipo:'módulo montado', pecas: pecas.map(q => q.id), dims:[L + 2*mg, H + 2*mg, P + 2*mg], peso: mdf.reduce((s, q) => s + pesoPeca(q), 0) });
  } else {
    const empilhar = (lista, tipo) => {
      const pilhas = [];
      [...lista].sort((a, b) => b.comp*b.larg - a.comp*a.larg).forEach(q => {
        const w = pesoPeca(q);
        if (w > Em.pesoMax) { vol.push({ tipo, pecas:[q.id], dims:[q.comp + 2*mg, q.larg + 2*mg, q.esp + 2*mg], peso:w, aviso:'carregar a dois' }); A.push(`Volume: ${q.nome} pesa ${fmt(w)} kg sozinha — carregar a dois.`); return; }
        const pl = pilhas.find(p => q.comp <= p.base[0] && q.larg <= p.base[1] && p.peso + w <= Em.pesoMax && p.alt + q.esp <= Em.alturaMax);
        if (pl) { pl.pecas.push(q.id); pl.peso += w; pl.alt += q.esp; }
        else pilhas.push({ base:[q.comp, q.larg], pecas:[q.id], peso:w, alt:q.esp });
      });
      pilhas.forEach(p => vol.push({ tipo, pecas:p.pecas, dims:[p.base[0] + 2*mg, p.base[1] + 2*mg, p.alt + 2*mg], peso:p.peso }));
    };
    empilhar(mdf.filter(q => q.cat === 'frente'), 'frentes');
    empilhar(mdf.filter(q => q.cat !== 'frente'), 'caixa');
    if (ferr.length) vol.push({ tipo:'ferragens e parafusos', pecas: ferr.map(q => q.id), dims:null, peso:null });
  }
  vol.forEach((v, i) => { v.num = i + 1; v.etiqueta = `Volume ${i + 1} de ${vol.length}`; v.peso = v.peso === null ? null : Math.round(v.peso * 10) / 10; });
  return vol;
}

// CONVERSORES: parâmetros dos tipos antigos → módulo do núcleo novo
const PUXADOR_BARRA_GENERICO = proj => ({ ref:null, modelo:null, furacao:128, comp:R.puxadorComp, larg:12, proj, cor:undefined, altura:'topo-120' });
function moduloDeGabinete(p) {
  const n = k => Number(p[k]);
  const nG = Math.max(0, Math.round(n('gavetas'))), nS = Math.max(0, Math.round(n('prateleiras'))), nP = Number(p.portas);
  const lst = String(p.alturasGavetas).split(/[;,\s]+/).filter(Boolean).map(s => Number(s.replace(',','.')));
  const alts = nG ? (lst.length === 1 ? Array(nG).fill(lst[0]) : lst) : [];
  const somaG = alts.reduce((s,v) => s+v, 0), temSup = (n('altura') - n('pes')) - somaG > 0.5;
  const frentePortas = nP === 2 ? { tipo:'2portas' } : nP === 1 ? { tipo:'porta', lado:(p.paredeEsq && !p.paredeDir) ? 'dir' : 'esq' } : { tipo:'nenhuma' };
  const vaoPortas = { tipo:'vao', frente:frentePortas, conteudo: nS ? [{ tipo:'prateleiras', n:nS, min:100 }] : [] };
  const pilha = { tipo:'dividir', dir:'h', sep:'nenhum', partes: alts.map(h => ({ medida:h, no:{ tipo:'vao', frente:{ tipo:'gaveta' }, conteudo:[] } })) };
  const raiz = nG && temSup ? { tipo:'dividir', dir:'h', sep:'divisoria', partes:[{ medida:somaG, no:pilha }, { medida:'auto', no:vaoPortas }] } : nG ? pilha : vaoPortas;
  const pux = PUXADOR_BARRA_GENERICO(n('puxadorProj'));
  return {
    largura:n('largura'), altura:n('altura'), profundidade:n('profundidade'),
    metodo:'gabinete-atual', metodoAjustes:{ pes:n('pes') },
    construcao:{ espMDF:n('espMDF'), espFundo:n('espFundo'), beiral:0,
      paredeEsq:!!p.paredeEsq, paredeDir:!!p.paredeDir, enchimento:!!p.enchimento, tampo:{ larg:n('tampoLarg'), prof:n('tampoProf'), esp:n('tampoEsp') } },
    ambiente:{ esgoto:{ altura:n('esgoto'), recorteLarg:n('recorteLarg'), recorteProf:n('recorteProf') } },
    puxadorPorta:pux, puxadorGaveta:pux, raiz,
  };
}
function moduloDeArmario(p) {
  const n = k => Number(p[k]);
  const vaos = String(p.vaos).split(',').map(x => x.trim().toLowerCase().replace(/\s+/g,'')).filter(Boolean).map(x => x === 'botijao+gavetas' ? 'gavetas+botijao' : x);
  const PxP = { ...PUXADORES[n('puxadorPorta')], altura:n('alturaPuxador') }, PxG = PUXADORES[n('puxadorGaveta')];
  const gav = { tipo:'gavetas-internas', n:Math.max(0, Math.round(n('gavetas'))), altura:n('alturaGaveta'), recuo:45, puxador:PxG };
  const acima = { tipo:'prateleiras-acima', n:Math.max(0, Math.round(n('pratAcimaGavetas'))), minLivre:250 };
  const conteudoDe = v => v === 'prateleiras' ? [{ tipo:'prateleiras', n:Math.max(0, Math.round(n('prateleiras'))), min:150 }]
    : v === 'vassoura' ? [{ tipo:'vassoura', alturaPrat:n('alturaPratVassoura') }]
    : v === 'vassoura+sapateira' ? [{ tipo:'vassoura', alturaPrat:n('alturaPratVassoura'), sapateira:{ nivel:Number(p.alturaNivelSapateira) || 220, max:Number(p.niveisSapateira) || 0 } }]
    : v === 'gavetas' ? (gav.n ? [gav, acima] : [])
    : v === 'gavetas+botijao' ? [{ tipo:'botijao', altura:n('alturaBotijao') }, ...(gav.n ? [gav, acima] : [])] : [];
  const folhas = vaos.map((v, i) => ({ tipo:'vao', frente:{ tipo:'porta', lado: i % 2 === 0 ? 'esq' : 'dir' }, conteudo:conteudoDe(v) }));
  const raiz = folhas.length > 1 ? { tipo:'dividir', dir:'v', sep:'divisoria', partes:folhas.map(no => ({ medida:'auto', no })) } : folhas[0];
  return {
    largura:n('largura'), altura:n('altura'), profundidade:n('profundidade'),
    metodo:'armario-atual', metodoAjustes:{ rodape:{ altura:n('rodape'), recuo:n('recuoRodape') } },
    construcao:{ espMDF:n('espMDF'), espFundo:n('espFundo'), beiral:n('alturaBeiral'),
      paredeEsq:!!p.paredeEsq, paredeDir:!!p.paredeDir, enchimento:false },
    ambiente:{}, puxadorPorta:PxP, puxadorGaveta:PxG, raiz,
  };
}
const CONVERSORES_V3 = { gabinete:moduloDeGabinete, armario:moduloDeArmario };

/* MÓVEL LIVRE (5a) — o móvel montado pela tela: módulo + árvore de vãos, gerado pelo núcleo novo.
   O resultado ganha ferragens, fixações e medidas no mesmo formato do gabinete e do armário,
   para as listas, o plano de corte, as compras, os desenhos e o 3D funcionarem igual. */
function resultadoModulo(r, m) {
  const c = resolverMetodo(m), soma = new Map(), add = (ref, q) => { if (q > 0 && BIBLIOTECA[ref]) soma.set(ref, (soma.get(ref) || 0) + q); };
  r.compras.filter(l => BIBLIOTECA[l.ref]?.unid !== 'chapa').forEach(l => add(l.ref, l.qtd));
  add('pino-5', r.pecas.filter(q => q.papel === 'prateleira').length * 4);
  const fx = calcularFixacoes(r.pecas), red10 = v => Math.ceil(v*1.2/10)*10;
  ['paraf-40x50','paraf-40x30','paraf-35x14','paraf-35x25','paraf-50x60-bucha','cavilha-8x30'].forEach(t => { const n = fx.filter(f => f.tipo === t).length; add(t, t.startsWith('paraf-4') || t === 'paraf-35x14' ? red10(n) : n); });
  const fitaMm = r.pecas.filter(q => q.lista).reduce((s, q) => s + q.fita[0]*q.comp + q.fita[1]*q.larg, 0);
  add(c.espMDF <= 19 ? 'fita-pvc-22' : 'fita-pvc-35', Math.ceil(fitaMm*R.perdaFita/1000));
  r.ferragens = [...soma.entries()].map(([ref, qtd]) => { const b = BIBLIOTECA[ref];
    return { ref, item: b.nome + (b.marca ? ` — ${b.marca}${b.codigo ? ' ' + b.codigo : ''}` : ''), nome:b.nome, marca:b.marca, codigo:b.codigo, qtd, unid: b.metro ? 'm' : (b.unid === 'par' ? 'par' : 'un'), obs: b.metro ? 'metros, com 10% de perda' : (b.obs || ''), var:'' }; });
  r.fixacoes = fx;
  r.dims = { L:m.largura, H:m.altura, P:m.profundidade, t:c.espMDF, top:m.altura, faixaEsgoto:null, paredeEsq:!!c.paredeEsq, paredeDir:!!c.paredeDir, alturaTampo:m.altura };
  if (m.altura > 1800) r.avisos.push('Móvel alto: fixe na parede antes de colocar peso (risco de tombar).');
  return r;
}
TIPOS.modulo = {
  nomePadrao:'Móvel novo', nome:'Móvel livre (pela tela)', grupos:[], editor:'modulo',
  padrao: JSON.parse(JSON.stringify({ ...moduloDeArmario(TIPOS.armario.padrao), metodo:'padrao-nathan', metodoAjustes:{}, entrega:'desmontado' })),
  gerar: p => resultadoModulo(gerarModuloV3(p), p),
};

