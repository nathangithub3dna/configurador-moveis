// Peças livres pela tela. Movido da suíte original; mesmas entradas e verificações.
const fs = require('fs');
const path = require('path');
const { resumo, diferencas } = require('../apoio/comparacao');

module.exports = { id:'livres-tela', descricao:"Peças livres pela tela", async executar({ ctx, pagina, nm, raiz, atualizar, tipoFormulario }) {
  let falhas = 0;
  // passo 1b: o mesmo caso da 1a montado PELA TELA (clicando e digitando), e o resultado tem que ser igual ao montado pelos dados
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
    await page.selectOption('#tipoMovel', 'ambiente'); await page.waitForTimeout(800);
    const aberta = '#form .amb-livre[aria-current]';
    const add = async f => { await page.selectOption('#form [data-amb="funcaoAdd"]', f); await page.click('#form [data-acao="add-livre"]'); await page.waitForTimeout(150); };
    const digita = async (sel, v) => { const l = page.locator(`${aberta} ${sel}:visible`).first(); await l.fill(String(v)); await l.evaluate(e => e.dispatchEvent(new Event('change', { bubbles: true }))); await page.waitForTimeout(60); };
    const escolhe = async (sel, v) => { await page.locator(`${aberta} ${sel}:visible`).first().selectOption(String(v)); await page.waitForTimeout(60); };
    const campos = async o => { for (const [k, v] of Object.entries(o)) { if (['funcao', 'mat', 'veio', 'apoio', 'onde'].includes(k)) await escolhe(`[data-livre="${k}"]`, v); else await digita(`[data-livre="${k}"]`, v); } };
    const fita = async lados => { for (const k of ['C1', 'C2', 'L1', 'L2']) await page.locator(`${aberta} [data-fita="${k}"]`).setChecked(lados.includes(k)); await page.waitForTimeout(60); };
    const ferragem = async (ref, qtd) => { if (ref === null) { await page.click(`${aberta} [data-acao="rem-fer"]`); return; } await page.locator(`${aberta} [data-fer="ref"]`).selectOption(ref); await page.waitForTimeout(60); await digita('[data-fer="qtd"]', qtd); };
    const linha = async (tipo, j, o) => { await page.click(`${aberta} [data-acao="add-${tipo}"]`); await page.waitForTimeout(80); for (const [k, v] of Object.entries(o)) await digita(`[data-${tipo === 'rec' ? 'rec' : 'furo'}="${k}"][data-j="${j}"]`, v); };
    const todos = ['C1', 'C2', 'L1', 'L2'];
    // L1 painel do pórtico
    await add('painel'); await campos({ nome: 'Painel do pórtico', grupo: 'pórtico', larg: 2382, mat: 'mdf-amadeirado', veio: 'larg', x: 2000 }); await fita(todos); await ferragem('paraf-50x60-bucha', 6);
    // L2 forro
    await add('forro'); await campos({ nome: 'Forro do pórtico', grupo: 'pórtico', mat: 'mdf-amadeirado', x: 2000, y: 2382 }); await fita(['C2', 'L1', 'L2']); await ferragem('paraf-50x60-bucha', 4);
    // L3 cortineiro com 2 furos passantes
    await add('cortineiro'); await campos({ x: 300 }); await linha('furo', 0, { u: 30, v: 75, d: 8, prof: 0 }); await linha('furo', 1, { u: 1170, v: 75, d: 8, prof: 0 });
    // L4 tampo da mesa: recorte de canto, vazado e 4 furos
    await add('tampo-mesa'); await campos({ nome: 'Tampo da mesa', grupo: 'mesa', mat: 'mdf-amadeirado', sx: 1000, sy: 732, sz: 1200 }); await fita(todos);
    await linha('rec', 0, { u: 0, v: 0, w: 100, h: 100 }); await linha('rec', 1, { u: 550, v: 300, w: 100, h: 60 });
    for (const [j, [u, v]] of [[200, 150], [1000, 150], [200, 550], [1000, 550]].entries()) await linha('furo', j, { u, v, d: 5, prof: 10 });
    await ferragem('kit-minifix-15', 4);
    // L5 pé da mesa (sem ferragem)
    await add('pe-painel'); await campos({ nome: 'Pé da mesa', grupo: 'mesa', larg: 732, mat: 'mdf-amadeirado', sx: 1150, sz: 1200 }); await ferragem(null);
    // L6 girada 30°, L7 girada 90°, L8 na parede B tombada 10°
    await add('peca-generica'); await campos({ nome: 'Girada 30°', sx: 200, sz: 1500, gy: 30 }); await ferragem(null);
    await add('tamponamento'); await campos({ nome: 'Girada 90°', comp: 600, larg: 400, apoio: 'frente', onde: 'solta' }); await campos({ sx: 2600, sy: 0, sz: 1500, gy: 90 }); await fita([]); await ferragem(null);
    await add('lateral-acabamento'); await campos({ nome: 'Na parede B', onde: '1' }); await campos({ x: 1500, y: 50, afast: 80, gx: 10 }); await fita([]); await ferragem(null);
    await page.waitForTimeout(500);
    const LIVRES_1A = (() => { const f1 = { C1:1, C2:1, L1:1, L2:1 }; return [
      { funcao:'painel', nome:'Painel do pórtico', grupo:'pórtico', comp:900, larg:2382, esp:18, mat:'mdf-amadeirado', veio:'larg', fita:f1, apoio:'frente', pos:{ parede:0, x:2000, y:0, afast:0 }, ferragens:[{ ref:'paraf-50x60-bucha', qtd:6 }] },
      { funcao:'forro', nome:'Forro do pórtico', grupo:'pórtico', comp:900, larg:600, esp:18, mat:'mdf-amadeirado', fita:{ C2:1, L1:1, L2:1 }, apoio:'deitada', pos:{ parede:0, x:2000, y:2382, afast:0 }, ferragens:[{ ref:'paraf-50x60-bucha', qtd:4 }] },
      { funcao:'cortineiro', comp:1200, larg:150, esp:18, mat:'mdf-branco', fita:{ C1:1 }, apoio:'frente', pos:{ parede:0, x:300, y:2300, afast:150 }, furos:[{ u:30, v:75, d:8, prof:0 }, { u:1170, v:75, d:8, prof:0 }], ferragens:[{ ref:'paraf-50x60-bucha', qtd:2 }] },
      { funcao:'tampo-mesa', nome:'Tampo da mesa', grupo:'mesa', comp:1200, larg:700, esp:25, mat:'mdf-amadeirado', fita:f1, apoio:'deitada', pos:{ solta:true, x:1000, y:732, z:1200 },
        recortes:[{ u:0, v:0, w:100, h:100 }, { u:550, v:300, w:100, h:60 }], furos:[{ u:200, v:150, d:5, prof:10 }, { u:1000, v:150, d:5, prof:10 }, { u:200, v:550, d:5, prof:10 }, { u:1000, v:550, d:5, prof:10 }], ferragens:[{ ref:'kit-minifix-15', qtd:4 }] },
      { funcao:'pe-painel', nome:'Pé da mesa', grupo:'mesa', comp:700, larg:732, esp:25, mat:'mdf-amadeirado', fita:{ C2:1, L1:1, L2:1 }, apoio:'lado', pos:{ solta:true, x:1150, y:0, z:1200 } },
      { funcao:'peca-generica', nome:'Girada 30°', comp:600, larg:400, esp:18, mat:'mdf-branco', apoio:'frente', giro:[0, 30, 0], pos:{ solta:true, x:200, y:0, z:1500 } },
      { funcao:'tamponamento', nome:'Girada 90°', comp:600, larg:400, esp:18, mat:'mdf-branco', apoio:'frente', giro:[0, 90, 0], pos:{ solta:true, x:2600, y:0, z:1500 } },
      { funcao:'lateral-acabamento', nome:'Na parede B', comp:580, larg:850, esp:18, mat:'mdf-branco', apoio:'lado', giro:[10, 0, 0], pos:{ parede:1, x:1500, y:50, afast:80 } },
    ]; })();
    const t1b = await page.evaluate(async (dados) => {
      const c = window.__configurador, e = c.estado, a = e.projeto.parametros;
      const resumoL = r => r.pecas.filter(p => p.cat === 'livre').map(p => ({ id: p.id, nome: p.nome, comp: p.comp, larg: p.larg, esp: p.esp, mat: p.mat, veio: p.veio, fita: p.fitaLados,
        box: p.box, giro: !!p.giro, des: { w: p.des.w, h: p.des.h, fita: p.des.fita, furos: p.des.furos, recortes: p.des.recortes, rasgos: p.des.rasgos } }));
      const fer = r => r.ferragens.map(f => `${f.qtd} ${f.ref}`).sort().join(' | ');
      const pelaTela = { livres: resumoL(e.res), fer: fer(e.res), avisos: e.res.avisos.filter(x => /^L\d/.test(x)), erros: e.res.erros };
      const naPlanta = document.querySelectorAll('#esquema [data-livre]').length;
      const girada = [...document.querySelectorAll('#esquema [data-livre="5"] polygon')].map(p => p.getAttribute('points'))[0] || '';
      const ruim = JSON.parse(JSON.stringify(a)); ruim.livres = dados;
      const rd = c.TIPOS.ambiente.gerar(ruim), pelosDados = { livres: resumoL(rd), fer: fer(rd), avisos: rd.avisos.filter(x => /^L\d/.test(x)), erros: rd.erros };
      const dif = JSON.stringify(pelaTela) === JSON.stringify(pelosDados) ? null : resumoL(e.res).map((p, k) => JSON.stringify(p) === JSON.stringify(pelosDados.livres[k]) ? null : { tela: p, dados: pelosDados.livres[k] }).filter(Boolean).concat(pelaTela.fer !== pelosDados.fer ? [{ fer: [pelaTela.fer, pelosDados.fer] }] : []);
      const xs = girada.split(' ').map(q => q.split(',').map(Number)), alinhado = xs.length === 4 && xs.every(q => xs.filter(r => Math.abs(r[0] - q[0]) < 0.5).length === 2);
      return { livres: pelaTela.livres.length, erros: pelaTela.erros, iguais: !dif, dif, naPlanta, giradaNaPlanta: xs.length >= 4 && !alinhado };
    }, LIVRES_1A);
    // clique na planta escolhe a peça; grupo: mover e duplicar; duplicar e remover peça
    await page.click('#esquema [data-livre="3"] polygon', { force: true }); await page.waitForTimeout(200);
    t1b.cliquePlanta = await page.evaluate(() => [window.__configurador.estado.livreSel, document.querySelector('#form .amb-livre[aria-current] [data-livre="nome"]')?.value]);
    const grp = '#form .amb-grupo:has-text("Grupo mesa")';
    await page.locator(`${grp} [data-gdelta="0"]`).fill('100'); await page.locator(`${grp} [data-gdelta="0"]`).evaluate(e => e.dispatchEvent(new Event('change', { bubbles: true })));
    await page.locator(`${grp} [data-gdelta="2"]`).fill('-50'); await page.locator(`${grp} [data-gdelta="2"]`).evaluate(e => e.dispatchEvent(new Event('change', { bubbles: true })));
    await page.click(`${grp} [data-acao="mover-grupo"]`); await page.waitForTimeout(200);
    await page.click(`${grp} [data-acao="dup-grupo"]`); await page.waitForTimeout(200);
    await page.click('#form [data-acao="dup-livre"][data-i="2"]'); await page.waitForTimeout(200);
    await page.click('#form [data-acao="rem-livre"][data-i="6"]'); await page.waitForTimeout(300);
    Object.assign(t1b, await page.evaluate(() => { const e = window.__configurador.estado, L = e.projeto.parametros.livres;
      return { depois: L.map(l => `${l.nome || l.funcao}@${l.pos.x},${l.pos.z ?? l.pos.afast}${l.grupo ? '#' + l.grupo : ''}`), errosDepois: e.res.erros, livresDepois: e.res.pecas.filter(p => p.cat === 'livre').length,
        planta: document.querySelectorAll('#esquema [data-livre]').length }; }));
    const ok1b = t1b.livres === 8 && !t1b.erros.length && t1b.iguais && t1b.naPlanta === 8 && t1b.giradaNaPlanta && t1b.cliquePlanta[0] === 3 && t1b.cliquePlanta[1] === 'Tampo da mesa'
      && t1b.livresDepois === 10 && t1b.planta === 10 && !t1b.errosDepois.length && !erros.length
      && t1b.depois.includes('Tampo da mesa@1100,1150#mesa') && t1b.depois.includes('Pé da mesa@1250,1150#mesa') && t1b.depois.filter(x => /#mesa 2$/.test(x)).length === 2 && t1b.depois.filter(x => /^cortineiro@/.test(x)).length === 2 && !t1b.depois.some(x => /^Girada 30/.test(x));
    if (!ok1b) { falhas++; console.log('PEÇAS LIVRES PELA TELA (1b) ERRADO  ' + JSON.stringify({ ...t1b, paginaErros: erros })); } else console.log('PEÇAS LIVRES PELA TELA (1b) OK  ' + JSON.stringify(t1b));
    await page.screenshot({ path: path.join(require('os').tmpdir(), 'tela-1b.png') }).catch(() => {});
    await page.close();
  }

  return falhas;
} };
