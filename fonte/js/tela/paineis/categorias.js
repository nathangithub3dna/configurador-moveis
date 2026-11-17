/* =====================================================================
   CATEGORIAS DO EDITOR (item 74, pedido do Nathan 17/11): cada bloco do painel (Medidas, Dividir e juntar, Vão, O que tem dentro,
   Construção, Peças ajustadas) abre e fecha tocando no título; a ordem muda arrastando o ⠿ (ou setas ↑ ↓ com o ⠿ em foco).
   Ordem e abertas/fechadas ficam guardadas neste aparelho. O editor é remontado a cada mudança: aplicarCategorias(ed) reaplica tudo.
   ===================================================================== */
const CHAVE_CATS = 'configurador.categoriasEditor';
function lerCats() { try { const d = JSON.parse(localStorage.getItem(CHAVE_CATS)); return d && typeof d === 'object' ? d : {}; } catch (e) { return {}; } }
function gravarCats(mudar) { const d = lerCats(); mudar(d); try { localStorage.setItem(CHAVE_CATS, JSON.stringify(d)); } catch (e) {} }

function abrirCategoria(sec, aberta) {
  sec.toggleAttribute('data-fechada', !aberta);
  sec.querySelector('.ed-cat-abrir')?.setAttribute('aria-expanded', String(aberta));
}
function guardarOrdem(caixa) { gravarCats(d => { d.ordem = [...caixa.querySelectorAll(':scope > .ed-cat')].map(s => s.dataset.cat); }); }

function aplicarCategorias(ed) {
  const caixa = ed.querySelector('[data-lista="categorias"]'); if (!caixa) return;
  const salvo = lerCats(), secs = [...caixa.querySelectorAll(':scope > .ed-cat')];
  // ordem guardada; categoria nova (que não estava na ordem guardada) fica na posição de fábrica relativa
  const pos = id => { const i = (salvo.ordem || []).indexOf(id); return i < 0 ? 1000 + secs.findIndex(s => s.dataset.cat === id) : i; };
  secs.sort((a, b) => pos(a.dataset.cat) - pos(b.dataset.cat)).forEach(s => caixa.append(s));
  for (const sec of secs) {
    const id = sec.dataset.cat, aberta = salvo.abertas?.[id] ?? !sec.hasAttribute('data-fechada');
    abrirCategoria(sec, aberta);
    sec.querySelector('.ed-cat-abrir').addEventListener('click', () => {
      const ab = sec.hasAttribute('data-fechada'); abrirCategoria(sec, ab);
      gravarCats(d => { d.abertas = { ...(d.abertas || {}), [id]: ab }; });
    });
    const alca = sec.querySelector('.ed-cat-mover');
    alca.addEventListener('keydown', e => {
      if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
      e.preventDefault();
      const viz = e.key === 'ArrowUp' ? sec.previousElementSibling : sec.nextElementSibling;
      if (!viz) return;
      if (e.key === 'ArrowUp') caixa.insertBefore(sec, viz); else caixa.insertBefore(viz, sec);
      alca.focus(); guardarOrdem(caixa);
    });
    // arrastar (mouse e dedo): a categoria acompanha o ponteiro, trocando de lugar com a vizinha cujo meio ele cruza.
    // Ouve na janela (mover o nó no DOM solta a captura do ponteiro); perto da borda, o painel rola sozinho enquanto segura.
    alca.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      e.preventDefault(); sec.classList.add('arrastando');
      const rolar = caixa.closest('.painel'), noPainel = () => rolar && getComputedStyle(rolar).overflowY === 'auto';
      let y = e.clientY, rodando = true;
      const meio = el => { const r = el.getBoundingClientRect(); return r.top + r.height / 2; };
      const trocar = () => {
        const ant = sec.previousElementSibling, prox = sec.nextElementSibling;
        if (ant && y < meio(ant)) caixa.insertBefore(sec, ant);           // subir: passa a de cima
        else if (prox && y > meio(prox)) caixa.insertBefore(prox, sec);   // descer: passa a de baixo
      };
      const passo = () => {
        if (!rodando) return;
        const topoFixo = document.querySelector('.ed-fixo')?.getBoundingClientRect().bottom ?? 0;   // o esquema preso cobre o alto
        if (noPainel()) { const r = rolar.getBoundingClientRect(), topo = Math.max(r.top, topoFixo);
          if (y < topo + 40) rolar.scrollTop -= 10; else if (y > r.bottom - 40) rolar.scrollTop += 10; }
        else if (y < topoFixo + 40) scrollBy(0, -10); else if (y > innerHeight - 40) scrollBy(0, 10);   // celular: a página inteira rola
        trocar(); requestAnimationFrame(passo);
      };
      const mover = ev => { y = ev.clientY; trocar(); };
      const fim = () => { rodando = false; removeEventListener('pointermove', mover); removeEventListener('pointerup', fim); removeEventListener('pointercancel', fim);
        sec.classList.remove('arrastando'); guardarOrdem(caixa); alca.focus({ preventScroll:true }); };
      addEventListener('pointermove', mover); addEventListener('pointerup', fim); addEventListener('pointercancel', fim);
      requestAnimationFrame(passo);
    });
  }
}
