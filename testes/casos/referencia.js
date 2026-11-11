// Formulários: gabinete e armário. Movido da suíte original; mesmas entradas e verificações.
const fs = require('fs');
const path = require('path');
const { resumo, diferencas } = require('../apoio/comparacao');
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


module.exports = { id:'referencia', descricao:"Formulários: gabinete e armário", async executar({ ctx, pagina, nm, raiz, atualizar, tipoFormulario }) {
  let falhas = 0;
  for (const caso of CASOS.filter(c => !tipoFormulario || c.tipo === tipoFormulario)) {
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
    const arq = path.join(raiz, 'testes', 'referencia', caso.nome + '.json');
    if (!atualizar && !fs.existsSync(arq)) { falhas++; console.log('REFERÊNCIA AUSENTE  ' + arq); }
    else if (atualizar) {
      fs.writeFileSync(arq, JSON.stringify(atual, null, 1));
      console.log(`GRAVADO  ${caso.nome}  (${atual.pecas.length} peças, ${atual.erros.length} erros)`);
    } else {
      const d = diferencas(JSON.parse(fs.readFileSync(arq, 'utf8')), atual);
      if (d.length) { falhas++; console.log(`MUDOU    ${caso.nome}  (${d.length} diferenças)`); d.slice(0, 15).forEach(x => console.log('   ' + x)); }
      else console.log(`IGUAL    ${caso.nome}`);
    }
    await page.close();
  }

  return falhas;
} };
