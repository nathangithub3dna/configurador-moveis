/* MÓVEL LIVRE (5a) — o móvel montado pela tela: módulo + árvore de vãos, gerado pelo núcleo novo.
   O resultado ganha ferragens, fixações e medidas no mesmo formato do gabinete e do armário,
   para as listas, o plano de corte, as compras, os desenhos e o 3D funcionarem igual. */
function resultadoModulo(r, m) {
  const c = resolverMetodo(m), soma = new Map(), add = (ref, q) => { if (q > 0 && BIBLIOTECA[ref]) soma.set(ref, (soma.get(ref) || 0) + q); };
  r.compras.filter(l => BIBLIOTECA[l.ref]?.unid !== 'chapa').forEach(l => add(l.ref, l.qtd));
  add('pino-5', r.pecas.filter(q => q.papel === 'prateleira').length * 4);
  const fx = calcularFixacoes(r.pecas), red10 = v => Math.ceil(v*1.2/10)*10;
  ['paraf-40x50','paraf-40x30','paraf-35x14','paraf-35x25','paraf-50x60-bucha','cavilha-8x30'].forEach(t => { const n = fx.filter(f => f.tipo === t).length; add(t, t.startsWith('paraf-4') || t === 'paraf-35x14' ? red10(n) : n); });
  const fitaMm = r.pecas.filter(q => q.lista).reduce((s, q) => s + q.fita[0]*q.comp + q.fita[1]*q.larg, 0);
  add(c.espMDF <= 19 ? 'fita-pvc-22' : 'fita-pvc-35', Math.ceil(fitaMm*R.perdaFita/1000));
  r.ferragens = [...soma.entries()].map(([ref, qtd]) => { const b = BIBLIOTECA[ref];
    return { ref, item: b.nome + (b.marca ? ` — ${b.marca}${b.codigo ? ' ' + b.codigo : ''}` : ''), nome:b.nome, marca:b.marca, codigo:b.codigo, qtd, unid: b.metro ? 'm' : (b.unid === 'par' ? 'par' : 'un'), obs: b.metro ? 'metros, com 10% de perda' : (b.obs || ''), var:'' }; });
  r.fixacoes = fx;
  r.dims = { L:m.largura, H:m.altura, P:m.profundidade, t:c.espMDF, top:m.altura, faixaEsgoto:null, paredeEsq:!!c.paredeEsq, paredeDir:!!c.paredeDir, alturaTampo:m.altura };
  if (m.altura > 1800) r.avisos.push('Móvel alto: fixe na parede antes de colocar peso (risco de tombar).');
  return r;
}
TIPOS.modulo = {
  nomePadrao:'Móvel novo', nome:'Móvel livre (pela tela)', grupos:[], editor:'modulo',
  padrao: JSON.parse(JSON.stringify({ ...moduloDeArmario(TIPOS.armario.padrao), metodo:'padrao-nathan', metodoAjustes:{}, entrega:'desmontado' })),
  gerar: p => resultadoModulo(gerarModuloV3(p), p),
};
