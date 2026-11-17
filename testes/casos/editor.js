// Editor do móvel livre. Movido da suíte original; mesmas entradas e verificações.
const fs = require('fs');
const path = require('path');
const { resumo, diferencas } = require('../apoio/comparacao');

module.exports = { id:'editor', descricao:"Editor do móvel livre", async executar({ ctx, pagina, nm, raiz, atualizar, tipoFormulario }) {
  let falhas = 0;
  // 5a: tela do móvel livre — montar pela tela, clicando
  {
    const page = await ctx.newPage(); const erros = [];
    page.on('pageerror', e => erros.push(e.message));
    await page.addInitScript(() => { try { localStorage.clear(); } catch (e) {} });
    await page.route('**/*', route => {
      const u = route.request().url();
      if (u.startsWith('http://teste/')) return route.fulfill({ body: pagina, contentType: 'text/html' });
      const m = u.match(/three@0\.160\.0\/(.*)$/);
      if (m) return route.fulfill({ path: nm('three/' + m[1]), contentType: 'application/javascript' });
      if (u.includes('jspdf')) return route.fulfill({ path: nm('jspdf/dist/jspdf.umd.min.js'), contentType: 'application/javascript' });
      if (u.includes('jszip')) return route.fulfill({ path: nm('jszip/dist/jszip.min.js'), contentType: 'application/javascript' });
      if (u.includes('qrcode-generator')) return route.fulfill({ path: nm('qrcode-generator/qrcode.js'), contentType: 'application/javascript' });
      if (u.includes('svg2pdf')) return route.fulfill({ path: nm('svg2pdf.js/dist/svg2pdf.umd.min.js'), contentType: 'application/javascript' });
      return route.abort();
    });
    await page.goto('http://teste/');
    await page.waitForFunction(() => window.__configurador?.estado?.res, null, { timeout: 20000 });
    await page.selectOption('#tipoMovel', 'modulo'); await page.waitForTimeout(500);
    const passo = async (sel) => { await page.click(sel); await page.waitForTimeout(250); };
    const foto = () => page.evaluate(() => { const e = window.__configurador.estado, r = e.res;
      return { erros: r.erros, vaos: (r.vaos || []).length, botoesEsquema: document.querySelectorAll('#esquema button[data-cam]').length, espacos: document.querySelectorAll('#form .mini-vao').length,
        gavetas: r.pecas.filter(p => p.papel === 'frente-gaveta').length, prateleiras: r.pecas.filter(p => p.papel === 'prateleira').length, semFuncao: r.pecas.filter(p => !p.papel).map(p => p.id), ferragens: r.ferragens.length }; });
    const inicio = await foto();
    await passo('#esquema button[data-cam=".1"]');                   // clica no vão 2 do desenho
    await passo('[data-acao="dividir-h"]');                          // divide deitado
    if (await page.evaluate(() => window.__configurador.estado.vaoSel) !== '.1.0') throw Error('Dividir perdeu o vão selecionado');
    await passo('#esquema button[data-cam=".1.0"]');                 // parte de baixo
    await passo('[data-acao="frente"][data-valor="gaveta"]');        // vira gaveta
    const depois = await foto();
    await passo('[data-acao="juntar-prox"]');                        // junta de novo (com o de cima)
    const juntou = await foto();
    await passo('#etapas [data-etapa="plano"]');
    const abas = await page.evaluate(() => ({ montar: document.querySelector('[data-secao="montar"]').hidden, plano: document.querySelector('[data-secao="plano"]').hidden }));
    const t5 = { inicio, depois, juntou, abas, paginaErros: erros };
    const ok5 = !inicio.erros.length && inicio.vaos === 4 && inicio.botoesEsquema === 4 && inicio.espacos === 4 && inicio.ferragens > 0 && !inicio.semFuncao.length
      && depois.vaos === 5 && depois.gavetas === inicio.gavetas + 1 && !depois.semFuncao.length && juntou.vaos === 4 && abas.montar && !abas.plano && !erros.length;
    if (!ok5) { falhas++; console.log('TELA DO MÓVEL LIVRE (5a) ERRADO  ' + JSON.stringify(t5)); } else console.log('TELA DO MÓVEL LIVRE (5a) OK  ' + JSON.stringify(t5));
    await page.close();
  }

  // item 19: prateleira de vidro, prateleira com pino escondido e divisória dupla (pela tela)
  {
    const page = await ctx.newPage(); const erros = [];
    page.on('pageerror', e => erros.push(e.message));
    await page.addInitScript(() => { try { localStorage.clear(); } catch (e) {} });
    await page.route('**/*', route => {
      const u = route.request().url();
      if (u.startsWith('http://teste/')) return route.fulfill({ body: pagina, contentType: 'text/html' });
      const m = u.match(/three@0\.160\.0\/(.*)$/);
      if (m) return route.fulfill({ path: nm('three/' + m[1]), contentType: 'application/javascript' });
      if (u.includes('jspdf')) return route.fulfill({ path: nm('jspdf/dist/jspdf.umd.min.js'), contentType: 'application/javascript' });
      if (u.includes('jszip')) return route.fulfill({ path: nm('jszip/dist/jszip.min.js'), contentType: 'application/javascript' });
      if (u.includes('qrcode-generator')) return route.fulfill({ path: nm('qrcode-generator/qrcode.js'), contentType: 'application/javascript' });
      if (u.includes('svg2pdf')) return route.fulfill({ path: nm('svg2pdf.js/dist/svg2pdf.umd.min.js'), contentType: 'application/javascript' });
      return route.abort();
    });
    await page.goto('http://teste/', { waitUntil:'commit' });
    await page.waitForFunction(() => window.__configurador?.estado?.res);
    await page.setViewportSize({ width:1400, height:900 });
    await page.selectOption('#tipoMovel', 'modulo');
    await page.waitForFunction(() => window.__configurador.estado.projeto.tipo === 'modulo');
    await page.evaluate(() => { const c = window.__configurador, m = c.estado.projeto.parametros;
      const vao = () => ({ tipo:'vao', frente:{ tipo:'porta', lado:'auto' }, conteudo:[{ tipo:'prateleiras', n:2, min:150 }] });
      m.largura = 1000; m.raiz = { tipo:'dividir', dir:'v', sep:'divisoria', partes:[{ medida:'auto', no:vao() }, { medida:'auto', no:vao() }] }; c.atualizar(); });
    await page.click('#form [data-acao="selecionar"][data-cam=".0"]');
    const estado = () => page.evaluate(() => { const c = window.__configurador, r = c.estado.res, pcs = r.pecas;
      const lin = ref => r.ferragens.find(f => f.ref === ref), plano = c.planoDeCorte(pcs);
      return { erros:r.erros || [], semFuncao: pcs.filter(p => p.lista && !p.papel).map(p => p.id),
        prat1: pcs.filter(p => /^prateleira-1-/.test(p.id)).map(p => ({ cat:p.cat, lista:p.lista, esp:p.esp })),
        prat2: pcs.filter(p => /^prateleira-2-/.test(p.id)).map(p => ({ cat:p.cat, lista:p.lista, nome:p.nomeLista })),
        vidroNoPlano: plano.materiais.some(x => x.mat === 'vidro-temperado'),
        vidro: lin('vidro-temperado-6')?.qtd ?? 0, vidroObs: lin('vidro-temperado-6')?.obs || '', supVidro: lin('suporte-vidro-5')?.qtd ?? 0,
        pino: lin('pino-5')?.qtd ?? 0, oculto: lin('pino-oculto')?.qtd ?? 0,
        fixVidro: r.fixacoes.filter(f => f.tipo === 'suporte-vidro-5').length,
        div: pcs.filter(p => /^divisoria-v-/.test(p.id)).map(p => ({ id:p.id, x0:p.box[0], x1:p.box[1], papel:p.papel })),
        larg: (r.vaos || []).map(v => v.x1 - v.x0), uniao: r.fixacoes.filter(f => f.tipo === 'paraf-35x25').length,
        notaVidro: !!document.querySelector('#form [data-se="pratVidro"]')?.offsetParent };
    });
    await page.selectOption('#form [data-vao="modeloPrat"]', 'vidro');
    const v = await estado();
    await page.click('#form [data-acao="selecionar"][data-cam=".1"]');
    await page.selectOption('#form [data-vao="modeloPrat"]', 'oculto');
    const o = await estado();
    const antes = o.larg.reduce((s, x) => s + x, 0);
    await page.selectOption('#form [data-vao="divDupla"]', 'dupla');
    const d = await estado();
    await page.selectOption('#form [data-vao="divDupla"]', '');
    const s1 = await estado();
    const t = await page.evaluate(() => window.__configurador.resolverMetodo(window.__configurador.estado.projeto.parametros).espMDF);
    const ok = !erros.length && !v.erros.length && !v.semFuncao.length
      && v.prat1.length === 2 && v.prat1.every(p => p.cat === 'vidro' && p.lista === false && p.esp === 6) && !v.vidroNoPlano
      && v.vidro === 2 && /Vidraçaria/.test(v.vidroObs) && v.supVidro === 8 && v.pino === 8 && v.fixVidro === 8 && v.notaVidro
      && o.prat2.every(p => p.lista && p.nome === 'Prateleira (pino escondido)') && o.oculto === 8 && o.pino === 0
      && d.div.length === 2 && d.div.every(p => p.papel === 'divisoria-vertical') && Math.abs(d.div[0].x1 - d.div[1].x0) < 0.01
      && Math.abs(antes - d.larg.reduce((s, x) => s + x, 0) - t) < 0.1 && d.uniao > 0 && !d.erros.length && !d.semFuncao.length
      && s1.div.length === 1;
    const info = { vidro:v.vidro, obs:v.vidroObs, supVidro:v.supVidro, pinoComum:v.pino, oculto:o.oculto, chapas:d.div.length, uniao:d.uniao, erros:[...erros, ...v.erros, ...d.erros] };
    if (!ok) { falhas++; console.log('ITEM 19 (VIDRO, PINO ESCONDIDO, DIVISÓRIA DUPLA) ERRADO  ' + JSON.stringify({ v, o, d, s1, erros })); }
    else console.log('Item 19: prateleira de vidro, pino escondido e divisória dupla OK  ' + JSON.stringify(info));
    await page.close();
  }
  // item 13: cabideiro, maleiro + cabideiro e calceiro (pela tela)
  {
    const page = await ctx.newPage(); const erros = [];
    page.on('pageerror', e => erros.push(e.message));
    await page.addInitScript(() => { try { localStorage.clear(); } catch (e) {} });
    await page.route('**/*', route => {
      const u = route.request().url();
      if (u.startsWith('http://teste/')) return route.fulfill({ body: pagina, contentType: 'text/html' });
      const m = u.match(/three@0\.160\.0\/(.*)$/);
      if (m) return route.fulfill({ path: nm('three/' + m[1]), contentType: 'application/javascript' });
      if (u.includes('jspdf')) return route.fulfill({ path: nm('jspdf/dist/jspdf.umd.min.js'), contentType: 'application/javascript' });
      if (u.includes('jszip')) return route.fulfill({ path: nm('jszip/dist/jszip.min.js'), contentType: 'application/javascript' });
      if (u.includes('qrcode-generator')) return route.fulfill({ path: nm('qrcode-generator/qrcode.js'), contentType: 'application/javascript' });
      if (u.includes('svg2pdf')) return route.fulfill({ path: nm('svg2pdf.js/dist/svg2pdf.umd.min.js'), contentType: 'application/javascript' });
      return route.abort();
    });
    await page.goto('http://teste/', { waitUntil:'commit' });
    await page.waitForFunction(() => window.__configurador?.estado?.res);
    await page.setViewportSize({ width:1400, height:900 });
    await page.selectOption('#tipoMovel', 'modulo');
    await page.waitForFunction(() => window.__configurador.estado.projeto.tipo === 'modulo');
    await page.evaluate(() => { const c = window.__configurador, m = c.estado.projeto.parametros;
      const vao = () => ({ tipo:'vao', frente:{ tipo:'2portas' }, conteudo:[] });
      m.largura = 1800; m.altura = 2400; m.profundidade = 600;
      m.raiz = { tipo:'dividir', dir:'v', sep:'divisoria', partes:[{ medida:1150, no:vao() }, { medida:'auto', no:vao() }] }; c.atualizar(); });
    const estado = () => page.evaluate(() => { const c = window.__configurador, r = c.estado.res, pcs = r.pecas;
      const lin = ref => r.ferragens.find(f => f.ref === ref), sel = re => pcs.filter(p => re.test(p.id));
      return { erros:r.erros || [], avisos:(r.avisos || []).filter(a => /cabid|maleiro|calceiro|calça/i.test(a)),
        semFuncao: pcs.filter(p => !p.papel).map(p => p.id),
        tubo: sel(/-tubo-cabideiro$/).map(p => ({ id:p.id, comp:p.comp, papel:p.papel, y:p.box[3], lista:p.lista })),
        sup: sel(/-suporte-cabideiro-/).map(p => p.id), mal: sel(/^prateleira-/).filter(p => p.nome === 'Prateleira do maleiro').map(p => ({ y:p.box[2], lista:p.lista })),
        calc: sel(/-calceiro$/).map(p => ({ papel:p.papel, y1:p.box[3], obs:p.obs })),
        mTubo: lin('tubo-oval-30x15')?.qtd ?? 0, sLat: lin('suporte-tubo-oval-lateral')?.qtd ?? 0, sCen: lin('suporte-tubo-oval-central')?.qtd ?? 0, nCalc: lin('calceiro-deslizante')?.qtd ?? 0,
        vaos: (r.vaos || []).map(v => ({ y1:v.y1, w:v.x1 - v.x0 })),
        notas: ['maleiro', 'cabideiro', 'calceiro'].filter(k => document.querySelector(`#form .ed-nota[data-se="${k}"]`)?.offsetParent) };
    });
    await page.click('#form [data-acao="selecionar"][data-cam=".0"]');
    await page.click('#form [aria-label="Conteúdo do espaço"] button:has(span:text-is("Maleiro + cabideiro"))');
    const a = await estado();
    await page.fill('#form [data-vao="altMaleiro"]', '600'); await page.press('#form [data-vao="altMaleiro"]', 'Tab');
    const b = await estado();
    await page.click('#form [data-acao="selecionar"][data-cam=".1"]');
    await page.click('#form [aria-label="Conteúdo do espaço"] button:has(span:text-is("Calceiro"))');
    const d = await estado();
    await page.click('#form [aria-label="Conteúdo do espaço"] button:has(span:text-is("Cabideiro"))');
    const e = await estado();
    const t = 18, v0 = a.vaos[0];
    const ok = !erros.length && !a.erros.length && !a.semFuncao.length && !d.semFuncao.length && !e.erros.length
      && a.mal.length === 1 && Math.abs(a.mal[0].y - (v0.y1 - 500 - t)) < 0.1 && a.mal[0].lista
      && a.tubo.length === 1 && a.tubo[0].papel === 'tubo-cabideiro' && !a.tubo[0].lista && Math.abs(a.tubo[0].y - (a.mal[0].y - 55 + 15)) < 0.1
      && a.sup.length === 3 && a.sLat === 2 && a.sCen === 1 && a.mTubo > 1 && a.notas.includes('maleiro') && a.notas.includes('cabideiro')
      && Math.abs(b.mal[0].y - (v0.y1 - 600 - t)) < 0.1
      && d.calc.length === 1 && d.calc[0].papel === 'calceiro' && /largura/.test(d.calc[0].obs) && d.nCalc === 1 && d.notas.includes('calceiro')
      && e.calc.length === 0 && e.tubo.length === 2 && e.sLat === 4 && e.sCen === 1 && e.mTubo === 2 && !b.erros.length && !d.erros.length;
    const info = { maleiro:a.mal[0], tubo:a.tubo[0], metros:e.mTubo, supLat:e.sLat, supCentral:e.sCen, calceiro:d.nCalc, avisos:e.avisos, erros:[...erros, ...a.erros, ...d.erros] };
    if (!ok) { falhas++; console.log('ITEM 13 (CABIDEIRO, MALEIRO, CALCEIRO) ERRADO  ' + JSON.stringify({ a, b, d, e, erros })); }
    else console.log('Item 13: cabideiro, maleiro e calceiro OK  ' + JSON.stringify(info));
    await page.close();
  }
  // item 74: esquema dos espaços preso no alto; categorias abrem/fecham e mudam de ordem (guardado no aparelho)
  {
    const page = await ctx.newPage(); const erros = [];
    page.on('pageerror', e => erros.push(e.message));
    await page.addInitScript(() => { try { if (!sessionStorage.getItem('jaAbriu')) { localStorage.clear(); sessionStorage.setItem('jaAbriu', '1'); } } catch (e) {} });
    await page.route('**/*', route => {
      const u = route.request().url();
      if (u.startsWith('http://teste/')) return route.fulfill({ body: pagina, contentType: 'text/html' });
      const m = u.match(/three@0\.160\.0\/(.*)$/);
      if (m) return route.fulfill({ path: nm('three/' + m[1]), contentType: 'application/javascript' });
      if (u.includes('jspdf')) return route.fulfill({ path: nm('jspdf/dist/jspdf.umd.min.js'), contentType: 'application/javascript' });
      if (u.includes('jszip')) return route.fulfill({ path: nm('jszip/dist/jszip.min.js'), contentType: 'application/javascript' });
      if (u.includes('qrcode-generator')) return route.fulfill({ path: nm('qrcode-generator/qrcode.js'), contentType: 'application/javascript' });
      if (u.includes('svg2pdf')) return route.fulfill({ path: nm('svg2pdf.js/dist/svg2pdf.umd.min.js'), contentType: 'application/javascript' });
      return route.abort();
    });
    await page.setViewportSize({ width:1400, height:900 });
    const abrir = async () => { await page.goto('http://teste/', { waitUntil:'commit' }); await page.waitForFunction(() => window.__configurador?.estado?.res);
      await page.selectOption('#tipoMovel', 'modulo'); await page.waitForFunction(() => window.__configurador.estado.projeto.tipo === 'modulo'); };
    const cats = () => page.evaluate(() => [...document.querySelectorAll('#form .ed-cat')].map(s => s.dataset.cat + (s.hasAttribute('data-fechada') ? '-' : '+')).join(' '));
    await abrir();
    const inicio = await cats();
    await page.click('#form .ed-cat[data-cat="medidas"] .ed-cat-abrir');
    const medidasEscondida = await page.evaluate(() => !document.querySelector('#form [data-modulo="largura"]').offsetParent);
    await page.focus('#form .ed-cat[data-cat="conteudo"] .ed-cat-mover');
    await page.keyboard.press('ArrowUp'); await page.keyboard.press('ArrowUp');
    const movida = await cats();
    await page.click('#form [data-acao="selecionar"][data-cam=".1"]');                 // remonta o editor
    const remontada = await cats();
    await page.evaluate(() => { document.querySelector('#painelParam').scrollTop = 900; });
    await page.waitForFunction(() => { const f = document.querySelector('#form .ed-fixo'), p = document.querySelector('#painelParam'); return p.scrollTop > 100 && Math.abs(f.getBoundingClientRect().top - p.getBoundingClientRect().top) < 2; });
    const preso = await page.evaluate(() => getComputedStyle(document.querySelector('#form .ed-fixo')).position);
    await abrir();                                                                       // abre de novo: lembra a ordem e o que estava fechado
    const reaberta = await cats();
    const esperado = 'medidas- conteudo+ espacos+ vao+ construcao- ajustes-';
    const ok = !erros.length && inicio === 'medidas+ espacos+ vao+ conteudo+ construcao- ajustes-' && medidasEscondida
      && movida === esperado && remontada === esperado && reaberta === esperado && preso === 'sticky';
    if (!ok) { falhas++; console.log('ITEM 74 (ESQUEMA PRESO E CATEGORIAS) ERRADO  ' + JSON.stringify({ inicio, medidasEscondida, movida, remontada, reaberta, preso, erros })); }
    else console.log('Item 74: esquema preso e categorias OK  ' + JSON.stringify({ ordem:reaberta }));
    await page.close();
  }

  return falhas;
} };
