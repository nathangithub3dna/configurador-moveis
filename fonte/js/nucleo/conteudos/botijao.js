// CONTEÚDO DO VÃO: botijao — compartimento do botijão P13: confere medidas, tampo fixo e ventilação na lateral externa
// ctx = medidas e funções do módulo (nucleo/gerar-modulo.js); est = o vão e o que já foi ocupado de baixo para cima
registrarConteudo({ id:'botijao', gerar(ctx, ct, est) {
  const { t, Dc, zf, zFr, E, A, add, prateleira, regiao0, ventilacao } = ctx;
  const { V, x0, x1, w, xm } = est;
  let { y } = est;
    const hB = ct.altura;
    if (hB < 520) E.push(`Vão ${V}: altura livre do botijão de ${fmt(hB)} mm é pouca (mínimo 520).`);
    if (w < 390) E.push(`Vão ${V}: largura de ${fmt(w)} mm não passa o botijão P13.`);
    if (Dc < 370) E.push(`Profundidade interna de ${fmt(Dc)} mm não comporta o botijão P13.`);
    add({ id:`botijao-${V}`, nome:'Botijão P13 (referência)', cat:'referencia', mat:'mdf-branco', lista:false, forma:{ tipo:'cil', eixo:'y' }, box:[xm-180, xm+180, y, y+480, zf+(Dc-360)/2, zf+(Dc+360)/2] });
    const yf = y + hB;
    add({ id:`prateleira-fixa-${V}`, nome:'Tampo do compartimento do botijão', nomeLista:'Prateleira fixa', cat:'caixa', a:w, b:Dc, fita:[1,0], box:[x0, x1, yf, yf+t, zf, zFr], des:{ w, h:Dc, fita:['b'], frente:'b', vista:'Vista de cima' } });
    if (Math.abs(x1 - regiao0.ix1) < 0.5) ventilacao.push({ lado:'dir', y0:y, hB }); else A.push('O botijão não encosta na lateral externa: a ventilação não alcança o compartimento.');
    y = yf + t;
  est.y = y;
} });

registrarEscolha({ grupo:'conteudo', id:'gavetas+botijao', rotulo:'Botijão + gavetas', ordem:60, prioridade:10, icone:'<rect x="4" y="3" width="26" height="34"/><rect x="7" y="6" width="20" height="5"/><rect x="11" y="18" width="12" height="17" rx="5"/>',
  reconhece: no => (no.conteudo || []).some(c => c.tipo === 'botijao'),
  aplicar(no, m) { no.conteudo = [{ tipo: 'botijao', altura: TIPOS.armario.padrao.alturaBotijao }, ...gavetasEAcima(m)]; } });
