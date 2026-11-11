// Reabrir projetos salvos no aparelho. Movido da suíte original; mesmas entradas e verificações.
const fs = require('fs');
const path = require('path');
const { resumo, diferencas } = require('../apoio/comparacao');

module.exports = { id:'reabrir', descricao:"Reabrir projetos salvos no aparelho", async executar({ ctx, pagina, nm, raiz, atualizar, tipoFormulario }) {
  let falhas = 0;
  // reabrir com o projeto guardado no aparelho: cada tipo precisa abrir de novo sem erro
  // (o celular do Nathan travou ao reabrir num Ambiente; os outros casos começam com nada guardado)
  {
    const page = await ctx.newPage(), errosRe = [], arq = 'file://' + path.join(raiz, 'configurador-offline.html'), res = {};
    page.on('pageerror', e => errosRe.push(e.message));
    await page.route('**/*', route => route.request().url().startsWith('file:') ? route.continue() : route.abort());
    await page.goto(arq); await page.waitForFunction(() => window.__configurador?.estado?.res, null, { timeout: 20000 });
    const tipos = await page.evaluate(() => Object.keys(window.__configurador.TIPOS || {}).length ? Object.keys(window.__configurador.TIPOS) : [...document.querySelectorAll('#tipoMovel option')].map(o => o.value));
    for (const tipo of tipos) {
      await page.selectOption('#tipoMovel', tipo); await page.waitForTimeout(400);
      if (tipo === 'ambiente') { await page.click('#form [data-acao="add-livre"]').catch(() => {}); await page.waitForTimeout(300); }
      const antes = errosRe.length; await page.reload();
      let abriu = true; try { await page.waitForFunction(() => window.__configurador?.estado?.res, null, { timeout: 20000 }); } catch (e) { abriu = false; }
      const voltou = abriu ? await page.evaluate(() => window.__configurador.estado.projeto.tipo) : null;
      res[tipo] = abriu && voltou === tipo && errosRe.length === antes ? 'ok' : { abriu, voltou, erros: errosRe.slice(antes) };
    }
    // Um ajuste de medida salvo usa EIXOS_TELA já durante a primeira montagem do editor.
    await page.selectOption('#tipoMovel', 'modulo');
    const ajustado = await page.evaluate(() => {
      const c = window.__configurador, m = c.estado.projeto.parametros;
      m.pecasAjuste = { 'lateral-esq': { nome:'Lateral esquerda', medidas:{ y:{ valor:2200, fixo:'fim' } } } };
      m.fachada = { frente:{tipo:'2portas'} }; m.largura = 900;
      c.atualizar();
      return JSON.stringify(m);
    });
    const antesAjustado = errosRe.length;
    await page.reload();
    let abriuAjustado = true;
    try { await page.waitForFunction(() => window.__configurador?.estado?.res, null, { timeout:20000 }); } catch (e) { abriuAjustado = false; }
    const depoisAjustado = abriuAjustado ? await page.evaluate(() => ({
      parametros:JSON.stringify(window.__configurador.estado.projeto.parametros),
      texto:document.querySelector('[data-lista="ajustes"]')?.textContent,
      altura:window.__configurador.estado.res.pecas.find(p=>p.id==='lateral-esq')?.box.slice(2,4),
    })) : null;
    res.moduloComMedidaAjustada = abriuAjustado && errosRe.length === antesAjustado && depoisAjustado.parametros === ajustado && /2200/.test(depoisAjustado.texto) && depoisAjustado.altura[1]-depoisAjustado.altura[0]===2200 ? 'ok' : { abriuAjustado, depoisAjustado, erros:errosRe.slice(antesAjustado) };
    await page.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
    const okRe = tipos.length > 1 && Object.values(res).every(v => v === 'ok');
    if (!okRe) { falhas++; console.log('REABRIR COM PROJETO GUARDADO ERRADO  ' + JSON.stringify(res)); } else console.log('REABRIR COM PROJETO GUARDADO OK  ' + JSON.stringify(res));
    await page.close();
  }

  return falhas;
} };
