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


module.exports = { resumo, diferencas };
