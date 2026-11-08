// Monta o configurador.html (arquivo publicado, um arquivo só) a partir das partes em fonte/ + dados/*.json.
//   fonte/pagina.html      estrutura da tela (o que aparece e onde)
//   fonte/estilos/*.css    visual: tema.css = cores, fontes e sombras; layout.css = posições e tamanhos
//   fonte/js/*.js          lógica: regras, tipos, geradores, núcleo, saídas (listas/plano/desenhos/Inventor), tela
//   dados/*.json           regras de marcenaria, biblioteca, materiais, métodos de construção
// Edite sempre fonte/ e dados/; o configurador.html é gerado.
const fs = require('fs'); const path = require('path');
const raiz = path.join(__dirname, '..');
const incluir = (txt, profundidade = 0) => txt.replace(/\/\*@inclui:([\w\/.-]+)\*\//g, (_, rel) => {
  const arq = path.join(raiz, 'fonte', rel);
  if (!fs.existsSync(arq)) { console.error(`ERRO: fonte/${rel} não existe (pedido por /*@inclui:${rel}*/)`); process.exit(1); }
  if (profundidade > 5) { console.error('ERRO: inclusões demais (uma parte inclui a outra em círculo?)'); process.exit(1); }
  return incluir(fs.readFileSync(arq, 'utf8').replace(/\n$/, ''), profundidade + 1);
});
let s = incluir(fs.readFileSync(path.join(raiz, 'fonte', 'pagina.html'), 'utf8'));
const { threeEmbutido } = require('./three-embutido');
if (!s.includes('/*@three*/')) { console.error('ERRO: a página não tem /*@three*/ (onde entra o 3D)'); process.exit(1); }
s = s.replace('/*@three*/', () => threeEmbutido());
const usados = new Set();
s = s.replace(/\/\*@dados:([\w-]+)\*\/null/g, (_, nome) => {
  const arq = path.join(raiz, 'dados', nome + '.json');
  let dados;
  try { dados = JSON.parse(fs.readFileSync(arq, 'utf8')); }
  catch (e) { console.error(`ERRO no arquivo dados/${nome}.json: ${e.message}\n(confira vírgulas, aspas e chaves; nada foi gerado)`); process.exit(1); }
  usados.add(nome);
  return JSON.stringify(dados);
});
const aviso = '<!-- ARQUIVO GERADO por ferramentas/montar.js — não editar aqui; edite fonte/ (pagina.html, estilos/, js/) e dados/*.json -->\n';
fs.writeFileSync(path.join(raiz, 'configurador.html'), aviso + s);
console.log('configurador.html montado com: ' + [...usados].join(', '));
