/* =====================================================================
   4. LISTAS — agrupa peças iguais e calcula chapas e fita
   ===================================================================== */
function listaDeCorte(pecas) {
  const ordem = ['caixa','enchimento','frente','gaveta','fundo'];
  const mapa = new Map();
  for (const pc of pecas.filter(p=>p.lista)) {
    const k = [pc.mat, pc.esp, pc.nomeLista||pc.nome, pc.comp, pc.larg, pc.fita.join(), pc.forma?.tipo||''].join('|');
    if (!mapa.has(k)) mapa.set(k, { ...pc, qtd:0, ids:[] });
    const it = mapa.get(k); it.qtd++; it.ids.push(pc.id);
  }
  const itens = [...mapa.values()].sort((a,b) => (a.esp===b.esp ? 0 : b.esp-a.esp) || ordem.indexOf(a.cat)-ordem.indexOf(b.cat) || b.comp-a.comp);
  const grupos = new Map();
  for (const it of itens) { const g = `${MATERIAIS[it.mat].nome} ${fmt(it.esp)} mm`; if (!grupos.has(g)) grupos.set(g, []); grupos.get(g).push(it); }
  const chapaM2 = R.chapa[0]*R.chapa[1]/1e6;
  const resumo = [...grupos.entries()].map(([g,its]) => {
    const area = its.reduce((s,it)=>s+it.qtd*it.comp*it.larg,0)/1e6;
    return { grupo:g, area, chapas: Math.max(1, Math.ceil(area/(chapaM2*R.aproveitamento))) };
  });
  let num = 0; for (const its of grupos.values()) its.forEach(it => it.num = ++num);
  return { grupos, resumo };
}

/* =====================================================================
   4a. PLANO DE CORTE — encaixa as peças nas chapas (cortes em faixas, como a
   seccionadora da loja faz). MDF liso: a peça pode girar.
   ===================================================================== */
function planoDeCorte(pecas) {
  const lc = listaDeCorte(pecas), numDe = new Map();
  for (const its of lc.grupos.values()) its.forEach(it => it.ids.forEach(id => numDe.set(id, it)));
  const porChapa = new Map(), erros = [];
  for (const pc of pecas.filter(p => p.lista)) {
    const k = pc.mat + '|' + pc.esp;
    if (!porChapa.has(k)) porChapa.set(k, []);
    porChapa.get(k).push({ id:pc.id, num:numDe.get(pc.id).num, nome:pc.nomeLista||pc.nome, a:pc.veio === 'larg' ? pc.larg : pc.comp, b:pc.veio === 'larg' ? pc.comp : pc.larg, chapaRef:pc.chapaRef, fixo:!!pc.veio });
  }
  const res = [];
  for (const [k, itens] of porChapa) {
    const [mat, espS] = k.split('|'), esp = Number(espS);
    const ref = itens.find(i => i.chapaRef)?.chapaRef || chapaDe(mat, esp), dim = ref ? BIBLIOTECA[ref].dim : R.chapa;   // chapa escolhida pelo fundo, se houver
    const LU = dim[0] - 2*R.refilo, WU = dim[1] - 2*R.refilo, kf = R.serra;
    itens.sort((p,q) => (q.b - p.b) || (q.a - p.a));
    const chapas = [];
    const novaChapa = () => { const c = { faixas:[], usadoY:0, pecas:[] }; chapas.push(c); return c; };
    for (const it of itens) {
      if ((it.a > LU || it.b > WU) && (it.fixo || it.b > LU || it.a > WU)) { erros.push(`${it.nome} (${fmt(it.a)} × ${fmt(it.b)}) não cabe na chapa ${dim[0]} × ${dim[1]}${it.fixo ? ' sem girar (veio)' : ''}.`); continue; }
      let ok = false;
      for (const c of chapas) {
        for (const f of c.faixas) {
          if (it.b <= f.h && f.x + it.a <= LU) { c.pecas.push({ ...it, x:f.x, y:f.y, w:it.a, h:it.b }); f.x += it.a + kf; ok = true; break; }
          if (!it.fixo && it.a <= f.h && f.x + it.b <= LU) { c.pecas.push({ ...it, x:f.x, y:f.y, w:it.b, h:it.a, giro:true }); f.x += it.b + kf; ok = true; break; }
        }
        if (ok) break;
        const [w, h, giro] = (it.fixo || it.a <= LU) ? [it.a, it.b, false] : [it.b, it.a, true];
        if (c.usadoY + h <= WU) { const f = { y:c.usadoY, h, x:w + kf }; c.faixas.push(f); c.usadoY += h + kf; c.pecas.push({ ...it, x:0, y:f.y, w, h, giro }); ok = true; break; }
      }
      if (!ok) { const c = novaChapa(); const [w, h, giro] = (it.fixo || it.a <= LU) ? [it.a, it.b, false] : [it.b, it.a, true]; const f = { y:0, h, x:w + kf }; c.faixas.push(f); c.usadoY = h + kf; c.pecas.push({ ...it, x:0, y:0, w, h, giro }); }
    }
    const areaChapa = dim[0]*dim[1];
    chapas.forEach(c => c.aproveitamento = c.pecas.reduce((s,p) => s + p.w*p.h, 0) / areaChapa);
    res.push({ ref, mat, esp, nome: ref ? BIBLIOTECA[ref].nome : `${MATERIAIS[mat].nome} ${fmt(esp)} mm`, dim, refilo:R.refilo, serra:kf, chapas });
  }
  res.sort((a,b) => b.esp - a.esp);
  return { materiais:res, erros };
}

/* Lista de compras: chapas do plano de corte + ferragens, em unidades de compra */
function listaDeCompras(res, plano, precos) {
  const linhas = [];
  for (const m of plano.materiais) linhas.push({ ref:m.ref || ('chapa-' + m.mat + '-' + m.esp), grupo:'Chapas', nome:m.nome, marca:'', codigo:'', necessario:`${m.chapas.length} chapa${m.chapas.length>1?'s':''}`, compra:m.chapas.length, unid:'chapa', obs:`Aproveitamento médio ${Math.round(100*m.chapas.reduce((s,c)=>s+c.aproveitamento,0)/m.chapas.length)}%. A loja também pode vender só o corte.` });
  for (const f of res.ferragens) {
    const b = BIBLIOTECA[f.ref], compra = Math.ceil(f.qtd / b.emb);
    linhas.push({ ref:f.ref + (f.var ? '-' + f.var.replace(/\s/g,'') : ''), grupo:b.grupo, nome:f.nome, marca:b.marca, codigo:b.codigo, necessario: f.unid==='m' ? `${f.qtd} m` : `${f.qtd} ${f.unid}`, compra, unid:b.unid, obs:f.obs });
  }
  linhas.forEach(l => { const pr = Number(precos[l.ref]); l.preco = pr > 0 ? pr : null; l.total = l.preco != null ? l.preco * l.compra : null; });
  const total = linhas.reduce((s,l) => s + (l.total||0), 0), semPreco = linhas.filter(l => l.preco == null).length;
  return { linhas, total, semPreco };
}
const reais = v => v.toLocaleString('pt-BR', { style:'currency', currency:'BRL' });

/* =====================================================================
   4b. DESENHOS TÉCNICOS — mesma lista de comandos vira SVG (tela) e PDF
   ===================================================================== */
const TIPOS_FURO = {
  caneco:   { l:'K', nome:'Caneco da dobradiça' },
  puxador:  { l:'X', nome:'Puxador, passante' },
  montagem: { l:'M', nome:'Montagem, parafuso 4,0 × 50, passante' },
  pino:     { l:'P', nome:'Pino de prateleira' },
  calco:    { l:'D', nome:'Calço da dobradiça, pré-furo' },
  corredica:{ l:'C', nome:'Corrediça, pré-furo' },
  parede:   { l:'F', nome:'Fixação na parede, passante' },
};
function listaDesenhos(pecas) {
  const ordem = ['caixa','enchimento','frente','gaveta','fundo'];
  const mapa = new Map();
  for (const pc of pecas.filter(p => p.lista && p.des)) {
    const k = JSON.stringify([pc.nomeLista, pc.comp, pc.larg, pc.esp, pc.mat, pc.des]);
    if (!mapa.has(k)) mapa.set(k, { pc, ids:[] });
    mapa.get(k).ids.push(pc.id);
  }
  return [...mapa.values()].sort((a,b) => ordem.indexOf(a.pc.cat)-ordem.indexOf(b.pc.cat)).map(g => {
    const cont = {};
    const furos = (g.pc.des.furos||[]).map(f => { cont[f.tipo] = (cont[f.tipo]||0)+1; return { ...f, rot: TIPOS_FURO[f.tipo].l + cont[f.tipo] }; });
    return { ...g, qtd:g.ids.length, titulo: g.ids.length > 1 ? (g.pc.nomeLista || g.pc.nome) : g.pc.nome, furos };
  });
}
function cmdsDesenho(d, furos, W, H, ts) {
  const c = [];
  const ml = ts*5.5, mb = ts*5, mt = ts*2.5, mr = ts*3;
  const s = Math.min((W-ml-mr)/d.w, (H-mt-mb)/d.h);
  const ox = ml, oy = mt + d.h*s;
  const X = x => ox + x*s, Y = y => oy - y*s;
  const pts = [[0,0],[d.w,0],[d.w,d.h]];
  (d.recortes||[]).slice().sort((a,b)=>b.x-a.x).forEach(r => pts.push([r.x+r.w,d.h],[r.x+r.w,d.h-r.h],[r.x,d.h-r.h],[r.x,d.h]));
  pts.push([0,d.h]);
  c.push({ t:'poly', pts:pts.map(([x,y]) => [X(x),Y(y)]), papel:'peca' });
  const lados = { b:[[0,0],[d.w,0]], t:[[0,d.h],[d.w,d.h]], l:[[0,0],[0,d.h]], r:[[d.w,0],[d.w,d.h]] };
  (d.fita||[]).forEach(k => { const [a,b] = lados[k]; c.push({ t:'line', a:[X(a[0]),Y(a[1])], b:[X(b[0]),Y(b[1])], papel:'fita' }); });
  if (d.frente) {
    const fs = ts*0.75, pad = ts*1.1;
    const pos = { b:[X(d.w/2), Y(0)-pad*0.6, 0], t:[X(d.w/2), Y(d.h)+pad*1.2, 0], l:[X(0)+pad*1.2, Y(d.h/2), -90], r:[X(d.w)-pad*0.6, Y(d.h/2), -90] }[d.frente];
    if (d.w*s > ts*8 && d.h*s > ts*3) c.push({ t:'text', p:[pos[0],pos[1]], s:'FRENTE', size:fs, anchor:'middle', rot:pos[2], papel:'frente' });
  }
  (d.linhas||[]).forEach(l => {
    c.push({ t:'line', a:[X(l.x1),Y(l.y1)], b:[X(l.x2),Y(l.y2)], papel:'eixo' });
    if (l.txt && Math.abs(l.x2-l.x1)*s > ts*10) c.push({ t:'text', p:[(X(l.x1)+X(l.x2))/2, Y(l.y1)-ts*0.45], s:l.txt, size:ts*0.7, anchor:'middle', papel:'eixo' });
  });
  if (d.rasgos?.length) {
    d.rasgos.forEach(r => c.push({ t:'poly', pts:[[r.x,r.y],[r.x+r.w,r.y],[r.x+r.w,r.y+r.h],[r.x,r.y+r.h]].map(([x,y]) => [X(x),Y(y)]), papel:'furo' }));
    const r0 = d.rasgos[0], ymax = Math.max(...d.rasgos.map(r => r.y + r.h));
    c.push({ t:'text', p:[X(d.w/2), Y(ymax) - ts*0.6], s:`${d.rasgos.length} rasgos ${fmt(r0.w)} × ${fmt(r0.h)} passantes (ventilação)`, size:ts*0.75, anchor:'middle', papel:'furo' });
  }
  (d.recortes||[]).forEach(r => c.push({ t:'text', p:[X(r.x+r.w/2), Y(d.h-r.h)-ts*0.6], s:`recorte ${fmt(r.w)} × ${fmt(r.h)}`, size:ts*0.8, anchor:'middle', papel:'cota' }));
  furos.forEach(f => {
    const r = Math.max(f.d/2*s, ts*0.22), cx = X(f.x), cy = Y(f.y);
    c.push({ t:'circle', c:[cx,cy], r, papel:'furo' });
    c.push({ t:'text', p:[cx + r + ts*0.15, cy - r*0.3 - ts*0.1], s:f.rot, size:ts*0.72, anchor:'start', papel:'furo' });
  });
  const tick = (x,y) => c.push({ t:'line', a:[x-ts*0.35,y+ts*0.35], b:[x+ts*0.35,y-ts*0.35], papel:'cota' });
  const yc = Y(0) + ts*2.6;
  c.push({ t:'line', a:[X(0),yc], b:[X(d.w),yc], papel:'cota' }); tick(X(0),yc); tick(X(d.w),yc);
  [0,d.w].forEach(x => c.push({ t:'line', a:[X(x),Y(0)+ts*0.4], b:[X(x),yc+ts*0.6], papel:'cota-ext' }));
  c.push({ t:'text', p:[(X(0)+X(d.w))/2, yc+ts*1.35], s:fmt(d.w), size:ts, anchor:'middle', papel:'cota' });
  const xc = X(0) - ts*2.6;
  c.push({ t:'line', a:[xc,Y(0)], b:[xc,Y(d.h)], papel:'cota' }); tick(xc,Y(0)); tick(xc,Y(d.h));
  [0,d.h].forEach(y => c.push({ t:'line', a:[X(0)-ts*0.4,Y(y)], b:[xc-ts*0.6,Y(y)], papel:'cota-ext' }));
  c.push({ t:'text', p:[xc-ts*0.5, (Y(0)+Y(d.h))/2], s:fmt(d.h), size:ts, anchor:'middle', rot:-90, papel:'cota' });
  c.push({ t:'text', p:[X(0)-ts*0.3, Y(0)+ts*1.3], s:'0,0', size:ts*0.7, anchor:'end', papel:'eixo' });
  return { cmds:c, W: ox + d.w*s + mr, H: oy + mb };
}
function svgDesenho(cmds, W, H, titulo) {
  const NS = 'http://www.w3.org/2000/svg', mk = (tag, at) => { const e = document.createElementNS(NS, tag); for (const [k,v] of Object.entries(at)) if (v != null) e.setAttribute(k, v); return e; };
  const svg = mk('svg', { viewBox:`0 0 ${W.toFixed(1)} ${H.toFixed(1)}`, class:'des-svg', role:'img', 'aria-label':'Desenho de '+titulo });
  for (const k of cmds) {
    let e;
    if (k.t === 'poly') e = mk('polygon', { points:k.pts.map(p => p.map(v=>v.toFixed(2)).join(',')).join(' ') });
    else if (k.t === 'line') e = mk('line', { x1:k.a[0], y1:k.a[1], x2:k.b[0], y2:k.b[1] });
    else if (k.t === 'circle') e = mk('circle', { cx:k.c[0], cy:k.c[1], r:k.r });
    else { e = mk('text', { x:k.p[0], y:k.p[1], 'font-size':k.size, 'text-anchor':k.anchor==='middle'?'middle':k.anchor==='end'?'end':'start', transform:k.rot?`rotate(${k.rot} ${k.p[0]} ${k.p[1]})`:null }); e.textContent = k.s; }
    e.setAttribute('class', 'd-'+k.papel); svg.append(e);
  }
  return svg;
}
function mostrarDesenhos(res) {
  const g = $('gradeDes');
  if (res.erros.length) { g.replaceChildren(el('p', { class:'vazio', text:'Corrija os erros nos parâmetros para ver os desenhos.' })); return; }
  g.replaceChildren(...listaDesenhos(res.pecas).map(it => {
    const pc = it.pc, d = pc.des;
    const { cmds, W, H } = cmdsDesenho(d, it.furos, 560, 360, 11);
    const tab = it.furos.length ? el('div', { class:'tabela furos' }, el('table', {},
      el('thead', {}, el('tr', {}, ...['Furo','X','Y','Ø','Prof.','Tipo'].map((h,i) => el('th', { class:i>0&&i<5?'n':null, text:h })))),
      el('tbody', {}, ...it.furos.map(f => el('tr', {}, el('td', { class:'mono', text:f.rot }), el('td', { class:'n', text:fmt(f.x) }), el('td', { class:'n', text:fmt(f.y) }), el('td', { class:'n', text:fmt(f.d) }), el('td', { class:'n', text:f.prof ? fmt(f.prof) : 'passa' }), el('td', { class:'obs', text:TIPOS_FURO[f.tipo].nome })))))) : null;
    return el('article', { class:'des', id:'des-'+pc.id, 'data-ids':it.ids.join(' ') },
      el('h3', {}, el('span', { text:it.titulo }), el('button', { type:'button', text:'Mostrar no 3D', onclick:() => { selecionar(pc.id); $('palco').scrollIntoView({ behavior:'smooth', block:'center' }); } })),
      el('div', { class:'meta' }, 'Qtd ', el('b', { text:String(it.qtd) }), ` · ${MATERIAIS[pc.mat].nome} ${fmt(pc.esp)} mm · corte `, el('b', { text:`${fmt(pc.comp)} × ${fmt(pc.larg)}` }), ` · fita ${fitaTxt(pc.fita)} · ${d.vista}`),
      svgDesenho(cmds, W, H, it.titulo), tab,
      pc.obs ? el('div', { class:'meta', text:pc.obs }) : null);
  }));
  marcarDesenho();
}
function marcarDesenho() {
  document.querySelectorAll('.des[data-ids]').forEach(a => a.classList.toggle('sel', !!estado.sel && a.dataset.ids.split(' ').includes(estado.sel)));
}

/* ---------- PDF para a marcenaria ---------- */
const pdfTxt = t => String(t).replace(/[—–]/g,'-').replace(/≈/g,'~').replace(/Δ/g,'d').replace(/[^\x00-\xFF]/g,'');
const COR_PDF = { peca:[25,30,35], fita:[196,101,15], furo:[31,95,158], cota:[70,78,84], 'cota-ext':[150,158,164], eixo:[120,128,134], frente:[120,128,134] };
function pdfDesenhar(doc, cmds, ox, oy) {
  for (const k of cmds) {
    const cor = COR_PDF[k.papel] || [0,0,0];
    doc.setDrawColor(...cor); doc.setTextColor(...cor);
    doc.setLineDashPattern(k.papel==='eixo' ? [2,1.4] : [], 0);
    doc.setLineWidth({ peca:0.35, fita:1.0, furo:0.25, cota:0.18, 'cota-ext':0.15, eixo:0.18 }[k.papel] || 0.2);
    if (k.t === 'poly') {
      doc.setFillColor(246,246,244);
      const p0 = k.pts[0], del = k.pts.slice(1).map((p,i) => [p[0]-k.pts[i][0], p[1]-k.pts[i][1]]);
      doc.lines(del, ox+p0[0], oy+p0[1], [1,1], 'FD', true);
    } else if (k.t === 'line') doc.line(ox+k.a[0], oy+k.a[1], ox+k.b[0], oy+k.b[1]);
    else if (k.t === 'circle') { doc.setFillColor(255,255,255); doc.circle(ox+k.c[0], oy+k.c[1], k.r, 'FD'); }
    else {
      doc.setFontSize(k.size*2.835); const s = pdfTxt(k.s);
      if (k.rot) { const w = doc.getTextWidth(s); doc.text(s, ox+k.p[0], oy+k.p[1]+w/2, { angle:90 }); }
      else doc.text(s, ox+k.p[0], oy+k.p[1], { align: k.anchor==='middle'?'center':k.anchor==='end'?'right':'left' });
    }
  }
  doc.setLineDashPattern([], 0);
}
function gerarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation:'landscape', unit:'mm', format:'a4' });
  const nome = estado.projeto.nome || 'Projeto', res = estado.res, lc = listaDeCorte(res.pecas), dess = listaDesenhos(res.pecas);
  const T = (s, x, y, o) => doc.text(Array.isArray(s) ? s.map(pdfTxt) : pdfTxt(s), x, y, o);
  // Capa: lista de corte e ferragens
  doc.setFont('helvetica','bold'); doc.setFontSize(16); doc.setTextColor(20,24,28); T(nome, 14, 18);
  doc.setFont('helvetica','normal'); doc.setFontSize(9); doc.setTextColor(90,98,104);
  T(`Lista de corte, plano de corte, compras e desenhos técnicos · ${new Date().toLocaleDateString('pt-BR')} · medidas em mm`, 14, 24);
  let y = 34;
  const linha = (cols, xs, neg) => { doc.setFont('helvetica', neg?'bold':'normal'); cols.forEach((c,i) => T(c, xs[i], y, { align: i>0 && i<5 ? 'right' : 'left' })); y += 5; if (y > 195) { doc.addPage(); y = 18; } };
  const xsC = [14, 100, 120, 140, 158, 166];
  doc.setFontSize(10); doc.setTextColor(20,24,28); linha(['Nº  Peça','Qtd','Comp.','Larg.','Fita','Obs.'], xsC, true);
  doc.setFontSize(9);
  for (const [g, its] of lc.grupos) { doc.setTextColor(31,95,158); linha([g,'','','','',''], xsC, true); doc.setTextColor(30,34,38);
    its.forEach(it => linha([`${String(it.num).padStart(2,' ')}  ${it.nomeLista||it.nome}`, String(it.qtd), fmt(it.comp), fmt(it.larg), fitaTxt(it.fita), (it.forma?.tipo==='recorte' ? `recorte ${fmt(it.forma.rl)} x ${fmt(it.forma.rp)}` : '')], xsC)); }
  // Lista de compras
  const comp = estado.compras;
  if (comp) {
    y += 4; const xsF = [14, 150, 150, 150, 176, 182];
    doc.setFontSize(10); doc.setTextColor(20,24,28); linha(['Lista de compras','Comprar','','','Total',''], xsF, true); doc.setFontSize(9);
    comp.linhas.forEach(l => { doc.setTextColor(30,34,38); linha([l.nome + (l.marca||l.codigo ? ` (${[l.marca,l.codigo].filter(Boolean).join(' ')})` : ''), `${l.compra} ${l.unid}`, '', '', l.total != null ? reais(l.total) : '-', ''], xsF); });
    linha([comp.semPreco ? `Total (${comp.semPreco} sem preço)` : 'Total', '', '', '', reais(comp.total), ''], xsF, true);
  }
  // Plano de corte: uma página por chapa
  const plano = estado.plano;
  if (plano) plano.materiais.forEach(m => m.chapas.forEach((c, i) => {
    doc.addPage();
    doc.setFont('helvetica','bold'); doc.setFontSize(14); doc.setTextColor(20,24,28); T(`Plano de corte · ${m.nome} · chapa ${i+1} de ${m.chapas.length}`, 12, 15);
    doc.setFont('helvetica','normal'); doc.setFontSize(9); doc.setTextColor(90,98,104);
    T(`Chapa ${m.dim[0]} x ${m.dim[1]} mm · refilo ${m.refilo} mm · serra ${m.serra} mm · ${Math.round(c.aproveitamento*100)}% aproveitado · número = Nº da lista de corte`, 12, 21);
    const sc = 248 / m.dim[0], ox = (297 - 248) / 2, oy = 27;
    doc.setDrawColor(25,30,35); doc.setFillColor(246,246,244); doc.setLineWidth(0.3); doc.rect(ox, oy, m.dim[0]*sc, m.dim[1]*sc, 'FD');
    doc.setLineDashPattern([1.5,1], 0); doc.setDrawColor(150,158,164); doc.rect(ox+m.refilo*sc, oy+m.refilo*sc, (m.dim[0]-2*m.refilo)*sc, (m.dim[1]-2*m.refilo)*sc, 'S'); doc.setLineDashPattern([], 0);
    c.pecas.forEach(pp => {
      const x = ox + (m.refilo+pp.x)*sc, yy = oy + (m.refilo+pp.y)*sc, w = pp.w*sc, h = pp.h*sc;
      doc.setDrawColor(31,95,158); doc.setFillColor(226,236,246); doc.setLineWidth(0.25); doc.rect(x, yy, w, h, 'FD');
      doc.setTextColor(20,24,28);
      if (w > 4 && h > 4) { doc.setFont('helvetica','bold'); doc.setFontSize(9); T(String(pp.num), x + w/2, yy + h/2 + (h > 10 ? -0.5 : 1.2), { align:'center' }); }
      if (w > 22 && h > 10) { doc.setFont('helvetica','normal'); doc.setFontSize(7); doc.setTextColor(90,98,104); T(`${fmt(pp.w)} x ${fmt(pp.h)}`, x + w/2, yy + h/2 + 3.5, { align:'center' }); }
    });
  }));
  // Uma página por peça
  dess.forEach(it => {
    doc.addPage();
    const pc = it.pc;
    doc.setFont('helvetica','bold'); doc.setFontSize(14); doc.setTextColor(20,24,28); T(it.titulo, 12, 15);
    doc.setFont('helvetica','normal'); doc.setFontSize(9); doc.setTextColor(90,98,104);
    T(`Qtd ${it.qtd} · ${MATERIAIS[pc.mat].nome} ${fmt(pc.esp)} mm · corte ${fmt(pc.comp)} x ${fmt(pc.larg)} · fita ${fitaTxt(pc.fita)} · ${pc.des.vista}`, 12, 21);
    const { cmds, W, H } = cmdsDesenho(pc.des, it.furos, 188, 168, 3.4);
    pdfDesenhar(doc, cmds, 8 + (188-W)/2, 26 + (168-H)/2);
    let ty = 30; const tx = 204;
    doc.setFontSize(9);
    if (it.furos.length) {
      doc.setFont('helvetica','bold'); doc.setTextColor(20,24,28); T('Furação', tx, ty); ty += 5;
      doc.setFontSize(8); ['Furo','X','Y','Ø','Prof.'].forEach((h,i) => T(h, tx + [0,24,40,52,66][i], ty, { align: i ? 'right' : 'left' })); ty += 1.5;
      doc.setDrawColor(200,205,208); doc.setLineWidth(0.2); doc.line(tx, ty, tx+80, ty); ty += 3.8;
      doc.setFont('helvetica','normal'); doc.setTextColor(30,34,38);
      it.furos.forEach(f => { [f.rot, fmt(f.x), fmt(f.y), fmt(f.d), f.prof ? fmt(f.prof) : 'passa'].forEach((v,i) => T(v, tx + [0,24,40,52,66][i], ty, { align: i ? 'right' : 'left' })); ty += 4; });
      ty += 2;
      const tipos = [...new Set(it.furos.map(f => f.tipo))];
      tipos.forEach(tp => { const lin = doc.splitTextToSize(pdfTxt(`${TIPOS_FURO[tp].l}: ${TIPOS_FURO[tp].nome}`), 82); T(lin, tx, ty); ty += 3.6*lin.length; });
      ty += 3;
    }
    doc.setFontSize(8.5); doc.setTextColor(90,98,104);
    if (pc.obs) { const lin = doc.splitTextToSize(pdfTxt(pc.obs), 82); T(lin, tx, ty); ty += 3.8*lin.length + 3; }
    doc.setDrawColor(...COR_PDF.fita); doc.setLineWidth(1); doc.line(tx, ty, tx+8, ty); T('borda com fita', tx+10, ty+1);
  });
  const N = doc.internal.getNumberOfPages();
  for (let i = 1; i <= N; i++) { doc.setPage(i); doc.setFont('helvetica','normal'); doc.setFontSize(7.5); doc.setTextColor(130,138,144);
    T(`${nome} · Configurador de Móveis · X e Y a partir do canto inferior esquerdo (0,0) da vista · página ${i} de ${N}`, 12, 203); }
  return doc.output('arraybuffer');
}

/* =====================================================================
   4c. INVENTOR — gera uma regra iLogic com os dados do projeto embutidos
   Cada peça: desenho no plano XY, chapa extrudada para −Z, furos cortados da face Z=0.
   Montagem: eixos (u, v) da vista do desenho → eixos do móvel; Z da peça aponta para quem olha a vista.
   ===================================================================== */
function oriDe(id) {
  const pc = estado.res?.pecas.find(p => p.id === id); const { papel, lado } = pc || papelDe(id);
  return ORIENTACAO[papel + ':' + lado] || ORIENTACAO[papel] || ['+x','-z'];
}
const EIXO = { x:0, y:1, z:2 };
const vetor = s => { const v = [0,0,0]; v[EIXO[s[1]]] = s[0]==='-' ? -1 : 1; return v; };
const cruz = (a,b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
function posicaoInventor(pc) {
  const [us, vs] = oriDe(pc.id), u = vetor(us), v = vetor(vs), nn = cruz(u, v);
  const ext = [pc.box[1]-pc.box[0], pc.box[3]-pc.box[2], pc.box[5]-pc.box[4]];
  const mn = [pc.box[0], pc.box[2], pc.box[4]], mx = [pc.box[1], pc.box[3], pc.box[5]];
  const ia = u.findIndex(c=>c), ib = v.findIndex(c=>c), ic = nn.findIndex(c=>c);
  const ok = Math.abs(ext[ia]-pc.des.w) < 0.05 && Math.abs(ext[ib]-pc.des.h) < 0.05 && Math.abs(ext[ic]-pc.esp) < 0.05;
  const o = [0,0,0];
  o[ia] = u[ia] > 0 ? mn[ia] : mx[ia];
  o[ib] = v[ib] > 0 ? mn[ib] : mx[ib];
  o[ic] = nn[ic] > 0 ? mx[ic] : mn[ic];
  return { ok, o, u, v, n:nn };
}
function gerarILogic() {
  const res = estado.res, nome = estado.projeto.nome || 'Projeto', base = slug();
  const dess = listaDesenhos(res.pecas);
  const limpa = t => String(t).replace(/["|]/g, "'").replace(/[\r\n]+/g, ' ');
  const arq = t => limpa(t).replace(/[\\/:*?<>]/g, '-');
  const num = v => String(Math.round(v*1000)/1000);
  const porId = new Map(res.pecas.map(pc => [pc.id, pc]));
  const pecasVB = [], ocsVB = [], problemas = [], nomesUsados = new Set();
  dess.forEach((it, i) => {
    const pc = it.pc, d = pc.des, cod = String(i+1).padStart(2, '0');
    const furos = it.furos.map(f => [f.x, f.y, f.d, f.prof].map(num).join(':')).join(';');
    const rec = (d.recortes||[]).slice().sort((a,b)=>b.x-a.x).map(r => [r.x, r.w, r.h].map(num).join(':')).join(';');
    const ras = (d.rasgos||[]).map(r => [r.x, r.y, r.w, r.h].map(num).join(':')).join(';');
    pecasVB.push(`"${[arq(`${cod} - ${it.titulo}`), limpa(it.titulo), `${base.split('-').filter(w=>w.length>2).map(w=>w[0]).join('').toUpperCase().slice(0,4) || 'MOV'}-${cod}`, num(d.w), num(d.h), num(pc.esp), fitaTxt(pc.fita), it.qtd, limpa(MATERIAIS[pc.mat].nome), furos, rec, limpa(pc.obs||''), ras].join('|')}"`);
    it.ids.forEach(id => {
      const q = porId.get(id), pos = posicaoInventor(q);
      if (!pos.ok) { problemas.push(q.nome); return; }
      let nm = limpa(q.nome); while (nomesUsados.has(nm)) nm += ' b'; nomesUsados.add(nm);
      ocsVB.push(`"${[i, ...pos.o.map(num), ...pos.u, ...pos.v, ...pos.n, nm].join('|')}"`);
    });
  });
  const lista = arr => arr.map((l, i) => '    ' + l + (i < arr.length-1 ? ', _' : '')).join('\n');
  return `' =====================================================================
' Configurador de Móveis — regra iLogic gerada para: ${limpa(nome)}
' Gerada em ${new Date().toLocaleString('pt-BR')} · ${dess.length} peças diferentes, ${ocsVB.length} na montagem
' O que faz: cria uma peça .ipt por peça de MDF (contorno, espessura, furos, recortes,
' iProperties) e a montagem .iam com todas as peças no lugar. Não altera arquivos existentes:
' se a pasta já tiver arquivos, cria outra com data e hora no nome.
' Como usar: Inventor > aba Gerenciar > iLogic > Adicionar regra (com uma montagem ou peça aberta,
' ou como regra externa) > colar este texto > Salvar e executar.
' Unidades: os dados estão em mm; a API do Inventor trabalha em cm (por isso o /10).
' =====================================================================
Imports System.IO

Sub Main()
  Dim PASTA_BASE As String = "C:\\Moveis"   ' <<< troque pela pasta onde quer salvar
  Dim NOME As String = "${base}"

  Dim pasta As String = Path.Combine(PASTA_BASE, NOME)
  If Directory.Exists(pasta) AndAlso Directory.GetFileSystemEntries(pasta).Length > 0 Then
    pasta = pasta & "_" & DateTime.Now.ToString("yyyyMMdd-HHmmss")
  End If
  Directory.CreateDirectory(pasta)

  ' arquivo|nome|código|largura|altura|espessura|fita|qtd|material|furos x:y:Ø:prof (0 = passante)|recortes x:larg:fundo|obs
  Dim pecas() As String = { _
${lista(pecasVB)} }

  ' índice da peça|origem x|y|z|eixo X da peça|eixo Y da peça|eixo Z da peça|nome
  Dim ocorrencias() As String = { _
${lista(ocsVB)} }

  Dim tg As TransientGeometry = ThisApplication.TransientGeometry
  Dim tplPeca As String = ThisApplication.FileManager.GetTemplateFile(DocumentTypeEnum.kPartDocumentObject, SystemOfMeasureEnum.kMetricSystemOfMeasure)
  Dim tplMont As String = ThisApplication.FileManager.GetTemplateFile(DocumentTypeEnum.kAssemblyDocumentObject, SystemOfMeasureEnum.kMetricSystemOfMeasure)
  Dim arquivos As New List(Of String)
  Dim erros As New List(Of String)

  For Each linha As String In pecas
    Try
      arquivos.Add(CriarPeca(linha, pasta, tplPeca, tg))
    Catch ex As Exception
      arquivos.Add("")
      erros.Add(linha.Split("|"c)(1) & ": " & ex.Message)
    End Try
  Next

  Dim mont As AssemblyDocument = ThisApplication.Documents.Add(DocumentTypeEnum.kAssemblyDocumentObject, tplMont, True)
  For Each linha As String In ocorrencias
    Dim c() As String = linha.Split("|"c)
    Dim arqPeca As String = arquivos(CInt(c(0)))
    If arqPeca = "" Then Continue For
    Try
      Dim m As Matrix = tg.CreateMatrix()
      m.SetCoordinateSystem(tg.CreatePoint(Val(c(1)) / 10, Val(c(2)) / 10, Val(c(3)) / 10), _
        tg.CreateVector(Val(c(4)), Val(c(5)), Val(c(6))), _
        tg.CreateVector(Val(c(7)), Val(c(8)), Val(c(9))), _
        tg.CreateVector(Val(c(10)), Val(c(11)), Val(c(12))))
      Dim oc As ComponentOccurrence = mont.ComponentDefinition.Occurrences.Add(arqPeca, m)
      oc.Grounded = True
      Try
        oc.Name = c(13)
      Catch
      End Try
    Catch ex As Exception
      erros.Add("Montagem, " & c(13) & ": " & ex.Message)
    End Try
  Next
  mont.SaveAs(Path.Combine(pasta, NOME & ".iam"), False)
  ThisApplication.ActiveView.Fit()

  Dim msg As String = "Pronto: " & (arquivos.Count - erros.Count) & " peças e a montagem em" & vbCrLf & pasta
  If erros.Count > 0 Then msg = msg & vbCrLf & vbCrLf & "Problemas:" & vbCrLf & String.Join(vbCrLf, erros)
  MessageBox.Show(msg, "Configurador de Móveis")
End Sub

Function CriarPeca(linha As String, pasta As String, tpl As String, tg As TransientGeometry) As String
  Dim c() As String = linha.Split("|"c)
  Dim w As Double = Val(c(3)) / 10, h As Double = Val(c(4)) / 10, e As Double = Val(c(5)) / 10
  Dim doc As PartDocument = ThisApplication.Documents.Add(DocumentTypeEnum.kPartDocumentObject, tpl, False)
  Dim def As PartComponentDefinition = doc.ComponentDefinition

  ' Contorno no plano XY (com recortes na borda de cima, se houver)
  Dim pts As New List(Of Point2d)
  pts.Add(tg.CreatePoint2d(0, 0)) : pts.Add(tg.CreatePoint2d(w, 0)) : pts.Add(tg.CreatePoint2d(w, h))
  If c(10) <> "" Then
    For Each r As String In c(10).Split(";"c)
      Dim q() As String = r.Split(":"c)
      Dim rx As Double = Val(q(0)) / 10, rw As Double = Val(q(1)) / 10, rh As Double = Val(q(2)) / 10
      pts.Add(tg.CreatePoint2d(rx + rw, h)) : pts.Add(tg.CreatePoint2d(rx + rw, h - rh))
      pts.Add(tg.CreatePoint2d(rx, h - rh)) : pts.Add(tg.CreatePoint2d(rx, h))
    Next
  End If
  pts.Add(tg.CreatePoint2d(0, h))
  Dim sk As PlanarSketch = def.Sketches.Add(def.WorkPlanes.Item(3))
  sk.Name = "Contorno"
  Dim ln As SketchLine = sk.SketchLines.AddByTwoPoints(pts(0), pts(1))
  Dim inicio As SketchPoint = ln.StartSketchPoint
  For i As Integer = 2 To pts.Count - 1
    ln = sk.SketchLines.AddByTwoPoints(ln.EndSketchPoint, pts(i))
  Next
  sk.SketchLines.AddByTwoPoints(ln.EndSketchPoint, inicio)
  Dim ed As ExtrudeDefinition = def.Features.ExtrudeFeatures.CreateExtrudeDefinition(sk.Profiles.AddForSolid(), PartFeatureOperationEnum.kJoinOperation)
  ed.SetDistanceExtent(e, PartFeatureExtentDirectionEnum.kNegativeExtentDirection)
  def.Features.ExtrudeFeatures.Add(ed).Name = "Chapa"

  ' Furos: um esboço e um corte por diâmetro + profundidade
  If c(9) <> "" Then
    Dim grupos As New Dictionary(Of String, List(Of String))
    For Each f As String In c(9).Split(";"c)
      Dim q() As String = f.Split(":"c)
      Dim k As String = q(2) & ":" & q(3)
      If Not grupos.ContainsKey(k) Then grupos.Add(k, New List(Of String))
      grupos(k).Add(f)
    Next
    For Each k As String In grupos.Keys
      Dim dk() As String = k.Split(":"c)
      Dim diam As Double = Val(dk(0)) / 10, prof As Double = Val(dk(1)) / 10
      Dim skf As PlanarSketch = def.Sketches.Add(def.WorkPlanes.Item(3))
      skf.Name = "Furos Ø" & dk(0)
      For Each f As String In grupos(k)
        Dim q() As String = f.Split(":"c)
        skf.SketchCircles.AddByCenterRadius(tg.CreatePoint2d(Val(q(0)) / 10, Val(q(1)) / 10), diam / 2)
      Next
      Dim fd As ExtrudeDefinition = def.Features.ExtrudeFeatures.CreateExtrudeDefinition(skf.Profiles.AddForSolid(), PartFeatureOperationEnum.kCutOperation)
      If prof <= 0 Or prof >= e Then
        fd.SetThroughAllExtent(PartFeatureExtentDirectionEnum.kNegativeExtentDirection)
      Else
        fd.SetDistanceExtent(prof, PartFeatureExtentDirectionEnum.kNegativeExtentDirection)
      End If
      def.Features.ExtrudeFeatures.Add(fd).Name = "Furos Ø" & dk(0) & IIf(prof > 0 And prof < e, " x " & dk(1), " passante")
    Next
  End If

  ' Rasgos passantes (ventilação), se houver: campo 12 = x:y:largura:altura
  If c.Length > 12 AndAlso c(12) <> "" Then
    Dim skr As PlanarSketch = def.Sketches.Add(def.WorkPlanes.Item(3))
    skr.Name = "Rasgos"
    For Each r As String In c(12).Split(";"c)
      Dim q() As String = r.Split(":"c)
      Dim rx As Double = Val(q(0)) / 10, ry As Double = Val(q(1)) / 10
      skr.SketchLines.AddAsTwoPointRectangle(tg.CreatePoint2d(rx, ry), tg.CreatePoint2d(rx + Val(q(2)) / 10, ry + Val(q(3)) / 10))
    Next
    Dim rd As ExtrudeDefinition = def.Features.ExtrudeFeatures.CreateExtrudeDefinition(skr.Profiles.AddForSolid(), PartFeatureOperationEnum.kCutOperation)
    rd.SetThroughAllExtent(PartFeatureExtentDirectionEnum.kNegativeExtentDirection)
    def.Features.ExtrudeFeatures.Add(rd).Name = "Rasgos de ventilação"
  End If

  ' iProperties
  doc.PropertySets.Item("Design Tracking Properties").Item("Part Number").Value = c(2)
  doc.PropertySets.Item("Design Tracking Properties").Item("Description").Value = c(1)
  doc.PropertySets.Item("Inventor Summary Information").Item("Title").Value = c(1)
  Dim ud As PropertySet = doc.PropertySets.Item("Inventor User Defined Properties")
  Dim nomes() As String = {"Largura da vista (mm)", "Altura da vista (mm)", "Espessura (mm)", "Fita", "Qtd", "Material", "Obs"}
  Dim vals() As String = {c(3), c(4), c(5), c(6), c(7), c(8), c(11)}
  For i As Integer = 0 To nomes.Length - 1
    Try
      ud.Item(nomes(i)).Value = vals(i)
    Catch
      ud.Add(vals(i), nomes(i))
    End Try
  Next

  Dim caminho As String = Path.Combine(pasta, c(0) & ".ipt")
  doc.SaveAs(caminho, False)
  doc.Close(True)
  Return caminho
End Function
` + (problemas.length ? `\n' Atenção: não posicionadas na montagem (medida não bate com a vista): ${problemas.join(', ')}\n` : '');
}

