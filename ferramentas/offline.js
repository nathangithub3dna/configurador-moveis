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

// 2. three.js principal: o endereço completo vira um "data:" (as partes extras já vêm embutidas pelo montar — three-embutido.js)
const { URL_THREE } = require('./three-embutido');
function dataURL(codigo) { return 'data:text/javascript;base64,' + Buffer.from(codigo, 'utf8').toString('base64'); }
if (!s.includes(`'${URL_THREE}'`)) { console.error('ERRO: endereço do three.js não encontrado na página'); process.exit(1); }
s = s.replace(`'${URL_THREE}'`, () => `'${dataURL(fs.readFileSync(nm('three/build/three.module.js'), 'utf8'))}'`);
s = s.replace('<!-- ARQUIVO GERADO', '<!-- VERSÃO SEM INTERNET (bibliotecas embutidas) · ARQUIVO GERADO');
// aberto direto do disco não há quem diga a codificação: sem isto o navegador adivinha e pode quebrar os acentos (e o programa)
s = '<meta charset="utf-8">\n' + s;

const saida = path.join(raiz, 'configurador-offline.html');
fs.writeFileSync(saida, s);
console.log(`configurador-offline.html montado: ${(fs.statSync(saida).size / 1048576).toFixed(1)} MB, 3D embutido, ${Object.keys(UMD).length} bibliotecas`);
