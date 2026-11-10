/* =====================================================================
   MINIATURA DA PEÇA — desenho 2D bem simples para a lista de Peças (pedido do Nathan, 09/11):
   chapas = contorno + recortes de borda + vazados (do desenho da peça, pc.des);
   ferragens = um ícone por tipo. Só gera o SVG; a tela (js/tela/paineis/listas.js) põe na lista e mostra a prévia maior.
   ===================================================================== */
const ICONES_FERRAGEM = {
  dobradica:        '<circle cx="8" cy="12" r="5"/><rect x="13" y="9" width="8" height="6" rx="1"/>',
  puxador:          '<path d="M4 15h16"/><path d="M6 15v-5h12v5"/>',
  corredica:        '<rect x="2" y="7" width="20" height="4"/><rect x="5" y="13" width="17" height="4"/>',
  'suporte-vassoura':'<path d="M6 5v7a6 6 0 0 0 12 0V5"/><path d="M4 5h4M16 5h4"/>',
  gancho:           '<path d="M12 3v10a4 4 0 1 1-4 4"/><path d="M9 3h6"/>',
  pistao:           '<path d="M4 19l7-5"/><path d="M11 14l9-7" stroke-width="3.2"/>',
  'kit-correr':     '<path d="M2 7h20"/><circle cx="8" cy="11" r="2.2"/><circle cx="16" cy="11" r="2.2"/><path d="M5 14h14v5H5z"/>',
  'trilho-correr':  '<path d="M2 9h20M2 15h20"/><path d="M2 9v6M22 9v6"/>',
  pe:               '<rect x="7" y="4" width="10" height="3"/><path d="M10 7v12h4V7"/><path d="M8 19h8"/>',
  minifix:          '<circle cx="12" cy="12" r="7"/><path d="M9 12h6"/>',
  cavilha:          '<rect x="3" y="9" width="18" height="6" rx="3"/><path d="M8 9v6M12 9v6M16 9v6"/>',
  desempenador:     '<path d="M12 2v20"/><path d="M8 6h8M8 18h8"/><circle cx="12" cy="12" r="2"/>',
};
const ICONE_PARAFUSO = '<path d="M8 3h8l-1.5 3h-5z"/><path d="M12 6v14"/><path d="M10 9l4 1.2M10 12l4 1.2M10 15l4 1.2"/>';

// SVG da miniatura em `px` × `px`
function miniaturaPeca(pc, px) {
  const svg = (vb, corpo, cls) => `<svg class="${cls}" width="${px}" height="${px}" viewBox="${vb}" aria-hidden="true">${corpo}</svg>`;
  if (pc.cat === 'ferragem') return svg('0 0 24 24', ICONES_FERRAGEM[pc.papel] || ICONE_PARAFUSO, 'mini-ico');
  const d = pc.des, w = d?.w || pc.comp || 0, h = d?.h || pc.larg || 0;
  if (!(w > 0 && h > 0)) return svg('0 0 24 24', '<rect x="4" y="4" width="16" height="16" stroke-dasharray="2 2"/>', 'mini-ico');
  // contorno visto de frente (y para cima), com os recortes de borda na borda de cima — igual ao desenho da peça
  const pts = [[0, 0], [w, 0], [w, h]];
  (d?.recortes || []).slice().sort((a, b) => b.x - a.x).forEach(r => pts.push([r.x + r.w, h], [r.x + r.w, h - r.h], [r.x, h - r.h], [r.x, h]));
  pts.push([0, h]);
  const m = Math.max(w, h) * 0.06, vb = `${-m} ${-m} ${w + 2*m} ${h + 2*m}`, Y = y => h - y;
  const sw = Math.max(w, h) / (px > 60 ? 90 : 18);   // traço com a mesma grossura na tela, qualquer que seja a peça
  const contorno = `<polygon points="${pts.map(([x, y]) => `${x},${Y(y)}`).join(' ')}" stroke-width="${sw}"/>`;
  const vazados = (d?.rasgos || []).map(r => `<rect class="mini-vazado" x="${r.x}" y="${Y(r.y + r.h)}" width="${r.w}" height="${r.h}" stroke-width="${sw * 0.7}"/>`).join('');
  return svg(vb, contorno + vazados, 'mini-chapa');
}
