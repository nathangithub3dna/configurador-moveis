// Monta o configurador.html (arquivo publicado) a partir de fonte/configurador.html + dados/*.json.
// Edite sempre fonte/ e dados/; o configurador.html é gerado.
const fs = require('fs'); const path = require('path');
const raiz = path.join(__dirname, '..');
let s = fs.readFileSync(path.join(raiz, 'fonte', 'configurador.html'), 'utf8');
const usados = new Set();
s = s.replace(/\/\*@dados:([\w-]+)\*\/null/g, (_, nome) => {
  const arq = path.join(raiz, 'dados', nome + '.json');
  let dados;
  try { dados = JSON.parse(fs.readFileSync(arq, 'utf8')); }
  catch (e) { console.error(`ERRO no arquivo dados/${nome}.json: ${e.message}\n(confira vírgulas, aspas e chaves; nada foi gerado)`); process.exit(1); }
  usados.add(nome);
  return JSON.stringify(dados);
});
const aviso = '<!-- ARQUIVO GERADO por ferramentas/montar.js — não editar aqui; edite fonte/configurador.html e dados/*.json -->\n';
fs.writeFileSync(path.join(raiz, 'configurador.html'), aviso + s);
console.log('configurador.html montado com: ' + [...usados].join(', '));
