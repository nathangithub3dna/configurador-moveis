// CONTEÚDO DO VÃO: cabideiro — tubo oval 30 × 15 mm cromado logo abaixo do teto do vão (item 13), 2 suportes laterais
// e 1 suporte central quando o tubo passa de 1 m. Avisa se falta altura para pendurar ou profundidade para o cabide.
// ctx = medidas e funções do módulo (nucleo/gerar-modulo.js); est = o vão; est.yTeto = teto que sobrou (o maleiro baixa o teto)
const CABIDEIRO = { alto:30, fundo:15, distTeto:55, folgaTubo:3, centralAcima:1000, livreCamisa:1000, livreLongo:1500, fundoCabide:500 };   // [Provável] medidas de mercado

registrarConteudo({ id:'cabideiro', gerar(ctx, ct, est) {
  const { zf, zFr, Dc, E, A, ferr } = ctx, C = CABIDEIRO;
  const { g, V, x0, x1, xm } = est, teto = est.yTeto ?? g.iy1;
  const dist = Number(ct.dist) > 0 ? Number(ct.dist) : C.distTeto;
  const yc = teto - dist, yb = yc - C.alto/2, livre = yb - est.y, zc = (zf + zFr)/2, comp = x1 - x0 - C.folgaTubo;
  if (livre < 300) { E.push(`Vão ${V}: não cabe cabideiro — sobram ${fmt(Math.max(0, livre))} mm abaixo do tubo.`); return; }
  if (livre < C.livreCamisa) A.push(`Vão ${V}: cabideiro com ${fmt(livre)} mm livres embaixo — camisa pede uns ${C.livreCamisa} mm e vestido longo uns ${C.livreLongo}.`);
  if (Dc < C.fundoCabide) A.push(`Vão ${V}: ${fmt(Dc)} mm de profundidade por dentro — o cabide pede uns ${C.fundoCabide} mm (a roupa encosta).`);
  ferr({ id:`vao-${V}-tubo-cabideiro`, nome:`Tubo cabideiro do vão ${V}`, ref:'tubo-oval-30x15', comp, forma:{ tipo:'cil', eixo:'x' },
    box:[x0 + C.folgaTubo/2, x1 - C.folgaTubo/2, yc - C.alto/2, yc + C.alto/2, zc - C.fundo/2, zc + C.fundo/2],
    obs:`Tubo oval 30 × 15 mm, cortar com ${fmt(comp)} mm; centro a ${fmt(dist)} mm do teto do vão.` });
  [['esq', x0], ['dir', x1 - 12]].forEach(([l, xs]) => ferr({ id:`vao-${V}-suporte-cabideiro-${l}`, nome:`Suporte do cabideiro (${l === 'esq' ? 'esquerdo' : 'direito'})`, ref:'suporte-tubo-oval-lateral',
    box:[xs, xs + 12, yc - 22, yc + 22, zc - 16, zc + 16] }));
  if (comp > C.centralAcima) ferr({ id:`vao-${V}-suporte-cabideiro-central`, nome:'Suporte central do cabideiro', ref:'suporte-tubo-oval-central',
    box:[xm - 10, xm + 10, yb, teto, zc - 9, zc + 9], obs:`Tubo com ${fmt(comp)} mm: suporte no meio, preso no teto do vão.` });
  est.yTeto = yb;
} });

registrarEscolha({ grupo:'conteudo', id:'cabideiro', rotulo:'Cabideiro', ordem:50, prioridade:27,
  icone:'<rect x="4" y="3" width="26" height="34"/><line x1="6" y1="9" x2="28" y2="9" stroke-width="2.4"/><path d="M12 9l-4 6h8zM22 9l-4 6h8z"/>',
  reconhece: no => (no.conteudo || []).some(c => c.tipo === 'cabideiro'),
  aplicar(no) { no.conteudo = [{ tipo:'cabideiro', dist:CABIDEIRO.distTeto }]; } });
