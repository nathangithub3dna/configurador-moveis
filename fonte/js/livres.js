/* =====================================================================
   PASSO 1a. PEÇAS LIVRES — chapa posicionada à mão no ambiente (painel de parede,
   forro, cortineiro, mesa, bancada, lateral de acabamento…). Só lógica.

   Peça livre (ambiente.livres[]) = {
     nome, funcao (FUNCOES_LIVRE em regras.js), grupo (texto; peças do mesmo grupo andam juntas — tela, 1b),
     comp, larg, esp, mat,                   // comp = medida 1 (eixo u), larg = medida 2 (eixo v)
     veio: 'comp' | 'larg' | null,           // só vale em material com veio; sem informar = no comprimento
     fita: { C1, C2, L1, L2 },               // espessura da fita em cada lado (0 = sem). C1 = lado v=0, C2 = v=larg, L1 = u=0, L2 = u=comp
     apoio: 'deitada' | 'frente' | 'lado',   // como a peça nasce antes do giro
     pos: { parede:0|1, x, y, afast }        // x = distância do canto, y = altura do chão, afast = distância da parede (mesma regra dos módulos)
        | { solta:true, x, y, z },           // coordenadas do ambiente (X ao longo da parede A, Y para cima, Z saindo da parede A)
     giro: [gx, gy, gz],                     // graus, em volta do centro da peça; eixos da parede: x ao longo dela, y vertical, z saindo dela
                                              // ordem: primeiro gz, depois gx, por último gy (gy = girar em volta do eixo vertical)
     recortes: [{ u, v, w, h }],             // retângulo no plano da peça: encostado na borda = recorte; por dentro = vazado
     furos: [{ u, v, d, prof }],             // na face A; prof 0 = passante
     ferragens: [{ ref, qtd }],              // fixação escolhida à mão (itens da biblioteca)
   }
   Eixos da peça antes do giro: u = medida 1, v = medida 2, n = u × v (sai da face A, a face furada).
     deitada: u ao longo da parede, v na profundidade, face A para baixo
     frente:  u ao longo da parede, v na vertical,     face A para a frente
     lado:    u na profundidade,     v na vertical,     face A virada para o lado do canto
   Fixação: sempre escolhida à mão (o cálculo por contato dos módulos não vale para peça livre:
   ele poria parafuso aparente no tampo de uma mesa, por exemplo).
   ===================================================================== */
const LIVRE_APOIOS = { deitada: [[1,0,0],[0,0,1]], frente: [[1,0,0],[0,1,0]], lado: [[0,0,1],[0,1,0]] };

const V3 = {
  cruz: (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]],
  soma: (...vs) => vs.reduce((s, v) => [s[0]+v[0], s[1]+v[1], s[2]+v[2]], [0,0,0]),
  mult: (v, k) => [v[0]*k, v[1]*k, v[2]*k],
  abs: v => v.map(Math.abs),
  matVet: (m, v) => [0,1,2].map(i => m[i][0]*v[0] + m[i][1]*v[1] + m[i][2]*v[2]),
  matMat: (a, b) => [0,1,2].map(i => [0,1,2].map(j => a[i][0]*b[0][j] + a[i][1]*b[1][j] + a[i][2]*b[2][j])),
  limpa: v => v.map(x => Math.abs(x) < 1e-9 ? 0 : Math.abs(Math.abs(x) - 1) < 1e-9 ? Math.sign(x) : x),
};
// giro em graus → matriz (ordem: z, depois x, depois y)
function matrizGiro([gx = 0, gy = 0, gz = 0] = []) {
  const r = g => g * Math.PI / 180, c = g => Math.cos(r(g)), s = g => Math.sin(r(g));
  const Rx = [[1,0,0],[0,c(gx),-s(gx)],[0,s(gx),c(gx)]], Ry = [[c(gy),0,s(gy)],[0,1,0],[-s(gy),0,c(gy)]], Rz = [[c(gz),-s(gz),0],[s(gz),c(gz),0],[0,0,1]];
  return V3.matMat(Ry, V3.matMat(Rx, Rz)).map(V3.limpa);
}
const giroAlinhado = m => m.every(l => l.every(x => x === 0 || x === 1 || x === -1));
// da parede ao ambiente (só direção): parede A = igual; parede B = girada 90° (como os módulos: o lado do canto fica à direita)
const vetorNoMundo = (parede, v) => parede === 1 ? [v[2], v[1], -v[0]] : v;

// desenho da peça: escolhe o giro no plano (0, 90, 180 ou 270°) que deixa todos os recortes na borda de cima,
// porque o contorno do desenho, do iLogic e da folha só sabe recortar a borda de cima
const ROT_DESENHO = [
  { pt: (a, b, C, L) => [a, b],         W: (C, L) => C, H: (C, L) => L, du: (U, V) => U,              dv: (U, V) => V,              ori: (C, L) => [0, 0], fita: { C1:'b', C2:'t', L1:'l', L2:'r' } },
  { pt: (a, b, C, L) => [b, C - a],     W: (C, L) => L, H: (C, L) => C, du: (U, V) => V,              dv: (U, V) => V3.mult(U, -1), ori: (C, L) => [C, 0], fita: { C1:'l', C2:'r', L1:'t', L2:'b' } },
  { pt: (a, b, C, L) => [C - a, L - b], W: (C, L) => C, H: (C, L) => L, du: (U, V) => V3.mult(U, -1), dv: (U, V) => V3.mult(V, -1), ori: (C, L) => [C, L], fita: { C1:'t', C2:'b', L1:'r', L2:'l' } },
  { pt: (a, b, C, L) => [L - b, a],     W: (C, L) => L, H: (C, L) => C, du: (U, V) => V3.mult(V, -1), dv: (U, V) => U,              ori: (C, L) => [0, L], fita: { C1:'r', C2:'l', L1:'b', L2:'t' } },
];
function desenhoLivre(lv, C, L) {
  const rec = lv.recortes || [], na = r => r.u <= 0.01 || r.v <= 0.01 || r.u + r.w >= C - 0.01 || r.v + r.h >= L - 0.01;
  const bordas = rec.filter(na);
  for (let k = 0; k < 4; k++) {
    const R0 = ROT_DESENHO[k], W = R0.W(C, L), H = R0.H(C, L);
    const ret = r => { const p1 = R0.pt(r.u, r.v, C, L), p2 = R0.pt(r.u + r.w, r.v + r.h, C, L);
      return { x: Math.min(p1[0], p2[0]), y: Math.min(p1[1], p2[1]), w: Math.abs(p2[0] - p1[0]), h: Math.abs(p2[1] - p1[1]) }; };
    const noTopo = bordas.map(ret).every(q => q.y + q.h >= H - 0.01 && q.y > 0.01);
    if (!noTopo) continue;
    return { k, W, H,
      recortes: bordas.map(ret).map(q => ({ x: q.x, w: q.w, h: q.h })),
      rasgos: rec.filter(r => !na(r)).map(ret),
      furos: (lv.furos || []).map(f => { const [x, y] = R0.pt(f.u, f.v, C, L); return { x, y, d: f.d, prof: f.prof || 0, tipo: 'avulso' }; }),
      fita: Object.entries(lv.fita || {}).filter(([, e]) => e > 0).map(([lado]) => R0.fita[lado]) };
  }
  return null;
}

const linhaFerragem = (ref, qtd) => { const b = BIBLIOTECA[ref];
  return { ref, item: b.nome + (b.marca ? ` — ${b.marca}${b.codigo ? ' ' + b.codigo : ''}` : ''), nome: b.nome, marca: b.marca, codigo: b.codigo, qtd,
    unid: b.metro ? 'm' : (b.unid === 'par' ? 'par' : 'un'), obs: b.metro ? 'metros, com 10% de perda' : (b.obs || ''), var: '' }; };

function pecasLivres(amb, paredes) {
  const E = [], A = [], pecas = [], conta = new Map();
  const somaRef = (ref, q) => { const it = BIBLIOTECA[ref]; if (!it || !(q > 0)) return;
    if (it.componentes) it.componentes.forEach(([cr, cq]) => conta.set(cr, (conta.get(cr) || 0) + q * cq)); else conta.set(ref, (conta.get(ref) || 0) + q); };
  let fitaFina = 0, fitaGrossa = 0;
  (amb.livres || []).forEach((lv, k) => {
    const tag = `L${k + 1}`, nome = lv.nome || FUNCOES_LIVRE[lv.funcao] || 'Peça livre', rot = `${tag} (${nome})`;
    const C = Number(lv.comp), L = Number(lv.larg), esp = Number(lv.esp);
    if (!FUNCOES_LIVRE[lv.funcao]) { E.push(`${rot}: escolha a função da peça.`); return; }
    if (!(C > 0 && L > 0 && esp > 0)) { E.push(`${rot}: medidas inválidas.`); return; }
    if (!MATERIAIS[lv.mat]) { E.push(`${rot}: material "${lv.mat}" não existe.`); return; }
    if (Math.max(C, L) > Math.max(...R.chapa) || Math.min(C, L) > Math.min(...R.chapa)) E.push(`${rot}: maior que a chapa (${R.chapa.join(' × ')}).`);
    const pos = lv.pos || { parede: 0, x: 0, y: 0, afast: 0 }, solta = !!pos.solta, parede = solta ? null : (pos.parede || 0);
    const P = solta ? null : paredes[parede];
    if (!solta && !P) { E.push(`${rot}: está numa parede que não existe neste formato.`); return; }
    // eixos na parede (antes e depois do giro) e caixa da peça na parede
    const [U0, V0] = LIVRE_APOIOS[lv.apoio] || LIVRE_APOIOS.deitada, N0 = V3.cruz(U0, V0);
    const ext0 = V3.soma(V3.mult(V3.abs(U0), C), V3.mult(V3.abs(V0), L), V3.mult(V3.abs(N0), esp));
    const p0 = solta ? [pos.x || 0, pos.y || 0, pos.z || 0] : [pos.x || 0, pos.y || 0, pos.afast || 0];
    const cP = V3.soma(p0, V3.mult(ext0, 0.5));
    const G = matrizGiro(lv.giro), alinhado = giroAlinhado(G);
    const U = V3.limpa(V3.matVet(G, U0)), V = V3.limpa(V3.matVet(G, V0)), N = V3.cruz(U, V);
    const quinas = []; for (const a of [-C/2, C/2]) for (const b of [-L/2, L/2]) for (const c of [-esp/2, esp/2]) quinas.push(V3.soma(cP, V3.mult(U, a), V3.mult(V, b), V3.mult(N, c)));
    const cx = [0,1,2].map(i => [Math.min(...quinas.map(q => q[i])), Math.max(...quinas.map(q => q[i]))]);
    // avisos de posição (na parede: medidas da parede; solta: só o chão)
    if (cx[1][0] < -0.5) E.push(`${rot}: fica ${fmt(-cx[1][0])} mm abaixo do chão.`);
    if (!solta) {
      if (cx[0][0] < -0.5) E.push(`${rot}: começa antes do canto da parede ${P.nome}.`);
      if (cx[0][1] > P.comprimento + 0.5) E.push(`${rot}: passa ${fmt(cx[0][1] - P.comprimento)} mm do fim da parede ${P.nome}.`);
      if (cx[1][1] > P.altura + 0.5) E.push(`${rot}: passa ${fmt(cx[1][1] - P.altura)} mm da altura da parede ${P.nome}.`);
      if (cx[2][0] < -0.5) E.push(`${rot}: entra ${fmt(-cx[2][0])} mm na parede ${P.nome}.`);
    }
    // da parede para o ambiente: pontos pela mesma conta dos módulos (noMundo), direções girando a parede B
    const fake = solta ? null : { parede, x: cx[0][0], y: 0, modulo: { largura: cx[0][1] - cx[0][0] } };
    const ponto = p => { if (solta) return p; const b = AMB.noMundo(amb, fake, [p[0] - cx[0][0], p[0] - cx[0][0], p[1], p[1], p[2], p[2]]); return [b[0], b[2], b[4]]; };
    const dir = v => solta ? v : vetorNoMundo(parede, v);
    const Uw = dir(U), Vw = dir(V), Nw = dir(N), cW = ponto(cP);
    const qW = quinas.map(ponto), box = [0,1,2].flatMap(i => [Math.min(...qW.map(q => q[i])), Math.max(...qW.map(q => q[i]))]).map(x => Math.round(x * 1000) / 1000);
    // recortes e furos dentro da peça
    for (const r of lv.recortes || []) if (!(r.w > 0 && r.h > 0) || r.u < -0.01 || r.v < -0.01 || r.u + r.w > C + 0.01 || r.v + r.h > L + 0.01) E.push(`${rot}: recorte fora da peça (${fmt(r.u)}, ${fmt(r.v)}, ${fmt(r.w)} × ${fmt(r.h)}).`);
    for (const f of lv.furos || []) if (!(f.d > 0) || f.u - f.d/2 < 0 || f.v - f.d/2 < 0 || f.u + f.d/2 > C || f.v + f.d/2 > L) E.push(`${rot}: furo Ø${fmt(f.d)} fora da peça (${fmt(f.u)}, ${fmt(f.v)}).`);
    const des = desenhoLivre(lv, C, L);
    if (!des) { E.push(`${rot}: recortes em bordas opostas ou em mais de dois lados — ainda não dá para desenhar (só recortes que caibam numa mesma borda).`); return; }
    // eixos do desenho no ambiente: origem do desenho na face A (para o iLogic e o 3D)
    const RD = ROT_DESENHO[des.k], du = RD.du(Uw, Vw), dv = RD.dv(Uw, Vw), [oa, ob] = RD.ori(C, L);
    const canto0 = V3.soma(cW, V3.mult(Uw, -C/2), V3.mult(Vw, -L/2), V3.mult(Nw, -esp/2));
    const origem = V3.soma(canto0, V3.mult(Uw, oa), V3.mult(Vw, ob), V3.mult(Nw, esp));
    // fita, veio e medida de corte (lista de corte: comprimento = lado maior)
    const fl = { C1: 0, C2: 0, L1: 0, L2: 0, ...(lv.fita || {}) }, temVeio = !!MATERIAIS[lv.mat].veio;
    let veio = temVeio ? (lv.veio === 'larg' ? 'larg' : 'comp') : null, comp = C, larg = L, lados = fl;
    if (L > C) { comp = L; larg = C; lados = { C1: fl.L1, C2: fl.L2, L1: fl.C1, L2: fl.C2 }; if (veio) veio = veio === 'comp' ? 'larg' : 'comp'; }
    const nC = (lados.C1 > 0) + (lados.C2 > 0), nL = (lados.L1 > 0) + (lados.L2 > 0);
    const corte = { comp: comp - lados.L1 - lados.L2, larg: larg - lados.C1 - lados.C2 }, loja = R.lojaPadrao;
    if (Math.max(comp, larg) <= Math.max(...R.chapa) && Math.min(comp, larg) <= Math.min(...R.chapa) && veio && (veio === 'comp' ? comp : larg) > Math.max(...R.chapa)) E.push(`${rot}: com o veio na ${veio === 'comp' ? 'maior' : 'menor'} medida a peça não cabe na chapa.`);
    const pc = { id: `${tag}-${lv.funcao}`, nome: `${tag} · ${nome}`, nomeLista: nome, cat: 'livre', mat: lv.mat, esp, lista: true, mov: null,
      comp, larg, fita: [nC, nL], fitaLados: lados, veio, corte,
      medidaLoja: loja.descontaFita ? { comp, larg, tipo: 'final' } : { ...corte, tipo: 'corte' },
      box, livre: k, grupo: lv.grupo || null,
      giro: alinhado ? null : { centro: cW, eixos: [Uw, Vw, Nw] },
      forma: { tipo: 'livre', origem, du, dv, n: Nw, W: des.W, H: des.H, recortes: des.recortes, rasgos: des.rasgos },
      eixos: { o: origem, u: du, v: dv, n: Nw },
      des: { w: des.W, h: des.H, fita: des.fita, vista: 'Vista pela face A', furos: des.furos, recortes: des.recortes, rasgos: des.rasgos },
      obs: [lv.obs, alinhado ? '' : 'Peça girada em ângulo: conferir a montagem na obra.'].filter(Boolean).join(' ') };
    Object.assign(pc, papelDe(pc.id));
    pecas.push(pc);
    // compras: ferragens escolhidas e fita (metros com perda)
    const fer = (lv.ferragens || []).filter(f => f.qtd > 0);
    for (const f of fer) { if (!BIBLIOTECA[f.ref]) E.push(`${rot}: ferragem "${f.ref}" não existe na biblioteca.`); else somaRef(f.ref, f.qtd); }
    if (!fer.length) A.push(`${rot}: sem fixação escolhida — escolha as ferragens que prendem a peça.`);
    const mm = (lados.C1 > 0 ? comp : 0) + (lados.C2 > 0 ? comp : 0) + (lados.L1 > 0 ? larg : 0) + (lados.L2 > 0 ? larg : 0);
    if (esp <= 19) fitaFina += mm; else fitaGrossa += mm;
  });
  if (fitaFina) somaRef('fita-pvc-22', Math.ceil(fitaFina * R.perdaFita / 1000));
  if (fitaGrossa) somaRef('fita-pvc-35', Math.ceil(fitaGrossa * R.perdaFita / 1000));
  return { pecas, erros: E, avisos: A, ferragens: [...conta.entries()].map(([ref, qtd]) => linhaFerragem(ref, qtd)) };
}
