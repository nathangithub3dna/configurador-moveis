// TELA — câmera e vistas: enquadrar o móvel, vistas prontas, perspectiva/ortogonal (o cubo de navegação fica em cubo.js)
/* ---------- Câmera e vistas ---------- */
function ajustarOrto() {
  const w = palco.clientWidth || 1, h = palco.clientHeight || 1, m = dimsCena ? Math.max(dimsCena.L, dimsCena.H, dimsCena.P) : 1000;
  const asp = w/h, meia = m * 0.85 * (asp < 1.25 ? 1.25/asp : 1);
  camO.left = -meia*asp; camO.right = meia*asp; camO.top = meia; camO.bottom = -meia; camO.updateProjectionMatrix();
}
const VISTAS_DIR = { perspectiva:[0.85,0.6,1.2], frente:[0,0,1], lateral:[1,0,0], topo:[0,1,0.0001] };
// centro do móvel e distância da câmera para ele caber na tela (usado também pela casa do cubo de navegação)
function enquadramento() {
  const { L, H, P } = dimsCena, m = Math.max(L, H, P), asp = camP.aspect || 1;
  return { c: new THREE.Vector3(L/2, H/2, P/2), dist: m * 2.9 * (asp < 1.25 ? 1.25/asp : 1) };
}
function aplicarVista(nome) {
  if (!dimsCena) return;
  const { c, dist } = enquadramento();
  const d = new THREE.Vector3(...VISTAS_DIR[nome]).normalize();
  camP.position.copy(c).addScaledVector(d, dist);
  camO.position.copy(c).addScaledVector(d, dist); camO.zoom = 1; ajustarOrto();
  controles.target.copy(c); cam.updateProjectionMatrix(); controles.update();
}
function trocarCamera(orto) {
  const nova = orto ? camO : camP; if (nova === cam) return;
  nova.position.copy(cam.position); nova.quaternion.copy(cam.quaternion);
  cam = nova; controles.object = cam; ajustarOrto(); cam.updateProjectionMatrix(); controles.update();
}
