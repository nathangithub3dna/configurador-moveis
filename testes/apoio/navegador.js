const { chromium } = require('playwright');
module.exports = async function abrirNavegador() {
  // Se o navegador da versão do Playwright não estiver instalado (nuvem com outra versão),
  // usa o Chromium que existir em PLAYWRIGHT_BROWSERS_PATH.
  const opcoes = { args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] };
  let b;
  try { b = await chromium.launch(opcoes); }
  catch (e) {
    const fs = require('fs'), path = require('path');
    const base = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
    const achados = (fs.existsSync(base) ? fs.readdirSync(base) : []).filter(n => /^chromium-\d+$/.test(n)).sort().reverse()
      .flatMap(n => ['chrome-linux64/chrome', 'chrome-linux/chrome', 'chrome-win64/chrome.exe', 'chrome-win/chrome.exe'].map(s => path.join(base, n, s))).filter(p => fs.existsSync(p));
    if (!achados.length) throw e;
    console.log('Navegador da versão esperada ausente; usando ' + achados[0]);
    b = await chromium.launch({ ...opcoes, executablePath: achados[0] });
  }
  return b;
};
