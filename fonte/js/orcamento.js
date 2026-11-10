/* =====================================================================
   5c (parte 3). ORÇAMENTO — blocos MÓVEL e INSTALAÇÃO, revisões congeladas
   (Rev A, B…) e aceite do cliente. Só lógica; a tela fica em tela/paineis/orcamento.js.

   Fórmula (guia de precificação de marcenaria sob medida, pesquisa F9):
     MÓVEL      = (material + serviços da loja) × (1 + markup) + horas do móvel × taxa × (1 + lucro) + horas do móvel × custo fixo/hora
     INSTALAÇÃO = instalação terceirizada + frete + horas de montagem × taxa × (1 + lucro) + horas de montagem × custo fixo/hora
     serviços da loja = corte + fita + furação + outros;  custo fixo/hora = despesas fixas do mês ÷ horas trabalhadas no mês
     TOTAL      = (MÓVEL + INSTALAÇÃO) × (1 + impostos)
   Conferência de mercado: material × 3 (só para comparar, não entra na conta).
   ===================================================================== */
// taxa por hora e despesas fixas são da oficina: o último valor digitado vira o padrão dos projetos novos
const CHAVE_OFICINA_ORC = 'configurador-moveis:oficina-orc', CAMPOS_OFICINA_ORC = ['taxaHora', 'despesasMes', 'horasMes'];
function lerOficinaOrc() { try { return JSON.parse(localStorage.getItem(CHAVE_OFICINA_ORC)) || {}; } catch (e) { return {}; } }
function gravarOficinaOrc(e) { try { const o = {}; CAMPOS_OFICINA_ORC.forEach(k => o[k] = Number(e[k]) || 0); localStorage.setItem(CHAVE_OFICINA_ORC, JSON.stringify(o)); } catch (x) {} }
function entradasOrcamentoPadrao() {
  const O = R.orcamento;
  return { cliente:'', horasProjeto:0, horasFabricacao:0, horasMontagem:0, taxaHora:0, despesasMes:0, horasMes:0,
    servCorte:0, servFita:0, servFuracao:0, servicosLoja:0, instalacao:0, frete:0, ...lerOficinaOrc(),
    markup:O.markup, lucro:O.lucro, impostos:O.impostos, sinal:O.sinal, prazoDias:O.prazoDias, validadeDias:O.validadeDias, obs:'' };
}
function calcularOrcamento(compras, e) {
  const material = compras?.total || 0, semPreco = compras?.semPreco || 0, pct = v => (Number(v) || 0) / 100, num = v => Number(v) || 0;
  const fixoHora = num(e.horasMes) > 0 ? num(e.despesasMes) / num(e.horasMes) : 0;
  const hMovel = num(e.horasProjeto) + num(e.horasFabricacao), hMont = num(e.horasMontagem);
  const servicos = num(e.servCorte) + num(e.servFita) + num(e.servFuracao) + num(e.servicosLoja);
  const maoMovel = hMovel * num(e.taxaHora) * (1 + pct(e.lucro));
  const fixas = (hMovel + hMont) * fixoHora;
  const movel = (material + servicos) * (1 + pct(e.markup)) + maoMovel + hMovel * fixoHora;
  const instalacao = num(e.instalacao) + num(e.frete) + hMont * num(e.taxaHora) * (1 + pct(e.lucro)) + hMont * fixoHora;
  const total = (movel + instalacao) * (1 + pct(e.impostos));
  const avisos = [];
  if (semPreco) avisos.push(`${semPreco} item(ns) da lista de compras sem preço: o material está incompleto.`);
  if (!num(e.taxaHora)) avisos.push('Taxa por hora em branco: as horas não estão sendo cobradas.');
  if (!num(e.horasFabricacao)) avisos.push('Horas de fabricação em branco.');
  if (num(e.despesasMes) && !num(e.horasMes)) avisos.push('Despesas fixas sem as horas trabalhadas no mês: não estão sendo cobradas.');
  if (!num(e.despesasMes)) avisos.push('Despesas fixas do mês em branco: aluguel, luz etc. não estão no preço.');
  return { material, servicos, fixas, fixoHora, maoMovel, movel, instalacao, total, sinal: total * pct(e.sinal), conferencia: material * 3, avisos,
    blocos: { movel: movel * (1 + pct(e.impostos)), instalacao: instalacao * (1 + pct(e.impostos)) } };
}
// revisão congelada: guarda os preços e o projeto daquele dia; a anterior nunca muda
function congelarRevisao(projeto, res, compras, entradas) {
  const orc = projeto.orcamento, revs = orc.revisoes, letra = String.fromCharCode(65 + revs.length);
  const calc = calcularOrcamento(compras, entradas), ant = revs.at(-1);
  const rev = { rev: letra, data: new Date().toISOString(), entradas: JSON.parse(JSON.stringify(entradas)),
    itens: compras.linhas.map(l => ({ ref:l.ref, nome:l.nome, compra:l.compra, unid:l.unid, preco:l.preco, total:l.total })),
    resultado: calc, projeto: { nome: projeto.nome, tipo: projeto.tipo, pecas: res.pecas.filter(p => p.lista).length, dims: res.dims ? [res.dims.L, res.dims.H, res.dims.P] : null },
    parametros: JSON.parse(JSON.stringify(projeto.parametros)), aceite: null,
    diferenca: ant ? calc.total - ant.resultado.total : null, aposAceite: !!revs.some(r => r.aceite) };
  revs.push(rev); return rev;
}
function registrarAceite(projeto, rev, nome) { const r = projeto.orcamento.revisoes.find(x => x.rev === rev); if (r) r.aceite = { nome, data: new Date().toISOString() }; return r; }

// PDF do orçamento para o cliente (A4, retrato): blocos, condições, não incluso, aceite
function orcamentoPDF(rev, extra = {}) {
  const { jsPDF } = window.jspdf, doc = new jsPDF({ unit:'mm', format:'a4' }), e = rev.entradas, c = rev.resultado;
  const T = (s, x, y, size = 10, peso = 'normal', al = 'left') => { doc.setFont('helvetica', peso); doc.setFontSize(size); doc.text(pdfTxt(s), x, y, { align: al }); };
  const dia = iso => new Date(iso).toLocaleDateString('pt-BR');
  T(extra.empresa || '[NOME DA EMPRESA]', 20, 22, 16, 'bold'); T(`${extra.autor || 'Nathan'} · ${extra.cidade || 'Ponta Grossa - PR'}`, 20, 28, 9);
  T('ORÇAMENTO', 190, 22, 16, 'bold', 'right'); T(`Rev. ${rev.rev} · ${dia(rev.data)}`, 190, 28, 10, 'normal', 'right');
  doc.setLineWidth(0.4); doc.line(20, 32, 190, 32);
  T('Cliente:', 20, 42, 10, 'bold'); T(e.cliente || '—', 40, 42);
  T('Projeto:', 20, 48, 10, 'bold'); T(rev.projeto.nome || '—', 40, 48);
  if (rev.projeto.dims) T(`Medidas gerais: ${rev.projeto.dims.map(v => Math.round(v)).join(' × ')} mm`, 40, 54, 9);
  let y = 68; T('VALORES', 20, y, 11, 'bold'); y += 8;
  const linha = (rot, v, peso = 'normal') => { T(rot, 24, y, 11, peso); T(reais(v), 186, y, 11, peso, 'right'); y += 8; };
  linha('Móvel (material, fabricação e projeto)', c.blocos.movel);
  linha('Instalação', c.blocos.instalacao);
  doc.setLineWidth(0.2); doc.line(20, y - 4, 190, y - 4); linha('TOTAL', c.total, 'bold');
  if (rev.diferenca != null) { T(`Diferença em relação à revisão anterior: ${rev.diferenca >= 0 ? '+' : ''}${reais(rev.diferenca)}`, 24, y, 9); y += 7; }
  y += 6; T('CONDIÇÕES', 20, y, 11, 'bold'); y += 7;
  [`Sinal de ${e.sinal}% na aprovação (${reais(c.sinal)}); restante na entrega.`, `Prazo de entrega: ${e.prazoDias} dias após o sinal e a medição final.`,
   `Validade deste orçamento: ${e.validadeDias} dias.`, 'Mudanças depois da aprovação só por escrito, com nova revisão e diferença de valor.',
   ...(e.obs ? [e.obs] : [])].forEach(s => { T('• ' + s, 24, y, 9.5); y += 6; });
  y += 4; T('NÃO INCLUSO', 20, y, 11, 'bold'); y += 7;
  ['Pedra (tampo), vidros e espelhos, salvo se listados acima.', 'Instalação elétrica, hidráulica e de gás; pontos e tomadas.', 'Pintura, gesso e reparos de parede.'].forEach(s => { T('• ' + s, 24, y, 9.5); y += 6; });
  y = Math.max(y + 16, 240); doc.line(24, y, 100, y); doc.line(114, y, 186, y);
  T('Aceite do cliente', 62, y + 5, 9, 'normal', 'center'); T('Data', 150, y + 5, 9, 'normal', 'center');
  if (rev.aceite) T(`Aceito por ${rev.aceite.nome} em ${dia(rev.aceite.data)}.`, 24, y - 3, 9, 'bold');
  return doc.output('arraybuffer');
}
