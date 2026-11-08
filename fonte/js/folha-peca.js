/* =====================================================================
   5c (parte 2). DESENHO DE PEÇA — folha A3 no padrão da folha de teste do
   FreeCAD aprovada pelo Nathan (06/11): quadro NBR 10068, carimbo NBR 10582,
   1º diedro (frontal, lateral à direita, superior embaixo), corte do furo
   cego, perspectiva isométrica, cotas pelas regras da especificação (seção 14)
   e tabela de furos. Gera um SVG em mm; o PDF sai do mesmo SVG (vetor).
   Só lógica de desenho: nada aqui mexe na tela.
   ===================================================================== */
const FOLHA = { w:420, h:297, margemEsq:25, margem:7, carimbo:[178, 42], escalas:[0.5, 0.2, 0.1, 0.05, 0.04], escalaCorte:0.5,
  linha:{ visivel:0.5, oculta:0.25, cota:0.18, chamada:0.13, quadro:0.7 }, cotaPrimeira:10, cotaEntre:8 };

function folhaPecaSVG(pc, extra = {}) {
  const d = pc.des || {}, out = [];
  // a folha é desenhada com o lado maior em pé (como a porta do teste); peça deitada é girada 90°
  let W = d.w ?? pc.larg, H = d.h ?? pc.comp, furos = (d.furos || []).map(f => ({ ...f })), fita = [...(d.fita || [])];
  if (W > H) { furos = furos.map(f => ({ ...f, x: H - f.y, y: f.x })); fita = fita.map(s => ({ t:'l', l:'b', b:'r', r:'t' })[s]); [W, H] = [H, W]; }
  const E = pc.esp, FW = FOLHA.w, FH = FOLHA.h, L = FOLHA.linha;
  const n = v => (Math.round(v * 10) / 10).toFixed(1).replace(/\.0$/, '').replace('.', ',');
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const t = (x, y, s, size = 3.2, anchor = 'start', peso = 'normal', rot = 0) => out.push(`<text x="${x.toFixed(2)}" y="${y.toFixed(2)}" font-size="${size}" font-family="Helvetica, Arial, sans-serif" text-anchor="${anchor}" font-weight="${peso}"${rot ? ` transform="rotate(${rot} ${x.toFixed(2)} ${y.toFixed(2)})"` : ''}>${esc(s)}</text>`);
  const ln = (x1, y1, x2, y2, w = 0.25, extra = '') => out.push(`<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="#000" stroke-width="${w}" ${extra}/>`);
  const rect = (x, y, w, h, sw = 0.5, extra = 'fill="none"') => out.push(`<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${w.toFixed(2)}" height="${h.toFixed(2)}" stroke="#000" stroke-width="${sw}" ${extra}/>`);
  const circ = (cx, cy, r, sw = L.visivel, extra = '') => out.push(`<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${r.toFixed(2)}" fill="none" stroke="#000" stroke-width="${sw}" ${extra}/>`);
  const oculta = `stroke-dasharray="2,1"`;
  const seta = 'marker-start="url(#s)" marker-end="url(#s)"';
  const cotaH = (x1, x2, y, ylin, txt) => { [x1, x2].forEach(x => ln(x, y + (ylin > y ? 1.5 : -1.5), x, ylin + (ylin > y ? 1.5 : -1.5), L.cota)); ln(x1, ylin, x2, ylin, L.cota, seta); t((x1 + x2) / 2, ylin - 1, txt, 2.8, 'middle'); };
  const cotaV = (y1, y2, x, xlin, txt) => { [y1, y2].forEach(y => ln(x + (xlin > x ? 1.5 : -1.5), y, xlin + (xlin > x ? 1.5 : -1.5), y, L.cota)); ln(xlin, y1, xlin, y2, L.cota, seta); t(xlin - 1, (y1 + y2) / 2, txt, 2.8, 'middle', 'normal', -90); };

  // ESCALA: a maior escala normalizada em que a frontal cabe na coluna da esquerda
  const S = FOLHA.escalas.find(s => H * s <= 215 && W * s <= 85) || FOLHA.escalas.at(-1), den = Math.round(1 / S);
  rect(FOLHA.margemEsq, FOLHA.margem, FW - FOLHA.margemEsq - FOLHA.margem, FH - 2 * FOLHA.margem, L.quadro);

  // grupos de furos: mesma coluna (x) e mesmo tipo de furo → cotas em cadeia
  const grupos = []; for (const f of furos) { const g = grupos.find(g => Math.abs(g.x - f.x) < 0.5 && g.d === f.d && g.prof === f.prof); if (g) g.furos.push(f); else grupos.push({ x:f.x, d:f.d, prof:f.prof, tipo:f.tipo, furos:[f] }); }
  grupos.forEach(g => g.furos.sort((a, b) => a.y - b.y));
  const dir = grupos.filter(g => g.x > W / 2), esq = grupos.filter(g => g.x <= W / 2);
  const nCadeiaDir = dir.filter(g => g.furos.length > 1).length, nCadeiaEsq = esq.filter(g => g.furos.length > 1).length;
  const larguraDir = 10 + Math.max(0, nCadeiaDir - 1) * FOLHA.cotaEntre + (dir.length ? 16 : 0), larguraEsq = 10 + (nCadeiaEsq + 1) * FOLHA.cotaEntre;

  // posição da frontal: bloco centralizado na altura da coluna da esquerda (grade — regra 10)
  const bloco = 20 + H * S + 14 + E * S + 16;
  const topo = FOLHA.margem + (FH - 2 * FOLHA.margem - bloco) / 2;
  // centraliza na horizontal o conjunto (cotas da esquerda + frontal + cotas da direita + lateral) na coluna da esquerda
  const wEsq = FOLHA.cotaPrimeira + nCadeiaEsq * FOLHA.cotaEntre + 6, wDir = larguraDir + 18 + E * S + 4, area0 = FOLHA.margemEsq + 4, area1 = 218;
  const ini = area0 + Math.max(0, (area1 - area0 - (wEsq + W * S + wDir)) / 2);
  const cxF = ini + wEsq + W * S / 2, cyF = topo + 20 + H * S / 2;
  const X = x => cxF + (x - W / 2) * S, Y = y => cyF - (y - H / 2) * S;
  const yTitulo = Y(H) - 14 - (grupos.length ? 6 + Math.max(0, grupos.length - 1) * FOLHA.cotaEntre * 0.75 : 0);
  t(cxF, yTitulo, 'VISTA FRONTAL (face interna)', 3.2, 'middle', 'bold');
  rect(X(0), Y(H), W * S, H * S, L.visivel);
  // fita marcada nas bordas (regra 8): linha grossa por fora
  const bordas = { t:[X(0), Y(H), X(W), Y(H), 0, -0.6], b:[X(0), Y(0), X(W), Y(0), 0, 0.6], l:[X(0), Y(0), X(0), Y(H), -0.6, 0], r:[X(W), Y(0), X(W), Y(H), 0.6, 0] };
  fita.forEach(s => { const b = bordas[s]; if (b) ln(b[0] + b[4], b[1] + b[5], b[2] + b[4], b[3] + b[5], 0.9, 'stroke-opacity="0.55"'); });
  for (const f of furos) { circ(X(f.x), Y(f.y), Math.max(0.35, f.d * S / 2), f.prof ? L.visivel : L.visivel); if (f.d * S > 2) { ln(X(f.x) - f.d * S / 2 - 1, Y(f.y), X(f.x) + f.d * S / 2 + 1, Y(f.y), 0.13, 'stroke-dasharray="3,1,0.5,1"'); ln(X(f.x), Y(f.y) - f.d * S / 2 - 1, X(f.x), Y(f.y) + f.d * S / 2 + 1, 0.13, 'stroke-dasharray="3,1,0.5,1"'); } }
  // cotas totais (1ª linha a 10 mm — regra 12)
  cotaH(X(0), X(W), Y(0), Y(0) + FOLHA.cotaPrimeira, n(W));
  cotaV(Y(0), Y(H), X(0), X(0) - FOLHA.cotaPrimeira - nCadeiaEsq * FOLHA.cotaEntre, n(H));
  // cadeias entre furos (regra 2) — direita e esquerda; ordenadas da base numa coluna separada (regra 11)
  const cadeia = (g, k, lado) => { const ys = [0, ...g.furos.map(f => f.y), H], xl = lado > 0 ? X(W) + FOLHA.cotaPrimeira + k * FOLHA.cotaEntre : X(0) - FOLHA.cotaPrimeira - k * FOLHA.cotaEntre;
    for (let i = 0; i + 1 < ys.length; i++) cotaV(Y(ys[i]), Y(ys[i + 1]), lado > 0 ? X(W) : X(0), xl, n(ys[i + 1] - ys[i])); };
  dir.filter(g => g.furos.length > 1).forEach((g, k) => cadeia(g, k, 1));
  esq.filter(g => g.furos.length > 1).forEach((g, k) => cadeia(g, k, -1));
  if (dir.length) { const xo = X(W) + FOLHA.cotaPrimeira + Math.max(0, nCadeiaDir - 1) * FOLHA.cotaEntre + 9;
    const ysO = [...new Set(dir.flatMap(g => g.furos.map(f => Math.round(f.y * 10) / 10)))].sort((a, b) => a - b);
    [0, ...ysO].forEach(y => { ln(X(W) + 1.5, Y(y), xo - 1, Y(y), L.chamada); t(xo, Y(y) + 1, y ? n(y) : '0', 2.6); });
    t(xo + 4, Y(H) - 5, 'a partir da base', 2.2, 'middle'); }
  // posição de cada coluna de furos a partir da borda mais perto (em cima da peça)
  grupos.forEach((g, k) => { const daDir = g.x > W / 2, yl = Y(H) - 6 - k * FOLHA.cotaEntre * 0.75;
    if (daDir) cotaH(X(g.x), X(W), Y(H), yl, n(W - g.x)); else cotaH(X(0), X(g.x), Y(H), yl, n(g.x)); });
  // chamadas: uma por grupo (regra 4)
  const porTipo = new Map(); grupos.forEach(g => { const k = `${g.d}|${g.prof}`; porTipo.set(k, [...(porTipo.get(k) || []), ...g.furos]); });
  let kc = 0; for (const [, fs] of porTipo) { const f = fs[Math.floor(fs.length / 2)], daDir = f.x > W / 2, dx = daDir ? -14 : 12, dy = -10 - (kc++ % 2) * 6;
    ln(X(f.x), Y(f.y), X(f.x) + dx, Y(f.y) + dy, L.cota); t(X(f.x) + dx + (daDir ? -1 : 1), Y(f.y) + dy - 1, `${fs.length}× Ø${n(f.d)} ${f.prof ? 'prof. ' + n(f.prof) : 'passante'}`, 2.8, daDir ? 'end' : 'start'); }

  const fA = furos.filter(f => f.prof && f.prof < E).sort((a, b) => b.d - a.d || a.y - b.y)[0];
  if (fA) [X(fA.x) - fA.d * S / 2 - 6, X(fA.x) + fA.d * S / 2 + 3].forEach(x => t(x, Y(fA.y) - 1.5, 'A', 3, 'middle', 'bold'));
  // LATERAL (1º diedro: à direita da frontal) — espessura, furos ocultos tracejados
  const cxL = X(W) + larguraDir + 18 + E * S / 2;
  t(cxL, yTitulo, 'LATERAL', 3.2, 'middle', 'bold');
  rect(cxL - E * S / 2, Y(H), E * S, H * S, L.visivel);
  for (const f of furos) { const p = f.prof || E, x0 = cxL + E * S / 2 - p * S; rect(x0, Y(f.y + f.d / 2), p * S, f.d * S, L.oculta, `fill="none" ${oculta}`); }
  cotaH(cxL - E * S / 2, cxL + E * S / 2, Y(0), Y(0) + FOLHA.cotaPrimeira, n(E));
  // SUPERIOR (1º diedro: abaixo da frontal)
  const yT = Y(0) + FOLHA.cotaPrimeira + 10;
  rect(X(0), yT, W * S, E * S, L.visivel);
  for (const f of furos) { const p = f.prof || E; rect(X(f.x - f.d / 2), yT, f.d * S, p * S, L.oculta, `fill="none" ${oculta}`); }
  t(X(W) + 3, yT + E * S / 2 + 1, 'VISTA SUPERIOR', 2.6);

  // COLUNA DA DIREITA: corte do furo cego, isométrica, notas e tabela de furos
  const xR = Math.max(cxL + E * S / 2 + 22, 225), wR = FW - FOLHA.margem - 6 - xR;
  let yR = FOLHA.margem + 14;
  const cego = fA;
  if (cego) {
    const SC = FOLHA.escalaCorte, larg = Math.min(90, cego.d + 50), cx = xR + wR / 2 - 30, cy = yR + 18, borda = Math.min(cego.x, W - cego.x);
    t(xR + wR / 2 - 30, yR, `CORTE A-A (1:${Math.round(1 / SC)}) — furo Ø${n(cego.d)}`, 3.2, 'middle', 'bold');
    const x0 = cx - larg * SC / 2, x1 = cx + larg * SC / 2, ya = cy, yb = cy + E * SC, h0 = cx - cego.d * SC / 2, h1 = cx + cego.d * SC / 2, hp = ya + cego.prof * SC;
    out.push(`<path d="M${x0} ${ya} L${h0} ${ya} L${h0} ${hp} L${h1} ${hp} L${h1} ${ya} L${x1} ${ya} M${x0} ${yb} L${x1} ${yb}" fill="none" stroke="#000" stroke-width="${L.visivel}"/>`);
    ln(x0, ya, x0, yb, 0.18, 'stroke-dasharray="4,1,1,1"'); ln(x1, ya, x1, yb, 0.18, 'stroke-dasharray="4,1,1,1"');
    // hachura 45° só na parte cheia (recorte com clipPath)
    out.push(`<clipPath id="cl"><path d="M${x0} ${ya} L${h0} ${ya} L${h0} ${hp} L${h1} ${hp} L${h1} ${ya} L${x1} ${ya} L${x1} ${yb} L${x0} ${yb} Z"/></clipPath><g clip-path="url(#cl)">`);
    for (let a = x0 - E * SC; a < x1; a += 1.6) ln(a, yb, a + E * SC, ya, 0.13);
    out.push('</g>');
    cotaH(h0, h1, ya, ya - 8, 'Ø' + n(cego.d)); cotaV(ya, hp, x1, x1 + 8, n(cego.prof)); cotaV(ya, yb, x1, x1 + 16, n(E));
    if (borda < larg / 2) cotaH(cx, cx + (cego.x > W / 2 ? 1 : -1) * borda * SC, yb, yb + 8, n(borda));
    yR = yb + 20;
  }
  // ISOMÉTRICA: caixa da chapa + furos da face interna como elipses
  { const SI = Math.min(wR * 0.55 / (W * 0.866 + E * 0.866 + 1), 85 / (H + 0.5 * (W + E))), c30 = 0.866, s30 = 0.5;
    const P = (x, y, z) => [x * c30 - z * c30, -y + x * s30 + z * s30].map(v => v * SI);
    const minX = P(0, 0, E)[0], maxX = P(W, 0, 0)[0], minY = P(0, H, 0)[1], maxY = P(W, 0, E)[1];
    const ox = xR + wR / 2 - (minX + maxX) / 2 - 30, oy = yR + 6 - minY;
    const pt = (x, y, z) => { const [u, v] = P(x, y, z); return `${(ox + u).toFixed(2)} ${(oy + v).toFixed(2)}`; };
    const face = pts => out.push(`<path d="M${pts.map(p => pt(...p)).join(' L')} Z" fill="#fff" stroke="#000" stroke-width="${L.visivel}" stroke-linejoin="round"/>`);
    face([[0, 0, 0], [W, 0, 0], [W, H, 0], [0, H, 0]]); face([[0, H, 0], [W, H, 0], [W, H, E], [0, H, E]]); face([[0, 0, 0], [0, H, 0], [0, H, E], [0, 0, E]]);
    for (const f of furos) { const r = f.d / 2, pts = []; for (let a = 0; a < 24; a++) { const ang = a / 24 * Math.PI * 2; pts.push(pt(f.x + r * Math.cos(ang), f.y + r * Math.sin(ang), 0)); }
      out.push(`<path d="M${pts.join(' L')} Z" fill="none" stroke="#000" stroke-width="0.3"/>`); }
    const fim = oy + maxY + 6; t(xR + wR / 2 - 30, fim + 2, `PERSPECTIVA ISOMÉTRICA (sem escala)`, 3.2, 'middle', 'bold'); yR = fim + 12; }
  // NOTAS
  const notas = ['NOTAS:', '1. Medidas em mm.', `2. Fita de borda: ${fita.length ? fita.length + ' lado(s), marcados com linha grossa' : 'sem fita'}.`,
    `3. Furos cegos na face interna; furos sem profundidade são passantes.`, ...(pc.veio ? [`4. Veio: ${pc.veio === 'comp' ? 'no comprimento' : 'na largura'} (não girar no corte).`] : []),
    ...(d.canais || []).map((c, i) => `${5 + i}. Rasgo: ${n(c.larg)} × ${n(c.prof)} a ${n(c.dist)} da borda (${c.txt || c.face || ''}).`)];
  notas.forEach((s, i) => t(xR, yR + i * 4.6, s, 2.7, 'start', i ? 'normal' : 'bold')); yR += notas.length * 4.6 + 4;
  // TABELA DE FUROS (regra 5)
  const yMax = FH - FOLHA.margem - FOLHA.carimbo[1] - 4;
  if (furos.length) { const cols = [['Nº', 8], ['X', 16], ['Y', 18], ['Ø', 10], ['Prof.', 14], ['Face', 16], ['Função', 30]], lh = 4.2;
    const caber = Math.max(0, Math.floor((yMax - yR - lh) / lh)), lista = furos.slice(0, caber);
    let x = xR; t(xR, yR, 'TABELA DE FUROS', 2.8, 'start', 'bold'); yR += 2;
    rect(xR, yR, cols.reduce((s, c) => s + c[1], 0), lh * (lista.length + 1), 0.25);
    cols.forEach(([c, w]) => { t(x + 1, yR + 3, c, 2.4, 'start', 'bold'); x += w; ln(x, yR, x, yR + lh * (lista.length + 1), 0.13); });
    lista.forEach((f, i) => { const y = yR + lh * (i + 1); ln(xR, y, xR + cols.reduce((s, c) => s + c[1], 0), y, 0.13); let x2 = xR;
      [i + 1, n(f.x), n(f.y), n(f.d), f.prof ? n(f.prof) : 'pass.', f.face || 'interna', f.tipo || ''].forEach((v, j) => { t(x2 + 1, y + 3, String(v), 2.4); x2 += cols[j][1]; }); });
    if (lista.length < furos.length) t(xR, yR + lh * (lista.length + 1) + 3.5, `+ ${furos.length - lista.length} furos (lista completa no pedido da loja)`, 2.4);
  }
  // CARIMBO (NBR 10582)
  const [cw, ch] = FOLHA.carimbo, cx0 = FW - FOLHA.margem - cw, cy0 = FH - FOLHA.margem - ch;
  rect(cx0, cy0, cw, ch, L.quadro);
  [10, 20, 30].forEach(yy => ln(cx0 + 40, cy0 + yy, cx0 + cw, cy0 + yy, 0.25));
  ln(cx0 + 40, cy0, cx0 + 40, cy0 + ch, 0.5); ln(cx0 + 120, cy0 + 10, cx0 + 120, cy0 + ch, 0.25); ln(cx0 + 150, cy0 + 20, cx0 + 150, cy0 + ch, 0.25);
  rect(cx0 + 4, cy0 + 4, 32, 20, 0.25, 'fill="none" stroke-dasharray="1,1" stroke-opacity="0.5"'); t(cx0 + 20, cy0 + 15, 'LOGO', 3, 'middle');
  t(cx0 + 20, cy0 + 30, extra.empresa || '[NOME DA EMPRESA]', 2.4, 'middle', 'bold'); t(cx0 + 20, cy0 + 35, extra.autor || 'Nathan', 2.4, 'middle'); t(cx0 + 20, cy0 + 39.5, extra.cidade || 'Ponta Grossa - PR', 2.2, 'middle');
  const campo = (x, y, rot, val, size = 3.4, peso = 'bold') => { t(x + 1.5, y + 3, rot, 1.8); t(x + 1.5, y + 8, val, size, 'start', peso); };
  campo(cx0 + 40, cy0, 'PROJETO · CÓDIGO DA PEÇA', `${extra.projeto || ''}${extra.codigo ? ' · ' + extra.codigo : ''}`.slice(0, 62), 2.9);
  campo(cx0 + 40, cy0 + 10, 'PEÇA', `${pc.nome} — ${MATERIAIS[pc.mat]?.nome || pc.mat} ${n(E)} mm`.slice(0, 52), 3.0); campo(cx0 + 120, cy0 + 10, 'QTD.', '1');
  campo(cx0 + 40, cy0 + 20, 'DIMENSÕES (C × L × E)', `${n(H)} × ${n(W)} × ${n(E)}`, 3.2); campo(cx0 + 120, cy0 + 20, 'ESCALA', `1:${den}`, 3.2); campo(cx0 + 150, cy0 + 20, 'FOLHA', 'A3', 3.2);
  const nC = fita.filter(x => x === 'l' || x === 'r').length, nL = fita.filter(x => x === 't' || x === 'b').length;
  campo(cx0 + 40, cy0 + 30, 'FITA', fita.length ? `${fita.length} lado${fita.length > 1 ? 's' : ''} (${[nC && nC + 'C', nL && nL + 'L'].filter(Boolean).join(' ')})` : 'sem fita', 3.0); campo(cx0 + 120, cy0 + 30, 'DATA', new Date().toLocaleDateString('pt-BR'), 3.0); campo(cx0 + 150, cy0 + 30, 'REV.', extra.rev || '—', 3.0);
  const sx = cx0 + 160, sy = cy0 + 4;   // símbolo do 1º diedro
  out.push(`<path d="M${sx} ${sy + 3} L${sx + 7} ${sy + 1} L${sx + 7} ${sy + 7} L${sx} ${sy + 5} Z" fill="none" stroke="#000" stroke-width="0.25"/><circle cx="${sx + 12}" cy="${sy + 4}" r="3" fill="none" stroke="#000" stroke-width="0.25"/><circle cx="${sx + 12}" cy="${sy + 4}" r="1.3" fill="none" stroke="#000" stroke-width="0.25"/>`);
  // documento que não está liberado sai marcado (ninguém fabrica com folha de estudo)
  if (extra.aviso) { out.push(`<text x="${FW / 2 - 40}" y="${FOLHA.margem + 8}" font-size="5" font-family="Helvetica, Arial, sans-serif" font-weight="bold" fill="#b00020" text-anchor="middle">${esc(extra.aviso)}</text>`);
    out.push(`<text x="${FW / 2 - 40}" y="${FH / 2 + 20}" font-size="28" font-family="Helvetica, Arial, sans-serif" font-weight="bold" fill="#b00020" fill-opacity="0.12" text-anchor="middle" transform="rotate(-25 ${FW / 2 - 40} ${FH / 2 + 20})">NÃO FABRICAR</text>`); }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${FW}mm" height="${FH}mm" viewBox="0 0 ${FW} ${FH}"><defs><marker id="s" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="2.5" markerHeight="2.5" orient="auto-start-reverse"><path d="M0,2 L10,5 L0,8 z" fill="#000"/></marker></defs><rect width="${FW}" height="${FH}" fill="#fff"/>${out.join('')}</svg>`;
}

// PDF das folhas (uma folha A3 por peça), vetorial: o mesmo SVG convertido pelo svg2pdf
async function folhasPDF(pecas, extraDe) {
  const { jsPDF } = window.jspdf, doc = new jsPDF({ orientation:'landscape', unit:'mm', format:'a3' });
  const host = document.createElement('div'); host.style.cssText = 'position:fixed;left:-99999px;top:0'; document.body.append(host);
  try {
    let primeira = true;
    for (const pc of pecas) {
      host.innerHTML = folhaPecaSVG(pc, extraDe(pc));
      if (!primeira) doc.addPage('a3', 'landscape'); primeira = false;
      await doc.svg(host.firstElementChild, { x:0, y:0, width:FOLHA.w, height:FOLHA.h });
    }
  } finally { host.remove(); }
  return doc.output('arraybuffer');
}
