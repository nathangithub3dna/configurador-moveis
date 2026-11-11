// Ambiente: cozinha, compras, desenhos, orçamento e exportação. Movido da suíte original; mesmas entradas e verificações.
const fs = require('fs');
const path = require('path');
const { resumo, diferencas } = require('../apoio/comparacao');

module.exports = { id:'ambiente', descricao:"Ambiente: cozinha, compras, desenhos, orçamento e exportação", async executar({ ctx, pagina, nm, raiz, atualizar, tipoFormulario }) {
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
    const passo = async (sel) => { await page.click(sel); await page.waitForTimeout(250); };
    // 5b: ambiente — cozinha em L de teste
    await passo('#etapas [data-etapa="montar"]');
    await page.selectOption('#tipoMovel', 'ambiente'); await page.waitForTimeout(800);
    const fotoA = () => page.evaluate(() => { const r = window.__configurador.estado.res;
      return { erros: r.erros, avisos: r.avisos.length, canto: r.avisos.some(x => /^Canto/.test(x)), abertura: r.avisos.filter(x => /^Abertura/.test(x)).length, esgoto: r.avisos.some(x => /cobre o esgoto/.test(x)), recorte: r.pecas.some(p => p.forma?.tipo === 'recorte'),
        modulos: new Set(r.pecas.filter(p => p.modulo !== undefined).map(p => p.modulo)).size, tampos: r.pecas.filter(p => p.papel === 'tampo').length, semFuncao: r.pecas.filter(p => !p.papel).map(p => p.id).slice(0, 5),
        naPlanta: document.querySelectorAll('#esquema .pl-modulo').length, chapas: (window.__configurador.estado.plano?.materiais || []).length }; });
    const cozinha = await fotoA();
    await page.click('#form [data-acao="abrir"][data-i="1"]'); await page.waitForTimeout(300);           // abre o balcão da pia por dentro
    const dentro = await page.evaluate(() => ({ editor: !!document.querySelector('#form [data-acao="voltar-ambiente"]'), vaosEsquema: document.querySelectorAll('#esquema button[data-cam]').length }));
    await passo('[data-acao="frente"][data-valor="gaveta"]');
    const mudouDentro = await page.evaluate(() => window.__configurador.estado.res.pecas.filter(p => p.modulo === 1 && p.papel === 'frente-gaveta').length);
    await passo('[data-acao="voltar-ambiente"]');
    for (let k = 0; k < 3; k++) await passo('#form [data-acao="add"][data-modelo="balcao"]');                 // passa do fim da parede A
    const estourou = await fotoA();
    await page.selectOption('#form [data-amb="formato"]', 'reta'); await page.waitForTimeout(400);
    const reta = await fotoA();
    const t5b = { cozinha, dentro, mudouDentro, estourou: estourou.erros, reta: reta.erros.slice(0, 3), paginaErros: erros };
    // 4: no canto, um gaveteiro no lugar do balcão cego tem as gavetas bloqueadas pelo módulo da parede B
    const bloqueio = await page.evaluate(() => { const c = window.__configurador, amb = JSON.parse(JSON.stringify(c.TIPOS.ambiente.padrao));
      amb.modulos[0] = c.AMB.novoModulo('gaveteiro', 0, 0); const r = c.TIPOS.ambiente.gerar(amb);
      const portaB = r.pecas.find(p => p.modulo === 3 && p.mov?.tipo === 'porta'), gavB = (() => { const a2 = JSON.parse(JSON.stringify(c.TIPOS.ambiente.padrao)); a2.modulos[3] = c.AMB.novoModulo('gaveteiro', 1, a2.modulos[3].x); return c.TIPOS.ambiente.gerar(a2).pecas.find(p => p.modulo === 3 && p.mov?.tipo === 'gaveta'); })();
      return { gavetasBloqueadas: r.avisos.filter(x => /^Abertura: M1 · Frente da gaveta/.test(x)).length, portaB: portaB && { pivX: portaB.mov.pivX, pivZ: portaB.mov.pivZ, dentro: portaB.mov.pivZ >= portaB.box[4] - 3 && portaB.mov.pivZ <= portaB.box[5] + 3 }, gavetaB: gavB?.mov.eixo }; });
    t5b.bloqueio = bloqueio; t5b.abertura = cozinha.abertura;
    const ok4 = cozinha.abertura === 0 && !cozinha.canto && bloqueio.gavetasBloqueadas === 3 && bloqueio.portaB?.dentro && bloqueio.gavetaB === 'x';
    if (!ok4) { falhas++; console.log('CONFERÊNCIA DE ABERTURA ERRADO  ' + JSON.stringify({ abertura: cozinha.abertura, canto: cozinha.canto, bloqueio })); } else console.log('CONFERÊNCIA DE ABERTURA OK  ' + JSON.stringify(bloqueio));
    const ok5b = !cozinha.erros.length && cozinha.esgoto && cozinha.recorte && cozinha.modulos === 8 && cozinha.tampos === 2 && !cozinha.semFuncao.length && cozinha.naPlanta === 8 && cozinha.chapas > 0
      && dentro.editor && dentro.vaosEsquema === 1 && mudouDentro === 1 && estourou.erros.some(x => /passa .* do fim da parede A/.test(x)) && reta.erros.some(x => /parede que não existe/.test(x)) && !erros.length;
    // 5c: códigos, pedido CorteCloud e etiquetas (no ambiente de exemplo, voltando ao L)
    await page.selectOption('#form [data-amb="formato"]', 'L'); await page.waitForTimeout(300);
    for (let k = 0; k < 3; k++) await passo('#form [data-acao="remover-mod"][data-i="8"]');
    const loja = await page.evaluate(() => { const c = window.__configurador, e = c.estado, r = e.res, cods = e.codigos;
      const lista = r.pecas.filter(p => p.lista), cc = c.pedidoCorteCloud(r.pecas, cods), pdf = c.etiquetasPDF(r.pecas, cods, 'teste');
      const furosCC = cc.parts.reduce((s, p) => s + (p.machining ? p.machining.verticalDrills.length + p.machining.horizontalDrills.length : 0), 0);
      const furosPecas = lista.reduce((s, p) => s + (p.des?.furos || []).length, 0);
      return { erros: r.erros, pecas: lista.length, codigos: cods.size, unicos: new Set([...cods.values()].map(x => x.codigo)).size, exemplo: [...cods.values()][0]?.codigo,
        modulosNosCodigos: new Set([...cods.values()].map(x => x.modulo)).size, partes: cc.parts.length, furosCC, furosPecas, comFita: cc.parts.filter(p => p.c1).length,
        pdfKB: Math.round(pdf.byteLength / 1024), pdfB64: btoa(String.fromCharCode(...new Uint8Array(pdf).slice(0, 0))), qr: !!window.qrcode, tabela: document.querySelectorAll('#tabCodigos tbody tr').length }; });
    t5b.loja = loja;
    const ok5c = !loja.erros.length && loja.codigos === loja.pecas && loja.unicos === loja.pecas && /^\d{4}-\d{2} · A-M\d{2} · P\d{3}$/.test(loja.exemplo) && loja.modulosNosCodigos === 8
      && loja.partes === loja.pecas && loja.furosCC === loja.furosPecas && loja.comFita > 0 && loja.pdfKB > 5 && loja.pdfKB < 3000 && loja.qr && loja.tabela === loja.pecas;
    const folha = await page.evaluate(async () => { const c = window.__configurador, e = c.estado, pcs = e.res.pecas.filter(p => p.lista).slice(0, 3);
      const svg = c.folhaPecaSVG(pcs[0], { projeto:'teste', codigo:'x' }); const pdf = await c.folhasPDF(pcs, () => ({ projeto:'teste' }));
      return { svgOk: svg.startsWith('<svg') && svg.includes('VISTA FRONTAL') && svg.includes('LATERAL'), pdfKB: Math.round(pdf.byteLength / 1024), paginas: (new TextDecoder('latin1').decode(pdf).match(/\/Type \/Page\b/g) || []).length,
        previa: !!document.querySelector('#folhaSvg svg'), opcoes: document.querySelectorAll('#selFolha option').length }; });
    loja.folha = folha;
    const okFolha = folha.svgOk && folha.paginas === 3 && folha.pdfKB > 3 && folha.previa && folha.opcoes > 0;
    if (!okFolha) { falhas++; console.log('FOLHA A3 (5c) ERRADO  ' + JSON.stringify(folha)); } else console.log('FOLHA A3 (5c) OK  ' + JSON.stringify(folha));
    // 5c parte 3: orçamento com revisões congeladas e aceite
    await passo('#etapas [data-etapa="compras"]');
    const orc = await page.evaluate(async () => {
      const e = window.__configurador.estado, preencher = (k, v) => { const i = document.querySelector(`[data-orc="${k}"]`); i.value = v; i.dispatchEvent(new Event('change', { bubbles:true })); };
      document.querySelectorAll('#tabCompras input[type=number]').forEach((inp, k) => { inp.value = 10 + k; inp.dispatchEvent(new Event('change')); });
      preencher('cliente', 'Cliente Teste'); preencher('taxaHora', 50); preencher('horasFabricacao', 20); preencher('instalacao', 800);
      const resumo1 = document.querySelectorAll('#orcResumo .orc-caixa').length;
      document.getElementById('btnCongelar').click();
      const revA = JSON.parse(JSON.stringify(e.projeto.orcamento.revisoes[0]));
      document.querySelector('[data-aceite="A"]').click();
      preencher('horasFabricacao', 30); document.getElementById('btnCongelar').click();
      const revs = e.projeto.orcamento.revisoes, pdf = window.__configurador.orcamentoPDF(revs[1]);
      return { resumo1, n: revs.length, totalA: revA.resultado.total, totalA_depois: revs[0].resultado.total, aceiteA: !!revs[0].aceite, revB: revs[1].rev, difB: revs[1].diferenca, aposAceite: revs[1].aposAceite,
        fixas: (() => { const c = window.__configurador.calcularOrcamento({ total: 1000, semPreco: 0 }, { ...revs[1].entradas, despesasMes: 4000, horasMes: 160, servCorte: 100, servFita: 50, servFuracao: 30, servicosLoja: 20, markup: 0, impostos: 0 });
          return { fixoHora: c.fixoHora, fixas: c.fixas, servicos: c.servicos }; })(),
        lembra: JSON.parse(localStorage.getItem('configurador-moveis:oficina-orc') || '{}').taxaHora,
        pdfAntigo: (() => { const t = new TextDecoder('latin1').decode(window.__configurador.gerarPDF()); return { naoFabricar: /N\S*O FABRICAR/.test(t), rotulo: /ESTUDO/.test(t) }; })(),
        linhas: document.querySelectorAll('#tabRevisoes tbody tr').length, pdfKB: Math.round(pdf.byteLength / 1024), salvo: !!JSON.parse(localStorage.getItem('configurador-moveis:v2') || '{}').orcamento };
    });
    loja.orc = orc;
    // situação: aceite da B → aprovado → liberar → liberado; mudar medida → estudo com lista do que mudou
    const sit = await page.evaluate(async () => {
      const c = window.__configurador, e = c.estado, ler = () => ({ rotulo: document.querySelector('#situacao .sit-rotulo').textContent, liberar: !document.getElementById('btnLiberar').hidden });
      const s0 = ler(); document.querySelector('[data-aceite="B"]').click(); await new Promise(r => setTimeout(r, 300));
      const s1 = ler(); document.getElementById('btnLiberar').click(); await new Promise(r => setTimeout(r, 300));
      const bloqueado = ler().rotulo, confFaltas = [...document.querySelectorAll('#confLista li[data-ok="nao"]')].length;
      document.querySelector('input[name="confFur"][value="soCorte"]').click(); const av = document.getElementById('confAvisos'); if (!av.disabled && !av.checked) av.click();
      document.getElementById('btnLiberar').click(); await new Promise(r => setTimeout(r, 300));
      const pt = c.pecaDeTeste(), pedidoTeste = c.pedidoCorteCloud([pt], new Map([[pt.id, { codigo:'T' }]]), 'TESTE').parts[0].machining;
      const s2 = ler(), lista2 = e.textos.corte.split('\n')[1], folha2 = c.folhaPecaSVG(e.res.pecas.find(p => p.lista), { aviso:'' }).includes('NÃO FABRICAR');
      const furProjeto = e.projeto.conferencia?.furacao?.furacao, salvoFur = JSON.parse(localStorage.getItem('configurador-moveis:v2') || '{}').conferencia?.furacao?.furacao;
      return { s0, s1, bloqueado, confFaltas, s2, lista2, folha2, furProjeto, salvoFur, teste: { face: pedidoTeste.verticalDrills.length, topo: pedidoTeste.horizontalDrills.length } }; });
    await passo('#etapas [data-etapa="montar"]');
    await page.evaluate(() => { const i = document.querySelector('#form [data-mod="largura"][data-i="2"]'); i.value = 500; i.dispatchEvent(new Event('change', { bubbles:true })); });
    await page.waitForTimeout(400);
    sit.depois = await page.evaluate(() => ({ rotulo: document.querySelector('#situacao .sit-rotulo').textContent, mudancas: !document.getElementById('mudancas').hidden,
      pecasMudaram: document.querySelectorAll('#mudancas [data-lista="pecas"] tbody tr').length, titulo: document.querySelector('#mudancas h3').textContent, lista: window.__configurador.estado.textos.corte.split('\n')[1] }));
    loja.situacao = sit;
    const okSit = /ESTUDO/.test(sit.s0.rotulo) && /APROVADO/.test(sit.s1.rotulo) && sit.s1.liberar && /APROVADO/.test(sit.bloqueado) && sit.confFaltas > 0 && /LIBERADO/.test(sit.s2.rotulo) && sit.teste.face === 4 && sit.teste.topo === 1 && /LIBERADO/.test(sit.lista2) && sit.furProjeto === 'soCorte' && sit.salvoFur === 'soCorte'
      && /ESTUDO — alterado depois da Rev. B/.test(sit.depois.rotulo) && sit.depois.mudancas && sit.depois.pecasMudaram > 0 && /Rev. B/.test(sit.depois.titulo) && /não fabricar/.test(sit.depois.lista);
    if (!okSit) { falhas++; console.log('SITUAÇÃO E REVISÃO ERRADO  ' + JSON.stringify(sit)); } else console.log('SITUAÇÃO E REVISÃO OK  ' + JSON.stringify(sit));
    const okOrc = orc.resumo1 >= 6 && orc.n === 2 && orc.totalA > 0 && orc.totalA === orc.totalA_depois && orc.aceiteA && orc.revB === 'B' && Math.abs(orc.difB - 10 * 50 * 1.15) < 0.01 && orc.aposAceite && orc.linhas === 2 && orc.pdfKB > 2
      && orc.fixas.fixoHora === 25 && orc.fixas.fixas === 25 * 30 && orc.fixas.servicos === 200 && orc.lembra === 50 && orc.pdfAntigo.naoFabricar && orc.pdfAntigo.rotulo;
    if (!okOrc) { falhas++; console.log('ORÇAMENTO (5c) ERRADO  ' + JSON.stringify(orc)); } else console.log('ORÇAMENTO (5c) OK  ' + JSON.stringify(orc));
    // fora do Claude: o download sai pelo navegador; projeto com erro também salva
    const baixar = await page.evaluate(() => ({ json: !document.getElementById('btnJson').disabled, nota: document.getElementById('notaExport').textContent }));
    const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 8000 }).catch(() => null), page.evaluate(() => document.getElementById('btnJson').click())]);
    loja.baixar = { ...baixar, arquivo: dl ? dl.suggestedFilename() : null };
    await page.evaluate(() => { const i = document.querySelector('#form [data-parede="comprimento"]'); i.value = 500; i.dispatchEvent(new Event('change', { bubbles:true })); });
    await page.waitForTimeout(400);
    const comErro = await page.evaluate(() => ({ erros: window.__configurador.estado.res.erros.length, json: !document.getElementById('btnJson').disabled }));
    const [dl2] = await Promise.all([page.waitForEvent('download', { timeout: 8000 }).catch(() => null), page.evaluate(() => document.getElementById('btnJson').click())]);
    loja.baixar.comErro = { ...comErro, arquivo: dl2 ? dl2.suggestedFilename() : null };
    const okBaixar = baixar.json && !/só funciona/.test(baixar.nota) && !!dl && comErro.erros > 0 && comErro.json && /incompleto\.json$/.test(dl2?.suggestedFilename() || '');
    if (!okBaixar) { falhas++; console.log('SALVAR FORA DO CLAUDE ERRADO  ' + JSON.stringify(loja.baixar)); } else console.log('SALVAR FORA DO CLAUDE OK  ' + JSON.stringify(loja.baixar));
    if (!ok5c) { falhas++; console.log('LOJA E ETIQUETAS (5c) ERRADO  ' + JSON.stringify(loja)); } else console.log('LOJA E ETIQUETAS (5c) OK  ' + JSON.stringify(loja));
    if (!ok5b) { falhas++; console.log('AMBIENTE (5b) ERRADO  ' + JSON.stringify(t5b)); } else console.log('AMBIENTE (5b) OK  ' + JSON.stringify(t5b));
    await page.close();
  }

  return falhas;
} };
