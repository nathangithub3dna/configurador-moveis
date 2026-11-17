// TELA — cubo de navegação no canto do 3D (item 70): clicar numa face, aresta ou canto gira a câmera até ela; casa = vista inicial; botão Ortogonal junto
/* ---------- Cubo de navegação ---------- */
// Cada face é dividida em 3 × 3: o meio é a face, as bordas são as arestas e os cantos são os cantos do cubo.
// A direção da câmera = normal da face + vizinhas (ex.: canto de cima à direita da Frente = frente + direita + topo).
const FACES_CUBO = [
  { nome:'Frente',   n:[0,0,1],  u:[1,0,0],  v:[0,1,0] },
  { nome:'Trás',     n:[0,0,-1], u:[-1,0,0], v:[0,1,0] },
  { nome:'Direita',  n:[1,0,0],  u:[0,0,-1], v:[0,1,0] },
  { nome:'Esquerda', n:[-1,0,0], u:[0,0,1],  v:[0,1,0] },
  { nome:'Topo',     n:[0,1,0],  u:[1,0,0],  v:[0,0,-1] },
  { nome:'Base',     n:[0,-1,0], u:[1,0,0],  v:[0,0,1] },
];
const cuboCorpo = $('cuboCorpo');
const espelhoY = new THREE.Matrix4().makeScale(1, -1, 1);       // o CSS tem o y para baixo; o 3D, para cima
const cssMatriz = m => 'matrix3d(' + espelhoY.clone().multiply(m).multiply(espelhoY).elements.map(x => +x.toFixed(6)).join(',') + ')';
for (const f of FACES_CUBO) {
  const face = el('div', { class:'cubo-face' });
  const base = new THREE.Matrix4().makeBasis(new THREE.Vector3(...f.u), new THREE.Vector3(...f.v), new THREE.Vector3(...f.n));
  face.style.transform = cssMatriz(base) + ' translateZ(calc(var(--cubo) / 2))';
  for (const j of [1, 0, -1]) for (const i of [-1, 0, 1]) {
    const d = f.n.map((x, k) => x + i*f.u[k] + j*f.v[k]);
    const zona = el('div', { class:'cubo-zona' + (i || j ? '' : ' meio') });
    zona.dataset.dir = d.join(',');
    if (!i && !j) { zona.textContent = f.nome; zona.title = 'Vista: ' + f.nome; }
    face.append(zona);
  }
  cuboCorpo.append(face);
}

// gira o cubo junto com a câmera (chamado a cada quadro em inicio.js)
const qCubo = new THREE.Quaternion(); let orto0 = null;
function atualizarCubo() {
  if (!cam.quaternion.equals(qCubo)) {
    qCubo.copy(cam.quaternion);
    cuboCorpo.style.transform = cssMatriz(new THREE.Matrix4().makeRotationFromQuaternion(qCubo.clone().invert()));
  }
  if (orto0 !== estado.orto) { orto0 = estado.orto; $('cuboOrto').setAttribute('aria-pressed', estado.orto); }
}

// leva a câmera até a direção "dir" girando em volta do móvel (meio segundo; sem animação se o aparelho pede movimento reduzido)
let giroCubo = 0;
function girarCameraPara(dir, enquadrar) {
  const d = new THREE.Vector3(...dir).normalize();
  if (Math.abs(d.y) > 0.999) d.set(0, Math.sign(d.y), 0.0001).normalize();   // de cima ou de baixo: a frente fica embaixo
  const alvo0 = controles.target.clone(), dist0 = cam.position.distanceTo(alvo0);
  const fim = enquadrar ? enquadramento() : { c: alvo0, dist: dist0 };
  const s0 = new THREE.Spherical().setFromVector3(cam.position.clone().sub(alvo0)), s1 = new THREE.Spherical().setFromVector3(d);
  let dTheta = s1.theta - s0.theta; dTheta = Math.atan2(Math.sin(dTheta), Math.cos(dTheta));   // pelo caminho mais curto
  const id = ++giroCubo, t0 = performance.now(), dur = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 450;
  const passo = agora => {
    if (id !== giroCubo) return;
    const t = dur ? Math.min(1, (agora - t0) / dur) : 1, e = t < 0.5 ? 2*t*t : 1 - (-2*t + 2)**2 / 2;
    const s = new THREE.Spherical(1, s0.phi + (s1.phi - s0.phi)*e, s0.theta + dTheta*e);
    const c = alvo0.clone().lerp(fim.c, e), dist = dist0 + (fim.dist - dist0)*e;
    controles.target.copy(c);
    cam.position.copy(c).add(new THREE.Vector3().setFromSpherical(s).multiplyScalar(dist));
    if (enquadrar && cam === camO) { camO.zoom += (1 - camO.zoom)*e; camO.updateProjectionMatrix(); }
    cam.lookAt(c); controles.update();
    if (t < 1) requestAnimationFrame(passo);
  };
  requestAnimationFrame(passo);
}
// a câmera parada por arrasto do usuário cancela o giro em andamento
controles.addEventListener('start', () => { giroCubo++; });

let cuboBaixo = null;
cuboCorpo.addEventListener('pointerdown', e => { cuboBaixo = [e.clientX, e.clientY]; });
cuboCorpo.addEventListener('click', e => {
  const z = e.target.closest('.cubo-zona'); if (!z) return;
  if (cuboBaixo && (e.clientX - cuboBaixo[0])**2 + (e.clientY - cuboBaixo[1])**2 > 36) return;   // arrastou: não é clique
  const dir = z.dataset.dir.split(',').map(Number);
  const nomes = { '0,0,1':'frente', '1,0,0':'lateral', '0,1,0':'topo' };
  estado.vista = nomes[dir.join(',')] || 'livre';
  girarCameraPara(dir);
});
$('cuboCasa').addEventListener('click', () => {
  estado.vista = 'perspectiva';
  girarCameraPara(VISTAS_DIR.perspectiva, true);
});
$('cuboOrto').addEventListener('click', () => { estado.orto = !estado.orto; $('cuboOrto').setAttribute('aria-pressed', estado.orto); trocarCamera(estado.orto); });   // o botão Ortogonal da barra saiu (17/11)
