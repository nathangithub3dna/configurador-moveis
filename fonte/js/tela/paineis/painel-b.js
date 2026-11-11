/* =====================================================================
   PAINEL — VISUAL B (10/11/2026): escolhas com desenho e números com − e +.
   Só aparência: cada grupo de botões preenche o campo de escolha que já existia (escondido) e dispara a mesma
   mudança de antes, então a lógica (tela/paineis/modulo.js) e os testes continuam iguais.
   ===================================================================== */
const RET_B = '<rect x="4" y="3" width="26" height="34"/>';
// desenhos de frente e conteúdo: vêm das escolhas registradas (icone); aqui ficam os dos outros campos
const ICONES_B = {
  ...Object.fromEntries(['frente', 'conteudo'].flatMap(g => escolhasDe(g).map(e => [g + ':' + e.id, e.icone]))),
  'lado:auto': RET_B + '<path d="M10 20h14M20 16l4 4-4 4M14 16l-4 4 4 4"/>',
  'lado:dir': RET_B + '<line x1="9" y1="16" x2="9" y2="24" stroke-width="2.5"/><circle cx="29" cy="10" r="1.3"/><circle cx="29" cy="30" r="1.3"/>',    // dobradiça à direita = puxador à esquerda
  'lado:esq': RET_B + '<line x1="25" y1="16" x2="25" y2="24" stroke-width="2.5"/><circle cx="5" cy="10" r="1.3"/><circle cx="5" cy="30" r="1.3"/>',
  'perfil:auto': RET_B + '<path d="M10 20h14M20 16l4 4-4 4M14 16l-4 4 4 4"/>',
  'perfil:cima': '<rect x="4" y="7" width="26" height="30"/><rect x="4" y="3" width="26" height="4" stroke-width="2"/>',
  'perfil:baixo': '<rect x="4" y="3" width="26" height="30"/><rect x="4" y="33" width="26" height="4" stroke-width="2"/>',
  'perfil:lateral': '<rect x="4" y="3" width="22" height="34"/><rect x="26" y="3" width="4" height="34" stroke-width="2"/>',
  'abrirCorrer:esq': '<rect x="15" y="3" width="15" height="34"/><rect x="11" y="5" width="15" height="32" stroke-dasharray="3 2"/><path d="M6 20h4"/>',
  'abrirCorrer:dir': '<rect x="4" y="3" width="15" height="34"/><rect x="8" y="5" width="15" height="32" stroke-dasharray="3 2"/><path d="M24 20h4"/>',
  'dividir:v': RET_B + '<line x1="17" y1="3" x2="17" y2="37"/>',
  'dividir:h': RET_B + '<line x1="4" y1="20" x2="30" y2="20"/>',
};
const svgB = k => ICONES_B[k] ? `<svg class="ico-b" width="30" height="36" viewBox="0 0 34 40" aria-hidden="true">${ICONES_B[k]}</svg>` : '';
// desenho dentro de um botão que já existe (frente, dividir), mantendo o texto
function comDesenhoB(botao, chave) { if (!ICONES_B[chave] || botao.querySelector('.ico-b')) return; botao.classList.add('ed-op-b'); botao.insertAdjacentHTML('afterbegin', svgB(chave)); }
// troca um <select> por botões com desenho; o select fica escondido e continua sendo o dono do valor
function selectEmBotoesB(sel, campo, rotulos = {}) {
  if (!sel) return;
  const caixa = el('div', { class:'ed-grade-b', role:'group', 'aria-label': sel.getAttribute('aria-label') || sel.closest('label')?.firstChild?.textContent?.trim() || campo });
  [...sel.options].filter(o => !o.hidden).forEach(o => {
    const b = el('button', { type:'button', class:'btn ed-op ed-op-b', 'aria-pressed': String(o.value === sel.value) });
    b.innerHTML = svgB(campo + ':' + o.value); b.append(el('span', { text: rotulos[o.value] || o.textContent }));
    b.addEventListener('click', () => { if (sel.value === o.value) return; sel.value = o.value; sel.dispatchEvent(new Event('change', { bubbles:true })); });
    caixa.append(b);
  });
  // os botões ficam FORA do <label> do campo antigo (dentro dele, o navegador repassa o clique ao campo escondido)
  const rot = sel.closest('label');
  if (rot) {
    const titulo = [...rot.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim();
    const bloco = el('div', { class:'ed-linha-b' }, el('span', { text: titulo }), caixa);
    if (rot.dataset.se) bloco.dataset.se = rot.dataset.se; bloco.hidden = rot.hidden;
    rot.removeAttribute('data-se'); rot.style.display = 'none'; rot.after(bloco);   // o .ed-linha do CSS venceria o hidden
  } else { sel.hidden = true; sel.after(caixa); }
}
// − e + ao lado dos números (passo de 10 mm); o número do meio continua digitável
function numeroComPassosB(inp, passo = 10) {
  if (!inp || inp.closest('.ed-passo')) return;
  const caixa = el('span', { class:'ed-passo' }), menos = el('button', { type:'button', class:'btn', 'aria-label':'Menos ' + passo + ' mm' }, '−'), mais = el('button', { type:'button', class:'btn', 'aria-label':'Mais ' + passo + ' mm' }, '+');
  const mexe = d => () => { const v = Number(String(inp.value).replace(',', '.')); if (!(v >= 0)) return; inp.value = Math.max(0, v + d); inp.dispatchEvent(new Event('change', { bubbles:true })); };
  menos.addEventListener('click', mexe(-passo)); mais.addEventListener('click', mexe(passo));
  inp.replaceWith(caixa); caixa.append(menos, inp, mais);
}
// aplica o visual B no editor recém-montado (chamado no fim de montarEditorModulo)
function aplicarPainelB(ed) {
  ed.querySelectorAll('[data-lista="frentes"] [data-acao="frente"]').forEach(b => comDesenhoB(b, 'frente:' + b.dataset.valor));
  ed.querySelector('[data-lista="frentes"]')?.classList.add('ed-grade-b');
  comDesenhoB(ed.querySelector('[data-acao="dividir-v"]'), 'dividir:v'); comDesenhoB(ed.querySelector('[data-acao="dividir-h"]'), 'dividir:h');
  selectEmBotoesB(ed.querySelector('[data-vao="lado"]'), 'lado', { dir:'À esquerda', esq:'À direita' });
  selectEmBotoesB(ed.querySelector('[data-vao="perfil"]'), 'perfil', { lateral:'Na lateral' });
  selectEmBotoesB(ed.querySelector('[data-vao="abrirCorrer"]'), 'abrirCorrer', { esq:'Libera a esquerda', dir:'Libera a direita' });
  selectEmBotoesB(ed.querySelector('[data-vao="conteudo"]'), 'conteudo');
  ed.querySelectorAll('[data-modulo="largura"],[data-modulo="altura"],[data-modulo="profundidade"],[data-modulo="beiral"]').forEach(i => numeroComPassosB(i));
}
