// Sapateira embaixo das vassouras (pedido do Nathan): níveis de altura livre 'h' a partir do chão do vão (y0);
// a última prateleira da sapateira é o piso das vassouras, que precisam de 'livreVassoura' até o teto do vão (y1).
// 'max' > 0 limita o número de níveis (0 = quantos couberem). Devolve a base de cada prateleira e o piso das vassouras.
function sapateiraEmbaixo(y0, y1, t, h, max, livreVassoura = 1200) {
  const cabe = Math.max(0, Math.floor((y1 - y0 - livreVassoura) / (h + t))), n = max > 0 ? Math.min(cabe, Math.round(max)) : cabe;
  const ys = Array.from({ length:n }, (_, k) => y0 + h*(k+1) + t*k), piso = n ? ys[n-1] + t : y0;
  return { n, cabe, pedido:max, h, ys, piso, livre: y1 - piso, livreVassoura };
}
const avisoSapateira = (V, sap) => [
  `Vão ${V}: sapateira embaixo com ${sap.n} níve${sap.n > 1 ? 'is' : 'l'} de ${fmt(sap.h)} mm; vassouras em cima, com ${fmt(sap.livre)} mm livres.`,
  ...(sap.pedido > sap.cabe ? [`Vão ${V}: pediu ${Math.round(sap.pedido)} níveis na sapateira, mas com as vassouras em cima (${fmt(sap.livreVassoura)} mm) só cabem ${sap.cabe}.`] : []) ];

// Sapateira independente: usa o vão inteiro, sem reservar espaço para vassouras.
registrarConteudo({ id:'sapateira', gerar(ctx, ct, est) {
  const { g, V } = est, nivel = Number(ct.nivel), max = Number(ct.max) || 0;
  if (!(nivel > 0) || !Number.isFinite(nivel)) { ctx.E.push(`Vão ${V}: informe uma altura positiva para os níveis da sapateira.`); return; }
  const sap = sapateiraEmbaixo(est.y, g.iy1, ctx.t, nivel, max, 0);
  if (!sap.n) ctx.E.push(`Vão ${V}: não cabe um nível de ${fmt(nivel)} mm na sapateira.`);
  if (max > sap.cabe) ctx.A.push(`Vão ${V}: pediu ${Math.round(max)} níveis na sapateira, mas só cabem ${sap.cabe}.`);
  sap.ys.forEach(y => ctx.prateleira(g, V, ++est.kPrat, y, `Prateleira ${est.kPrat} da sapateira`));
  est.y = sap.piso;
} });
registrarEscolha({ grupo:'conteudo', id:'sapateira', rotulo:'Sapateira', ordem:40, prioridade:29,
  icone:'<rect x="4" y="3" width="26" height="34"/><path d="M4 12h26M4 23h26M4 34h26M9 9h7l-2-3M19 20h7l-2-3M9 31h7l-2-3"/>',
  reconhece: no => (no.conteudo || []).some(c => c.tipo === 'sapateira'),
  aplicar(no) { no.conteudo = [{ tipo:'sapateira', nivel:TIPOS.armario.padrao.alturaNivelSapateira, max:0 }]; } });

// Permite editar a sapateira independente e os conjuntos de projetos antigos.
function sapateiraDoVao(no) {
  return (no.conteudo || []).find(c => c.tipo === 'sapateira') || (no.conteudo || []).find(c => c.sapateira)?.sapateira;
}
