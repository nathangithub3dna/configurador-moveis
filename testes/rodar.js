// Sem argumentos: conferência completa obrigatória antes de qualquer commit.
// npm run testar -- editor | npm run testar -- gabinete | npm run testar -- --listar
const fs = require('fs');
const path = require('path');
const { areas, selecionar } = require('./apoio/selecao');
async function main() {
  const escolha = selecionar(process.argv.slice(2));
  if (escolha.listar) {
    for (const id of areas) console.log(id + ': ' + require('./casos/' + id).descricao);
    console.log('gabinete / armario: apenas os casos de referência do formulário escolhido.');
    console.log('Sem argumentos: todos os casos. Filtros não substituem a conferência completa.');
    return;
  }
  const raiz = path.join(__dirname, '..');
  const html = fs.readFileSync(path.join(raiz, 'configurador.html'), 'utf8');
  const pagina = '<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"></head><body>' + html + '</body></html>';
  const nm = p => path.join(raiz, 'node_modules', p);
  const b = await require('./apoio/navegador')();
  let falhas = 0;
  try {
    for (const id of escolha.selecionadas) {
      console.log('Área: ' + id);
      const ctx = await b.newContext({ viewport: { width: 1400, height: 900 } });
      // O primeiro carregamento do Chromium com 3D pode passar de 30 s no Windows.
      // Só amplia a espera de navegação; as verificações de funcionamento continuam iguais.
      ctx.setDefaultNavigationTimeout(90000);
      try { falhas += await require('./casos/' + id).executar({ ctx, pagina, nm, raiz, ...escolha }); }
      finally { await ctx.close(); }
    }
  } finally { await b.close(); }
  if (falhas) { console.error(falhas + ' caso(s) com diferenças.'); process.exitCode = 1; }
  else if (escolha.atualizar) console.log('Referências atualizadas.');
  else if (escolha.parcial) console.log('Todos os casos selecionados passaram. Conferência parcial; rode npm run testar antes de gravar.');
  else console.log('Todos os casos iguais à referência.');
}
main().catch(e => { console.error(e); process.exitCode = 1; });
