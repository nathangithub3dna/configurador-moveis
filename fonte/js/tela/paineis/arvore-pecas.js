// TELA — árvore de peças (parte do antigo tela.js, na mesma ordem: ver pagina.html)
/* ---------- Árvore de peças ---------- */
// miniatura 2D da peça (tela/paineis/miniatura.js) e a prévia maior: ao passar o mouse; no celular, ao tocar na miniatura
function miniaturaNaLista(pc) {
  const s = el('span', { class:'miniatura', 'aria-hidden':'true' }); s.innerHTML = miniaturaPeca(pc, 28);
  s.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') mostrarPrevia(pc, s); });
  s.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') esconderPrevia(); });
  s.addEventListener('pointerup', e => { if (e.pointerType !== 'mouse') { const aberta = $('previaPeca').dataset.id === pc.id && !$('previaPeca').hidden; aberta ? esconderPrevia() : mostrarPrevia(pc, s); } });
  return s;
}
function mostrarPrevia(pc, ancora) {
  const p = $('previaPeca'), r = ancora.getBoundingClientRect();
  p.innerHTML = miniaturaPeca(pc, 160); p.append(el('strong', { text: pc.nome }), el('span', { class:'num', text: pc.comp ? `${fmt(pc.comp)} × ${fmt(pc.larg)} mm` : (pc.ref || '') }));
  p.dataset.id = pc.id; p.hidden = false;
  const w = p.offsetWidth, h = p.offsetHeight;
  const borda = $('painelPecas').getBoundingClientRect().right;   // ao lado do painel, sem cobrir os nomes (no celular fica por cima, preso na tela)
  p.style.left = Math.max(8, Math.min(borda + 10, innerWidth - w - 8)) + 'px';
  p.style.top = Math.max(8, Math.min(r.top - h / 2 + r.height / 2, innerHeight - h - 8)) + 'px';
}
function esconderPrevia() { $('previaPeca').hidden = true; }
document.addEventListener('pointerdown', e => { if (!$('previaPeca').hidden && !e.target.closest('.miniatura')) esconderPrevia(); }, true);
$('painelPecas').addEventListener('scroll', esconderPrevia, { passive:true });

function montarArvore(pecas) {
  const por = {}; pecas.forEach(pc => (por[pc.cat] ||= []).push(pc));
  $('arvore').replaceChildren(...Object.keys(CATS).filter(c => por[c]).map(c => el('section', {},
    el('h3', {}, el('span', { text:CATS[c] }), el('span', { class:'num', text:String(por[c].length) })),
    el('ul', {}, ...por[c].map(pc => {
      const li = el('li', { 'data-id':pc.id },
        el('input', { type:'checkbox', checked:!estado.ocultas.has(pc.id), 'aria-label':'Mostrar '+pc.nome, onchange:e => { e.target.checked ? estado.ocultas.delete(pc.id) : estado.ocultas.add(pc.id); aplicarVisibilidade(); } }),
        miniaturaNaLista(pc),
        el('button', { type:'button', text:pc.nome, title:pc.nome, onclick:() => selecionar(pc.id) }),
        el('span', { class:'num', text: pc.comp ? `${fmt(pc.comp)}×${fmt(pc.larg)}` : '' }));
      return li;
    })))));
  destacar();
}
