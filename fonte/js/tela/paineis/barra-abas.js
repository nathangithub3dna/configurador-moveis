// TELA — barra de ferramentas e abas (parte do antigo tela.js, na mesma ordem: ver pagina.html)
/* ---------- Barra de ferramentas ---------- */
const alternar = (id, chave, depois) => $(id).addEventListener('click', () => {
  estado[chave] = !estado[chave]; $(id).setAttribute('aria-pressed', estado[chave]); depois && depois();
});
alternar('bPortas', 'portas', construirCotas);
alternar('bGavetas', 'gavetas', construirCotas);
alternar('bCotas', 'cotas', construirCotas);
alternar('bMedir', 'medir', () => { limparMedida(); $('dica').textContent = estado.medir ? 'Medir: toque em dois pontos. Perto de um canto, o ponto gruda no canto.' : 'Arraste para girar · botão direito ou dois dedos para mover · roda ou pinça para zoom · toque numa peça · clique direito parado (ou toque longo): abrir portas e gavetas'; });
alternar('bTampo', 'tampo', aplicarVisibilidade);
alternar('bFix', 'fix', aplicarFix);
alternar('bFundo', 'fundo', aplicarVisibilidade);
alternar('bParedes', 'paredes', aplicarVisibilidade);
alternar('bEsgoto', 'esgoto', aplicarVisibilidade);
alternar('bOrto', 'orto', () => trocarCamera(estado.orto));
$('selVista').addEventListener('change', e => { estado.vista = e.target.value; aplicarVista(estado.vista); });
$('rExplodir').addEventListener('input', e => { estado.explode = Number(e.target.value)/100; });
$('rExplodir').addEventListener('change', construirCotas);
function aplicarCorte() {
  planos.length = 0;
  if (estado.corte !== 'nenhum' && dimsCena) {
    const f = estado.cortePos/100, { L, H, P } = dimsCena;
    if (estado.corte === 'x') planos.push(new THREE.Plane(new THREE.Vector3(-1,0,0), L*f));
    if (estado.corte === 'y') planos.push(new THREE.Plane(new THREE.Vector3(0,-1,0), dimsCena.alturaTampo*f));
    if (estado.corte === 'z') planos.push(new THREE.Plane(new THREE.Vector3(0,0,-1), P*f));
  }
  [...Object.values(matCat), matSel, matLinha].forEach(m => m.needsUpdate = true);
  $('rCorte').disabled = estado.corte === 'nenhum';
}
$('selCorte').addEventListener('change', e => { estado.corte = e.target.value; aplicarCorte(); });
$('rCorte').addEventListener('input', e => { estado.cortePos = Number(e.target.value); aplicarCorte(); });

/* ---------- Abas ---------- */
[['abaParam','painelParam'],['abaPecas','painelPecas']].forEach(([a,p], _, todos) => $(a).addEventListener('click', () => {
  todos.forEach(([a2,p2]) => { $(a2).setAttribute('aria-selected', a2===a); $(p2).hidden = a2!==a; });
}));
