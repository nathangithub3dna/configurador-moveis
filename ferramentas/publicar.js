// Gera .publicar/index.html: o configurador.html dentro do esqueleto de página que o artifact exige
// (doctype, charset, viewport e estilos-base). É o mesmo esqueleto das versões publicadas até a v62,
// que o publicador antigo acrescentava sozinho; o atual só aceita a página completa.
// Uso: npm run pagina-publicar  → publicar o arquivo .publicar/index.html (a pasta não vai para o GitHub).
const fs = require('fs'), path = require('path');
const raiz = path.join(__dirname, '..');
const PREFIXO = '<!DOCTYPE html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover">'
  + '<style>:root{color-scheme:light;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}'
  + 'html{scroll-padding-top:env(safe-area-inset-top,0px)}body{margin:0;padding:0;font:14px -apple-system,BlinkMacSystemFont,sans-serif;background:#fff;color:#000}'
  + 'img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}</style></head><body>\n';
const corpo = fs.readFileSync(path.join(raiz, 'configurador.html'), 'utf8').replace(/\n+$/, '');
const destino = path.join(raiz, '.publicar', 'index.html');
fs.mkdirSync(path.dirname(destino), { recursive: true });
fs.writeFileSync(destino, PREFIXO + corpo + '\n\n</body></html>');
console.log(`Página para publicar: .publicar/index.html (${Math.round(fs.statSync(destino).size / 1024)} KB)`);
