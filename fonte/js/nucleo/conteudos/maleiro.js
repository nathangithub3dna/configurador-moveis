// CONTEÚDO DO VÃO: maleiro — espaço de malas no alto do vão (item 13). Com o vão maior que o maleiro, uma prateleira
// fecha o maleiro e baixa o teto (est.yTeto) para o que vem depois (ex.: cabideiro logo abaixo). Vão do tamanho do maleiro: sem peça.
// ctx = medidas e funções do módulo (nucleo/gerar-modulo.js); est = o vão e o que já foi ocupado
const MALEIRO = { altura:500, minimo:400, malaGrande:600 };   // altura livre; [Provável] mala média ~400 mm, grande ~600 mm

registrarConteudo({ id:'maleiro', gerar(ctx, ct, est) {
  const { t, E, A, prateleira } = ctx;
  const { g, V } = est, teto = est.yTeto ?? g.iy1;
  const alt = Number(ct.altura) > 0 ? Number(ct.altura) : MALEIRO.altura;
  if (teto - est.y <= alt + t + 50) {                              // o vão inteiro é o maleiro
    const livre = teto - est.y;
    if (livre < MALEIRO.minimo) A.push(`Vão ${V}: maleiro com ${fmt(livre)} mm de altura — mala média pede uns ${MALEIRO.minimo} mm.`);
    est.yTeto = est.y; return;
  }
  if (alt < MALEIRO.minimo) A.push(`Vão ${V}: maleiro com ${fmt(alt)} mm de altura — mala média pede uns ${MALEIRO.minimo} mm (grande, ${MALEIRO.malaGrande}).`);
  const yb = teto - alt - t;
  if (yb - est.y < 300) E.push(`Vão ${V}: com o maleiro de ${fmt(alt)} mm sobram só ${fmt(yb - est.y)} mm embaixo.`);
  prateleira(g, V, ++est.kPrat, yb, 'Prateleira do maleiro');
  est.yTeto = yb;
} });

registrarEscolha({ grupo:'conteudo', id:'maleiro', rotulo:'Maleiro', ordem:52, prioridade:28,
  icone:'<rect x="4" y="3" width="26" height="34"/><line x1="4" y1="15" x2="30" y2="15"/><rect x="10" y="7" width="14" height="8" rx="1"/><path d="M15 7V5h4v2"/>',
  reconhece: no => (no.conteudo || []).some(c => c.tipo === 'maleiro'),
  aplicar(no) { no.conteudo = [{ tipo:'maleiro', altura:MALEIRO.altura }]; } });
registrarEscolha({ grupo:'conteudo', id:'maleiro+cabideiro', rotulo:'Maleiro + cabideiro', ordem:51, prioridade:26,
  icone:'<rect x="4" y="3" width="26" height="34"/><line x1="4" y1="12" x2="30" y2="12"/><rect x="11" y="5" width="12" height="7" rx="1"/><line x1="6" y1="16" x2="28" y2="16" stroke-width="2.4"/><path d="M12 16l-4 6h8zM22 16l-4 6h8z"/>',
  reconhece: no => (no.conteudo || []).some(c => c.tipo === 'maleiro') && (no.conteudo || []).some(c => c.tipo === 'cabideiro'),
  aplicar(no) { no.conteudo = [{ tipo:'maleiro', altura:MALEIRO.altura }, { tipo:'cabideiro', dist:CABIDEIRO.distTeto }]; } });
