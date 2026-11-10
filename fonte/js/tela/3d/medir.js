// TELA — medir no 3D (parte do antigo tela.js, na mesma ordem: ver pagina.html)
/* ---------- Medir ---------- */
const medida = { pts:[] };
function limparMedida(fecharFicha = true) {
  grupoMedida.children.slice().forEach(o => { grupoMedida.remove(o); o.element?.remove(); });
  medida.pts = [];
  if (fecharFicha && !estado.sel) $('ficha').hidden = true;
}
function pontoMedida(hit) {
  const box = new THREE.Box3().setFromObject(hit.object);
  let melhor = hit.point.clone(), dmin = 25;
  for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) {
    const v = new THREE.Vector3(x,y,z), dd = v.distanceTo(hit.point); if (dd < dmin) { dmin = dd; melhor = v; }
  }
  if (medida.pts.length >= 2) limparMedida(false);
  medida.pts.push(melhor);
  const s = new THREE.Mesh(new THREE.SphereGeometry(5, 12, 8), matMed); s.position.copy(melhor); s.renderOrder = 11; grupoMedida.add(s);
  if (medida.pts.length === 2) {
    const [a, b] = medida.pts, dist = a.distanceTo(b);
    const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints([a,b]), matCota); l.renderOrder = 11; grupoMedida.add(l);
    const r = new CSS2DObject(el('div', { class:'cota-rot med', text:`${fmt(dist)} mm` })); r.position.copy(a).lerp(b,0.5); grupoMedida.add(r);
    estado.sel = null; destacar();
    $('fNome').textContent = 'Medida';
    $('fMed').textContent = `${fmt(dist)} mm`;
    $('fDet').textContent = `Δx ${fmt(Math.abs(b.x-a.x))} · Δy ${fmt(Math.abs(b.y-a.y))} · Δz ${fmt(Math.abs(b.z-a.z))} mm`;
    $('fObs').textContent = 'Pontos perto de um canto grudam no canto.'; $('fGlb').textContent = ''; $('fDesenho').hidden = true; $('fAjuste').replaceChildren();
    $('ficha').hidden = false;
  }
}
