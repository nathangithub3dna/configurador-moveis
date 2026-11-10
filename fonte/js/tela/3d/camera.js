// TELA — câmera e vistas (parte do antigo tela.js, na mesma ordem: ver pagina.html)
/* ---------- Câmera e vistas ---------- */
function ajustarOrto() {
  const w = palco.clientWidth || 1, h = palco.clientHeight || 1, m = dimsCena ? Math.max(dimsCena.L, dimsCena.H, dimsCena.P) : 1000;
  const asp = w/h, meia = m * 0.85 * (asp < 1.25 ? 1.25/asp : 1);
  camO.left = -meia*asp; camO.right = meia*asp; camO.top = meia; camO.bottom = -meia; camO.updateProjectionMatrix();
}
function aplicarVista(nome) {
  if (!dimsCena) return;
  const { L, H, P } = dimsCena, c = new THREE.Vector3(L/2, H/2, P/2), m = Math.max(L, H, P);
  const dirs = { perspectiva:[0.85,0.6,1.2], frente:[0,0,1], lateral:[1,0,0], topo:[0,1,0.0001] };
  const d = new THREE.Vector3(...dirs[nome]).normalize();
  const asp = camP.aspect || 1, dist = m * 2.9 * (asp < 1.25 ? 1.25/asp : 1);
  camP.position.copy(c).addScaledVector(d, dist);
  camO.position.copy(c).addScaledVector(d, dist); camO.zoom = 1; ajustarOrto();
  controles.target.copy(c); cam.updateProjectionMatrix(); controles.update();
}
function trocarCamera(orto) {
  const nova = orto ? camO : camP; if (nova === cam) return;
  nova.position.copy(cam.position); nova.quaternion.copy(cam.quaternion);
  cam = nova; controles.object = cam; ajustarOrto(); cam.updateProjectionMatrix(); controles.update();
}
