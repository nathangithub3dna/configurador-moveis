// Testes de referência: gera cada modelo e compara com o que foi guardado em testes/referencia/.
// Uso:  npm run testar                 → compara (falha se 1 mm mudar)
//       npm run atualizar-referencia   → grava o resultado atual como novo padrão (só quando a mudança foi intencional)
const { chromium } = require('playwright');
const fs = require('fs'); const path = require('path');
const raiz = path.join(__dirname, '..');
const atualizar = process.argv.includes('--atualizar');
const html = fs.readFileSync(path.join(raiz, 'configurador.html'), 'utf8');
const pagina = `<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"></head><body>${html}</body></html>`;
const nm = p => path.join(raiz, 'node_modules', p);

// Cada caso: tipo de móvel + parâmetros alterados em relação ao padrão
const CASOS = [
  { nome: 'gabinete-padrao', tipo: 'gabinete', mudar: {} },
  { nome: 'armario-padrao', tipo: 'armario', mudar: {} },
  { nome: 'armario-3-vaos', tipo: 'armario', mudar: { vaos: 'vassoura, prateleiras, gavetas+botijao', alturaBeiral: 0 } },
  { nome: 'gabinete-1-porta-parede-esq', tipo: 'gabinete', mudar: { portas: 1, paredeEsq: true, enchimento: true, largura: 600, prateleiras: 2 } },
  { nome: 'gabinete-3-gavetas-sem-portas', tipo: 'gabinete', mudar: { portas: 0, gavetas: 3, alturasGavetas: '150, 200, 250', pes: 100, paredeDir: true, enchimento: true } },
  { nome: 'gabinete-so-portas', tipo: 'gabinete', mudar: { gavetas: 0, prateleiras: 1, esgoto: 1500 } },
  { nome: 'armario-2-vaos-gavetas', tipo: 'armario', mudar: { vaos: 'gavetas, prateleiras', largura: 900, paredeEsq: true, rodape: 0, alturaBeiral: 0 } },
  { nome: 'armario-1-vao', tipo: 'armario', mudar: { vaos: 'prateleiras', largura: 500, altura: 900, prateleiras: 2 } },
];

function resumo() {
  const c = window.__configurador, e = c.estado, res = e.res;
  const r = v => typeof v === 'number' ? Math.round(v * 10) / 10 : v;
  return {
    erros: res.erros, avisos: res.avisos,
    semPapel: res.pecas.filter(p => !p.papel).map(p => p.id),
    pecas: res.pecas.map(p => ({ id: p.id, papel: p.papel, lado: p.lado, nome: p.nome, cat: p.cat, lista: p.lista, comp: r(p.comp), larg: r(p.larg), esp: p.esp, mat: p.mat, fita: p.fita, box: (p.box || []).map(r),
      furos: (p.des?.furos || []).map(f => [r(f.x), r(f.y), f.d, f.prof, f.tipo]), rasgos: (p.des?.rasgos || []).length })),
    listaDeCorte: e.textos.corte,
    ferragens: res.ferragens.map(f => `${f.qtd} ${f.unid} ${f.item}`),
    plano: e.plano ? e.plano.materiais.map(m => ({ material: m.nome, chapas: m.chapas.length, pecasPorChapa: m.chapas.map(c => c.pecas.length) })) : null,
    compras: (e.compras?.itens || e.compras?.linhas || []).length,
    ilogic: (() => { try { return c.gerarILogic().replace(/^' Gerado em .*$/gm, '').split('\n').filter(l => /^\s*"/.test(l) || /Dim pecas/.test(l)); } catch (x) { return 'erro: ' + x.message; } })(),
    fixacoes: (res.fixacoes || []).reduce((a, f) => (a[f.tipo] = (a[f.tipo] || 0) + 1, a), {}),
  };
}

function diferencas(a, b, caminho = '') {
  if (JSON.stringify(a) === JSON.stringify(b)) return [];
  if (typeof a !== 'object' || typeof b !== 'object' || !a || !b) return [`${caminho}: era ${JSON.stringify(a)} → agora ${JSON.stringify(b)}`];
  const out = []; const chaves = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of chaves) out.push(...diferencas(a[k], b[k], caminho ? `${caminho}.${k}` : k));
  return out;
}

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await b.newContext({ viewport: { width: 1400, height: 900 } });
  let falhas = 0;
  for (const caso of CASOS) {
    const page = await ctx.newPage(); const erros = [];
    page.on('pageerror', e => erros.push(e.message));
    await page.addInitScript(() => { try { localStorage.clear(); } catch (e) {} window.claude = { use: async () => ({ save: async () => ({ status: 'saved' }) }) }; });
    await page.route('**/*', route => {
      const u = route.request().url();
      if (u.startsWith('http://teste/')) return route.fulfill({ body: pagina, contentType: 'text/html' });
      const m = u.match(/three@0\.160\.0\/(.*)$/);
      if (m) return route.fulfill({ path: nm('three/' + m[1]), contentType: 'application/javascript' });
      if (u.includes('jspdf')) return route.fulfill({ path: nm('jspdf/dist/jspdf.umd.min.js'), contentType: 'application/javascript' });
      if (u.includes('jszip')) return route.fulfill({ path: nm('jszip/dist/jszip.min.js'), contentType: 'application/javascript' });
      if (u.includes('qrcode-generator')) return route.fulfill({ path: nm('qrcode-generator/qrcode.js'), contentType: 'application/javascript' });
      return route.abort();
    });
    await page.goto('http://teste/');
    await page.waitForFunction(() => window.__configurador?.estado?.res, null, { timeout: 20000 });
    await page.selectOption('#tipoMovel', caso.tipo); await page.waitForTimeout(400);
    for (const [id, v] of Object.entries(caso.mudar)) {
      await page.evaluate(([id, v]) => { const el = document.getElementById('p-' + id); if (el.type === 'checkbox') el.checked = v; else el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); }, [id, v]);
      await page.waitForTimeout(300);
    }
    await page.waitForTimeout(500);
    const atual = await page.evaluate(resumo);
    if (erros.length) atual.errosDaPagina = erros;
    if (atual.semPapel.length) { falhas++; console.log(`SEM FUNÇÃO  ${caso.nome}: ${atual.semPapel.join(', ')}`); }
    // Sub-etapa 4a: o núcleo novo precisa gerar as mesmas peças (geometria, medidas, fita, furos) que o gerador atual
    const v3 = await page.evaluate(() => {
      const c = window.__configurador, e = c.estado, r = v => typeof v === 'number' ? Math.round(v * 10) / 10 : v;
      const norm = ps => ps.map(p => JSON.stringify([p.papel, p.cat, p.lista, r(p.comp), r(p.larg), p.esp, p.mat, p.fita, (p.box||[]).map(r),
        (p.des?.furos||[]).map(f => [r(f.x), r(f.y), f.d, f.prof, f.tipo]).sort((a,b) => JSON.stringify(a) < JSON.stringify(b) ? -1 : 1),
        (p.des?.rasgos||[]).length, (p.des?.recortes||[]).map(x => [r(x.x), r(x.w), r(x.h)]), (p.des?.linhas||[]).length])).sort();
      const conv = c.CONVERSORES_V3[e.projeto.tipo]; if (!conv) return { erro: 'sem conversor' };
      const novo = c.gerarModuloV3(conv(e.projeto.parametros));
      // o núcleo novo divide o fundo pelo transporte (peças até 1220): compara o fundo somado, peça a peça o resto
      const juntaFundo = ps => { const f = ps.filter(p => p.papel === 'fundo' && p.cat === 'fundo'); if (f.length < 2) return ps;
        const bx = [Math.min(...f.map(p => p.box[0])), Math.max(...f.map(p => p.box[1])), ...f[0].box.slice(2)], w = bx[1] - bx[0];
        return [...ps.filter(p => !f.includes(p)), { ...f[0], comp: Math.max(w, f[0].comp), larg: Math.min(w, f[0].comp), box: bx }]; };
      // regra nova de dobradiça (4d: altura, peso e no máximo 600 entre elas) pode dar mais dobradiças que o gerador antigo:
      // compara portas sem os canecos e confere à parte que o núcleo nunca põe menos dobradiças
      const semDob = ps => ps.filter(p => p.papel !== 'dobradica').map(p => p.papel === 'porta' ? { ...p, des:{ ...p.des, furos:(p.des?.furos||[]).filter(f => f.tipo !== 'caneco') } } : p.papel === 'lateral' ? { ...p, des:{ ...p.des, furos:(p.des?.furos||[]).filter(f => f.tipo !== 'calco') } } : p);
      const nDob = ps => ps.filter(p => p.papel === 'dobradica').length, dobMenos = nDob(novo.pecas) < nDob(e.res.pecas);
      const a = norm(semDob(juntaFundo(e.res.pecas))), b = norm(semDob(juntaFundo(novo.pecas)));
      const so = (x, y) => x.filter(v => !y.includes(v));
      return { erros: novo.erros, nErrosAtual: e.res.erros.length, faltam: so(a, b).concat(dobMenos ? ['menos dobradiças que o gerador antigo'] : []), sobram: so(b, a), dobradicas: [nDob(e.res.pecas), nDob(novo.pecas)] };
    });
    if (v3.erro || v3.erros.length !== v3.nErrosAtual || v3.faltam.length || v3.sobram.length) {
      falhas++; console.log(`NÚCLEO NOVO DIFERENTE  ${caso.nome}  (${v3.erro || ''} erros: ${v3.erros?.length}, faltam ${v3.faltam?.length}, sobram ${v3.sobram?.length})`);
      (v3.erros || []).slice(0, 5).forEach(x => console.log('   erro: ' + x));
      (v3.faltam || []).slice(0, 6).forEach(x => console.log('   falta: ' + x.slice(0, 260)));
      (v3.sobram || []).slice(0, 6).forEach(x => console.log('   sobra: ' + x.slice(0, 260)));
    } else console.log(`NÚCLEO NOVO IGUAL  ${caso.nome}` + (v3.dobradicas[0] !== v3.dobradicas[1] ? `  (dobradiças: antigo ${v3.dobradicas[0]} → núcleo ${v3.dobradicas[1]}, regra 4d)` : ''));
    const arq = path.join(__dirname, 'referencia', caso.nome + '.json');
    if (atualizar || !fs.existsSync(arq)) {
      fs.writeFileSync(arq, JSON.stringify(atual, null, 1));
      console.log(`GRAVADO  ${caso.nome}  (${atual.pecas.length} peças, ${atual.erros.length} erros)`);
    } else {
      const d = diferencas(JSON.parse(fs.readFileSync(arq, 'utf8')), atual);
      if (d.length) { falhas++; console.log(`MUDOU    ${caso.nome}  (${d.length} diferenças)`); d.slice(0, 15).forEach(x => console.log('   ' + x)); }
      else console.log(`IGUAL    ${caso.nome}`);
    }
    await page.close();
  }
  // Móvel montado só pelo núcleo novo (não existe nos tipos antigos): armário 1200 × 2000 × 500 com 2 vãos;
  // vão 1 = porta + 4 prateleiras; vão 2 = gaveta 200 + gaveta 200 + porta em cima
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
      return route.abort();
    });
    await page.goto('http://teste/');
    await page.waitForFunction(() => window.__configurador?.estado?.res, null, { timeout: 20000 });
    const atual = await page.evaluate(() => {
      const c = window.__configurador, r = v => typeof v === 'number' ? Math.round(v * 10) / 10 : v;
      const pux = { ...c.CONVERSORES_V3.armario({ ...c.TIPOS.armario.padrao }).puxadorPorta };
      const m = { largura:1200, altura:2000, profundidade:500,
        metodo:'armario-atual', metodoAjustes:{ furarLaterais:true },
        construcao:{ espMDF:18, espFundo:6, beiral:0, paredeEsq:false, paredeDir:false, enchimento:false },
        ambiente:{}, puxadorPorta:pux, puxadorGaveta:{ ...pux, altura:'topo-120' },
        raiz:{ tipo:'dividir', dir:'v', sep:'divisoria', partes:[
          { medida:'auto', no:{ tipo:'vao', frente:{ tipo:'porta', lado:'esq' }, conteudo:[{ tipo:'prateleiras', n:4, min:150 }] } },
          { medida:'auto', no:{ tipo:'dividir', dir:'h', sep:'divisoria', partes:[
            { medida:400, no:{ tipo:'dividir', dir:'h', sep:'nenhum', partes:[{ medida:200, no:{ tipo:'vao', frente:{ tipo:'gaveta' } } }, { medida:200, no:{ tipo:'vao', frente:{ tipo:'gaveta' } } }] } },
            { medida:'auto', no:{ tipo:'vao', frente:{ tipo:'porta', lado:'dir' }, conteudo:[{ tipo:'prateleiras', n:2, min:150 }] } } ] } } ] } };
      const res = c.gerarModuloV3(m);
      // Sub-etapa 4b: trocar o método de construção refaz as peças sem redesenhar
      const peca = (r_, papel, lado) => r_.pecas.find(p => p.papel === papel && (!lado || p.lado === lado));
      const comMetodo = (nome, aj) => c.gerarModuloV3({ ...m, metodo:nome, metodoAjustes:{ ...m.metodoAjustes, ...aj } });
      const e1 = comMetodo('topo-base-passantes', {}), e2 = comMetodo('fundo-rasgo', {}), e3 = comMetodo('armario-atual', { prateleira:{ furacao:'faixa32' } });
      // fundo pela chapa de mercado e pelo transporte: armário 1800 × 1920 → 2 peças de 900 (emenda na divisória do meio), as duas numa chapa 2750 × 2130
      const armL = c.gerarModuloV3({ ...c.CONVERSORES_V3.armario({ ...c.TIPOS.armario.padrao }), metodo:'fundo-hdf', metodoAjustes:{ rodape:{ altura:100, recuo:40 }, apoio:'rodape', topo:'inteiro', fixacao:'por-vao' } });
      const fundosL = armL.pecas.filter(p => p.papel === 'fundo').map(p => [p.mat, p.esp, r(p.comp), r(p.larg), r(p.box[0]), r(p.box[1])]);
      // sem divisória no caminho (1 vão de 3000): 3 peças iguais (transporte) com 2 perfis H plásticos
      const sem = c.gerarModuloV3({ ...m, largura:3000, metodo:'fundo-hdf', raiz:{ tipo:'vao', frente:{ tipo:'nenhuma' }, conteudo:[] } });
      // pés reguláveis + rodapé de encaixe
      const pes = c.gerarModuloV3({ ...m, metodo:'padrao-nathan-cozinha-banheiro', metodoAjustes:{} });
      // transporte e volumes (limite por projeto; montado × desmontado)
      const baseArm = { ...c.CONVERSORES_V3.armario({ ...c.TIPOS.armario.padrao }), metodo:'fundo-hdf', metodoAjustes:{ rodape:{ altura:100, recuo:40 }, apoio:'rodape', topo:'inteiro', fixacao:'por-vao' } };
      const tMont = c.gerarModuloV3({ ...baseArm, entrega:'montado' }), t2000 = c.gerarModuloV3({ ...baseArm, transporte:{ menorLadoMax:2000 } }), t400 = c.gerarModuloV3({ ...baseArm, transporte:{ menorLadoMax:350 } });
      const nF = r_ => r_.pecas.filter(p => p.papel === 'fundo').length;
      const transporte = {
        desmontado: { fundos: nF(armL), volumes: armL.volumes.length, lista: armL.volumes.map(v => [v.tipo, v.pecas.length, (v.dims||[]).map(Math.round), v.peso]), tipos: [...new Set(armL.volumes.map(v => v.tipo))], acima25: armL.volumes.filter(v => v.peso > 25 && !v.aviso).length, etiqueta: armL.volumes[0]?.etiqueta },
        montado: { fundos: nF(tMont), volumes: tMont.volumes.length },
        limite2000: { fundos: nF(t2000) },
        limite350: { avisoPorta: t400.avisos.some(a => a.includes('Porta')), avisoLateral: t400.avisos.some(a => a.includes('Lateral')) },
      };
      // 4c: frentes — correr (Dominus e RO-27), basculante, portas automáticas
      const vaoCom = (frente, o) => c.gerarModuloV3({ ...m, ...o, raiz:{ tipo:'vao', frente, conteudo:[] } });
      const gr = vaoCom({ tipo:'correr', sistema:'correr-rometal-dominus', n:2 }, { largura:1800, altura:2400, profundidade:600, metodo:'fundo-hdf' });
      const grLeve = vaoCom({ tipo:'correr', sistema:'correr-rometal-ro27', n:2 }, { largura:1800, altura:2400, profundidade:600, metodo:'fundo-hdf' });
      const bas = vaoCom({ tipo:'basculante' }, { largura:800, altura:450, profundidade:350 });
      const pAuto = vaoCom({ tipo:'portas', n:'auto' }, { largura:1200 });
      const pLado = vaoCom({ tipo:'porta', lado:'auto' }, { largura:500, construcao:{ paredeEsq:true } });
      const frentes = {
        correrDominus: { erros: gr.erros, portas: gr.pecas.filter(p => p.papel === 'porta-correr').map(p => [r(p.comp), r(p.larg)]), desempenadores: gr.pecas.filter(p => p.papel === 'desempenador').length, trilhos: gr.pecas.filter(p => p.papel === 'trilho-correr').length, semFuncao: gr.pecas.filter(p => !p.papel).map(p => p.id) },
        correrRO27: { erroPeso: grLeve.erros.some(e => e.includes('kg passa do máximo')) },
        basculante: { erros: bas.erros, pistoes: bas.pecas.filter(p => p.papel === 'pistao').map(p => p.ref), semFuncao: bas.pecas.filter(p => !p.papel).map(p => p.id) },
        portasAuto: pAuto.pecas.filter(p => p.papel === 'porta').map(p => [r(p.larg), p.mov.lado]),
        ladoAuto: pLado.pecas.find(p => p.papel === 'porta')?.mov.lado,
      };
      // 4d: dobradiças por altura/peso/largura, junção minifix/cavilha, kits nas compras
      const portaDe = (o) => { const r_ = vaoCom({ tipo:'porta', lado:'esq' }, o), pt = r_.pecas.find(p => p.papel === 'porta'); return [r(pt.comp), r(pt.larg), r_.pecas.filter(p => p.papel === 'dobradica').length]; };
      const jMf = c.gerarModuloV3({ ...m, metodoAjustes:{ ...m.metodoAjustes, juncao:'minifix' } }), jCv = c.gerarModuloV3({ ...m, metodoAjustes:{ ...m.metodoAjustes, juncao:'cavilha+minifix' } });
      const tipos = (r_, papel, lado) => { const p = r_.pecas.find(q => q.papel === papel && (!lado || q.lado === lado)); return (p?.des?.furos || []).reduce((a, f) => (a[f.tipo] = (a[f.tipo] || 0) + 1, a), {}); };
      const cmp = (r_, ref) => r_.compras.find(x => x.ref === ref)?.qtd || 0;
      const ferragem = {
        dobradicas: { alta: portaDe({ largura:500, altura:2400, profundidade:600 }), baixa: portaDe({ largura:450, altura:800 }), larga: portaDe({ largura:700, altura:800 }) },
        minifix: { lateral: tipos(jMf, 'lateral', 'esq'), base: tipos(jMf, 'base'), compra: cmp(jMf, 'minifix-15'), semFuncao: jMf.pecas.filter(p => !p.papel).map(p => p.id) },
        cavMinifix: { lateral: tipos(jCv, 'lateral', 'esq'), cavilhas: cmp(jCv, 'cavilha-8x30'), minifix: cmp(jCv, 'minifix-15') },
        kits: { dob: cmp(res, 'dob-blum-71B3550'), calco: cmp(res, 'calco-blum-0'), paraf: cmp(res, 'paraf-35x14'), corredicas: cmp(res, 'corr-tel45-amort'), nCorr: res.pecas.filter(p => p.papel === 'corredica').length },
        concha: gr.pecas.filter(p => p.papel === 'puxador').map(p => p.ref),
      };
      // 4e: material por grupo, veio, fita por lado, medida de corte; plano não gira peça com veio
      const mad = c.gerarModuloV3({ ...m, materiais:{ frentes:'mdf-amadeirado' } }), basMad = c.gerarModuloV3({ ...m, largura:800, altura:450, profundidade:350, materiais:{ frentes:'mdf-amadeirado' }, raiz:{ tipo:'vao', frente:{ tipo:'basculante' }, conteudo:[] } });
      const planoMad = c.planoDeCorte(mad.pecas), planoBas = c.planoDeCorte(basMad.pecas);
      const comVeio = pl => pl.materiais.flatMap(mm => mm.chapas.flatMap(ch => ch.pecas)).filter(p => (mad.pecas.concat(basMad.pecas)).find(q => q.id === p.id && q.veio));
      const pt0 = mad.pecas.find(p => p.papel === 'porta'), basP = basMad.pecas.find(p => p.papel === 'porta-basculante');
      const acabamento = {
        frentesMat: [...new Set(mad.pecas.filter(p => p.cat === 'frente').map(p => p.mat))], caixaMat: mad.pecas.find(p => p.papel === 'lateral').mat,
        veioPorta: pt0.veio, veioBasculante: basP.veio, giradas: comVeio(planoMad).concat(comVeio(planoBas)).filter(p => p.giro).length,
        basNoPlano: (() => { const p = planoBas.materiais.flatMap(mm => mm.chapas.flatMap(ch => ch.pecas)).find(p => p.id === basP.id); return p && [r(p.w), r(p.h)]; })(), basMedida: [r(basP.comp), r(basP.larg)],
        porta: { medida: [r(pt0.comp), r(pt0.larg)], corte: [r(pt0.corte.comp), r(pt0.corte.larg)], fita: pt0.fitaLados, loja: pt0.medidaLoja.tipo },
        lateral: { fita: mad.pecas.find(p => p.papel === 'lateral').fitaLados, veio: mad.pecas.find(p => p.papel === 'lateral').veio },
      };
      const pinos = r_ => peca(r_, 'lateral', 'esq').des.furos.filter(f => f.tipo === 'pino').length;
      const metodo = {
        passantes: { topo: peca(e1,'topo').comp, base: peca(e1,'base').comp, lateral: peca(e1,'lateral','esq').comp, erros: e1.erros.length },
        rasgo: { fundo: [peca(e2,'fundo').comp, peca(e2,'fundo').larg], fundoZ: peca(e2,'fundo').box.slice(4), lateralFundo: peca(e2,'lateral','esq').larg, divisoria: peca(e2,'divisoria-vertical').larg, canais: e2.pecas.filter(p => p.des?.canais?.length).length, erros: e2.erros.length },
        pinos: { quatroFuros: pinos(res), faixa32: pinos(e3) },
        origem: c.resolverMetodo({ ...m, metodo:'fundo-rasgo' }).origem.fundo,
        fundoDividido: fundosL, perfilH: sem.pecas.filter(p => p.papel === 'emenda-fundo').length, montante: sem.pecas.filter(p => p.id.startsWith('reforco-emenda')).length, chapaFundo: [armL, sem].map(x => x.pecas.find(p => p.papel === 'fundo').chapaRef), fundosSem: sem.pecas.filter(p => p.papel === 'fundo').map(p => r(p.larg)),
        pes: pes.pecas.filter(p => p.papel === 'pe').length, rodapeEncaixe: pes.pecas.some(p => p.id === 'rodape-encaixe'), semFuncao: [...armL.pecas, ...sem.pecas, ...pes.pecas].filter(p => !p.papel).map(p => p.id),
      };
      return { metodo, transporte, frentes, ferragem, acabamento, erros: res.erros, avisos: res.avisos, pecas: res.pecas.map(p => ({ id:p.id, papel:p.papel, comp:r(p.comp), larg:r(p.larg), box:(p.box||[]).map(r), furos:(p.des?.furos||[]).length })) };
    });
    if (erros.length) atual.errosDaPagina = erros;
    const esp = { passantes: { topo:1200, base:1200, lateral:1864, erros:0 }, rasgo: { fundo:[1879, 1179], fundoZ:[10, 16], lateralFundo:482, divisoria:466, canais:4, erros:0 } };
    const dm = diferencas(esp, { passantes: atual.metodo.passantes, rasgo: atual.metodo.rasgo });
    const mt = atual.metodo;
    const fundoOk = JSON.stringify(mt.fundoDividido) === JSON.stringify([['hdf-cru',3,1920,900,0,900],['hdf-cru',3,1920,900,900,1800]]) && mt.montante === 0 && mt.perfilH === 2 && mt.fundosSem.length === 3 && mt.fundosSem.every(w => w <= 1220) && mt.chapaFundo.every(x => x === 'chapa-hdf-cru-3-2750x2130') && mt.pes >= 4 && mt.rodapeEncaixe && !mt.semFuncao.length;
    const fg = atual.ferragem;
    const fgOk = fg.dobradicas.alta[2] === 5 && fg.dobradicas.baixa[2] === 2 && fg.dobradicas.larga[2] === 4
      && fg.minifix.base['minifix-tambor'] === fg.minifix.base['minifix-canal'] && fg.minifix.base['minifix-tambor'] > 0 && !fg.minifix.lateral.montagem_base && fg.minifix.compra > 0 && !fg.minifix.semFuncao.length
      && fg.cavMinifix.cavilhas > 0 && fg.cavMinifix.minifix > 0 && fg.kits.dob === fg.kits.calco && fg.kits.paraf === 4*fg.kits.dob + 12*fg.kits.corredicas && fg.kits.corredicas * 2 === fg.kits.nCorr
      && fg.concha.length === 2 && fg.concha.every(x => x === 'pux-zen-shell-64');
    if (!fgOk) { falhas++; console.log('FERRAGEM (4d) ERRADO  ' + JSON.stringify(fg)); } else console.log('FERRAGEM (4d) OK  ' + JSON.stringify(fg));
    const ac = atual.acabamento;
    const acOk = ac.frentesMat.join() === 'mdf-amadeirado' && ac.caixaMat !== 'mdf-amadeirado' && ac.veioPorta === 'comp' && ac.veioBasculante === 'larg' && ac.giradas === 0
      && ac.basNoPlano && ac.basNoPlano[0] === ac.basMedida[1] && Math.abs(ac.porta.corte[0] - (ac.porta.medida[0] - 0.9)) < 0.11 && Math.abs(ac.porta.corte[1] - (ac.porta.medida[1] - 0.9)) < 0.11
      && ac.porta.loja === 'final' && ac.lateral.veio === null && ac.lateral.fita.C1 === 0.45 && ac.lateral.fita.L1 === 0;
    if (!acOk) { falhas++; console.log('ACABAMENTO (4e) ERRADO  ' + JSON.stringify(ac)); } else console.log('ACABAMENTO (4e) OK  ' + JSON.stringify(ac));
    const fr4c = atual.frentes;
    const frOk = !fr4c.correrDominus.erros.length && fr4c.correrDominus.portas.length === 2 && fr4c.correrDominus.desempenadores === 4 && fr4c.correrDominus.trilhos === 2 && !fr4c.correrDominus.semFuncao.length
      && fr4c.correrRO27.erroPeso && !fr4c.basculante.erros.length && fr4c.basculante.pistoes.length === 2 && fr4c.basculante.pistoes.every(x => /^pistao-gas-\d+$/.test(x)) && !fr4c.basculante.semFuncao.length
      && fr4c.portasAuto.length === 2 && fr4c.portasAuto[0][1] === 'esq' && fr4c.portasAuto[1][1] === 'dir' && fr4c.ladoAuto === 'dir';
    if (!frOk) { falhas++; console.log('FRENTES (4c) ERRADO', JSON.stringify(fr4c)); } else console.log('FRENTES (4c) OK  ' + JSON.stringify(fr4c));
    const tr = atual.transporte;
    const trOk = tr.desmontado.fundos === 2 && tr.desmontado.acima25 === 0 && tr.desmontado.tipos.join() === 'frentes,caixa,ferragens e parafusos' && tr.montado.fundos === 1 && tr.montado.volumes === 1 && tr.limite2000.fundos === 1 && tr.limite350.avisoPorta && tr.limite350.avisoLateral;
    if (!trOk) { falhas++; console.log('TRANSPORTE/VOLUMES ERRADO', JSON.stringify(tr)); } else console.log('TRANSPORTE E VOLUMES OK  ' + JSON.stringify(tr));
    if (!fundoOk) { falhas++; console.log('FUNDO/PÉS ERRADO', JSON.stringify({ fundoDividido: mt.fundoDividido, montante: mt.montante, perfilH: mt.perfilH, chapa: mt.chapaFundo, fundosSem: mt.fundosSem, pes: mt.pes, rodape: mt.rodapeEncaixe, semFuncao: mt.semFuncao })); }
    else console.log('FUNDO PELA CHAPA DE MERCADO E PÉS OK  ' + JSON.stringify({ fundoDividido: mt.fundoDividido, chapa: mt.chapaFundo, fundosSem: mt.fundosSem, perfilH: mt.perfilH, pes: mt.pes }));
    if (dm.length || !(atual.metodo.pinos.faixa32 > atual.metodo.pinos.quatroFuros) || atual.metodo.origem !== 'método "Fundo em rasgo"') { falhas++; console.log('MÉTODO DE CONSTRUÇÃO ERRADO', JSON.stringify(atual.metodo)); dm.forEach(x => console.log('   ' + x)); }
    else console.log('MÉTODO DE CONSTRUÇÃO OK  ' + JSON.stringify(atual.metodo));
    const arq = path.join(__dirname, 'referencia', 'nucleo-armario-misto.json');
    const semFuncao = atual.pecas.filter(p => !p.papel).map(p => p.id);
    if (semFuncao.length || atual.erros.length || erros.length) { falhas++; console.log('NÚCLEO (móvel novo) COM PROBLEMA', JSON.stringify({ semFuncao, erros: atual.erros, pagina: erros })); }
    else if (atualizar || !fs.existsSync(arq)) { fs.writeFileSync(arq, JSON.stringify(atual, null, 1)); console.log(`GRAVADO  nucleo-armario-misto  (${atual.pecas.length} peças)`); }
    else { const d = diferencas(JSON.parse(fs.readFileSync(arq, 'utf8')), atual); if (d.length) { falhas++; console.log(`MUDOU    nucleo-armario-misto  (${d.length})`); d.slice(0, 10).forEach(x => console.log('   ' + x)); } else console.log('IGUAL    nucleo-armario-misto'); }
    await page.close();
  }
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
      return route.abort();
    });
    await page.goto('http://teste/');
    await page.waitForFunction(() => window.__configurador?.estado?.res, null, { timeout: 20000 });
    await page.selectOption('#tipoMovel', 'modulo'); await page.waitForTimeout(500);
    const passo = async (sel) => { await page.click(sel); await page.waitForTimeout(250); };
    const foto = () => page.evaluate(() => { const e = window.__configurador.estado, r = e.res;
      return { erros: r.erros, vaos: (r.vaos || []).length, botoesEsquema: document.querySelectorAll('#esquema button[data-cam]').length, espacos: document.querySelectorAll('#form .ed-espaco:not(.divisao)').length,
        gavetas: r.pecas.filter(p => p.papel === 'frente-gaveta').length, prateleiras: r.pecas.filter(p => p.papel === 'prateleira').length, semFuncao: r.pecas.filter(p => !p.papel).map(p => p.id), ferragens: r.ferragens.length }; });
    const inicio = await foto();
    await passo('#esquema button[data-cam=".1"]');                   // clica no vão 2 do desenho
    await passo('[data-acao="dividir-h"]');                          // divide deitado
    await passo('#esquema button[data-cam=".1.0"]');                 // parte de baixo
    await passo('[data-acao="frente"][data-valor="gaveta"]');        // vira gaveta
    const depois = await foto();
    await passo('[data-acao="remover"]');                            // junta de novo
    const juntou = await foto();
    await passo('#etapas [data-etapa="plano"]');
    const abas = await page.evaluate(() => ({ montar: document.querySelector('[data-secao="montar"]').hidden, plano: document.querySelector('[data-secao="plano"]').hidden }));
    const t5 = { inicio, depois, juntou, abas, paginaErros: erros };
    const ok5 = !inicio.erros.length && inicio.vaos === 4 && inicio.botoesEsquema === 4 && inicio.espacos === 4 && inicio.ferragens > 0 && !inicio.semFuncao.length
      && depois.vaos === 5 && depois.gavetas === inicio.gavetas + 1 && !depois.semFuncao.length && juntou.vaos === 4 && abas.montar && !abas.plano && !erros.length;
    if (!ok5) { falhas++; console.log('TELA DO MÓVEL LIVRE (5a) ERRADO  ' + JSON.stringify(t5)); } else console.log('TELA DO MÓVEL LIVRE (5a) OK  ' + JSON.stringify(t5));
    // 5b: ambiente — cozinha em L de teste
    await passo('#etapas [data-etapa="montar"]');
    await page.selectOption('#tipoMovel', 'ambiente'); await page.waitForTimeout(800);
    const fotoA = () => page.evaluate(() => { const r = window.__configurador.estado.res;
      return { erros: r.erros, avisos: r.avisos.length, canto: r.avisos.some(x => /^Canto/.test(x)), esgoto: r.avisos.some(x => /cobre o esgoto/.test(x)), recorte: r.pecas.some(p => p.forma?.tipo === 'recorte'),
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
    const ok5b = !cozinha.erros.length && cozinha.canto && cozinha.esgoto && cozinha.recorte && cozinha.modulos === 8 && cozinha.tampos === 2 && !cozinha.semFuncao.length && cozinha.naPlanta === 8 && cozinha.chapas > 0
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
    if (!ok5c) { falhas++; console.log('LOJA E ETIQUETAS (5c) ERRADO  ' + JSON.stringify(loja)); } else console.log('LOJA E ETIQUETAS (5c) OK  ' + JSON.stringify(loja));
    if (!ok5b) { falhas++; console.log('AMBIENTE (5b) ERRADO  ' + JSON.stringify(t5b)); } else console.log('AMBIENTE (5b) OK  ' + JSON.stringify(t5b));
    await page.close();
  }
  await b.close();
  if (falhas) { console.log(`\n${falhas} caso(s) mudaram. Se a mudança foi de propósito: npm run atualizar-referencia`); process.exit(1); }
  console.log('\nTodos os casos iguais à referência.');
})();
