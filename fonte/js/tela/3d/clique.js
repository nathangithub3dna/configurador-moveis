// TELA — clique, botão direito e toque longo no 3D (parte do antigo tela.js, na mesma ordem: ver pagina.html)
/* ---------- Clique no 3D ---------- */
const ray = new THREE.Raycaster(), mouse = new THREE.Vector2();
let baixo = null;
// menu do clique direito (abrir portas/gavetas): clique direito sem arrastar; no celular, toque longo parado.
// Arrastar com o botão direito continua movendo a vista. O clique direito não seleciona peça.
let toqueLongo = null, menuPeloToque = false;
function mostrarMenu3D(x, y) {
  const m = $('menu3d'), r = $('palco').getBoundingClientRect();
  m.hidden = false;
  const w = m.offsetWidth, h = m.offsetHeight;
  m.style.left = Math.max(8, Math.min(x - r.left, r.width - w - 8)) + 'px';
  m.style.top = Math.max(8, Math.min(y - r.top, r.height - h - 8)) + 'px';
}
const fecharMenu3D = () => { $('menu3d').hidden = true; };
$('menu3d').addEventListener('click', e => { if (e.target.closest('button')) setTimeout(fecharMenu3D, 0); });
document.addEventListener('pointerdown', e => { if (!$('menu3d').hidden && !$('menu3d').contains(e.target)) fecharMenu3D(); }, true);
addEventListener('keydown', e => { if (e.key === 'Escape') fecharMenu3D(); });
renderer.domElement.addEventListener('contextmenu', e => e.preventDefault());
renderer.domElement.addEventListener('pointerdown', e => {
  baixo = [e.clientX, e.clientY, e.button]; menuPeloToque = false; clearTimeout(toqueLongo);
  if (e.pointerType === 'touch') toqueLongo = setTimeout(() => { if (baixo) { menuPeloToque = true; mostrarMenu3D(baixo[0], baixo[1]); } }, 550);
});
renderer.domElement.addEventListener('pointermove', e => { if (baixo && (e.clientX-baixo[0])**2 + (e.clientY-baixo[1])**2 > 36) clearTimeout(toqueLongo); });
renderer.domElement.addEventListener('pointercancel', () => { clearTimeout(toqueLongo); baixo = null; });
renderer.domElement.addEventListener('pointerup', e => {
  clearTimeout(toqueLongo);
  if (!baixo) return; const dx = e.clientX-baixo[0], dy = e.clientY-baixo[1], botao = baixo[2]; baixo = null;
  if (dx*dx + dy*dy > 36) return;
  if (menuPeloToque) { menuPeloToque = false; return; }      // o toque longo abriu o menu: não seleciona
  if (botao === 2) { mostrarMenu3D(e.clientX, e.clientY); return; }
  const r = renderer.domElement.getBoundingClientRect();
  mouse.set(((e.clientX-r.left)/r.width)*2-1, -((e.clientY-r.top)/r.height)*2+1);
  ray.setFromCamera(mouse, cam);
  const alvos = [...nos.values()].filter(n => n.wrapper.visible).map(n => n.mesh);
  const hit = ray.intersectObjects(alvos, false).find(h => !planos.length || planos[0].distanceToPoint(h.point) >= 0);
  if (estado.medir) { if (hit) pontoMedida(hit); return; }
  selecionar(hit ? hit.object.userData.peca.id : null);
});
addEventListener('keydown', e => { if (e.key === 'Escape') { limparMedida(); selecionar(null); } });
