// TELA — cena 3D técnica: materiais, peças, luzes, explodir, cortes, tema (parte do antigo tela.js, na mesma ordem: ver pagina.html)
/* =====================================================================
   6. CENA 3D TÉCNICA
   ===================================================================== */
const palco = $('palco');
const renderer = new THREE.WebGLRenderer({ antialias:true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, 2));
renderer.localClippingEnabled = true;
palco.prepend(renderer.domElement);
const rotulos = new CSS2DRenderer(); rotulos.domElement.className = 'rotulos'; palco.append(rotulos.domElement);

const cena = new THREE.Scene();
const camP = new THREE.PerspectiveCamera(32, 1, 5, 60000);
const camO = new THREE.OrthographicCamera(-1, 1, 1, -1, -60000, 60000);
let cam = camP;
const controles = new OrbitControls(cam, renderer.domElement);
controles.enableDamping = true; controles.dampingFactor = 0.12;

cena.add(new THREE.HemisphereLight(0xffffff, 0x9aa3a8, 1.9));
const luz1 = new THREE.DirectionalLight(0xffffff, 1.5); luz1.position.set(1400, 2200, 2600); cena.add(luz1);
const luz2 = new THREE.DirectionalLight(0xffffff, 0.5); luz2.position.set(-1600, 900, 800); cena.add(luz2);

const planos = [];
const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
const matCat = {}; Object.keys(CATS).forEach(c => matCat[c] = new THREE.MeshLambertMaterial({ clippingPlanes:planos, side:THREE.DoubleSide, polygonOffset:true, polygonOffsetFactor:1, polygonOffsetUnits:1 }));
const matFix = {
  'paraf-40x50': new THREE.MeshLambertMaterial({ color:0xe8772e, clippingPlanes:planos }),
  'paraf-40x30': new THREE.MeshLambertMaterial({ color:0xd9a21b, clippingPlanes:planos }),
  'paraf-35x14': new THREE.MeshLambertMaterial({ color:0xc94f8a, clippingPlanes:planos }),
  'paraf-35x25': new THREE.MeshLambertMaterial({ color:0x8e5bd0, clippingPlanes:planos }),
  'paraf-50x60-bucha': new THREE.MeshLambertMaterial({ color:0xd8322b, clippingPlanes:planos }),
  'cavilha-8x30': new THREE.MeshLambertMaterial({ color:0x2f9e6b, clippingPlanes:planos }),
  'pino-5': new THREE.MeshLambertMaterial({ color:0x3b82c4, clippingPlanes:planos }),
};
const matCor = {};
const matDe = pc => pc.cor === undefined ? matCat[pc.cat] : (matCor[pc.cor] ||= new THREE.MeshLambertMaterial({ color:pc.cor, clippingPlanes:planos }));
const geoFix = {}, geoCabeca = new THREE.CylinderGeometry(4, 4, 2, 12);
let fixObjs = [];
function aplicarFix() {
  const on = estado.fix;
  for (const c of ['caixa','gaveta','enchimento','fundo','frente']) { const m = matCat[c]; if (!m) continue; m.transparent = on; m.opacity = on ? 0.16 : 1; m.depthWrite = !on; m.needsUpdate = true; }
  fixObjs.forEach(o => o.visible = on);
  const leg = document.getElementById('legFix'); if (leg) leg.hidden = !on;
}
matCat.tampo.transparent = true; matCat.tampo.opacity = 0.5; matCat.tampo.depthWrite = false;
const matSel = new THREE.MeshLambertMaterial({ clippingPlanes:planos, side:THREE.DoubleSide, polygonOffset:true, polygonOffsetFactor:1, polygonOffsetUnits:1 });
const matLinha = new THREE.LineBasicMaterial({ clippingPlanes:planos, transparent:true, opacity:0.7 });
const matCota = new THREE.LineBasicMaterial({ depthTest:false, transparent:true });
const matMed = new THREE.MeshBasicMaterial({ depthTest:false });
const matParede = new THREE.MeshLambertMaterial({ side:THREE.DoubleSide, transparent:true, opacity:0.55, depthWrite:false });
const matEsgoto = new THREE.MeshBasicMaterial({ transparent:true, opacity:0.28, depthWrite:false, side:THREE.DoubleSide });

const raiz = new THREE.Group(); cena.add(raiz);
const ambiente = new THREE.Group(); cena.add(ambiente);
const grupoCotas = new THREE.Group(); cena.add(grupoCotas);
const grupoMedida = new THREE.Group(); cena.add(grupoMedida);
let nos = new Map(), grade = null, esgotoObj = null, dimsCena = null;

function geometriaDe(pc) {
  const [x0,x1,y0,y1,z0,z1] = pc.box, w=x1-x0, h=y1-y0, d=z1-z0;
  const c = [(x0+x1)/2, (y0+y1)/2, (z0+z1)/2];
  let g;
  if (pc.forma?.tipo === 'livre') {
    // peça livre: contorno do desenho (recortes na borda de cima, vazados) extrudado para dentro da face A, nos eixos da peça
    const f = pc.forma, pts = [[0,0],[f.W,0],[f.W,f.H]];
    f.recortes.slice().sort((a,b) => b.x - a.x).forEach(r => pts.push([r.x+r.w,f.H],[r.x+r.w,f.H-r.h],[r.x,f.H-r.h],[r.x,f.H]));
    pts.push([0,f.H]);
    const sh = new THREE.Shape(pts.map(([u,v]) => new THREE.Vector2(u,v)));
    f.rasgos.forEach(r => sh.holes.push(new THREE.Path([[r.x,r.y],[r.x,r.y+r.h],[r.x+r.w,r.y+r.h],[r.x+r.w,r.y]].map(([u,v]) => new THREE.Vector2(u,v)))));
    g = new THREE.ExtrudeGeometry(sh, { depth:pc.esp, bevelEnabled:false }); g.translate(0, 0, -pc.esp);
    g.applyMatrix4(new THREE.Matrix4().makeBasis(new THREE.Vector3(...f.du), new THREE.Vector3(...f.dv), new THREE.Vector3(...f.n)).setPosition(...f.origem));
  } else if (pc.forma?.tipo === 'recorte') {
    const { rl, rp } = pc.forma, a=(w-rl)/2;
    const s = new THREE.Shape([[0,0],[a,0],[a,rp],[a+rl,rp],[a+rl,0],[w,0],[w,d],[0,d]].map(([u,v])=>new THREE.Vector2(u,v)));
    g = new THREE.ExtrudeGeometry(s, { depth:h, bevelEnabled:false });
    g.rotateX(Math.PI/2); g.translate(x0, y1, z0);
  } else if (pc.forma?.tipo === 'rasgos') {
    // chapa vertical (espessura em x) com rasgos passantes; contorno no plano (z, y)
    const sh = new THREE.Shape([[z0,y0],[z1,y0],[z1,y1],[z0,y1]].map(([u,v]) => new THREE.Vector2(u,v)));
    for (const r of pc.forma.lista) { const f = new THREE.Path([[r.z0,r.y0],[r.z0,r.y1],[r.z1,r.y1],[r.z1,r.y0]].map(([u,v]) => new THREE.Vector2(u,v))); sh.holes.push(f); }
    g = new THREE.ExtrudeGeometry(sh, { depth:w, bevelEnabled:false }); g.rotateY(-Math.PI/2); g.translate(x1, 0, 0);
  } else if (pc.forma?.tipo === 'cil' && pc.forma.eixo === 'y') {
    g = new THREE.CylinderGeometry(w/2, w/2, h, 40); g.translate(...c);
  } else if (pc.forma?.tipo === 'cil') {
    g = new THREE.CylinderGeometry(w/2, w/2, d, 28); g.rotateX(Math.PI/2); g.translate(...c);
  } else if (pc.forma?.tipo === 'puxador') {
    const v = pc.forma.dir === 'v', comp = v ? h : w, larg = v ? w : h, mod = pc.forma.modelo || 'barra';
    if (mod === 'perfil') {
      // perfil G de borda (cava): tampa em cima na profundidade toda + aba na frente cobrindo a parte de cima; a cava fica atrás da aba
      // a tampa fica do lado de fora (a borda onde o perfil está): em cima, embaixo, à esquerda ou à direita
      const sd = pc.forma.saida || (pc.forma.embaixo ? 'baixo' : 'cima'), deLado = sd === 'esq' || sd === 'dir', s = sd === 'baixo' || sd === 'esq' ? -1 : 1;
      const tampa = deLado ? new THREE.BoxGeometry(3, h, d) : new THREE.BoxGeometry(w, 3, d);
      if (deLado) tampa.translate(s*(w/2 - 1.5), 0, 0); else tampa.translate(0, s*(h/2 - 1.5), 0);
      const aba = deLado ? new THREE.BoxGeometry(w*0.55, h, 2) : new THREE.BoxGeometry(w, h*0.55, 2);
      if (deLado) aba.translate(s*(w/2 - w*0.275), 0, d/2 - 1); else aba.translate(0, s*(h/2 - h*0.275), d/2 - 1);
      const fundo = new THREE.BoxGeometry(w, h, 2); fundo.translate(0, 0, -d/2 + 1);
      g = mergeGeometries([tampa, aba, fundo].map(q => q.toNonIndexed())); g.translate(...c);
    } else if (mod === 'bloco') {
      g = new THREE.BoxGeometry(v?larg:comp, v?comp:larg, d); g.translate(c[0], c[1], z0 + d/2);
    } else if (mod === 'concha') {
      // concha: base fina na frente + casca saliente (o dedo entra por baixo)
      const base = new THREE.BoxGeometry(v?larg:comp, v?comp:larg, 4); base.translate(0, 0, 2);
      const casca = new THREE.BoxGeometry(v?larg:comp, v?comp:larg*0.55, d - 4); casca.translate(0, v?0:larg*0.22, 4 + (d-4)/2);
      g = mergeGeometries([base, casca].map(q => q.toNonIndexed())); g.translate(c[0], c[1], z0);
    } else {
      const barra = Math.min(10, d*0.3), haste = d - barra, fur = pc.forma.furacao || (comp - 32);
      const b = new THREE.BoxGeometry(v?larg:comp, v?comp:larg, barra); b.translate(0, 0, haste + barra/2);
      const parts = [b];
      [-1,1].forEach(sn => { const hs = new THREE.BoxGeometry(Math.min(8,larg), Math.min(8,larg), haste); hs.translate(v?0:sn*fur/2, v?sn*fur/2:0, haste/2); parts.push(hs); });
      g = mergeGeometries(parts.map(q => q.toNonIndexed())); g.translate(c[0], c[1], z0);
    }
  } else {
    g = new THREE.BoxGeometry(w, h, d); g.translate(...c);
  }
  return g;
}

function construirCena(res) {
  raiz.clear(); nos = new Map();
  const d = res.dims; dimsCena = d;
  const mid = new THREE.Vector3(d.L/2, d.H/2, d.P/2);
  const centro = pc => new THREE.Vector3((pc.box[0]+pc.box[1])/2, (pc.box[2]+pc.box[3])/2, (pc.box[4]+pc.box[5])/2);
  const porId = new Map(res.pecas.map(pc => [pc.id, pc]));
  for (const pc of res.pecas) {
    const g = geometriaDe(pc);
    const mesh = new THREE.Mesh(g, matDe(pc));
    mesh.userData.peca = pc;
    if (pc.cat !== 'tampo') mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(g, 25), matLinha));
    const wrapper = new THREE.Group(), mover = new THREE.Group();
    if (pc.mov?.tipo === 'porta') { mover.position.set(pc.mov.pivX, 0, pc.mov.pivZ); mesh.position.set(-pc.mov.pivX, 0, -pc.mov.pivZ); }
    if (pc.mov?.tipo === 'basculante') { mover.position.set(pc.mov.pivX || 0, pc.mov.pivY, pc.mov.pivZ); mesh.position.copy(mover.position).multiplyScalar(-1); }   // gira na borda do eixo (em cima; embaixo se abre para baixo)
    mover.add(mesh); wrapper.add(mover); raiz.add(wrapper);
    const cExp = centro(pc.expPai ? porId.get(pc.expPai) : pc);
    nos.set(pc.id, { pc, mesh, wrapper, mover, dirExp: cExp.sub(mid), ang:0, slide:0 });
  }
  // fixações: ficam dentro do grupo da peça "dona" para acompanhar gaveta/explosão
  fixObjs = [];
  const fixs = res.fixacoes || calcularFixacoes(res.pecas), eixoY = new THREE.Vector3(0,1,0);
  for (const f of fixs) {
    const no = nos.get(f.dono); if (!no) continue;
    const chave = f.d + 'x' + f.comp;
    if (!geoFix[chave]) geoFix[chave] = new THREE.CylinderGeometry(f.d/2, f.d/2, f.comp, 10);
    const m = new THREE.Mesh(geoFix[chave], matFix[f.tipo] || matFix['paraf-40x50']);
    const d = new THREE.Vector3(...f.dir);
    m.quaternion.setFromUnitVectors(eixoY, d);
    m.position.set(...f.p).addScaledVector(d, f.comp/2).add(no.mesh.position);
    m.userData.fix = f; no.mover.add(m); fixObjs.push(m);
    if (f.tipo === 'paraf-40x50' || f.tipo === 'paraf-50x60-bucha') {          // cabeça
      const c = new THREE.Mesh(geoCabeca, m.material); c.quaternion.copy(m.quaternion);
      c.position.set(...f.p).addScaledVector(d, 1).add(no.mesh.position); no.mover.add(c); fixObjs.push(c);
    }
  }
  aplicarFix();
  $('bTampo').hidden = !res.pecas.some(p => p.cat === 'tampo');
  $('bEsgoto').hidden = !d.faixaEsgoto;
  construirAmbiente(d);
  aplicarVisibilidade();
  if (estado.sel && !nos.has(estado.sel)) estado.sel = null;
  destacar();
  construirCotas();
  limparMedida();
}

function construirAmbiente(d) {
  ambiente.clear();
  const ext = Math.max(d.L, d.P) + 1400;
  grade = new THREE.GridHelper(ext, Math.round(ext/100), css('--v-grade'), css('--v-grade'));
  grade.position.set(d.L/2, 0, d.P/2 + 300); grade.material.transparent = true; grade.material.opacity = 0.6;
  ambiente.add(grade);
  const pw = d.L + 900, ph = d.alturaTampo + 700;
  const fundo = new THREE.Mesh(new THREE.PlaneGeometry(pw, ph), matParede); fundo.position.set(d.L/2, ph/2, -1); fundo.userData.parede = true; ambiente.add(fundo);
  const lat = (x) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(d.P + 700, ph), matParede); m.rotation.y = Math.PI/2; m.position.set(x, ph/2, (d.P+700)/2); m.userData.parede = true; ambiente.add(m); };
  if (d.paredeEsq) lat(-1); if (d.paredeDir) lat(d.L + 1);
  esgotoObj = null;
  if (!d.faixaEsgoto) { aplicarVisibilidade(); return; }
  const [f0, f1] = d.faixaEsgoto;
  esgotoObj = new THREE.Group();
  const faixa = new THREE.Mesh(new THREE.PlaneGeometry(d.L + 300, f1 - f0), matEsgoto); faixa.position.set(d.L/2, (f0+f1)/2, 8); esgotoObj.add(faixa);
  const div = el('div', { class:'cota-rot esg', text:`Esgoto ${fmt(f0)}–${fmt(f1)} mm` });
  const rot = new CSS2DObject(div); rot.position.set(d.L + 150, (f0+f1)/2, 8); esgotoObj.add(rot);
  ambiente.add(esgotoObj);
  aplicarVisibilidade();
}

function aplicarVisibilidade() {
  for (const { pc, wrapper } of nos.values()) {
    wrapper.visible = !estado.ocultas.has(pc.id) && !(pc.cat==='tampo' && !estado.tampo) && !(pc.cat==='fundo' && !estado.fundo);
  }
  ambiente.children.forEach(o => { if (o.userData.parede) o.visible = estado.paredes; });
  if (esgotoObj) { esgotoObj.visible = estado.esgoto; esgotoObj.traverse(o => { if (o.isCSS2DObject) o.visible = estado.esgoto; }); }
}

function aplicarTema() {
  renderer.setClearColor(css('--v-bg'));
  Object.keys(CATS).forEach(c => matCat[c].color.set(css('--v-'+c)));
  matSel.color.set(css('--accent')); matLinha.color.set(css('--v-linha'));
  matCota.color.set(css('--accent')); matMed.color.set(css('--accent'));
  matParede.color.set(css('--v-parede')); matEsgoto.color.set(css('--v-esgoto'));
  if (dimsCena) construirAmbiente(dimsCena);
}
try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', aplicarTema); } catch(e) {}
new MutationObserver(aplicarTema).observe(document.documentElement, { attributes:true, attributeFilter:['data-theme'] });
