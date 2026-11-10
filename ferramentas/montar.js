// Monta o configurador.html (arquivo publicado, um arquivo só) a partir das partes em fonte/ + dados/*.json.
//   fonte/pagina.html      estrutura da tela (o que aparece e onde)
//   fonte/estilos/*.css    visual: tema.css = cores, fontes e sombras; layout.css = posições e tamanhos
//   fonte/js/*.js          lógica: regras, tipos, geradores, núcleo, saídas (listas/plano/desenhos/Inventor), tela
//   dados/*.json           regras de marcenaria, biblioteca, materiais, métodos de construção
// Marcas que o montador entende:
//   /*@inclui:caminho*/        coloca ali o arquivo fonte/caminho
//   /*@inclui-pasta:caminho*/  coloca ali todos os .js (ou .css/.html) da pasta fonte/caminho, em ordem de nome
//   /*@dados:nome*/null        coloca ali dados/nome.json; se existir a pasta dados/nome/, junta também
//                              todos os .json dela (em ordem de nome). Nome repetido entre arquivos = erro.
// Edite sempre fonte/ e dados/; o configurador.html é gerado.
const fs = require('fs'); const path = require('path');
const raiz = path.join(__dirname, '..');
const lerParte = (arq, profundidade) => {
  if (profundidade > 5) { console.error('ERRO: inclusões demais (uma parte inclui a outra em círculo?)'); process.exit(1); }
  return incluir(fs.readFileSync(arq, 'utf8').replace(/\n$/, ''), profundidade + 1);
};
const emOrdem = (lista) => lista.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
const incluir = (txt, profundidade = 0) => txt
  .replace(/\/\*@inclui:([\w\/.-]+)\*\//g, (_, rel) => {
    const arq = path.join(raiz, 'fonte', rel);
    if (!fs.existsSync(arq)) { console.error(`ERRO: fonte/${rel} não existe (pedido por /*@inclui:${rel}*/)`); process.exit(1); }
    return lerParte(arq, profundidade);
  })
  .replace(/\/\*@inclui-pasta:([\w\/.-]+)\*\//g, (_, rel) => {
    const pasta = path.join(raiz, 'fonte', rel);
    if (!fs.existsSync(pasta) || !fs.statSync(pasta).isDirectory()) { console.error(`ERRO: a pasta fonte/${rel} não existe (pedida por /*@inclui-pasta:${rel}*/)`); process.exit(1); }
    const nomes = emOrdem(fs.readdirSync(pasta).filter(n => /\.(js|css|html)$/.test(n) && fs.statSync(path.join(pasta, n)).isFile()));
    return nomes.map(n => lerParte(path.join(pasta, n), profundidade)).join('\n');
  });
let s = incluir(fs.readFileSync(path.join(raiz, 'fonte', 'pagina.html'), 'utf8'));
const { threeEmbutido } = require('./three-embutido');
if (!s.includes('/*@three*/')) { console.error('ERRO: a página não tem /*@three*/ (onde entra o 3D)'); process.exit(1); }
s = s.replace('/*@three*/', () => threeEmbutido());
const usados = new Set();
const lerJson = (arq, rotulo) => {
  try { return JSON.parse(fs.readFileSync(arq, 'utf8')); }
  catch (e) { console.error(`ERRO no arquivo ${rotulo}: ${e.message}\n(confira vírgulas, aspas e chaves; nada foi gerado)`); process.exit(1); }
};
const lerDados = (nome) => {
  const arq = path.join(raiz, 'dados', nome + '.json');
  const pasta = path.join(raiz, 'dados', nome);
  const temPasta = fs.existsSync(pasta) && fs.statSync(pasta).isDirectory();
  if (!temPasta) {
    if (!fs.existsSync(arq)) { console.error(`ERRO: dados/${nome}.json não existe (pedido por /*@dados:${nome}*/)`); process.exit(1); }
    return lerJson(arq, `dados/${nome}.json`);
  }
  // Pasta dados/nome/: junta dados/nome.json (se houver) com cada dados/nome/*.json, em ordem de nome.
  const partes = [];
  if (fs.existsSync(arq)) partes.push([`dados/${nome}.json`, path.join(raiz, 'dados', nome + '.json')]);
  for (const n of emOrdem(fs.readdirSync(pasta).filter(n => n.endsWith('.json')))) partes.push([`dados/${nome}/${n}`, path.join(pasta, n)]);
  const junto = {}; const origem = {};
  for (const [rotulo, caminho] of partes) {
    const d = lerJson(caminho, rotulo);
    if (!d || typeof d !== 'object' || Array.isArray(d)) { console.error(`ERRO: ${rotulo} precisa ser um objeto { "nome": {...} } para ser juntado`); process.exit(1); }
    for (const [k, v] of Object.entries(d)) {
      if (k in junto) { console.error(`ERRO: "${k}" aparece em ${origem[k]} e em ${rotulo} (nome repetido; nada foi gerado)`); process.exit(1); }
      junto[k] = v; origem[k] = rotulo;
    }
  }
  return junto;
};
s = s.replace(/\/\*@dados:([\w-]+)\*\/null/g, (_, nome) => {
  const dados = lerDados(nome);
  usados.add(nome);
  return JSON.stringify(dados);
});
const aviso = '<!-- ARQUIVO GERADO por ferramentas/montar.js — não editar aqui; edite fonte/ (pagina.html, estilos/, js/) e dados/*.json -->\n';
fs.writeFileSync(path.join(raiz, 'configurador.html'), aviso + s);
console.log('configurador.html montado com: ' + [...usados].join(', '));
