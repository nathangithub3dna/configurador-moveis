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
  { nome: 'armario-vassoura-sapateira', tipo: 'armario', mudar: { vaos: 'vassoura+sapateira, prateleiras, prateleiras, gavetas+botijao' } },
  { nome: 'armario-sapateira-1-nivel', tipo: 'armario', mudar: { vaos: 'vassoura+sapateira, prateleiras, prateleiras, gavetas+botijao', niveisSapateira: 1 } },
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
  // Se o navegador da versão do Playwright não estiver instalado (nuvem com outra versão),
  // usa o Chromium que existir em PLAYWRIGHT_BROWSERS_PATH.
  const opcoes = { args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] };
  let b;
  try { b = await chromium.launch(opcoes); }
  catch (e) {
    const fs = require('fs'), path = require('path');
    const base = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
    const achados = (fs.existsSync(base) ? fs.readdirSync(base) : []).filter(n => /^chromium-\d+$/.test(n)).sort().reverse()
      .flatMap(n => ['chrome-linux64/chrome', 'chrome-linux/chrome'].map(s => path.join(base, n, s))).filter(p => fs.existsSync(p));
    if (!achados.length) throw e;
    console.log('Navegador da versão esperada ausente; usando ' + achados[0]);
    b = await chromium.launch({ ...opcoes, executablePath: achados[0] });
  }
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
      if (u.includes('svg2pdf')) return route.fulfill({ path: nm('svg2pdf.js/dist/svg2pdf.umd.min.js'), contentType: 'application/javascript' });
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
      if (u.includes('svg2pdf')) return route.fulfill({ path: nm('svg2pdf.js/dist/svg2pdf.umd.min.js'), contentType: 'application/javascript' });
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
  // passo 3: versão sem internet — abre o arquivo direto (file://) com TODA a rede bloqueada
  {
    const page = await ctx.newPage(), errosOff = [], pedidos = [];
    page.on('pageerror', e => errosOff.push(e.message));
    await page.route('**/*', route => { const u = route.request().url(); if (u.startsWith('file:')) return route.continue(); pedidos.push(u.slice(0, 60)); return route.abort(); });
    await page.goto('file://' + path.join(__dirname, '..', 'configurador-offline.html'));
    let ok = true; try { await page.waitForFunction(() => window.__configurador?.estado?.res, null, { timeout: 20000 }); } catch (e) { ok = false; }
    const off = ok ? await page.evaluate(async () => { const c = window.__configurador, e = c.estado, pcs = e.res.pecas.filter(p => p.lista);
      const pdf = await c.folhasPDF(pcs.slice(0, 2), () => ({ projeto:'offline' })), etq = c.etiquetasPDF(e.res.pecas, e.codigos, 'offline');
      return { tipoInicial: e.projeto.tipo, pecas: pcs.length, canvas3D: !!document.querySelector('#palco canvas'), libs: { three: !!window.__configurador.cam, jspdf: !!window.jspdf, jszip: !!window.JSZip, qr: !!window.qrcode, svg2pdf: !!(window.svg2pdf || window.jspdf?.jsPDF?.API?.svg) },
        folhasKB: Math.round(pdf.byteLength / 1024), etiquetasKB: Math.round(etq.byteLength / 1024), zip: !document.getElementById('btnZip').disabled }; }) : null;
    const tamanhoMB = +(fs.statSync(path.join(__dirname, '..', 'configurador-offline.html')).size / 1048576).toFixed(1);
    const fontes = pedidos.filter(u => !/fonts\.(googleapis|gstatic)/.test(u));
    const okOff = ok && off && off.tipoInicial === 'modulo' && off.pecas > 0 && off.canvas3D && Object.values(off.libs).every(Boolean) && off.folhasKB > 3 && off.etiquetasKB > 3 && off.zip && !errosOff.length && !fontes.length;
    const t = { carregou: ok, ...off, tamanhoMB, pedidosBloqueados: pedidos.length, foraDeFontes: fontes, erros: errosOff };
    if (!okOff) { falhas++; console.log('SEM INTERNET ERRADO  ' + JSON.stringify(t)); } else console.log('SEM INTERNET OK  ' + JSON.stringify(t));
    await page.close();
  }
  // reabrir com o projeto guardado no aparelho: cada tipo precisa abrir de novo sem erro
  // (o celular do Nathan travou ao reabrir num Ambiente; os outros casos começam com nada guardado)
  {
    const page = await ctx.newPage(), errosRe = [], arq = 'file://' + path.join(__dirname, '..', 'configurador-offline.html'), res = {};
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
    await page.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
    const okRe = tipos.length > 1 && Object.values(res).every(v => v === 'ok');
    if (!okRe) { falhas++; console.log('REABRIR COM PROJETO GUARDADO ERRADO  ' + JSON.stringify(res)); } else console.log('REABRIR COM PROJETO GUARDADO OK  ' + JSON.stringify(res));
    await page.close();
  }
  await b.close();
  if (falhas) { console.log(`\n${falhas} caso(s) mudaram. Se a mudança foi de propósito: npm run atualizar-referencia`); process.exit(1); }
  console.log('\nTodos os casos iguais à referência.');
})();
