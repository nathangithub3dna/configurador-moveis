// TELA — alertas, status e listas (corte, compras, ferragens, desenhos) (parte do antigo tela.js, na mesma ordem: ver pagina.html)
/* ---------- Alertas e status ---------- */
function mostrarAlertas(res) {
  $('alertas').replaceChildren(...res.erros.map(m => el('div', { class:'alerta erro', role:'alert', text:m })), ...res.avisos.map(m => el('div', { class:'alerta aviso', text:m })));
  const ok = res.erros.length === 0;
  $('status').className = 'status ' + (ok ? 'ok' : 'erro');
  $('status').textContent = ok ? (res.avisos.length ? `Pronto · ${res.avisos.length} aviso${res.avisos.length>1?'s':''}` : 'Pronto para exportar') : `${res.erros.length} erro${res.erros.length>1?'s':''} · exportação bloqueada`;
  $('faixaDesat').hidden = ok || !estado.valido;
  atualizarBotoesExport();
}

/* ---------- Listas ---------- */
function textoCorte(lc, nome) {
  const ls = [`LISTA DE CORTE — ${nome}`, rotuloDocumento(estado.projeto).longo, 'Medidas em mm (comprimento × largura). Fita: C = lados do comprimento, L = lados da largura.', ''];
  for (const [g, its] of lc.grupos) {
    ls.push(g.toUpperCase());
    its.forEach(it => ls.push(`${it.qtd}× ${it.nomeLista||it.nome} — ${fmt(it.comp)} × ${fmt(it.larg)} — fita ${fitaTxt(it.fita)}${it.forma?.tipo==='recorte' ? ` — recorte ${fmt(it.forma.rl)} × ${fmt(it.forma.rp)} no centro de trás` : ''}`));
    ls.push('');
  }
  return ls.join('\n').trim();
}
const textoFerr = (fs, nome) => [`FERRAGENS — ${nome}`, '', ...fs.map(f => `${f.qtd}${f.obs.startsWith('metros') ? ' m' : '×'} ${f.item}${f.obs && !f.obs.startsWith('metros') ? ` (${f.obs})` : ''}`)].join('\n');

function mostrarListas(res) {
  const ok = res.erros.length === 0;
  ['copCorte','copFerr','copLoja','copCompras'].forEach(id => $(id).disabled = !ok);
  ['copiaLoja','copiaCompras'].forEach(id => $(id).hidden = true);
  $('copiaCorte').hidden = true; $('copiaFerr').hidden = true;
  if (!ok) {
    const msg = () => el('p', { class:'vazio', text:'Corrija os erros nos parâmetros para ver a lista.' });
    $('tabCorte').replaceChildren(msg()); $('tabFerr').replaceChildren(msg()); $('resumoCorte').replaceChildren(); $('gradePlano').replaceChildren(msg()); $('tabCompras').replaceChildren(msg()); $('notaPlano').textContent = ''; return;
  }
  const lc = listaDeCorte(res.pecas);
  const linhas = [];
  for (const [g, its] of lc.grupos) {
    linhas.push(el('tr', { class:'grupo' }, el('td', { colspan:6, text:g })));
    its.forEach(it => linhas.push(el('tr', { 'data-ids':it.ids.join(' ') },
      el('td', { text:it.nomeLista||it.nome }), el('td', { class:'n', text:String(it.qtd) }),
      el('td', { class:'n', text:fmt(it.comp) }), el('td', { class:'n', text:fmt(it.larg) }),
      el('td', { class:'n', text:fitaTxt(it.fita) }), el('td', { class:'obs', text:it.obs }))));
  }
  $('tabCorte').replaceChildren(el('table', {}, el('thead', {}, el('tr', {}, el('th', { text:'Peça' }), el('th', { class:'n', text:'Qtd' }), el('th', { class:'n', text:'Comp.' }), el('th', { class:'n', text:'Larg.' }), el('th', { class:'n', text:'Fita' }), el('th', { text:'Observação' }))), el('tbody', {}, ...linhas)));
  const fitaItem = res.ferragens.find(f => f.item.startsWith('Fita'));
  $('resumoCorte').replaceChildren(
    ...lc.resumo.map(r => el('span', {}, `${r.grupo}: `, el('b', { text:`${fmt(r.area)} m²` }), ` ≈ ${r.chapas} chapa${r.chapas>1?'s':''}`)),
    fitaItem ? el('span', {}, 'Fita: ', el('b', { text:`${fitaItem.qtd} m` })) : null,
    el('span', { text:`Chapa ${R.chapa[0]/1000} × ${R.chapa[1]/1000} m, aproveitamento 85%` }));
  $('tabFerr').replaceChildren(el('table', {}, el('thead', {}, el('tr', {}, el('th', { text:'Item' }), el('th', { class:'n', text:'Qtd' }), el('th', { text:'Observação' }))),
    el('tbody', {}, ...res.ferragens.map(f => el('tr', {}, el('td', { text:f.item }), el('td', { class:'n', text: f.obs.startsWith('metros') ? `${f.qtd} m` : String(f.qtd) }), el('td', { class:'obs', text: f.obs.startsWith('metros') ? 'com 10% de perda' : f.obs }))))));
  estado.textos = { corte: textoCorte(lc, estado.projeto.nome), ferr: textoFerr(res.ferragens, estado.projeto.nome), lc };
  const plano = planoDeCorte(res.pecas); estado.plano = plano;
  $('resumoCorte').replaceChildren(
    ...plano.materiais.map(m => el('span', {}, `${m.nome}: `, el('b', { text:`${m.chapas.length} chapa${m.chapas.length>1?'s':''}` }))),
    fitaItem ? el('span', {}, 'Fita: ', el('b', { text:`${fitaItem.qtd} m` })) : null,
    el('span', { text:'Nº = número da peça no plano de corte' }));
  linhasNum(lc);
  mostrarPlano(plano); mostrarCompras(); mostrarOrcamento();
}
function linhasNum(lc) {
  // acrescenta a coluna Nº na tabela da lista de corte
  const mapa = new Map(); for (const its of lc.grupos.values()) its.forEach(it => mapa.set(it.ids.join(' '), it.num));
  const th = el('th', { class:'n', text:'Nº' }); $('tabCorte').querySelector('thead tr')?.prepend(th);
  $('tabCorte').querySelectorAll('tbody tr').forEach(tr => {
    if (tr.classList.contains('grupo')) { tr.firstChild.colSpan = 7; return; }
    tr.prepend(el('td', { class:'n', text:String(mapa.get(tr.dataset.ids) ?? '') }));
  });
}
function svgChapa(m, c, idx) {
  const NS = 'http://www.w3.org/2000/svg', mk = (t, a, txt) => { const e = document.createElementNS(NS, t); for (const [k,v] of Object.entries(a)) e.setAttribute(k, v); if (txt != null) e.textContent = txt; return e; };
  const W = 640, s = W / m.dim[0], H = m.dim[1]*s;
  const svg = mk('svg', { viewBox:`0 0 ${W} ${H.toFixed(1)}`, class:'chapa-svg', role:'img', 'aria-label':`Chapa ${idx+1} de ${m.nome}` });
  svg.append(mk('rect', { x:0, y:0, width:W, height:H, class:'p-chapa' }));
  svg.append(mk('rect', { x:m.refilo*s, y:m.refilo*s, width:(m.dim[0]-2*m.refilo)*s, height:(m.dim[1]-2*m.refilo)*s, class:'p-refilo' }));
  for (const p of c.pecas) {
    const x = (m.refilo + p.x)*s, y = (m.refilo + p.y)*s, w = p.w*s, h = p.h*s;
    const g = mk('g', { 'data-id':p.id });
    g.append(mk('rect', { x, y, width:w, height:h, class:'p-peca' }));
    const tit = mk('title', {}, `${p.num}. ${p.nome} — ${fmt(p.w)} × ${fmt(p.h)}${p.giro ? ' (girada)' : ''}`); g.append(tit);
    if (w > 18 && h > 14) g.append(mk('text', { x:x+w/2, y:y+h/2 + (h > 34 ? -2 : 4), 'text-anchor':'middle', class:'p-num' }, String(p.num)));
    if (w > 70 && h > 34) g.append(mk('text', { x:x+w/2, y:y+h/2 + 12, 'text-anchor':'middle', class:'p-med' }, `${fmt(p.w)}×${fmt(p.h)}`));
    g.addEventListener('click', () => selecionar(p.id));
    svg.append(g);
  }
  return svg;
}
function mostrarPlano(plano) {
  $('notaPlano').textContent = `Chapas de ${R.chapa[0]} × ${R.chapa[1]} mm, refilo de ${R.refilo} mm nas bordas e ${R.serra} mm de serra entre peças. Cortes em faixas; peças podem girar (MDF liso). Toque numa peça para vê-la no 3D.` + (plano.erros.length ? ' Atenção: ' + plano.erros.join(' ') : '');
  $('gradePlano').replaceChildren(...plano.materiais.flatMap(m => m.chapas.map((c, i) => el('article', { class:'des' },
    el('h3', {}, el('span', { text:`${m.nome} · chapa ${i+1} de ${m.chapas.length}` }), el('span', { class:'meta', text:`${Math.round(c.aproveitamento*100)}% aproveitado` })),
    svgChapa(m, c, i),
    el('div', { class:'meta', text: c.pecas.map(p => p.num).sort((a,b)=>a-b).join(', ').replace(/^/, 'Peças: ') }))))); 
}
function mostrarCompras() {
  if (!estado.res || estado.res.erros.length || !estado.plano) return;
  const lc = listaDeCompras(estado.res, estado.plano, precos); estado.compras = lc;
  const grupos = [...new Set(lc.linhas.map(l => l.grupo))];
  const corpo = [];
  grupos.forEach(g => {
    corpo.push(el('tr', { class:'grupo' }, el('td', { colspan:6, text:g })));
    lc.linhas.filter(l => l.grupo === g).forEach(l => {
      const inp = el('input', { type:'number', min:'0', step:'0.01', inputmode:'decimal', id:'preco-'+l.ref, 'aria-label':'Preço de '+l.nome, value: l.preco ?? '' });
      inp.addEventListener('change', () => { const v = Number(inp.value); if (v > 0) precos[l.ref] = v; else delete precos[l.ref]; salvarPrecos(); mostrarCompras(); mostrarOrcamento(); });
      corpo.push(el('tr', {},
        el('td', {}, el('div', { text:l.nome }), (l.marca||l.codigo) ? el('div', { class:'obs', text:[l.marca, l.codigo].filter(Boolean).join(' · ') }) : null),
        el('td', { class:'n', text:l.necessario }),
        el('td', { class:'n', text:`${l.compra} ${l.unid}` }),
        el('td', { class:'n' }, inp),
        el('td', { class:'n', text: l.total != null ? reais(l.total) : '—' }),
        el('td', { class:'obs', text:l.obs || '' })));
    });
  });
  $('tabCompras').replaceChildren(el('table', {},
    el('thead', {}, el('tr', {}, ...['Item','Precisa','Comprar','Preço unit. (R$)','Total',''].map((h,i) => el('th', { class: i>0 && i<5 ? 'n' : null, text:h })))),
    el('tbody', {}, ...corpo),
    el('tfoot', {}, el('tr', {}, el('td', { colspan:4, text: lc.semPreco ? `Total (${lc.semPreco} ite${lc.semPreco>1?'ns':'m'} sem preço)` : 'Total' }), el('td', { class:'n', text:reais(lc.total) }), el('td', {})))));
  estado.textos.compras = textoCompras(lc);
}
const textoCompras = lc => [`LISTA DE COMPRAS — ${estado.projeto.nome}`, '', ...lc.linhas.map(l => `${l.compra} ${l.unid} — ${l.nome}${l.marca||l.codigo ? ` (${[l.marca,l.codigo].filter(Boolean).join(' ')})` : ''}${l.total != null ? ` — ${reais(l.total)}` : ''}`), '', `Total: ${reais(lc.total)}${lc.semPreco ? ` (${lc.semPreco} sem preço)` : ''}`].join('\n');
function linhasLoja() {
  const lc = listaDeCorte(estado.res.pecas), out = [];
  for (const its of lc.grupos.values()) its.forEach(it => out.push({ num:it.num, nome:it.nomeLista||it.nome, qtd:it.qtd, comp:it.comp, larg:it.larg, esp:it.esp, mat:MATERIAIS[it.mat].nome, c1:it.fita[0]>=1, c2:it.fita[0]>=2, l1:it.fita[1]>=1, l2:it.fita[1]>=2, obs:it.forma?.tipo==='recorte' ? `recorte ${fmt(it.forma.rl)}x${fmt(it.forma.rp)} centro de trás` : '' }));
  return out;
}
const textoLoja = () => [`PEDIDO DE CORTE — ${estado.projeto.nome}`, 'Medidas em mm (comprimento × largura). Fita: C1/C2 nos lados do comprimento, L1/L2 nos lados da largura.', '',
  ...linhasLoja().map(l => `Nº ${l.num} · ${l.qtd}× ${l.nome} · ${fmt(l.comp)} × ${fmt(l.larg)} · ${l.mat} ${fmt(l.esp)} mm · fita: ${[l.c1&&'C1',l.c2&&'C2',l.l1&&'L1',l.l2&&'L2'].filter(Boolean).join(' ') || 'nenhuma'}${l.obs ? ' · ' + l.obs : ''}`)].join('\n');
const csvLoja = () => '\ufeff' + ['Nº;Peça;Qtd;Comprimento;Largura;Espessura;Material;Fita C1;Fita C2;Fita L1;Fita L2;Observação',
  ...linhasLoja().map(l => [l.num, l.nome, l.qtd, csvNum(l.comp), csvNum(l.larg), csvNum(l.esp), l.mat, l.c1?'sim':'', l.c2?'sim':'', l.l1?'sim':'', l.l2?'sim':'', l.obs].join(';'))].join('\r\n');
const csvCompras = () => '\ufeff' + ['Grupo;Item;Marca;Código;Precisa;Comprar;Unidade;Preço unit.;Total;Observação',
  ...estado.compras.linhas.map(l => [l.grupo, l.nome, l.marca, l.codigo, l.necessario, l.compra, l.unid, l.preco != null ? csvNum(l.preco) : '', l.total != null ? csvNum(l.total) : '', l.obs||''].join(';'))].join('\r\n');
$('copLoja').addEventListener('click', () => { if (estado.res && !estado.res.erros.length) copiar(textoLoja(), 'copiaLoja'); });
$('copCompras').addEventListener('click', () => { if (estado.textos?.compras) copiar(estado.textos.compras, 'copiaCompras'); });
$('tabCorte').addEventListener('click', e => { const tr = e.target.closest('tr[data-ids]'); if (tr) selecionar(tr.dataset.ids.split(' ')[0]); });
function copiar(texto, areaId) {
  const fallback = () => { const a = $(areaId); a.value = texto; a.hidden = false; a.focus(); a.select(); toast('Selecionei o texto: copie com Ctrl+C ou segurando o dedo.'); };
  try { navigator.clipboard.writeText(texto).then(() => toast('Copiado.'), fallback); } catch(e) { fallback(); }
}
$('copCorte').addEventListener('click', () => estado.textos && copiar(estado.textos.corte, 'copiaCorte'));
$('copFerr').addEventListener('click', () => estado.textos && copiar(estado.textos.ferr, 'copiaFerr'));
