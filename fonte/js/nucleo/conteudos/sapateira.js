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

