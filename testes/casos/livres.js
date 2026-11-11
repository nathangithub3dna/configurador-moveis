// Peças livres pelas medidas. Movido da suíte original; mesmas entradas e verificações.
const fs = require('fs');
const path = require('path');
const { resumo, diferencas } = require('../apoio/comparacao');

module.exports = { id:'livres', descricao:"Peças livres pelas medidas", async executar({ ctx, pagina, nm, raiz, atualizar, tipoFormulario }) {
  let falhas = 0;
  // passo 1a: peças livres (painel, forro, cortineiro, mesa, peça girada) em todas as saídas
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
    await page.selectOption('#tipoMovel', 'ambiente'); await page.waitForTimeout(800);
    const t1a = await page.evaluate(async () => {
      const c = window.__configurador, e = c.estado, a = e.projeto.parametros;
      const f1 = { C1:1, C2:1, L1:1, L2:1 };
      a.livres = [
        { funcao:'painel', nome:'Painel do pórtico', grupo:'pórtico', comp:900, larg:2382, esp:18, mat:'mdf-amadeirado', veio:'larg', fita:f1, apoio:'frente', pos:{ parede:0, x:2000, y:0, afast:0 }, ferragens:[{ ref:'paraf-50x60-bucha', qtd:6 }] },
        { funcao:'forro', nome:'Forro do pórtico', grupo:'pórtico', comp:900, larg:600, esp:18, mat:'mdf-amadeirado', fita:{ C2:1, L1:1, L2:1 }, apoio:'deitada', pos:{ parede:0, x:2000, y:2382, afast:0 }, ferragens:[{ ref:'paraf-50x60-bucha', qtd:4 }] },
        { funcao:'cortineiro', comp:1200, larg:150, esp:18, mat:'mdf-branco', fita:{ C1:1 }, apoio:'frente', pos:{ parede:0, x:300, y:2300, afast:150 }, furos:[{ u:30, v:75, d:8, prof:0 }, { u:1170, v:75, d:8, prof:0 }], ferragens:[{ ref:'paraf-50x60-bucha', qtd:2 }] },
        { funcao:'tampo-mesa', nome:'Tampo da mesa', grupo:'mesa', comp:1200, larg:700, esp:25, mat:'mdf-amadeirado', fita:f1, apoio:'deitada', pos:{ solta:true, x:1000, y:732, z:1200 },
          recortes:[{ u:0, v:0, w:100, h:100 }, { u:550, v:300, w:100, h:60 }], furos:[{ u:200, v:150, d:5, prof:10 }, { u:1000, v:150, d:5, prof:10 }, { u:200, v:550, d:5, prof:10 }, { u:1000, v:550, d:5, prof:10 }], ferragens:[{ ref:'kit-minifix-15', qtd:4 }] },
        { funcao:'pe-painel', nome:'Pé da mesa', grupo:'mesa', comp:700, larg:732, esp:25, mat:'mdf-amadeirado', fita:{ C2:1, L1:1, L2:1 }, apoio:'lado', pos:{ solta:true, x:1150, y:0, z:1200 } },
        { funcao:'peca-generica', nome:'Girada 30°', comp:600, larg:400, esp:18, mat:'mdf-branco', apoio:'frente', giro:[0, 30, 0], pos:{ solta:true, x:200, y:0, z:1500 } },
        { funcao:'tamponamento', nome:'Girada 90°', comp:600, larg:400, esp:18, mat:'mdf-branco', apoio:'frente', giro:[0, 90, 0], pos:{ solta:true, x:2600, y:0, z:1500 } },
        { funcao:'lateral-acabamento', nome:'Na parede B', comp:580, larg:850, esp:18, mat:'mdf-branco', apoio:'lado', giro:[10, 0, 0], pos:{ parede:1, x:1500, y:50, afast:80 } },
      ];
      c.atualizar(); await new Promise(r => setTimeout(r, 500));
      const r = e.res, L = r.pecas.filter(p => p.cat === 'livre'), por = id => L.find(p => p.id === id);
      const bb = id => { const n = c.nosAtual().get(id); n.mesh.geometry.computeBoundingBox(); const q = n.mesh.geometry.boundingBox; return [q.min.x, q.max.x, q.min.y, q.max.y, q.min.z, q.max.z]; };
      const difBox = id => Math.max(...bb(id).map((v, i) => Math.abs(v - por(id).box[i])));
      const cods = e.codigos, cc = c.pedidoCorteCloud(r.pecas, cods), ilog = c.gerarILogic();
      const noPlano = (e.plano?.materiais || []).reduce((s, m) => s + m.chapas.reduce((t, ch) => t + ch.pecas.filter(q => /^L\d+-/.test(q.id || '')).length, 0), 0);
      const tampo = por('L4-tampo-mesa'), svg = c.folhaPecaSVG(tampo, { projeto:'teste', codigo:'x' });
      const ruim = JSON.parse(JSON.stringify(a)); ruim.livres = [{ funcao:'peca-generica', comp:3000, larg:2000, esp:18, mat:'mdf-branco', pos:{ parede:0, x:2800, y:0, afast:0 }, recortes:[{ u:0, v:0, w:50, h:50 }, { u:0, v:1950, w:50, h:50 }, { u:2950, v:900, w:50, h:50 }] }, { funcao:'xx', comp:1, larg:1, esp:1, mat:'mdf-branco' }];
      const rr = c.TIPOS.ambiente.gerar(ruim);
      return { erros: r.erros, avisosLivres: r.avisos.filter(x => /^L\d/.test(x)).length, sobrepoe: r.avisos.filter(x => /ocupa o mesmo lugar/.test(x)), livres: L.length, semFuncao: L.filter(p => !p.papel).map(p => p.id),
        papeis: L.map(p => p.papel), girada: !!por('L6-peca-generica').giro, alinhada90: !por('L7-tamponamento').giro && Math.round(por('L7-tamponamento').box[1] - por('L7-tamponamento').box[0]),
        difBox: r.erros.length ? -1 : Math.round(Math.max(...L.map(p => difBox(p.id))) * 100) / 100,
        tampo: { w: tampo.des.w, h: tampo.des.h, recortes: tampo.des.recortes.length, rasgos: tampo.des.rasgos.length, furos: tampo.des.furos.length, comp: tampo.comp, larg: tampo.larg, corte: tampo.corte, fita: tampo.fita },
        painel: { comp: por('L1-painel').comp, veio: por('L1-painel').veio, fitaLados: por('L1-painel').fitaLados },
        listaCorte: L.every(p => e.textos.corte.includes(p.nomeLista)), noPlano,
        codigos: L.map(p => cods.get(p.id)?.codigo).filter(x => / · A-L\d{2} · P\d{3}$/.test(x || '')).length,
        corteCloud: cc.parts.length === r.pecas.filter(p => p.lista).length, furosCC: cc.parts.filter(p => /A-L04/.test(p.complement)).map(p => p.machining?.verticalDrills.length)[0],
        ilogic: L.every(p => c.posicaoInventor(p).ok) && ilog.includes('Tampo da mesa'), folha: svg.startsWith('<svg') && svg.includes('VISTA FRONTAL'),
        ferragens: r.ferragens.filter(f => /bucha|minifix|cavilha|fita/i.test(f.item)).map(f => `${f.qtd} ${f.nome}`),
        ruim: rr.erros.filter(x => /^L\d/.test(x)) };
    });
    const ok1a = !t1a.erros.length && t1a.livres === 8 && !t1a.semFuncao.length && t1a.girada && t1a.alinhada90 === 18 && t1a.difBox < 0.5
      && t1a.tampo.recortes === 1 && t1a.tampo.rasgos === 1 && t1a.tampo.furos === 4 && t1a.tampo.comp === 1200 && t1a.tampo.corte.comp === 1198 && t1a.painel.comp === 2382 && t1a.painel.veio === 'comp'
      && t1a.listaCorte && t1a.noPlano === 8 && t1a.codigos === 8 && t1a.corteCloud && t1a.furosCC === 4 && t1a.ilogic && t1a.folha
      && t1a.sobrepoe.length === 1 && /L1 · Painel do pórtico: ocupa o mesmo lugar que M2, M3, M8\./.test(t1a.sobrepoe[0]) && t1a.ruim.some(x => /maior que a chapa/.test(x)) && t1a.ruim.some(x => /passa .* do fim/.test(x)) && t1a.ruim.some(x => /bordas opostas/.test(x)) && t1a.ruim.some(x => /escolha a função/.test(x)) && !erros.length;
    if (!ok1a) { falhas++; console.log('PEÇAS LIVRES (1a) ERRADO  ' + JSON.stringify({ ...t1a, paginaErros: erros })); } else console.log('PEÇAS LIVRES (1a) OK  ' + JSON.stringify(t1a));
    await page.close();
  }

  return falhas;
} };
