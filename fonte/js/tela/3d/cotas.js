// TELA — cotas no 3D (parte do antigo tela.js, na mesma ordem: ver pagina.html)
/* ---------- Cotas ---------- */
function cota(a, b, desl, texto) {
  const A = a.clone().add(desl), B = b.clone().add(desl);
  const ext = desl.clone().multiplyScalar(1.15);
  const pts = [A, B, a, a.clone().add(ext), b, b.clone().add(ext)];
  const g = new THREE.BufferGeometry().setFromPoints(pts);
  const linhas = new THREE.LineSegments(g, matCota); linhas.renderOrder = 10; grupoCotas.add(linhas);
  const r = new CSS2DObject(el('div', { class:'cota-rot', text:texto })); r.position.copy(A).lerp(B, 0.5); grupoCotas.add(r);
}
function construirCotas() {
  grupoCotas.children.slice().forEach(o => { grupoCotas.remove(o); o.element?.remove(); });
  if (!estado.cotas || !dimsCena) return;
  const { L, H, P } = dimsCena, V = (x,y,z) => new THREE.Vector3(x,y,z);
  cota(V(0,0,P), V(L,0,P), V(0,0,140), `${fmt(L)}`);
  cota(V(L,0,P), V(L,H,P), V(140,0,0), `${fmt(H)}`);
  cota(V(L,0,0), V(L,0,P), V(140,0,0), `${fmt(P)}`);
  const no = estado.sel && nos.get(estado.sel);
  if (no && estado.explode < 0.01 && !(no.ang > 0.5 || no.slide > 0.5)) {
    const [x0,x1,y0,y1,z0,z1] = no.pc.box;
    cota(V(x0,y1,z1), V(x1,y1,z1), V(0,50,30), fmt(x1-x0));
    cota(V(x1,y0,z1), V(x1,y1,z1), V(50,0,30), fmt(y1-y0));
    cota(V(x1,y1,z0), V(x1,y1,z1), V(50,50,0), fmt(z1-z0));
  }
}
