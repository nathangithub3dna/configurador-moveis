// Gera o configurador-offline.html: o mesmo configurador.html, com TODAS as bibliotecas embutidas
// (3D, PDF, ZIP, QR, SVG→PDF). Abre com dois cliques em qualquer computador, sem internet e sem o Claude.
// As bibliotecas vêm de node_modules (as mesmas versões do site). Rodar depois do montar.js.
const fs = require('fs'); const path = require('path');
const raiz = path.join(__dirname, '..'), nm = p => path.join(raiz, 'node_modules', p);
let s = fs.readFileSync(path.join(raiz, 'configurador.html'), 'utf8');

// 1. scripts comuns (UMD): troca o link pelo conteúdo
const UMD = {
  'jszip/3.10.1/jszip.min.js': 'jszip/dist/jszip.min.js',
  'jspdf/2.5.1/jspdf.umd.min.js': 'jspdf/dist/jspdf.umd.min.js',
  'qrcode-generator/1.4.4/qrcode.min.js': 'qrcode-generator/qrcode.js',
  'svg2pdf.js@2.2.3/dist/svg2pdf.umd.min.js': 'svg2pdf.js/dist/svg2pdf.umd.min.js',
};
for (const [url, arq] of Object.entries(UMD)) {
  const re = new RegExp(`<script src="[^"]*${url.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}"></script>`);
  if (!re.test(s)) { console.error(`ERRO: não achei o script ${url} na página`); process.exit(1); }
  const codigo = fs.readFileSync(nm(arq), 'utf8').replace(/<\/script/gi, '<\\/script');
  s = s.replace(re, () => `<script>/* ${url} (embutido) */\n${codigo}\n</script>`);
}

// 2. módulos do three.js: cada um vira um "data:" no importmap; imports relativos viram 'three/addons/…'
const base = nm('three/examples/jsm'), mapa = { three: dataURL(fs.readFileSync(nm('three/build/three.module.js'), 'utf8')) };
function dataURL(codigo) { return 'data:text/javascript;base64,' + Buffer.from(codigo, 'utf8').toString('base64'); }
function addon(rel) {                                      // rel: 'controls/OrbitControls.js'
  const chave = 'three/addons/' + rel; if (mapa[chave]) return;
  mapa[chave] = 'pendente';
  let codigo = fs.readFileSync(path.join(base, rel), 'utf8');
  codigo = codigo.replace(/(from\s*|import\s*)(['"])(\.{1,2}\/[^'"]+)\2/g, (_, pre, q, r) => {
    const alvo = path.posix.normalize(path.posix.join(path.posix.dirname(rel), r)); addon(alvo); return `${pre}${q}three/addons/${alvo}${q}`; });
  mapa[chave] = dataURL(codigo);
}
const usados = [...s.matchAll(/from\s*'three\/addons\/([^']+)'/g)].map(m => m[1]);
if (!usados.length) { console.error('ERRO: nenhum módulo three/addons encontrado'); process.exit(1); }
usados.forEach(addon);
const re = /<script type="importmap">[\s\S]*?<\/script>/;
if (!re.test(s)) { console.error('ERRO: importmap não encontrado'); process.exit(1); }
s = s.replace(re, () => `<script type="importmap">${JSON.stringify({ imports: mapa })}</script>`);
s = s.replace('<!-- ARQUIVO GERADO', '<!-- VERSÃO SEM INTERNET (bibliotecas embutidas) · ARQUIVO GERADO');

const saida = path.join(raiz, 'configurador-offline.html');
fs.writeFileSync(saida, s);
console.log(`configurador-offline.html montado: ${(fs.statSync(saida).size / 1048576).toFixed(1)} MB, ${Object.keys(mapa).length} módulos 3D, ${Object.keys(UMD).length} bibliotecas`);
