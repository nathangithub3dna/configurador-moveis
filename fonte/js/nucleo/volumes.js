/* VOLUMES — embalagem simulada (versão simples): frentes num volume próprio, caixa em pilhas
   (a maior peça embaixo define a base; pilha nova acima do peso ou da altura), ferragens numa caixa. */
const pesoPeca = q => q.comp * q.larg * q.esp * ((q.mat || '').startsWith('hdf') ? R.densidade.hdf : R.densidade.mdf) / 1e9;
function volumesDe(pecas, { montado, L, H, P, A }) {
  const Em = R.embalagem, mg = Em.margem, vol = [];
  const mdf = pecas.filter(q => q.lista), ferr = pecas.filter(q => !q.lista);
  if (montado) {
    vol.push({ tipo:'módulo montado', pecas: pecas.map(q => q.id), dims:[L + 2*mg, H + 2*mg, P + 2*mg], peso: mdf.reduce((s, q) => s + pesoPeca(q), 0) });
  } else {
    const empilhar = (lista, tipo) => {
      const pilhas = [];
      [...lista].sort((a, b) => b.comp*b.larg - a.comp*a.larg).forEach(q => {
        const w = pesoPeca(q);
        if (w > Em.pesoMax) { vol.push({ tipo, pecas:[q.id], dims:[q.comp + 2*mg, q.larg + 2*mg, q.esp + 2*mg], peso:w, aviso:'carregar a dois' }); A.push(`Volume: ${q.nome} pesa ${fmt(w)} kg sozinha — carregar a dois.`); return; }
        const pl = pilhas.find(p => q.comp <= p.base[0] && q.larg <= p.base[1] && p.peso + w <= Em.pesoMax && p.alt + q.esp <= Em.alturaMax);
        if (pl) { pl.pecas.push(q.id); pl.peso += w; pl.alt += q.esp; }
        else pilhas.push({ base:[q.comp, q.larg], pecas:[q.id], peso:w, alt:q.esp });
      });
      pilhas.forEach(p => vol.push({ tipo, pecas:p.pecas, dims:[p.base[0] + 2*mg, p.base[1] + 2*mg, p.alt + 2*mg], peso:p.peso }));
    };
    empilhar(mdf.filter(q => q.cat === 'frente'), 'frentes');
    empilhar(mdf.filter(q => q.cat !== 'frente'), 'caixa');
    if (ferr.length) vol.push({ tipo:'ferragens e parafusos', pecas: ferr.map(q => q.id), dims:null, peso:null });
  }
  vol.forEach((v, i) => { v.num = i + 1; v.etiqueta = `Volume ${i + 1} de ${vol.length}`; v.peso = v.peso === null ? null : Math.round(v.peso * 10) / 10; });
  return vol;
}
