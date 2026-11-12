// Formato do projeto e cópia na nuvem. Movido da suíte original; mesmas entradas e verificações.
const fs = require('fs');
const path = require('path');
const { resumo, diferencas } = require('../apoio/comparacao');

module.exports = { id:'formato', descricao:"Formato do projeto e cópia na nuvem", async executar({ ctx, pagina, nm, raiz, atualizar, tipoFormulario }) {
  let falhas = 0;
  // formato do projeto (0.2): número do formato, recusa de projeto mais novo e conversão que guarda o original na nuvem.
  // Hoje o formato é 1 e não há conversor; o teste finge um formato 2 (largura vira 777) para exercitar o caminho.
  {
    const page = await ctx.newPage(), errosF = [], arq = 'file://' + path.join(raiz, 'configurador-offline.html');
    page.on('pageerror', e => errosF.push(e.message));
    await page.route('**/*', route => route.request().url().startsWith('file:') ? route.continue() : route.abort());
    await page.addInitScript(() => {
      try { localStorage.clear(); } catch (e) {}
      const store = window.__nuvemFake = {}, copia = o => JSON.parse(JSON.stringify(o));
      const docRef = id => ({ get: async () => ({ exists: id in store, id, data: () => copia(store[id]) }), set: async o => { store[id] = copia(o); } });
      const db = { collection: () => ({ doc: docRef, orderBy: () => ({ limit: () => ({ get: async () => ({ docs: Object.keys(store).map(id => ({ id, data: () => copia(store[id]) })) }) }) }) }) };
      window.claude = { use: async n => n === 'db' ? db : n === 'user' ? { id: async () => 'teste' } : null };
    });
    await page.goto(arq); await page.waitForFunction(() => window.__configurador?.estado?.res && !document.getElementById('btnNuvem').hidden, null, { timeout: 20000 });
    await page.waitForTimeout(500);
    const tf = await page.evaluate(async () => {
      const c = window.__configurador, e = c.estado, store = window.__nuvemFake, espera = ms => new Promise(r => setTimeout(r, ms)), aviso = () => document.getElementById('toast').textContent;
      const r = { formato: c.FORMATO.versao, localComVersao: JSON.parse(localStorage.getItem('configurador-moveis:v2') || '{}').versao };
      // .json antigo (sem número): abre como sempre
      r.antigo = c.abrirProjetoTexto(JSON.stringify({ tipo: 'gabinete', nome: 'Antigo', parametros: {} })) && e.projeto.nome === 'Antigo' && aviso() === 'Projeto aberto.';
      // projeto de versão mais nova: recusado, nada muda
      const antes = JSON.stringify(e.projeto);
      r.maisNovoRecusado = c.abrirProjetoTexto(JSON.stringify({ versao: 99, tipo: 'armario', nome: 'Futuro', parametros: {} })) === false && JSON.stringify(e.projeto) === antes && /versão mais nova/.test(aviso());
      // formato 2 de mentira: a nuvem tem o projeto no formato 1; abrir um .json formato 1 com o mesmo nome converte e grava
      c.FORMATO.versao = 2; c.FORMATO.conversores[1] = p => ({ ...p, parametros: { ...p.parametros, largura: 777 } });
      const v1 = { app: 'Configurador de Móveis', versao: 1, tipo: 'armario', nome: 'Teste formato', parametros: { largura: 600 } };
      store['teste-formato'] = { nome: 'Teste formato', tipo: 'armario', salvoEm: '2026-01-01T00:00:00.000Z', projeto: JSON.stringify(v1) };
      r.abriuConvertido = c.abrirProjetoTexto(JSON.stringify(v1)) && e.projeto.parametros.largura === 777 && /formato novo/.test(aviso());
      await espera(800);
      const doc = store['teste-formato'], orig = store['teste-formato-original-formato-1'];
      r.nuvemNova = doc && JSON.parse(doc.projeto).versao === 2 && JSON.parse(doc.projeto).parametros.largura === 777;
      r.originalGuardado = !!orig && orig.copia === true && JSON.parse(orig.projeto).versao === 1 && JSON.parse(orig.projeto).parametros.largura === 600 && /original, formato 1/.test(orig.nome);
      // gravar de novo não cria outra cópia nem mexe no original
      e.projeto.parametros.largura = 778; await c.salvarNuvem(); await espera(200);
      r.copiasDoTeste = Object.keys(store).filter(k => k.startsWith('teste-formato')).length;
      r.originalIntacto = JSON.parse(store['teste-formato-original-formato-1'].projeto).parametros.largura === 600 && JSON.parse(store['teste-formato'].projeto).parametros.largura === 778;
      r.localNoFormatoNovo = JSON.parse(localStorage.getItem('configurador-moveis:v2') || '{}').versao === 2;
      // formato 3: este programa (formato 2) recusa
      r.formato3Recusado = c.abrirProjetoTexto(JSON.stringify({ ...v1, versao: 3 })) === false;
      return r;
    });
    await page.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
    const okF = tf.formato === 1 && tf.localComVersao === 1 && tf.antigo && tf.maisNovoRecusado && tf.abriuConvertido && tf.nuvemNova && tf.originalGuardado
      && tf.copiasDoTeste === 2 && tf.originalIntacto && tf.localNoFormatoNovo && tf.formato3Recusado && !errosF.length;
    if (!okF) { falhas++; console.log('FORMATO DO PROJETO ERRADO  ' + JSON.stringify({ ...tf, erros: errosF })); } else console.log('FORMATO DO PROJETO OK  ' + JSON.stringify(tf));
    await page.close();
  }

  return falhas;
} };
