// Arquivo offline com a rede bloqueada. Movido da suíte original; mesmas entradas e verificações.
const fs = require('fs');
const path = require('path');
const { resumo, diferencas } = require('../apoio/comparacao');

module.exports = { id:'offline', descricao:"Arquivo offline com a rede bloqueada", async executar({ ctx, pagina, nm, raiz, atualizar, tipoFormulario }) {
  let falhas = 0;
  // passo 3: versão sem internet — abre o arquivo direto (file://) com TODA a rede bloqueada
  {
    const page = await ctx.newPage(), errosOff = [], pedidos = [];
    page.on('pageerror', e => errosOff.push(e.message));
    await page.route('**/*', route => { const u = route.request().url(); if (u.startsWith('file:')) return route.continue(); pedidos.push(u.slice(0, 60)); return route.abort(); });
    await page.goto('file://' + path.join(raiz, 'configurador-offline.html'));
    let ok = true; try { await page.waitForFunction(() => window.__configurador?.estado?.res, null, { timeout: 20000 }); } catch (e) { ok = false; }
    const off = ok ? await page.evaluate(async () => {
      const fontesCarregadas = await document.fonts.load('16px "Manrope"', 'Vão 0123456789'); const c = window.__configurador, e = c.estado, pcs = e.res.pecas.filter(p => p.lista);
      const pdf = await c.folhasPDF(pcs.slice(0, 2), () => ({ projeto:'offline' })), etq = c.etiquetasPDF(e.res.pecas, e.codigos, 'offline');
      return { fonteOffline:fontesCarregadas.length > 0 && getComputedStyle(document.body).fontFamily.includes("Manrope"), tipoInicial: e.projeto.tipo, pecas: pcs.length, canvas3D: !!document.querySelector('#palco canvas'), libs: { three: !!window.__configurador.cam, jspdf: !!window.jspdf, jszip: !!window.JSZip, qr: !!window.qrcode, svg2pdf: !!(window.svg2pdf || window.jspdf?.jsPDF?.API?.svg) },
        folhasKB: Math.round(pdf.byteLength / 1024), etiquetasKB: Math.round(etq.byteLength / 1024), zip: !document.getElementById('btnZip').disabled }; }) : null;
    const tamanhoMB = +(fs.statSync(path.join(raiz, 'configurador-offline.html')).size / 1048576).toFixed(1);
    const fontes = pedidos.filter(u => !/fonts\.(googleapis|gstatic)/.test(u));
    const okOff = ok && off && off.fonteOffline && off.tipoInicial === 'modulo' && off.pecas > 0 && off.canvas3D && Object.values(off.libs).every(Boolean) && off.folhasKB > 3 && off.etiquetasKB > 3 && off.zip && !errosOff.length && !fontes.length;
    const t = { carregou: ok, ...off, tamanhoMB, pedidosBloqueados: pedidos.length, foraDeFontes: fontes, erros: errosOff };
    if (!okOff) { falhas++; console.log('SEM INTERNET ERRADO  ' + JSON.stringify(t)); } else console.log('SEM INTERNET OK  ' + JSON.stringify(t));
    await page.close();
  }

  return falhas;
} };
