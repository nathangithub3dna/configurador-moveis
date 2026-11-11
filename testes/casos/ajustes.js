// Ajustes por peça. Movido da suíte original; mesmas entradas e verificações.
const fs = require('fs');
const path = require('path');
const { resumo, diferencas } = require('../apoio/comparacao');

module.exports = { id:'ajustes', descricao:"Ajustes por peça", async executar({ ctx, pagina, nm, raiz, atualizar, tipoFormulario }) {
  let falhas = 0;
  // passo 1c: ajuste por peça — caixa da geladeira (aéreo em cima, laterais descendo até o chão, sem fundo) montada PELA TELA
  {
    const page = await ctx.newPage(); const erros = [];
    page.on('pageerror', e => erros.push(e.message));
    await page.setViewportSize({ width: 1400, height: 1000 });
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
    await page.selectOption('#tipoMovel', 'ambiente'); await page.waitForTimeout(600);
    await page.evaluate(() => { const c = window.__configurador, a = c.estado.projeto.parametros;
      a.formato = 'reta'; a.paredes = [{ nome:'A', comprimento:3000, altura:2600 }]; a.pontos = []; a.livres = [];
      const g = c.AMB.novoModulo('aereo', 0, 0); g.nome = 'Caixa da geladeira'; g.y = 1800; Object.assign(g.modulo, { largura:800, altura:400, profundidade:600 });
      a.modulos = [g]; c.atualizar(); });
    await page.click('#b3D'); await page.waitForTimeout(300);
    const mede = async (id, eixo, v, fixo) => { await page.evaluate(id => window.__configurador.selecionar(id), id); await page.waitForTimeout(120);
      await page.locator(`#fAjuste [data-aj-valor][data-eixo="${eixo}"]`).fill(String(v)); await page.locator(`#fAjuste [data-aj-fixo][data-eixo="${eixo}"]`).selectOption(fixo);
      await page.click('#fAjuste [data-aj="aplicar"]'); await page.waitForTimeout(250); };
    await mede('M1-lateral-esq', 'y', 2200, 'fim'); await mede('M1-lateral-dir', 'y', 2200, 'fim');
    await page.evaluate(() => window.__configurador.selecionar('M1-fundo')); await page.waitForTimeout(120);
    await page.click('#fAjuste [data-aj="desligar"]'); await page.waitForTimeout(300);
    const t1c = await page.evaluate(() => {
      const c = window.__configurador, e = c.estado, r = e.res, a = e.projeto.parametros, por = id => r.pecas.find(p => p.id === id);
      const AJ = { 'lateral-esq': { nome:'Lateral esquerda', medidas:{ y:{ valor:2200, fixo:'fim' } } }, 'lateral-dir': { nome:'Lateral direita', medidas:{ y:{ valor:2200, fixo:'fim' } } }, fundo: { nome:'Fundo do móvel', desligar:true } };
      const copia = JSON.parse(JSON.stringify(a)); copia.modulos[0].modulo.pecasAjuste = AJ;
      const rd = c.TIPOS.ambiente.gerar(copia), resumo = x => JSON.stringify(x.pecas.map(p => [p.id, p.comp, p.larg, p.box, p.des?.w, p.des?.h, p.des?.furos]));
      const lat = por('M1-lateral-esq'), furosBase = (lat?.des.furos || []).filter(f => f.tipo === 'montagem' && Math.abs(f.y - 1809) < 0.5).length;
      const svg = c.folhaPecaSVG(lat, { projeto:'teste', codigo:'x' }), ilog = c.gerarILogic();
      // erros e avisos pelos dados
      const caso = aj => { const q = JSON.parse(JSON.stringify(a)); q.modulos[0].modulo.pecasAjuste = aj; return c.TIPOS.ambiente.gerar(q); };
      const espessura = caso({ 'lateral-esq': { medidas:{ x:{ valor:30, fixo:'ini' } } } }).erros;
      const porta = caso({ 'porta-1': { medidas:{ y:{ valor:500, fixo:'ini' } } } }).erros;
      const sumiu = caso({ 'nao-existe': { desligar:true } }).avisos;
      const chao = caso({ 'lateral-esq': { medidas:{ y:{ valor:2500, fixo:'fim' } } } }).erros;
      const q = JSON.parse(JSON.stringify(a)); q.modulos[0].modulo.pecasAjuste = AJ; const bal = c.AMB.novoModulo('balcao', 0, 0); q.modulos.push(bal);
      const choque = c.TIPOS.ambiente.gerar(q).avisos.filter(x => /com a medida mudada ocupa/.test(x));
      // desligar a porta leva junto dobradiças e puxador
      const semPorta = caso({ 'porta-1': { desligar:true } }).pecas.filter(p => /^M1-porta-1/.test(p.id)).length;
      return { erros: r.erros, avisos: r.avisos, aj: a.modulos[0].modulo.pecasAjuste, igualDados: resumo(r) === resumo(rd), lat: lat?.box, latComp: lat?.comp, furosBase, fundo: !!por('M1-fundo'),
        listaCorte: /2200/.test(e.textos.corte), folha: svg.startsWith('<svg'), ilogic: /Lateral esquerda/.test(ilog), espessura, porta, sumiu, chao, choque, semPorta };
    });
    await page.click('#form [data-acao="abrir"][data-i="0"]'); await page.waitForTimeout(300);
    t1c.lista = (await page.locator('#form .ed-ajuste strong').allInnerTexts());
    await page.click('#form .ed-ajuste:has-text("Fundo do móvel") [data-acao="ajuste-voltar"]'); await page.waitForTimeout(300);
    t1c.voltou = await page.evaluate(() => { const e = window.__configurador.estado; return { fundo: !!e.res.pecas.find(p => p.id === 'M1-fundo'), ajustes: Object.keys(e.projeto.parametros.modulos[0].modulo.pecasAjuste || {}) }; });
    t1c.listaDepois = (await page.locator('#form .ed-ajuste').count());
    const ok1c = !t1c.erros.length && t1c.igualDados && t1c.lat?.[2] === 0 && t1c.lat?.[3] === 2200 && t1c.latComp === 2200 && t1c.furosBase === 3 && !t1c.fundo
      && t1c.listaCorte && t1c.folha && t1c.ilogic && t1c.espessura.some(x => /espessura da chapa/.test(x)) && t1c.porta.some(x => /porta e gaveta não mudam/.test(x))
      && t1c.sumiu.some(x => /não existe mais/.test(x)) && t1c.chao.some(x => /abaixo do chão/.test(x)) && t1c.choque.length === 2 && t1c.semPorta === 0
      && t1c.lista.length === 3 && t1c.voltou.fundo && t1c.voltou.ajustes.length === 2 && t1c.listaDepois === 2 && !erros.length;
    if (!ok1c) { falhas++; console.log('AJUSTE POR PEÇA (1c) ERRADO  ' + JSON.stringify({ ...t1c, paginaErros: erros })); } else console.log('AJUSTE POR PEÇA (1c) OK  ' + JSON.stringify(t1c));
    await page.close();
  }

  return falhas;
} };
