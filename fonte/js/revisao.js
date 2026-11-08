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
  const falta = conferenciaFabricacao(projeto, res, null).filter(i => i.obrigatorio && !i.ok);
  if (falta.length) return { ok: false, motivo: 'Falta na conferência: ' + falta.map(i => i.texto).join('; ') };
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

/* ---------- Conferência antes de liberar para corte ---------- */
// configuração da oficina (vale para todos os projetos deste computador): a furação da loja já foi conferida?
function lerConfigOficina() { try { return JSON.parse(localStorage.getItem('configurador-moveis:config')) || {}; } catch (e) { return {}; } }
function gravarConfigOficina(c) { try { localStorage.setItem('configurador-moveis:config', JSON.stringify(c)); } catch (e) {} }
function textoAvisos(res) { return (res?.avisos || []).join('|'); }
function conferenciaFabricacao(projeto, res, compras) {
  const s = situacaoProjeto(projeto), cfg = lerConfigOficina(), avisos = res?.avisos || [];
  const furacao = cfg.furacao === 'validada' ? 'Furação da loja conferida com a peça de teste' + (cfg.data ? ` (${new Date(cfg.data).toLocaleDateString('pt-BR')})` : '')
    : cfg.furacao === 'soCorte' ? 'A loja só corta; a furação é feita na oficina' : 'Furação da loja ainda não conferida (mande a peça de teste)';
  return [
    { ok: s.estado === 'aprovado' || s.estado === 'liberado', obrigatorio: true, texto: s.estado === 'estudo' ? 'Revisão aprovada pelo cliente: falta (congele uma revisão e registre o aceite)' : `Revisão ${s.rev} aprovada pelo cliente` },
    { ok: !!res && !res.erros.length, obrigatorio: true, texto: res?.erros.length ? `${res.erros.length} erro(s) no projeto` : 'Projeto sem erros' },
    { ok: !!res && res.pecas.every(p => p.papel), obrigatorio: true, texto: 'Toda peça com função definida (orientação no Inventor e etiquetas)' },
    { ok: !avisos.length || projeto.conferencia?.avisosVistos === textoAvisos(res), obrigatorio: true, texto: avisos.length ? `${avisos.length} aviso(s): conferir abertura de portas, gavetas, canto, pontos` : 'Sem avisos', chave: 'avisos' },
    { ok: cfg.furacao === 'validada' || cfg.furacao === 'soCorte', obrigatorio: true, texto: furacao, chave: 'furacao' },
    { ok: !compras || !compras.semPreco, obrigatorio: false, texto: compras?.semPreco ? `${compras.semPreco} item(ns) sem preço na lista de compras (o orçamento fica incompleto)` : 'Lista de compras com todos os preços' },
  ];
}
// peça de teste: mostra se a loja lê o canto, as faces e o topo como o configurador (furos fora de simetria)
function pecaDeTeste() {
  return { id: 'peca-teste', nome: 'Peça de teste de furação', nomeLista: 'Peça de teste de furação', cat: 'caixa', papel: 'teste', mat: 'mdf-ru-branco', esp: 18, comp: 300, larg: 200, fita: [0, 0], lista: true,
    des: { w: 200, h: 300, fita: [], vista: 'Vista pela face interna', furos: [
      { x: 40, y: 40, d: 35, prof: 13, tipo: 'Ø35 perto do canto 0' }, { x: 160, y: 40, d: 8, prof: 10, tipo: 'Ø8 na face' },
      { x: 100, y: 150, d: 5, prof: 0, tipo: 'Ø5 passante' }, { x: 40, y: 260, d: 5, prof: 11, tipo: 'Ø5 cego no alto' },
      { x: 0, y: 150, d: 8, prof: 20, tipo: 'Ø8 no topo esquerdo', face: 'topo-esq' } ] } };
}
