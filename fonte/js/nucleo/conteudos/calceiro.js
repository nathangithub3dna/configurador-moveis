// CONTEÚDO DO VÃO: calceiro — calceiro deslizante cromado (varetas + corrediça telescópica nas laterais) no alto do vão (item 13).
// Peça comprada pronta: vai nas compras com a largura e a profundidade do vão; não entra no plano de corte.
// ctx = medidas e funções do módulo (nucleo/gerar-modulo.js); est = o vão; est.yTeto = teto que sobrou
const CALCEIRO = { alto:45, distTeto:30, fundoMax:500, fundoMin:450, larguraMin:400, larguraMax:900, livre:600 };   // [Suposição] genérico (ex. real: Giosul 7 varetas, 44 mm, vão 450 × 500)

registrarConteudo({ id:'calceiro', gerar(ctx, ct, est) {
  const { zf, zFr, Dc, E, A, ferr } = ctx, C = CALCEIRO;
  const { g, V, x0, x1, w } = est, teto = est.yTeto ?? g.iy1;
  const y1 = teto - C.distTeto, y0 = y1 - C.alto, livre = y0 - est.y, fundo = Math.min(C.fundoMax, Dc - 20);
  if (livre < 300) { E.push(`Vão ${V}: não cabe calceiro — sobram ${fmt(Math.max(0, livre))} mm embaixo.`); return; }
  if (livre < C.livre) A.push(`Vão ${V}: calceiro com ${fmt(livre)} mm livres embaixo — calça dobrada pede uns ${C.livre} mm.`);
  if (Dc < C.fundoMin) A.push(`Vão ${V}: ${fmt(Dc)} mm de profundidade por dentro — calceiro deslizante pede uns ${C.fundoMin} mm.`);
  if (w < C.larguraMin || w > C.larguraMax) A.push(`Vão ${V}: calceiro para ${fmt(w)} mm de largura — os prontos costumam vir de ${C.larguraMin} a ${C.larguraMax} mm; confira na loja.`);
  ferr({ id:`vao-${V}-calceiro`, nome:`Calceiro deslizante do vão ${V}`, ref:'calceiro-deslizante', box:[x0, x1, y0, y1, zFr - fundo, zFr],
    obs:`Pedir para vão de ${fmt(w)} mm de largura por dentro e ${fmt(Dc)} mm de profundidade; topo a ${C.distTeto} mm do teto do vão.` });
  est.yTeto = y0;
} });

registrarEscolha({ grupo:'conteudo', id:'calceiro', rotulo:'Calceiro', ordem:53, prioridade:25,
  icone:'<rect x="4" y="3" width="26" height="34"/><rect x="6" y="7" width="22" height="4"/><path d="M9 11v14M13 11v18M17 11v14M21 11v18M25 11v14"/>',
  reconhece: no => (no.conteudo || []).some(c => c.tipo === 'calceiro'),
  aplicar(no) { no.conteudo = [{ tipo:'calceiro' }]; } });
