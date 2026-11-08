/* =====================================================================
   SITUAÇÃO DO PROJETO E REVISÕES — estudo, aprovado pelo cliente, liberado
   para corte; o que mudou desde a revisão aprovada. Só lógica.

   - ESTUDO: nenhuma revisão aceita, ou o projeto mudou depois da última congelada.
   - APROVADO: a última revisão congelada tem o aceite do cliente e o projeto não mudou.
   - LIBERADO: aprovado + "Liberar para corte" (sem erros). Só aqui os documentos
     de fabricação saem sem o aviso "NÃO FABRICAR".
   Todo documento (lista, desenho, etiqueta, pedido) leva o mesmo rótulo.
   ===================================================================== */
function situacaoProjeto(projeto) {
  const revs = projeto.orcamento?.revisoes || [], ult = revs.at(-1);
  const alterado = !ult || JSON.stringify(projeto.parametros) !== JSON.stringify(ult.parametros);
  const aprovada = [...revs].reverse().find(r => r.aceite) || null;
  let estado = 'estudo';
  if (ult && ult.aceite && !alterado) estado = projeto.liberacao?.rev === ult.rev ? 'liberado' : 'aprovado';
  return { estado, rev: ult && !alterado ? ult.rev : null, ultima: ult || null, aprovada, alterado: !!ult && alterado };
}
function rotuloDocumento(projeto) {
  const s = situacaoProjeto(projeto), dia = iso => new Date(iso).toLocaleDateString('pt-BR');
  if (s.estado === 'liberado') return { curto: `Rev. ${s.rev} · LIBERADO`, longo: `Rev. ${s.rev} · LIBERADO PARA CORTE em ${dia(projeto.liberacao.data)}`, fabricar: true, rev: s.rev };
  if (s.estado === 'aprovado') return { curto: `Rev. ${s.rev} · APROVADO`, longo: `Rev. ${s.rev} · APROVADO PELO CLIENTE — ainda não liberado para corte`, fabricar: false, rev: s.rev };
  return { curto: 'ESTUDO', longo: s.alterado ? `ESTUDO — alterado depois da Rev. ${s.ultima.rev}; não fabricar` : 'ESTUDO — não fabricar', fabricar: false, rev: s.alterado ? `${s.ultima.rev}*` : '—' };
}
function liberarParaCorte(projeto, res) {
  const s = situacaoProjeto(projeto);
  if (s.estado !== 'aprovado') return { ok: false, motivo: s.estado === 'liberado' ? 'Já está liberado.' : 'Só libera depois do aceite do cliente na última revisão, sem mudanças depois dela.' };
  if (res.erros.length) return { ok: false, motivo: 'Corrija os erros antes de liberar.' };
  projeto.liberacao = { rev: s.rev, data: new Date().toISOString() };
  return { ok: true };
}
// o que mudou entre a revisão de referência (a aprovada, ou a última) e o projeto atual
function diferencasDesdeRevisao(projeto, resAtual, comprasAtuais, entradasAtuais) {
  const s = situacaoProjeto(projeto), ref = s.aprovada || s.ultima; if (!ref || !s.alterado) return null;
  let resRef; try { resRef = TIPOS[projeto.tipo].gerar(ref.parametros); } catch (e) { return { ref: ref.rev, erro: 'Não foi possível refazer a revisão de referência.' }; }
  const chave = p => `${fmt(p.comp)} × ${fmt(p.larg)} × ${fmt(p.esp)} ${MATERIAIS[p.mat]?.nome || p.mat}`;
  const mapa = ps => new Map(ps.filter(p => p.lista).map(p => [p.id, p]));
  const A = mapa(resRef.pecas), B = mapa(resAtual.pecas), pecas = [];
  for (const [id, p] of B) { const q = A.get(id); if (!q) pecas.push({ tipo: 'nova', nome: p.nome, agora: chave(p) }); else if (chave(p) !== chave(q)) pecas.push({ tipo: 'mudou', nome: p.nome, antes: chave(q), agora: chave(p) }); }
  for (const [id, q] of A) if (!B.has(id)) pecas.push({ tipo: 'saiu', nome: q.nome, antes: chave(q) });
  const fA = new Map((resRef.ferragens || []).map(f => [f.ref, f])), fB = new Map((resAtual.ferragens || []).map(f => [f.ref, f])), ferragens = [];
  for (const ref2 of new Set([...fA.keys(), ...fB.keys()])) { const a = fA.get(ref2)?.qtd || 0, b = fB.get(ref2)?.qtd || 0; if (a !== b) ferragens.push({ nome: (fB.get(ref2) || fA.get(ref2)).nome, antes: a, agora: b }); }
  const totalAgora = comprasAtuais ? calcularOrcamento(comprasAtuais, entradasAtuais).total : null;
  return { ref: ref.rev, aprovada: !!ref.aceite, pecas, ferragens, totalAntes: ref.resultado.total, totalAgora, diferenca: totalAgora == null ? null : totalAgora - ref.resultado.total };
}
