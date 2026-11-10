/* =====================================================================
   5. ESTADO DA PÁGINA
   ===================================================================== */
const CHAVE = 'configurador-moveis:v2';
const projetoPadrao = (tipo = 'armario') => ({ tipo, nome:TIPOS[tipo].nomePadrao, parametros:JSON.parse(JSON.stringify(TIPOS[tipo].padrao)) });
const estado = {
  projeto: projetoPadrao('modulo'), res:null, valido:null, sel:null, ocultas:new Set(),
  portas:false, gavetas:false, explode:0, cotas:true, medir:false, corte:'nenhum', cortePos:50,
  tampo:true, fundo:true, paredes:true, esgoto:false, fix:false, orto:false, vista:'perspectiva',
};
let temProjetoLocal = false;   // havia projeto salvo neste aparelho ao abrir (sem ele, a nuvem abre o mais recente)
try { const s = JSON.parse(localStorage.getItem(CHAVE)||'null'); if (s && TIPOS[s.tipo] && s.parametros && (temProjetoLocal = true)) estado.projeto = { tipo:s.tipo, nome:s.nome||'Projeto', parametros:{ ...JSON.parse(JSON.stringify(TIPOS[s.tipo].padrao)), ...s.parametros }, codigo:s.codigo, orcamento:s.orcamento, liberacao:s.liberacao, conferencia:s.conferencia }; } catch(e) {}
const CHAVE_PRECOS = 'configurador-moveis:precos';
let precos = {}; try { precos = JSON.parse(localStorage.getItem(CHAVE_PRECOS) || '{}') || {}; } catch(e) {}
const salvarPrecos = () => { try { localStorage.setItem(CHAVE_PRECOS, JSON.stringify(precos)); } catch(e) {} };
// DESFAZER: cada gravação guarda a versão anterior do projeto (até 20); mudanças em menos de 0,8 s contam como uma (digitar um número)
const HIST = [], HIST_MAX = 20; let histUltimo = null, histT = 0, histPulando = false;
const salvarLocal = () => {
  const atual = JSON.stringify(estado.projeto);
  if (!histPulando && histUltimo !== null && atual !== histUltimo) {
    const agora = Date.now();
    if (!(HIST.length && agora - histT < 800)) { HIST.push(histUltimo); if (HIST.length > HIST_MAX) HIST.shift(); }
    histT = agora;
  }
  histUltimo = atual; histPulando = false; atualizarDesfazer();
  try { localStorage.setItem(CHAVE, atual); } catch(e) {}
  mostrarNaoSalvo();
};
// AVISO "NÃO SALVO": compara o projeto com o último salvo de verdade (Drive ou .json, ou aberto de um arquivo).
// O salvamento automático do navegador pode se perder no app do Claude (ex.: quando o programa é atualizado), então o aviso fica até salvar.
const CHAVE_SALVO = 'configurador-moveis:ultimo-salvo';
let ultimoSalvo = null; try { ultimoSalvo = localStorage.getItem(CHAVE_SALVO); } catch(e) {}
// Com a nuvem do programa ligada, "salvo" quer dizer salvo nela (Drive e .json viram cópias extras e a nuvem salva logo em seguida)
function marcarSalvo(origem) {
  if (nuvemPronta() && origem !== 'nuvem') { agendarNuvem(0); return; }
  ultimoSalvo = JSON.stringify(estado.projeto); try { localStorage.setItem(CHAVE_SALVO, ultimoSalvo); } catch(e) {} mostrarNaoSalvo();
}
function mostrarNaoSalvo() {
  const b = document.getElementById('naoSalvo'), mudou = JSON.stringify(estado.projeto) !== ultimoSalvo;
  if (b) b.hidden = !mudou;
  if (mudou && nuvemPronta()) agendarNuvem();
}
function atualizarDesfazer() { const b = document.getElementById('btnDesfazer'); if (b) { b.disabled = !HIST.length; b.title = HIST.length ? `Desfazer (${HIST.length} guardada${HIST.length > 1 ? 's' : ''})` : 'Nada para desfazer'; } }
function desfazer() {
  if (!HIST.length) return;
  estado.projeto = JSON.parse(HIST.pop()); histPulando = true; histT = 0;
  estado.ocultas.clear(); carregarProjeto(); toast('Desfeito.');
}

const $ = id => document.getElementById(id);
const el = (tag, attrs={}, ...filhos) => { const e = document.createElement(tag); for (const [k,v] of Object.entries(attrs)) { if (k==='class') e.className=v; else if (k==='text') e.textContent=v; else if (k.startsWith('on')) e.addEventListener(k.slice(2),v); else if (v!==false && v!=null) e.setAttribute(k, v===true?'':v); } filhos.flat().forEach(f => f!=null && e.append(f)); return e; };
let toastT; const toast = msg => { const t=$('toast'); t.textContent=msg; t.hidden=false; clearTimeout(toastT); toastT=setTimeout(()=>t.hidden=true, 2600); };

/* ---------- Formulário gerado a partir do tipo ---------- */
function montarFormulario() {
  const tipo = TIPOS[estado.projeto.tipo], form = $('form'), par = estado.projeto.parametros;
  $('btnParaLivre').hidden = !CONVERSORES_V3[estado.projeto.tipo];
  // móvel convertido pelo "Editar no esquema" continua com o nome do tipo de origem (pedido do Nathan)
  const origem = estado.projeto.tipo === 'modulo' && TIPOS[par.origem] ? par.origem : null;
  $('tipoMovel').replaceChildren(...Object.entries(TIPOS).map(([k,t]) => el('option', { value:k, selected:k===estado.projeto.tipo }, k === 'modulo' && origem ? `${TIPOS[origem].nome.split(' (')[0]} — esquema` : t.nome)));
  if (tipo.editor === 'ambiente' && !moduloEmEdicao()) { montarEditorAmbiente(); return; }   // ambiente (js/tela-ambiente.js)
  if (tipo.editor) { montarEditorModulo(); return; }                  // móvel livre ou módulo aberto do ambiente (js/tela-modulo.js)
  form.replaceChildren(...tipo.grupos.map(g => el('fieldset', {}, el('legend', { text:g.titulo }), ...g.campos.map(c => {
    const id = 'p-'+c.id;
    if (c.tipo === 'sim') return el('div', { class:'campo sim' }, el('input', { type:'checkbox', id, checked:!!par[c.id], 'data-c':c.id }), el('label', { for:id, text:c.rot }));
    let inp;
    if (c.tipo === 'sel') inp = el('select', { id, 'data-c':c.id }, ...c.opcoes.map(([v,r]) => el('option', { value:v, selected:Number(par[c.id])===v }, r)));
    else inp = el('input', { type:c.tipo==='txt'?'text':'number', id, 'data-c':c.id, value:par[c.id], inputmode:c.tipo==='txt'?'text':'decimal', step:'any' });
    return el('div', { class:'campo' }, el('label', { for:id, text:c.rot }), el('div', { class:'entrada' }, inp, c.unid ? el('span', { class:'unid', text:c.unid }) : null), c.ajuda ? el('span', { class:'ajuda', text:c.ajuda }) : null);
  }))));
}
let debounceT;
$('form').addEventListener('input', e => {
  const c = e.target.dataset.c; if (!c) return;
  const campo = TIPOS[estado.projeto.tipo].grupos.flatMap(g=>g.campos).find(x=>x.id===c);
  estado.projeto.parametros[c] = e.target.type==='checkbox' ? e.target.checked : (campo.tipo==='txt' ? e.target.value : (e.target.value==='' ? NaN : Number(e.target.value)));
  clearTimeout(debounceT); debounceT = setTimeout(atualizar, 120);
});
$('nomeProjeto').addEventListener('input', e => { estado.projeto.nome = e.target.value; salvarLocal(); });

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
    if (pc.mov?.tipo === 'basculante') { mover.position.set(0, pc.mov.pivY, pc.mov.pivZ); mesh.position.set(0, -pc.mov.pivY, -pc.mov.pivZ); }   // gira na borda de cima
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

/* ---------- Seleção e ficha ---------- */
function destacar() {
  for (const { pc, mesh } of nos.values()) mesh.material = pc.id === estado.sel ? matSel : matDe(pc);
  document.querySelectorAll('.arvore li').forEach(li => li.classList.toggle('sel', li.dataset.id === estado.sel));
  marcarDesenho();
  const card = estado.sel && [...document.querySelectorAll('.des[data-ids]')].find(a => a.dataset.ids.split(' ').includes(estado.sel));
  $('fDesenho').hidden = !card;
  const no = estado.sel && nos.get(estado.sel);
  if (!no) { if (!medida.pts.length) $('ficha').hidden = true; return; }
  const pc = no.pc;
  $('fNome').textContent = pc.nome;
  if (pc.cat === 'ferragem') { $('fMed').textContent = pc.forma?.tipo==='cil' ? 'Ø 35 mm' : `${fmt(pc.box[1]-pc.box[0])} × ${fmt(pc.box[3]-pc.box[2])} × ${fmt(pc.box[5]-pc.box[4])} mm`; $('fDet').textContent = 'Ferragem · não entra na lista de corte'; }
  else { $('fMed').textContent = `${fmt(pc.comp)} × ${fmt(pc.larg)} × ${fmt(pc.esp)} mm`; $('fDet').textContent = `${MATERIAIS[pc.mat].nome} · fita ${fitaTxt(pc.fita)}${pc.lista ? '' : ' · fora da lista de corte'}`; }
  $('fObs').textContent = pc.obs || '';
  $('fGlb').textContent = `${pc.cat}_${pc.mat}_${pc.id}`;
  preencherAjustePeca(pc);                                             // desligar / mudar medida (tela-ajuste.js)
  $('ficha').hidden = false;
}
function selecionar(id) { estado.sel = id; limparMedida(false); destacar(); construirCotas(); }
$('fDesenho').addEventListener('click', () => { const card = [...document.querySelectorAll('.des[data-ids]')].find(a => a.dataset.ids.split(' ').includes(estado.sel)); card?.scrollIntoView({ behavior:'smooth', block:'start' }); });
$('fFechar').addEventListener('click', () => { selecionar(null); limparMedida(); $('ficha').hidden = true; });

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

/* ---------- Árvore de peças ---------- */
// miniatura 2D da peça (js/miniatura.js) e a prévia maior: ao passar o mouse; no celular, ao tocar na miniatura
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

/* ---------- Alertas e status ---------- */
function mostrarAlertas(res) {
  $('alertas').replaceChildren(...res.erros.map(m => el('div', { class:'alerta erro', role:'alert', text:m })), ...res.avisos.map(m => el('div', { class:'alerta aviso', text:m })));
  const ok = res.erros.length === 0;
  $('status').className = 'status ' + (ok ? 'ok' : 'erro');
  $('status').textContent = ok ? (res.avisos.length ? `Pronto · ${res.avisos.length} aviso${res.avisos.length>1?'s':''}` : 'Pronto para exportar') : `${res.erros.length} erro${res.erros.length>1?'s':''} · exportação bloqueada`;
  $('faixaDesat').hidden = ok || !estado.valido;
  atualizarBotoesExport();
}

/* ---------- Listas ---------- */
function textoCorte(lc, nome) {
  const ls = [`LISTA DE CORTE — ${nome}`, rotuloDocumento(estado.projeto).longo, 'Medidas em mm (comprimento × largura). Fita: C = lados do comprimento, L = lados da largura.', ''];
  for (const [g, its] of lc.grupos) {
    ls.push(g.toUpperCase());
    its.forEach(it => ls.push(`${it.qtd}× ${it.nomeLista||it.nome} — ${fmt(it.comp)} × ${fmt(it.larg)} — fita ${fitaTxt(it.fita)}${it.forma?.tipo==='recorte' ? ` — recorte ${fmt(it.forma.rl)} × ${fmt(it.forma.rp)} no centro de trás` : ''}`));
    ls.push('');
  }
  return ls.join('\n').trim();
}
const textoFerr = (fs, nome) => [`FERRAGENS — ${nome}`, '', ...fs.map(f => `${f.qtd}${f.obs.startsWith('metros') ? ' m' : '×'} ${f.item}${f.obs && !f.obs.startsWith('metros') ? ` (${f.obs})` : ''}`)].join('\n');

function mostrarListas(res) {
  const ok = res.erros.length === 0;
  ['copCorte','copFerr','copLoja','copCompras'].forEach(id => $(id).disabled = !ok);
  ['copiaLoja','copiaCompras'].forEach(id => $(id).hidden = true);
  $('copiaCorte').hidden = true; $('copiaFerr').hidden = true;
  if (!ok) {
    const msg = () => el('p', { class:'vazio', text:'Corrija os erros nos parâmetros para ver a lista.' });
    $('tabCorte').replaceChildren(msg()); $('tabFerr').replaceChildren(msg()); $('resumoCorte').replaceChildren(); $('gradePlano').replaceChildren(msg()); $('tabCompras').replaceChildren(msg()); $('notaPlano').textContent = ''; return;
  }
  const lc = listaDeCorte(res.pecas);
  const linhas = [];
  for (const [g, its] of lc.grupos) {
    linhas.push(el('tr', { class:'grupo' }, el('td', { colspan:6, text:g })));
    its.forEach(it => linhas.push(el('tr', { 'data-ids':it.ids.join(' ') },
      el('td', { text:it.nomeLista||it.nome }), el('td', { class:'n', text:String(it.qtd) }),
      el('td', { class:'n', text:fmt(it.comp) }), el('td', { class:'n', text:fmt(it.larg) }),
      el('td', { class:'n', text:fitaTxt(it.fita) }), el('td', { class:'obs', text:it.obs }))));
  }
  $('tabCorte').replaceChildren(el('table', {}, el('thead', {}, el('tr', {}, el('th', { text:'Peça' }), el('th', { class:'n', text:'Qtd' }), el('th', { class:'n', text:'Comp.' }), el('th', { class:'n', text:'Larg.' }), el('th', { class:'n', text:'Fita' }), el('th', { text:'Observação' }))), el('tbody', {}, ...linhas)));
  const fitaItem = res.ferragens.find(f => f.item.startsWith('Fita'));
  $('resumoCorte').replaceChildren(
    ...lc.resumo.map(r => el('span', {}, `${r.grupo}: `, el('b', { text:`${fmt(r.area)} m²` }), ` ≈ ${r.chapas} chapa${r.chapas>1?'s':''}`)),
    fitaItem ? el('span', {}, 'Fita: ', el('b', { text:`${fitaItem.qtd} m` })) : null,
    el('span', { text:`Chapa ${R.chapa[0]/1000} × ${R.chapa[1]/1000} m, aproveitamento 85%` }));
  $('tabFerr').replaceChildren(el('table', {}, el('thead', {}, el('tr', {}, el('th', { text:'Item' }), el('th', { class:'n', text:'Qtd' }), el('th', { text:'Observação' }))),
    el('tbody', {}, ...res.ferragens.map(f => el('tr', {}, el('td', { text:f.item }), el('td', { class:'n', text: f.obs.startsWith('metros') ? `${f.qtd} m` : String(f.qtd) }), el('td', { class:'obs', text: f.obs.startsWith('metros') ? 'com 10% de perda' : f.obs }))))));
  estado.textos = { corte: textoCorte(lc, estado.projeto.nome), ferr: textoFerr(res.ferragens, estado.projeto.nome), lc };
  const plano = planoDeCorte(res.pecas); estado.plano = plano;
  $('resumoCorte').replaceChildren(
    ...plano.materiais.map(m => el('span', {}, `${m.nome}: `, el('b', { text:`${m.chapas.length} chapa${m.chapas.length>1?'s':''}` }))),
    fitaItem ? el('span', {}, 'Fita: ', el('b', { text:`${fitaItem.qtd} m` })) : null,
    el('span', { text:'Nº = número da peça no plano de corte' }));
  linhasNum(lc);
  mostrarPlano(plano); mostrarCompras(); mostrarOrcamento();
}
function linhasNum(lc) {
  // acrescenta a coluna Nº na tabela da lista de corte
  const mapa = new Map(); for (const its of lc.grupos.values()) its.forEach(it => mapa.set(it.ids.join(' '), it.num));
  const th = el('th', { class:'n', text:'Nº' }); $('tabCorte').querySelector('thead tr')?.prepend(th);
  $('tabCorte').querySelectorAll('tbody tr').forEach(tr => {
    if (tr.classList.contains('grupo')) { tr.firstChild.colSpan = 7; return; }
    tr.prepend(el('td', { class:'n', text:String(mapa.get(tr.dataset.ids) ?? '') }));
  });
}
function svgChapa(m, c, idx) {
  const NS = 'http://www.w3.org/2000/svg', mk = (t, a, txt) => { const e = document.createElementNS(NS, t); for (const [k,v] of Object.entries(a)) e.setAttribute(k, v); if (txt != null) e.textContent = txt; return e; };
  const W = 640, s = W / m.dim[0], H = m.dim[1]*s;
  const svg = mk('svg', { viewBox:`0 0 ${W} ${H.toFixed(1)}`, class:'chapa-svg', role:'img', 'aria-label':`Chapa ${idx+1} de ${m.nome}` });
  svg.append(mk('rect', { x:0, y:0, width:W, height:H, class:'p-chapa' }));
  svg.append(mk('rect', { x:m.refilo*s, y:m.refilo*s, width:(m.dim[0]-2*m.refilo)*s, height:(m.dim[1]-2*m.refilo)*s, class:'p-refilo' }));
  for (const p of c.pecas) {
    const x = (m.refilo + p.x)*s, y = (m.refilo + p.y)*s, w = p.w*s, h = p.h*s;
    const g = mk('g', { 'data-id':p.id });
    g.append(mk('rect', { x, y, width:w, height:h, class:'p-peca' }));
    const tit = mk('title', {}, `${p.num}. ${p.nome} — ${fmt(p.w)} × ${fmt(p.h)}${p.giro ? ' (girada)' : ''}`); g.append(tit);
    if (w > 18 && h > 14) g.append(mk('text', { x:x+w/2, y:y+h/2 + (h > 34 ? -2 : 4), 'text-anchor':'middle', class:'p-num' }, String(p.num)));
    if (w > 70 && h > 34) g.append(mk('text', { x:x+w/2, y:y+h/2 + 12, 'text-anchor':'middle', class:'p-med' }, `${fmt(p.w)}×${fmt(p.h)}`));
    g.addEventListener('click', () => selecionar(p.id));
    svg.append(g);
  }
  return svg;
}
function mostrarPlano(plano) {
  $('notaPlano').textContent = `Chapas de ${R.chapa[0]} × ${R.chapa[1]} mm, refilo de ${R.refilo} mm nas bordas e ${R.serra} mm de serra entre peças. Cortes em faixas; peças podem girar (MDF liso). Toque numa peça para vê-la no 3D.` + (plano.erros.length ? ' Atenção: ' + plano.erros.join(' ') : '');
  $('gradePlano').replaceChildren(...plano.materiais.flatMap(m => m.chapas.map((c, i) => el('article', { class:'des' },
    el('h3', {}, el('span', { text:`${m.nome} · chapa ${i+1} de ${m.chapas.length}` }), el('span', { class:'meta', text:`${Math.round(c.aproveitamento*100)}% aproveitado` })),
    svgChapa(m, c, i),
    el('div', { class:'meta', text: c.pecas.map(p => p.num).sort((a,b)=>a-b).join(', ').replace(/^/, 'Peças: ') }))))); 
}
function mostrarCompras() {
  if (!estado.res || estado.res.erros.length || !estado.plano) return;
  const lc = listaDeCompras(estado.res, estado.plano, precos); estado.compras = lc;
  const grupos = [...new Set(lc.linhas.map(l => l.grupo))];
  const corpo = [];
  grupos.forEach(g => {
    corpo.push(el('tr', { class:'grupo' }, el('td', { colspan:6, text:g })));
    lc.linhas.filter(l => l.grupo === g).forEach(l => {
      const inp = el('input', { type:'number', min:'0', step:'0.01', inputmode:'decimal', id:'preco-'+l.ref, 'aria-label':'Preço de '+l.nome, value: l.preco ?? '' });
      inp.addEventListener('change', () => { const v = Number(inp.value); if (v > 0) precos[l.ref] = v; else delete precos[l.ref]; salvarPrecos(); mostrarCompras(); mostrarOrcamento(); });
      corpo.push(el('tr', {},
        el('td', {}, el('div', { text:l.nome }), (l.marca||l.codigo) ? el('div', { class:'obs', text:[l.marca, l.codigo].filter(Boolean).join(' · ') }) : null),
        el('td', { class:'n', text:l.necessario }),
        el('td', { class:'n', text:`${l.compra} ${l.unid}` }),
        el('td', { class:'n' }, inp),
        el('td', { class:'n', text: l.total != null ? reais(l.total) : '—' }),
        el('td', { class:'obs', text:l.obs || '' })));
    });
  });
  $('tabCompras').replaceChildren(el('table', {},
    el('thead', {}, el('tr', {}, ...['Item','Precisa','Comprar','Preço unit. (R$)','Total',''].map((h,i) => el('th', { class: i>0 && i<5 ? 'n' : null, text:h })))),
    el('tbody', {}, ...corpo),
    el('tfoot', {}, el('tr', {}, el('td', { colspan:4, text: lc.semPreco ? `Total (${lc.semPreco} ite${lc.semPreco>1?'ns':'m'} sem preço)` : 'Total' }), el('td', { class:'n', text:reais(lc.total) }), el('td', {})))));
  estado.textos.compras = textoCompras(lc);
}
const textoCompras = lc => [`LISTA DE COMPRAS — ${estado.projeto.nome}`, '', ...lc.linhas.map(l => `${l.compra} ${l.unid} — ${l.nome}${l.marca||l.codigo ? ` (${[l.marca,l.codigo].filter(Boolean).join(' ')})` : ''}${l.total != null ? ` — ${reais(l.total)}` : ''}`), '', `Total: ${reais(lc.total)}${lc.semPreco ? ` (${lc.semPreco} sem preço)` : ''}`].join('\n');
function linhasLoja() {
  const lc = listaDeCorte(estado.res.pecas), out = [];
  for (const its of lc.grupos.values()) its.forEach(it => out.push({ num:it.num, nome:it.nomeLista||it.nome, qtd:it.qtd, comp:it.comp, larg:it.larg, esp:it.esp, mat:MATERIAIS[it.mat].nome, c1:it.fita[0]>=1, c2:it.fita[0]>=2, l1:it.fita[1]>=1, l2:it.fita[1]>=2, obs:it.forma?.tipo==='recorte' ? `recorte ${fmt(it.forma.rl)}x${fmt(it.forma.rp)} centro de trás` : '' }));
  return out;
}
const textoLoja = () => [`PEDIDO DE CORTE — ${estado.projeto.nome}`, 'Medidas em mm (comprimento × largura). Fita: C1/C2 nos lados do comprimento, L1/L2 nos lados da largura.', '',
  ...linhasLoja().map(l => `Nº ${l.num} · ${l.qtd}× ${l.nome} · ${fmt(l.comp)} × ${fmt(l.larg)} · ${l.mat} ${fmt(l.esp)} mm · fita: ${[l.c1&&'C1',l.c2&&'C2',l.l1&&'L1',l.l2&&'L2'].filter(Boolean).join(' ') || 'nenhuma'}${l.obs ? ' · ' + l.obs : ''}`)].join('\n');
const csvLoja = () => '\ufeff' + ['Nº;Peça;Qtd;Comprimento;Largura;Espessura;Material;Fita C1;Fita C2;Fita L1;Fita L2;Observação',
  ...linhasLoja().map(l => [l.num, l.nome, l.qtd, csvNum(l.comp), csvNum(l.larg), csvNum(l.esp), l.mat, l.c1?'sim':'', l.c2?'sim':'', l.l1?'sim':'', l.l2?'sim':'', l.obs].join(';'))].join('\r\n');
const csvCompras = () => '\ufeff' + ['Grupo;Item;Marca;Código;Precisa;Comprar;Unidade;Preço unit.;Total;Observação',
  ...estado.compras.linhas.map(l => [l.grupo, l.nome, l.marca, l.codigo, l.necessario, l.compra, l.unid, l.preco != null ? csvNum(l.preco) : '', l.total != null ? csvNum(l.total) : '', l.obs||''].join(';'))].join('\r\n');
$('copLoja').addEventListener('click', () => { if (estado.res && !estado.res.erros.length) copiar(textoLoja(), 'copiaLoja'); });
$('copCompras').addEventListener('click', () => { if (estado.textos?.compras) copiar(estado.textos.compras, 'copiaCompras'); });
$('tabCorte').addEventListener('click', e => { const tr = e.target.closest('tr[data-ids]'); if (tr) selecionar(tr.dataset.ids.split(' ')[0]); });
function copiar(texto, areaId) {
  const fallback = () => { const a = $(areaId); a.value = texto; a.hidden = false; a.focus(); a.select(); toast('Selecionei o texto: copie com Ctrl+C ou segurando o dedo.'); };
  try { navigator.clipboard.writeText(texto).then(() => toast('Copiado.'), fallback); } catch(e) { fallback(); }
}
$('copCorte').addEventListener('click', () => estado.textos && copiar(estado.textos.corte, 'copiaCorte'));
$('copFerr').addEventListener('click', () => estado.textos && copiar(estado.textos.ferr, 'copiaFerr'));

/* =====================================================================
   7. EXPORTAÇÃO — projeto (.json) e pacote para o Blender (.zip)
   ===================================================================== */
let downloads = null, downloadsPronto = false;
(async () => { try { downloads = window.claude?.use ? await window.claude.use('downloads') : null; } catch(e) { downloads = null; } downloadsPronto = true; atualizarBotoesExport(); })();
function atualizarBotoesExport() {
  const ok = estado.res && estado.res.erros.length === 0;
  const disp = true;                                                   // fora do Claude baixa pelo navegador (salvar)
  $('btnZip').disabled = !ok || !window.JSZip; $('btnJson').disabled = !estado.res;   // o projeto salva mesmo com erros
  $('btnPdf').disabled = $('btnPdf2').disabled = !ok || !disp || !window.jspdf;
  $('btnIlogic').disabled = !ok || !disp; $('copIlogic').disabled = !ok;
  $('notaExport').textContent = !ok ? 'O projeto (.json) pode ser salvo mesmo com erros; o pacote, os desenhos e o iLogic esperam a correção.' : !window.JSZip ? 'O pacote .zip não carregou; o projeto .json continua disponível.' : 'O pacote leva o modelo 3D (.glb), os desenhos em PDF, o projeto e as listas em planilha.';
}
const slug = () => (estado.projeto.nome || 'projeto').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || 'projeto';
function dadosProjeto() {
  const r = estado.res;
  return { app:'Configurador de Móveis', versao:1, exportadoEm:new Date().toISOString(), unidade:'mm',
    tipo:estado.projeto.tipo, nome:estado.projeto.nome, parametros:estado.projeto.parametros, codigo:estado.projeto.codigo, orcamento:estado.projeto.orcamento, liberacao:estado.projeto.liberacao, conferencia:estado.projeto.conferencia,
    situacao: rotuloDocumento(estado.projeto).longo,
    pecas: r.pecas.map(pc => ({ id:pc.id, nomeGLB:`${pc.cat}_${pc.mat}_${pc.id}`, nome:pc.nome, categoria:pc.cat, material:pc.mat, espessura:pc.esp, comprimento:pc.comp ?? null, largura:pc.larg ?? null, fita:pc.fita, listaDeCorte:pc.lista, caixa_mm:pc.box, forma:pc.forma||null, movimento:pc.mov, obs:pc.obs })),
    ferragens: r.ferragens,
    planoDeCorte: estado.plano, listaDeCompras: estado.compras, precos, biblioteca: BIBLIOTECA };
}
const csvNum = v => String(Math.round(v*10)/10).replace('.', ',');
function csvCorte() {
  const lc = listaDeCorte(estado.res.pecas), ls = ['Material;Espessura;Peça;Qtd;Comprimento;Largura;Fita;Observação'];
  for (const its of lc.grupos.values()) its.forEach(it => ls.push([MATERIAIS[it.mat].nome, csvNum(it.esp), it.nomeLista||it.nome, it.qtd, csvNum(it.comp), csvNum(it.larg), fitaTxt(it.fita), (it.obs||'').replace(/;/g,',')].join(';')));
  return '﻿' + ls.join('\r\n');
}
const csvFerr = () => '﻿' + ['Item;Qtd;Observação', ...estado.res.ferragens.map(f => [f.item, f.qtd, f.obs].join(';'))].join('\r\n');
async function gerarGLB() {
  const c = new THREE.Scene(), mats = {};
  for (const pc of estado.res.pecas) {
    const g = geometriaDe(pc);
    const ct = new THREE.Vector3((pc.box[0]+pc.box[1])/2, (pc.box[2]+pc.box[3])/2, (pc.box[4]+pc.box[5])/2);
    g.translate(-ct.x, -ct.y, -ct.z); g.scale(0.001, 0.001, 0.001);
    mats[pc.mat] ||= new THREE.MeshStandardMaterial({ name:pc.mat, color:MATERIAIS[pc.mat].cor, roughness: pc.mat==='cromado' ? 0.2 : 0.75, metalness: pc.mat==='cromado' ? 1 : 0 });
    const m = new THREE.Mesh(g, mats[pc.mat]);
    m.name = `${pc.cat}_${pc.mat}_${pc.id}`; m.position.copy(ct.multiplyScalar(0.001));
    m.userData = { nome:pc.nome, categoria:pc.cat, comprimento_mm:pc.comp ?? null, largura_mm:pc.larg ?? null, espessura_mm:pc.esp, fita:pc.fita,
      movimento: pc.mov ? (pc.mov.tipo==='porta' ? { tipo:'porta', lado:pc.mov.lado, pivo_m:[pc.mov.pivX/1000, 0, pc.mov.pivZ/1000], eixo:'y', angulo_max:pc.mov.angMax } : { tipo:'gaveta', curso_m:pc.mov.curso/1000, eixo:pc.mov.eixo || 'z' }) : null };
    c.add(m);
  }
  return await new GLTFExporter().parseAsync(c, { binary:true });
}
// salvar: dentro do Claude usa o recurso de downloads dele; em qualquer outro navegador, baixa direto (arquivo comum)
async function salvar(nome, dados) {
  if (downloads) {
    try { await downloads.save({ filename:nome, data:dados }); toast('Arquivo salvo.'); return true; }
    catch(e) { toast(e?.code === 'declined' ? 'Download cancelado.' : `Não foi possível salvar (${e?.code || 'erro'}).`); }
    return false;
  }
  try {
    const tipo = /\.json$/.test(nome) ? 'application/json' : /\.pdf$/.test(nome) ? 'application/pdf' : /\.zip$/.test(nome) ? 'application/zip' : 'text/plain';
    const url = URL.createObjectURL(new Blob([dados], { type:tipo })), a = document.createElement('a');
    a.href = url; a.download = nome; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 30000);
    toast('Arquivo baixado.'); return true;
  } catch(e) { toast('Não foi possível baixar o arquivo neste navegador.'); }
}
const baixarPDF = () => { if (estado.res.erros.length || !window.jspdf) return; try { salvar(slug()+'-desenhos.pdf', gerarPDF()); } catch(e) { toast('Falha ao montar o PDF.'); } };
$('btnIlogic').addEventListener('click', () => { if (estado.res.erros.length) return; salvar(slug()+'-inventor-ilogic.txt', gerarILogic()); });
$('copIlogic').addEventListener('click', () => { if (!estado.res.erros.length) copiar(gerarILogic(), 'copiaIlogic'); });
// Desenhos (.pdf): as folhas A3 no padrão do FreeCAD (uma por peça), as mesmas do bloco Desenhos técnicos
$('btnPdf').addEventListener('click', async () => {
  if (estado.res.erros.length || !window.jspdf) return;
  toast('Montando as folhas…');
  try { salvar(slug() + '-folhas-A3.pdf', await folhasPDF(pecasComFolha(), extraFolha)); } catch (e) { toast('Falha ao montar as folhas.'); }
});
$('btnPdf2').addEventListener('click', baixarPDF);
// o projeto como texto (.json): com erro, salva só o projeto para continuar depois (sem peças, que estão inconsistentes)
function projetoJSON() {
  const dados = estado.res.erros.length ? { app:'Configurador de Móveis', versao:1, exportadoEm:new Date().toISOString(), incompleto:true, erros:estado.res.erros,
    tipo:estado.projeto.tipo, nome:estado.projeto.nome, parametros:estado.projeto.parametros, codigo:estado.projeto.codigo, orcamento:estado.projeto.orcamento, liberacao:estado.projeto.liberacao, conferencia:estado.projeto.conferencia, precos } : dadosProjeto();
  return JSON.stringify(dados, null, 2);
}
async function salvarJson() { if (!estado.res) return; if (await salvar(slug() + (estado.res.erros.length ? '-incompleto' : '') + '.json', projetoJSON())) marcarSalvo(); }
$('btnJson').addEventListener('click', salvarJson);
// clicar no aviso "Não salvo" salva: no Drive quando a ligação existe (app do Claude), senão baixa o .json
$('naoSalvo').addEventListener('click', () => { if (nuvemPronta()) salvarNuvem(); else if (mcpDrive && !$('btnDriveSalvar').hidden) $('btnDriveSalvar').click(); else salvarJson(); });
// menu Exportar da barra de cima: fecha ao clicar fora, com Esc e depois de escolher uma saída (o "Copiar iLogic" mantém aberto para mostrar o texto)
document.addEventListener('click', e => { const m = $('menuExportar'); if (m.open && !m.contains(e.target)) m.open = false; });
document.addEventListener('keydown', e => { if (e.key === 'Escape') $('menuExportar').open = false; });
$('menuExportar').addEventListener('toggle', e => { const m = e.currentTarget; if (m.open) m.style.setProperty('--exp-topo', Math.round(m.querySelector('summary').getBoundingClientRect().bottom + 8) + 'px'); });
$('menuExportar').addEventListener('click', e => { const b = e.target.closest('button'); if (b && b.id !== 'copIlogic') setTimeout(() => { $('menuExportar').open = false; }, 0); });
$('btnZip').addEventListener('click', async () => {
  if (estado.res.erros.length || !window.JSZip) return;
  $('btnZip').disabled = true; $('notaExport').textContent = 'Montando o pacote…';
  try {
    const zip = new JSZip();
    zip.file('modelo.glb', await gerarGLB());
    zip.file('projeto.json', JSON.stringify(dadosProjeto(), null, 2));
    zip.file('lista-de-corte.csv', csvCorte());
    zip.file('ferragens.csv', csvFerr());
    zip.file('pedido-loja-de-corte.csv', csvLoja());
    zip.file('lista-de-compras.csv', csvCompras());
    if (window.jspdf) {
      zip.file('desenhos-folhas-A3.pdf', await folhasPDF(pecasComFolha(), extraFolha));
      zip.file('lista-e-plano-de-corte.pdf', gerarPDF({ semDesenhos:true }));
    }
    zip.file('inventor-gerar-pecas.iLogicVb', gerarILogic());
    const rot = rotuloDocumento(estado.projeto);
    zip.file('SITUACAO.txt', `${estado.projeto.nome}\n${rot.longo}\n${rot.fabricar ? '' : '\nNÃO FABRICAR com estes arquivos: o projeto ainda não foi liberado para corte.\n'}`);
    zip.file('LEIA-ME.txt', `${estado.projeto.nome}\n${rot.longo}\n\nmodelo.glb — abrir no Blender: File > Import > glTF 2.0. Unidade: metro.\nCada peça se chama categoria_material_id (ex.: frente_mdf-ru-branco_porta-esq).\nPortas e gavetas levam o pivô e o curso nas propriedades personalizadas (Custom Properties).\nprojeto.json — reabre no Configurador (botão Abrir projeto).\ndesenhos-folhas-A3.pdf — uma folha A3 cotada por peça (padrão FreeCAD), para a marcenaria.\nlista-e-plano-de-corte.pdf — lista de corte, compras e plano de corte.\ninventor-gerar-pecas.iLogicVb — regra iLogic: cria as peças .ipt e a montagem .iam no Inventor.\nlista-de-corte.csv e ferragens.csv — abrem no Excel.\n`);
    await salvar(slug() + '-' + rot.curto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') + '.zip', await zip.generateAsync({ type:'blob' }));
  } catch(e) { toast('Falha ao montar o pacote.'); }
  atualizarBotoesExport();
});

/* ---------- Abrir projeto / padrão ---------- */
$('btnAbrir').addEventListener('click', () => $('arqProjeto').click());
function abrirProjetoTexto(texto) {
  try {
    const d = JSON.parse(texto);
    if (!TIPOS[d.tipo] || typeof d.parametros !== 'object') throw 0;
    estado.projeto = { tipo:d.tipo, nome:d.nome || 'Projeto', parametros:{ ...JSON.parse(JSON.stringify(TIPOS[d.tipo].padrao)), ...d.parametros }, codigo:d.codigo, orcamento:d.orcamento, liberacao:d.liberacao, conferencia:d.conferencia };
    if (d.precos && typeof d.precos === 'object') { precos = { ...precos, ...d.precos }; salvarPrecos(); }
    carregarProjeto(); marcarSalvo(); toast('Projeto aberto.'); return true;
  } catch(err) { toast('Esse arquivo não é um projeto do Configurador.'); return false; }
}
/* ---------- Google Drive (só no programa publicado, pelo app do Claude) ----------
   Salvar grava uma cópia nova na pasta "Projetos de móveis" (o Drive não deixa trocar o conteúdo pela ligação:
   cada salvamento vira um arquivo com data e hora). Abrir lista os arquivos da pasta, do mais novo ao mais antigo. */
const DRIVE = 'Google Drive', PASTA_DRIVE = 'Projetos de móveis';
let mcpDrive = null, pastaDriveId = null;
(async () => { try { mcpDrive = window.claude?.use ? await window.claude.use('mcp') : null; } catch(e) { mcpDrive = null; }
  $('btnDriveSalvar').hidden = $('btnDriveAbrir').hidden = !mcpDrive; })();
const erroDrive = e => e?.code === 'not_granted' || e?.code === 'denied' ? 'Permissão do Google Drive recusada.' : e?.code === 'server_not_connected' ? 'O Google Drive não está ligado à sua conta do Claude.' : `Não deu para usar o Drive (${e?.code || e?.message || 'erro'}).`;
async function pastaDrive() {
  if (pastaDriveId) return pastaDriveId;
  const q = `title = '${PASTA_DRIVE}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  const r = await mcpDrive.callTool(DRIVE, 'search_files', { query:q, excludeContentSnippets:true, pageSize:1 }, { cache:false });
  pastaDriveId = r.payload?.files?.[0]?.id;
  if (!pastaDriveId) pastaDriveId = (await mcpDrive.callTool(DRIVE, 'create_file', { title:PASTA_DRIVE, contentMimeType:'application/vnd.google-apps.folder' })).payload?.id;
  if (!pastaDriveId) throw { message:'pasta não encontrada' };
  return pastaDriveId;
}
const doisDig = n => String(n).padStart(2, '0');
$('btnDriveSalvar').addEventListener('click', async () => {
  if (!mcpDrive || !estado.res) return;
  const b = $('btnDriveSalvar'); b.disabled = true; b.textContent = 'Salvando…';
  try {
    const d = new Date(), quando = `${d.getFullYear()}-${doisDig(d.getMonth()+1)}-${doisDig(d.getDate())} ${doisDig(d.getHours())}h${doisDig(d.getMinutes())}`;
    await mcpDrive.callTool(DRIVE, 'create_file', { title:`${estado.projeto.nome || 'Projeto'} — ${quando}.json`, parentId:await pastaDrive(),
      textContent:projetoJSON(), contentMimeType:'application/json', disableConversionToGoogleType:true });
    toast(`Salvo no Drive, na pasta "${PASTA_DRIVE}".`); marcarSalvo();
  } catch(e) { toast(erroDrive(e)); }
  b.disabled = false; b.textContent = 'Salvar no Drive';
});
// conteúdo baixado vem em base64 (às vezes no formato de URL); decodifica como UTF-8
function textoDeBase64(b64) { const bin = atob(String(b64).replace(/-/g, '+').replace(/_/g, '/')); return new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0))); }
$('btnDriveAbrir').addEventListener('click', async () => {
  if (!mcpDrive) return;
  const dlg = $('dlgDrive'), lista = dlg.querySelector('[data-lista="arquivos"]'), nota = dlg.querySelector('[data-texto="nota"]');
  lista.replaceChildren(); nota.textContent = 'Buscando no Drive…'; dlg.showModal();
  try {
    const r = await mcpDrive.callTool(DRIVE, 'search_files', { query:`'${await pastaDrive()}' in parents and trashed = false`, orderBy:'modifiedTime desc', pageSize:40, excludeContentSnippets:true }, { cache:false });
    const arqs = (r.payload?.files || []).filter(f => /\.json$/i.test(f.title || ''));
    nota.textContent = arqs.length ? `${arqs.length} projeto(s) na pasta "${PASTA_DRIVE}", do mais novo ao mais antigo.` : `Nenhum projeto na pasta "${PASTA_DRIVE}" ainda.`;
    lista.replaceChildren(...arqs.map(f => { const bt = el('button', { type:'button', class:'btn drive-arq' }, f.title.replace(/\.json$/i, '')); bt.dataset.id = f.id; return el('li', {}, bt); }));
  } catch(e) { nota.textContent = erroDrive(e); }
});
$('dlgDrive').addEventListener('click', async e => {
  const dlg = $('dlgDrive');
  if (e.target.closest('[data-acao="fechar-drive"]')) { dlg.close(); return; }
  const bt = e.target.closest('.drive-arq'); if (!bt) return;
  dlg.querySelector('[data-texto="nota"]').textContent = 'Abrindo…';
  try {
    const r = await mcpDrive.callTool(DRIVE, 'download_file_content', { fileId:bt.dataset.id }, { cache:false });
    if (abrirProjetoTexto(textoDeBase64(r.payload?.content ?? r.payload?.base64Content ?? ''))) dlg.close();
    else dlg.querySelector('[data-texto="nota"]').textContent = 'Esse arquivo não é um projeto do Configurador.';
  } catch(err) { dlg.querySelector('[data-texto="nota"]').textContent = erroDrive(err); }
});
/* ---------- Projetos guardados no próprio programa (capability db do artifact) ----------
   Cada projeto vira um documento privado do Nathan (data/users/<id>/<nome do projeto>): o mesmo no computador e no celular,
   e não se perde quando o programa é atualizado. O salvamento é automático, 3 s depois de cada mudança.
   De hora em hora, enquanto há mudanças, vai também uma cópia para o Google Drive (pasta "Projetos de móveis").
   Fora do Claude (arquivo solto ou sem internet) nada disso existe: vale o aviso "Não salvo" + Drive/.json. */
const CHAVE_NUVEM = 'configurador-moveis:nuvem';           // { id, salvoEm } do último salvamento na nuvem feito neste aparelho
const COPIA_DRIVE_MS = 60 * 60 * 1000;
var nuvem = null, nuvemUid = null, nuvemTimer = null, nuvemSalvando = false, ultimaCopiaDrive = 0;   // var: o aviso "Não salvo" consulta antes desta linha rodar
function nuvemPronta() { return !!(nuvem && nuvemUid); }
const colNuvem = () => nuvem.collection('data/users/' + nuvemUid);
const idNuvem = () => slug().slice(0, 150);
const horaCurta = iso => { const d = new Date(iso); return `${doisDig(d.getDate())}/${doisDig(d.getMonth()+1)} ${doisDig(d.getHours())}:${doisDig(d.getMinutes())}`; };
function estadoNuvem(texto, erro) { const e = $('estadoNuvem'); e.hidden = !texto; e.textContent = texto || ''; e.classList.toggle('erro', !!erro); }
function agendarNuvem(ms = 3000) { clearTimeout(nuvemTimer); nuvemTimer = setTimeout(salvarNuvem, ms); }
async function salvarNuvem() {
  if (!nuvemPronta()) return;
  if (nuvemSalvando) { agendarNuvem(); return; }
  const atual = JSON.stringify(estado.projeto); if (atual === ultimoSalvo) return;
  nuvemSalvando = true; estadoNuvem('☁ Salvando…');
  const id = idNuvem(), salvoEm = new Date().toISOString();
  try {
    const texto = JSON.stringify(JSON.parse(projetoJSON()));     // compacto: cada documento cabe até 256 KB
    await colNuvem().doc(id).set({ nome: estado.projeto.nome || 'Projeto', tipo: estado.projeto.tipo, salvoEm, projeto: texto });
    ultimoSalvo = atual; try { localStorage.setItem(CHAVE_SALVO, atual); localStorage.setItem(CHAVE_NUVEM, JSON.stringify({ id, salvoEm })); } catch(e) {}
    estadoNuvem('☁ Salvo ' + horaCurta(salvoEm)); mostrarNaoSalvo();
    copiaDriveDeHoraEmHora();
  } catch (e) {
    estadoNuvem(e?.code === 'invalid_argument' ? '☁ Projeto grande demais para a nuvem: salve no Drive' : e?.code === 'quota_exceeded' ? '☁ Nuvem cheia: apague projetos antigos' : '☁ Não salvou (sem conexão?)', true);
  }
  nuvemSalvando = false;
}
async function copiaDriveDeHoraEmHora() {
  if (!mcpDrive || Date.now() - ultimaCopiaDrive < COPIA_DRIVE_MS) return;
  ultimaCopiaDrive = Date.now();
  try {
    const d = new Date(), quando = `${d.getFullYear()}-${doisDig(d.getMonth()+1)}-${doisDig(d.getDate())} ${doisDig(d.getHours())}h${doisDig(d.getMinutes())}`;
    await mcpDrive.callTool(DRIVE, 'create_file', { title:`${estado.projeto.nome || 'Projeto'} — ${quando}.json`, parentId:await pastaDrive(),
      textContent:projetoJSON(), contentMimeType:'application/json', disableConversionToGoogleType:true });
  } catch (e) { /* a cópia no Drive é extra: a nuvem já guardou */ }
}
function abrirDaNuvem(doc, aviso) {
  if (!abrirProjetoTexto(doc.projeto)) return false;
  ultimoSalvo = JSON.stringify(estado.projeto); try { localStorage.setItem(CHAVE_SALVO, ultimoSalvo); localStorage.setItem(CHAVE_NUVEM, JSON.stringify({ id: idNuvem(), salvoEm: doc.salvoEm })); } catch(e) {}
  clearTimeout(nuvemTimer); estadoNuvem('☁ Salvo ' + horaCurta(doc.salvoEm)); mostrarNaoSalvo(); if (aviso) toast(aviso);
  return true;
}
(async () => {
  try {
    const [db, user] = await Promise.all([window.claude?.use ? window.claude.use('db') : null, window.claude?.use ? window.claude.use('user') : null]);
    if (!db || !user) return;
    const uid = await user.id(); if (!uid) return;
    nuvem = db; nuvemUid = uid; $('btnNuvem').hidden = false;
    let loc = null; try { loc = JSON.parse(localStorage.getItem(CHAVE_NUVEM) || 'null'); } catch(e) {}
    // ao abrir: se a nuvem tem uma versão mais nova deste projeto (salva em outro aparelho), abre ela; num aparelho novo, abre o mais recente
    let alvo = null;
    if (temProjetoLocal && loc?.id) { const d = await colNuvem().doc(loc.id).get(); if (d.exists && String(d.data().salvoEm) > String(loc.salvoEm || '')) alvo = d.data(); }
    else if (!temProjetoLocal) { const q = await colNuvem().orderBy('salvoEm', 'desc').limit(1).get(); alvo = q.docs[0]?.data() || null; }
    if (alvo && abrirDaNuvem(alvo, 'Abri a versão mais nova, salva na nuvem em ' + horaCurta(alvo.salvoEm) + '.')) return;
    if (!loc || loc.id !== idNuvem()) ultimoSalvo = null;        // este projeto ainda não está na nuvem: guarda já
    else if (JSON.stringify(estado.projeto) === ultimoSalvo) estadoNuvem('☁ Salvo ' + horaCurta(loc.salvoEm));
    mostrarNaoSalvo();                                            // mudança ainda não guardada: salva agora
  } catch (e) { nuvem = null; nuvemUid = null; }
})();
$('btnNuvem').addEventListener('click', async () => {
  if (!nuvemPronta()) return;
  const dlg = $('dlgNuvem'), lista = dlg.querySelector('[data-lista="projetos"]'), nota = dlg.querySelector('[data-texto="nota"]');
  lista.replaceChildren(); nota.textContent = 'Buscando…'; dlg.showModal();
  try {
    const q = await colNuvem().orderBy('salvoEm', 'desc').limit(100).get();
    nota.textContent = q.docs.length ? 'Toque para abrir. O projeto aberto agora já está salvo.' : 'Nenhum projeto guardado ainda.';
    lista.replaceChildren(...q.docs.map(d => { const v = d.data(), bt = el('button', { type:'button', class:'btn nuvem-arq' }, `${v.nome} · ${horaCurta(v.salvoEm)}`); bt.dataset.id = d.id; return el('li', {}, bt); }));
  } catch (e) { nota.textContent = 'Não deu para ler os projetos agora. Tente de novo.'; }
});
$('dlgNuvem').addEventListener('click', async e => {
  const dlg = $('dlgNuvem');
  if (e.target.closest('[data-acao="fechar-nuvem"]')) { dlg.close(); return; }
  const bt = e.target.closest('.nuvem-arq'); if (!bt) return;
  if (JSON.stringify(estado.projeto) !== ultimoSalvo) await salvarNuvem();   // guarda o atual antes de trocar
  try { const d = await colNuvem().doc(bt.dataset.id).get(); if (d.exists && abrirDaNuvem(d.data(), 'Projeto aberto.')) dlg.close(); else dlg.querySelector('[data-texto="nota"]').textContent = 'Não deu para abrir esse projeto.'; }
  catch (err) { dlg.querySelector('[data-texto="nota"]').textContent = 'Não deu para abrir agora. Tente de novo.'; }
});
$('arqProjeto').addEventListener('change', e => {
  const f = e.target.files[0]; if (!f) return;
  const fr = new FileReader();
  fr.onload = () => { abrirProjetoTexto(fr.result); e.target.value = ''; };
  fr.readAsText(f);
});
$('btnDesfazer').addEventListener('click', desfazer);
document.addEventListener('keydown', e => {
  if (!(e.ctrlKey || e.metaKey) || e.shiftKey || e.key.toLowerCase() !== 'z' || e.target.closest('input,textarea,select')) return;
  e.preventDefault(); desfazer();
});
$('btnPadrao').addEventListener('click', () => { estado.projeto = projetoPadrao(estado.projeto.tipo); estado.ocultas.clear(); carregarProjeto(); toast('Medidas padrão restauradas.'); });
// Editar no esquema: o Armário com vãos e o Gabinete viram Móvel livre com as mesmas peças (conversor do núcleo, conferido pelo teste)
$('btnParaLivre').addEventListener('click', () => {
  const conv = CONVERSORES_V3[estado.projeto.tipo]; if (!conv) return;
  const antigo = estado.projeto;
  estado.projeto = { ...antigo, tipo:'modulo', parametros:{ ...conv(antigo.parametros), entrega:'desmontado', origem:antigo.tipo } };
  estado.ocultas.clear(); estado.vaoSel = ''; carregarProjeto();
  toast('Agora é editado pelo Esquema: toque nos vãos. Este móvel não volta para o formulário antigo.');
});
$('tipoMovel').addEventListener('change', e => { estado.projeto = projetoPadrao(e.target.value); estado.ocultas.clear(); carregarProjeto(); });

/* =====================================================================
   8. CICLO: parâmetros → peças → 3D e listas
   ===================================================================== */
function atualizar(primeira = false) {
  let res;
  try { res = TIPOS[estado.projeto.tipo].gerar(estado.projeto.parametros); }
  catch(err) { res = { pecas:[], erros:['Combinação de medidas que o gerador não conseguiu montar. Revise os campos.'], avisos:[], ferragens:[], dims:null }; console.error(err); }
  estado.res = res;
  if (res.erros.length === 0) {
    const mudouTam = !estado.valido || ['L','H','P'].some(k => estado.valido.dims[k] !== res.dims[k]);
    estado.valido = res; construirCena(res); aplicarCorte(); montarArvore(res.pecas);
    if (primeira || mudouTam) aplicarVista(estado.vista);
  }
  mostrarAlertas(res); mostrarListas(res); mostrarDesenhos(res); destacar(); salvarLocal(); atualizarEsquema(); mostrarLoja(); mostrarFolha(); mostrarSituacao();
}
function carregarProjeto() { $('nomeProjeto').value = estado.projeto.nome; montarFormulario(); estado.valido = null; atualizar(true); }

/* ---------- Tamanho e animação ---------- */
function redimensionar() {
  const w = palco.clientWidth, h = palco.clientHeight; if (!w || !h) return;
  renderer.setSize(w, h); rotulos.setSize(w, h);
  camP.aspect = w/h; camP.updateProjectionMatrix(); ajustarOrto();
}
new ResizeObserver(redimensionar).observe(palco);
const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
let expAtual = 0;
function quadro() {
  const k = reduz ? 1 : 0.14;
  expAtual += (estado.explode - expAtual) * k;
  for (const no of nos.values()) {
    const m = no.pc.mov;
    if (m?.tipo === 'porta') { const alvo = estado.portas ? m.angMax : 0; no.ang += (alvo - no.ang)*k; no.mover.rotation.y = (m.lado==='esq' ? -1 : 1) * no.ang*Math.PI/180; }
    if (m?.tipo === 'basculante') { const alvo = estado.portas ? m.angMax : 0; no.ang += (alvo - no.ang)*k; no.mover.rotation.x = -no.ang*Math.PI/180; }   // sobe para fora
    if (m?.tipo === 'correr') { const alvo = estado.portas ? m.curso * m.sentido : 0; no.slide += (alvo - no.slide)*k; no.mover.position.x = no.slide; }
    if (m?.tipo === 'gaveta') { const alvo = estado.gavetas ? m.curso : 0; no.slide += (alvo - no.slide)*k; if (m.eixo === 'x') no.mover.position.x = no.slide; else no.mover.position.z = no.slide; }
    no.wrapper.position.copy(no.dirExp).multiplyScalar(expAtual*0.9);
  }
  controles.update();
  renderer.render(cena, cam); rotulos.render(cena, cam);
  requestAnimationFrame(quadro);
}
aplicarTema();
carregarProjeto();
redimensionar();
quadro();
window.__configurador = { atualizar, selecionar, nosAtual: () => nos, AMB, pecaDeTeste, conferenciaFabricacao, calcularOrcamento, congelarRevisao, orcamentoPDF, folhaPecaSVG, folhasPDF, ED, pedidoCorteCloud, codigosDasPecas, etiquetasPDF, planoDeCorte, gerarModuloV3, CONVERSORES_V3, resolverMetodo, METODOS_CONSTRUCAO, estado, TIPOS, listaDeCorte, nos, gerarPDF, listaDesenhos, gerarILogic, posicaoInventor, cam: () => ({ camera: cam, controles }) };
