/* VALIDAÇÕES DO MÓDULO — avisos de transporte (peças que não podem ser divididas não mudam). */

function avisarTransporte(ctx) {
  const { A, H0, L, P, limT, montado, pecas } = ctx;
  // TRANSPORTE: avisos (peças que não podem ser divididas não mudam)
  if (montado) { const ml = Math.min(L, H0, P); if (ml > limT) A.push(`Transporte: o módulo montado tem o menor lado de ${fmt(ml)} mm (limite do projeto ${fmt(limT)}).`); }
  else pecas.filter(q => q.lista && q.papel !== 'fundo' && Math.min(q.comp, q.larg) > limT)
    .forEach(q => A.push(`Transporte: ${q.nome} tem ${fmt(q.comp)} × ${fmt(q.larg)} mm (menor lado acima do limite de ${fmt(limT)}).`));
  const fundosT = pecas.filter(q => q.papel === 'fundo').length;
  if (!montado && fundosT > 3) A.push(`Transporte: com o limite de ${fmt(limT)} mm o fundo ficou em ${fundosT} peças (${fundosT - 1} emendas). Confira se o limite não está baixo demais.`);
}
