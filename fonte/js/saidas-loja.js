/* =====================================================================
   5c. SAÍDAS PARA A LOJA — códigos das peças, pedido no formato CorteCloud
   (JSON) e etiquetas com QR em PDF. Só lógica; a tela fica em tela-loja.js.

   Código da peça (especificação, seção 15):  projeto · ambiente-módulo · peça
     ex.: 2611-03 · A-M02 · P014   (AAMM-NN · letra-M nº do módulo · P nº no projeto)
   ===================================================================== */
function codigoProjetoPadrao() { const d = new Date(); return `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}-01`; }

// numera as peças na ordem da lista de corte (a mesma da loja); devolve Map id → { codigo, num, modulo }
function codigosDasPecas(pecas, codigoProjeto, ambiente = 'A') {
  const lc = listaDeCorte(pecas), mapa = new Map(); let n = 0;
  for (const its of lc.grupos.values()) for (const it of its) for (const id of it.ids) {
    const pc = pecas.find(p => p.id === id), mod = (pc.modulo ?? 0) + 1;
    const codigo = `${codigoProjeto} · ${ambiente}-M${String(mod).padStart(2, '0')} · P${String(++n).padStart(3, '0')}`;
    mapa.set(id, { codigo, num: it.num, modulo: mod });
  }
  return mapa;
}

// medida que vai para a loja (final ou já descontada a fita, conforme o perfil da loja) — 4e
function medidaLoja(pc) { return pc.medidaLoja ? [pc.medidaLoja.comp, pc.medidaLoja.larg] : [pc.comp, pc.larg]; }
function fitaTexto(esp) { return esp ? `Fita ${String(esp).replace('.', ',')}` : null; }

/* CorteCloud (Serrabits) — formato de importação JSON (cortecloud.com/api-docs, guia json_import):
   parts[]: quantity, c, l, function, complement, c1, c2, l1, l2, material, machining{ x, y, z, startSide,
   verticalDrills[], horizontalDrills[], furrowMachining, furrowMachiningPair }.
   [Provável] canto 0 = canto inferior esquerdo da vista do desenho; C = comprimento (lado maior).
   Conferir com a loja antes de mandar furar em CNC. */
function pedidoCorteCloud(pecas, codigos) {
  const parts = [];
  for (const pc of pecas.filter(p => p.lista)) {
    const [c, l] = medidaLoja(pc), d = pc.des || {}, e = pc.esp;
    const girada = d.w !== undefined && Math.abs(d.w - pc.comp) > 0.6;          // desenho com a largura na horizontal
    const xy = f => girada ? [f.y, f.x] : [f.x, f.y];
    const fl = ladosFita(pc);
    const furos = d.furos || [];
    const verticalDrills = furos.filter(f => !String(f.face || '').startsWith('topo')).map(f => { const [x, y] = xy(f);
      return { corner:0, bolthole: !f.prof, x: arred(x), y: arred(y), depth: f.prof || e, diameter: f.d, face: f.face === 'externa' || f.face === 'inferior' ? 'e' : 'i' }; });
    const horizontalDrills = furos.filter(f => String(f.face || '').startsWith('topo')).map(f => { const [, y] = xy(f);
      return { corner: f.face === 'topo-dir' ? 1 : 0, direction:'XP', x:0, y: arred(y), z: arred(e / 2), depth: f.prof, diameter: f.d, face:'i' }; });
    const canal = (d.canais || [])[0];
    parts.push({ quantity:1, c: arred(c), l: arred(l), function: pc.nomeLista || pc.nome, complement: codigos.get(pc.id)?.codigo || '',
      c1: fitaTexto(fl.C1), c2: fitaTexto(fl.C2), l1: fitaTexto(fl.L1), l2: fitaTexto(fl.L2),
      material: `${MATERIAIS[pc.mat]?.nome || pc.mat} ${String(e).replace('.', ',')}`,
      machining: (verticalDrills.length || horizontalDrills.length || canal) ? { x: arred(c), y: arred(l), z: e, startSide:0, verticalDrills, horizontalDrills,
        furrowMachining: canal ? { face:'i', depth: canal.prof, width: canal.larg, distance: canal.dist } : null, furrowMachiningPair:null } : null });
  }
  return { parts };
}
// fita por lado: a do acabamento (4e) ou, nos tipos antigos, a contagem C/L da peça
function ladosFita(pc) { return pc.fitaLados || { C1: pc.fita[0] >= 1 ? R.fitaEsp : 0, C2: pc.fita[0] >= 2 ? R.fitaEsp : 0, L1: pc.fita[1] >= 1 ? R.fitaEsp : 0, L2: pc.fita[1] >= 2 ? R.fitaEsp : 0 }; }
function arred(v) { return Math.round(v * 10) / 10; }

/* ETIQUETAS — folha A4 com 2 colunas × 7 linhas (99 × 38 mm) [Suposição: modelo de etiqueta a confirmar].
   Cada etiqueta: código, peça, medida, material, fita por lado, veio e QR com os dados da peça. */
const ETIQUETA = { cols:2, linhas:7, w:99, h:38, margemX:6, margemY:10.5 };
function textoQR(pc, cod) { const [c, l] = medidaLoja(pc); return `${cod.codigo}\n${pc.nomeLista || pc.nome}\n${arred(c)} x ${arred(l)} x ${pc.esp} mm\n${MATERIAIS[pc.mat]?.nome || pc.mat}`; }
// QR como imagem pequena (uma por etiqueta) — bem mais leve que desenhar cada quadradinho
function qrPNG(texto) {
  if (!window.qrcode) return null;
  const q = window.qrcode(0, 'M'); q.addData(texto); q.make();
  const n = q.getModuleCount(), px = 2, cv = document.createElement('canvas'); cv.width = cv.height = n * px;
  const g = cv.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, cv.width, cv.height); g.fillStyle = '#000';
  for (let r = 0; r < n; r++) for (let s = 0; s < n; s++) if (q.isDark(r, s)) g.fillRect(s * px, r * px, px, px);
  return cv.toDataURL('image/png');
}
function etiquetasPDF(pecas, codigos, nomeProjeto) {
  const { jsPDF } = window.jspdf, doc = new jsPDF({ unit:'mm', format:'a4' }), E = ETIQUETA;
  const lista = pecas.filter(p => p.lista && codigos.has(p.id)).sort((a, b) => codigos.get(a.id).codigo.localeCompare(codigos.get(b.id).codigo));
  lista.forEach((pc, k) => {
    const pos = k % (E.cols * E.linhas); if (k && !pos) doc.addPage();
    const x = E.margemX + (pos % E.cols) * E.w, y = E.margemY + Math.floor(pos / E.cols) * E.h, cod = codigos.get(pc.id), [c, l] = medidaLoja(pc);
    doc.setDrawColor(200); doc.setLineWidth(0.1); doc.rect(x, y, E.w, E.h);
    // QR (qrcode-generator): desenhado como quadradinhos
    const png = qrPNG(pdfTxt(textoQR(pc, cod))); if (png) doc.addImage(png, 'PNG', x + 3, y + 4, 30, 30, undefined, 'FAST');
    const tx = x + 36; doc.setTextColor(20);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.text(pdfTxt(cod.codigo), tx, y + 7);
    doc.setFontSize(9); doc.text(pdfTxt(pc.nomeLista || pc.nome).slice(0, 34), tx, y + 13);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
    doc.text(pdfTxt(`${arred(c)} x ${arred(l)} x ${pc.esp} mm  (Nº ${cod.num} da lista)`), tx, y + 18.5);
    doc.text(pdfTxt(MATERIAIS[pc.mat]?.nome || pc.mat).slice(0, 36), tx, y + 23.5);
    const fl = ladosFita(pc), f = ['C1','C2','L1','L2'].filter(k2 => fl[k2]).join(' ');
    doc.text(pdfTxt(`Fita: ${f || 'sem fita'}${pc.veio ? '   Veio: ' + (pc.veio === 'comp' ? 'no comprimento' : 'na largura') : ''}`), tx, y + 28.5);
    doc.setTextColor(110); doc.setFontSize(7); doc.text(pdfTxt(nomeProjeto).slice(0, 46), tx, y + 34);
  });
  return doc.output('arraybuffer');
}
