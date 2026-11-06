/* =====================================================================
   5b. AMBIENTE — paredes, pontos (água, esgoto, gás, tomada), módulos
   posicionados nas paredes (inferior, aéreo, torre), cantos e tampo.
   Só lógica: recebe o ambiente e devolve peças posicionadas, erros e avisos.

   Ambiente = {
     formato: 'reta' | 'L',
     paredes: [{ nome:'A', comprimento, altura }, { nome:'B', … }],   // A ao fundo; B à esquerda, a 90°
     pontos:  [{ tipo:'esgoto'|'agua'|'gas'|'tomada', parede:0, x, altura }],
     modulos: [{ nome, linha:'inferior'|'aereo'|'torre', parede:0, x, y, modulo:{…módulo do núcleo…} }],
     tampo:   { esp, balanco },
   }
   x = distância do canto (início da parede) até o lado do módulo; y = altura do chão até a base.
   Parede A corre no eixo X (fundo); parede B corre no eixo Z a partir do canto (lado esquerdo).
   ===================================================================== */
const MODELOS_AMBIENTE = {
  balcao:    { nome:'Balcão com portas', linha:'inferior', y:0, largura:800, altura:850, profundidade:580, metodo:'padrao-nathan-cozinha-banheiro',
               raiz:{ tipo:'vao', frente:{ tipo:'2portas' }, conteudo:[{ tipo:'prateleiras', n:1, min:150 }] } },
  gaveteiro: { nome:'Gaveteiro', linha:'inferior', y:0, largura:600, altura:850, profundidade:580, metodo:'padrao-nathan-cozinha-banheiro',
               raiz:{ tipo:'dividir', dir:'h', sep:'nenhum', partes:[0,1,2].map(() => ({ medida:'auto', no:{ tipo:'vao', frente:{ tipo:'gaveta' }, conteudo:[] } })) } },
  aereo:     { nome:'Aéreo', linha:'aereo', y:1500, largura:800, altura:700, profundidade:350, metodo:'padrao-nathan', ajustes:{ apoio:'pes', pes:0, rodapeEncaixe:null },
               raiz:{ tipo:'vao', frente:{ tipo:'2portas' }, conteudo:[{ tipo:'prateleiras', n:1, min:150 }] } },
  torre:     { nome:'Torre', linha:'torre', y:0, largura:600, altura:2200, profundidade:580, metodo:'padrao-nathan-cozinha-banheiro',
               raiz:{ tipo:'dividir', dir:'h', sep:'divisoria', partes:[{ medida:'auto', no:{ tipo:'vao', frente:{ tipo:'2portas' }, conteudo:[{ tipo:'prateleiras', n:2, min:150 }] } },
                 { medida:'auto', no:{ tipo:'vao', frente:{ tipo:'2portas' }, conteudo:[{ tipo:'prateleiras', n:1, min:150 }] } }] } },
};
const AMB = {
  novoModulo(chave, parede, x) {
    const M = MODELOS_AMBIENTE[chave], base = TIPOS.modulo.padrao;
    const pux = { ...base.puxadorPorta, altura: M.linha === 'aereo' ? 150 : M.linha === 'inferior' ? 'topo-120' : 1050 };   // aéreo: puxador embaixo; balcão: em cima
    return { nome:M.nome, linha:M.linha, parede, x, y:M.y, modulo: JSON.parse(JSON.stringify({ ...base, largura:M.largura, altura:M.altura, profundidade:M.profundidade,
      metodo:M.metodo, metodoAjustes:M.ajustes || {}, construcao:{ ...base.construcao, beiral:0 }, puxadorPorta:pux, raiz:M.raiz })) };
  },
  // onde cabe o próximo módulo da mesma linha na parede (encostado no último)
  proximoX(amb, parede, linha) {
    const mesma = amb.modulos.filter(m => m.parede === parede && (m.linha === linha || (linha !== 'aereo' && m.linha !== 'aereo')));
    return mesma.reduce((x, m) => Math.max(x, m.x + m.modulo.largura), AMB.inicioParede(amb, parede, linha));
  },
  // no L, a parede B começa depois da profundidade dos módulos da parede A (o canto é deles)
  inicioParede(amb, parede, linha) {
    if (parede !== 1) return 0;
    const noCanto = amb.modulos.filter(m => m.parede === 0 && m.x < 1 && (linha === 'aereo' ? m.linha === 'aereo' : m.linha !== 'aereo'));
    return noCanto.reduce((p, m) => Math.max(p, m.modulo.profundidade), 0);
  },
  // posição no mundo de uma caixa local [x0,x1,y0,y1,z0,z1] do módulo
  noMundo(amb, mod, b) {
    const W = mod.modulo.largura, y = mod.y;
    if (mod.parede === 0) return [mod.x + b[0], mod.x + b[1], y + b[2], y + b[3], b[4], b[5]];
    return [b[4], b[5], y + b[2], y + b[3], mod.x + W - b[1], mod.x + W - b[0]];   // parede B: profundidade vira X, largura corre em Z
  },
};

function gerarAmbiente(amb) {
  const E = [], A = [], pecas = [], fixacoes = [], soma = new Map();
  const paredes = amb.formato === 'L' ? amb.paredes.slice(0, 2) : amb.paredes.slice(0, 1);
  const nomeP = i => 'parede ' + (paredes[i]?.nome || '?');
  const ext = (m) => [m.x, m.x + m.modulo.largura];
  // 1. cada módulo: avisos de parede, pontos e canto; depois gera as peças pelo núcleo
  amb.modulos.forEach((mod, k) => {
    const P = paredes[mod.parede], tag = `M${k + 1}`, rot = `${tag} (${mod.nome})`;
    if (!P) { E.push(`${rot}: está numa parede que não existe neste formato.`); return; }
    const [a, b] = ext(mod);
    if (a < 0) E.push(`${rot}: começa antes do canto da ${nomeP(mod.parede)}.`);
    if (b > P.comprimento) E.push(`${rot}: passa ${fmt(b - P.comprimento)} mm do fim da ${nomeP(mod.parede)}.`);
    if (mod.y + mod.modulo.altura > P.altura) E.push(`${rot}: passa ${fmt(mod.y + mod.modulo.altura - P.altura)} mm da altura da ${nomeP(mod.parede)}.`);
    // pontos cobertos: esgoto/água/gás atrás de inferior; tomada atrás de qualquer módulo
    const amb_ = {};
    for (const pt of amb.pontos.filter(p => p.parede === mod.parede && p.x > a && p.x < b && p.altura > mod.y && p.altura < mod.y + mod.modulo.altura)) {
      if (pt.tipo === 'esgoto') { amb_.esgoto = { altura: pt.altura - mod.y, recorteLarg:300, recorteProf:150 }; A.push(`${rot}: cobre o esgoto — prateleiras na faixa ganham recorte.`); }
      else A.push(`${rot}: cobre ${pt.tipo === 'tomada' ? 'uma tomada' : pt.tipo === 'gas' ? 'o ponto de gás' : 'o ponto de água'} a ${fmt(pt.altura)} mm do chão.`);
    }
    const m = { ...mod.modulo, ambiente: { ...mod.modulo.ambiente, ...amb_ } };
    let r;
    try { r = resultadoModulo(gerarModuloV3(m), m); } catch (err) { E.push(`${rot}: não foi possível montar (${err.message}).`); return; }
    r.erros.forEach(x => E.push(`${rot}: ${x}`)); r.avisos.filter(x => !/Móvel alto/.test(x)).forEach(x => A.push(`${rot}: ${x}`));
    for (const pc of r.pecas) {
      const q = { ...pc, id: `${tag}-${pc.id}`, nome: `${tag} · ${pc.nome}`, modulo:k, box: pc.box ? AMB.noMundo(amb, mod, pc.box) : pc.box };
      if (mod.parede !== 0) q.mov = null;          // [limitação] porta da parede B ainda não abre no 3D
      if (q.expPai) q.expPai = `${tag}-${q.expPai}`;
      pecas.push(q);
    }
    r.ferragens.forEach(f => { const s = soma.get(f.ref); if (s) s.qtd += f.qtd; else soma.set(f.ref, { ...f }); });
    (r.fixacoes || []).forEach(f => {
      const p = AMB.noMundo(amb, mod, [f.p[0], f.p[0], f.p[1], f.p[1], f.p[2], f.p[2]]);
      const dir = mod.parede === 0 ? f.dir : [f.dir[2], f.dir[1], -f.dir[0]];
      fixacoes.push({ ...f, p:[p[0], p[2], p[4]], dir, dono:`${tag}-${f.dono}` });
    });
  });
  // 2. sobreposição entre módulos da mesma parede (aéreos só com aéreos; torre conta nas duas linhas)
  const conflito = (m1, m2) => m1.parede === m2.parede && ext(m1)[0] < ext(m2)[1] - 0.5 && ext(m2)[0] < ext(m1)[1] - 0.5
    && m1.y < m2.y + m2.modulo.altura - 0.5 && m2.y < m1.y + m1.modulo.altura - 0.5;
  amb.modulos.forEach((m1, i) => amb.modulos.slice(i + 1).forEach((m2, j) => { if (conflito(m1, m2)) E.push(`M${i + 1} e M${i + j + 2} se sobrepõem na ${nomeP(m1.parede)}.`); }));
  // 3. canto do L: módulo da parede B tem que começar depois da profundidade do módulo da parede A no canto
  if (paredes.length === 2) for (const ma of amb.modulos.filter(m => m.parede === 0 && m.x < 1)) for (const mb of amb.modulos.filter(m => m.parede === 1)) {
    const alturaCruza = ma.y < mb.y + mb.modulo.altura && mb.y < ma.y + ma.modulo.altura; if (!alturaCruza) continue;
    const ia = amb.modulos.indexOf(ma) + 1, ib = amb.modulos.indexOf(mb) + 1;
    if (mb.x < ma.modulo.profundidade - 0.5) E.push(`Canto: M${ia} e M${ib} se cruzam (M${ib} precisa começar a ${fmt(ma.modulo.profundidade)} mm do canto).`);
    else if (mb.x - ma.modulo.profundidade < R.cantoFolga) A.push(`Canto: entre M${ia} e M${ib} sobram ${fmt(mb.x - ma.modulo.profundidade)} mm — as portas podem bater. Sugestão: enchimento (cego) de ${R.cantoFolga} mm.`);
  }
  // 4. tampo contínuo sobre os inferiores de cada parede (pedra: referência, orçado à parte)
  paredes.forEach((P, i) => {
    const inf = amb.modulos.filter(m => m.parede === i && m.linha === 'inferior'); if (!inf.length) return;
    const x0 = Math.min(...inf.map(m => m.x)), x1 = Math.max(...inf.map(m => m.x + m.modulo.largura));
    const alt = Math.max(...inf.map(m => m.y + m.modulo.altura)), prof = Math.max(...inf.map(m => m.modulo.profundidade)) + amb.tampo.balanco;
    const fake = { parede:i, x:x0, y:alt, modulo:{ largura:x1 - x0 } };
    pecas.push({ id:`tampo-${P.nome}`, nome:`Tampo da ${nomeP(i)}`, cat:'tampo', mat:'marmore', esp:amb.tampo.esp, lista:false, papel:'tampo', comp:x1 - x0, larg:prof, fita:[0,0], obs:'Pedra: medir na obra e orçar à parte.',
      box: AMB.noMundo(amb, fake, [0, x1 - x0, 0, amb.tampo.esp, 0, prof]) });
    const tem = amb.pontos.some(p => p.parede === i && p.tipo === 'esgoto' && p.x > x0 && p.x < x1);
    if (tem) A.push(`Tampo da ${nomeP(i)}: tem esgoto embaixo — prever recorte da cuba no tampo.`);
  });
  // 5. pontos e paredes como referência no 3D (não fabricar)
  amb.pontos.forEach((pt, k) => { if (!paredes[pt.parede]) return;
    const fake = { parede:pt.parede, x:pt.x - 40, y:pt.altura - 40, modulo:{ largura:80 } };
    pecas.push({ id:`ponto-${k + 1}`, nome:`Ponto: ${pt.tipo}`, cat:'referencia', mat:'cromado', esp:10, lista:false, papel:'ponto', fita:[0,0], obs:'', box: AMB.noMundo(amb, fake, [0, 80, 0, 80, 0, 10]) }); });
  const L = Math.max(paredes[0].comprimento, ...pecas.filter(p => p.box).map(p => p.box[1]));
  const Pz = Math.max(700, ...pecas.filter(p => p.box).map(p => p.box[5]));
  const H = Math.max(...paredes.map(p => p.altura));
  return { pecas, erros:E, avisos:A, ferragens:[...soma.values()], fixacoes, ambiente:true,
    dims:{ L, H, P:Pz, t:18, top:H, faixaEsgoto:null, paredeEsq: paredes.length === 2, paredeDir:false, alturaTampo: Math.max(0, H - 700) } };
}

TIPOS.ambiente = {
  nomePadrao:'Cozinha', nome:'Ambiente (cozinha, lavanderia…)', grupos:[], editor:'ambiente',
  padrao: { formato:'L', paredes:[{ nome:'A', comprimento:3000, altura:2600 }, { nome:'B', comprimento:2200, altura:2600 }],
    pontos:[{ tipo:'esgoto', parede:0, x:1400, altura:550 }, { tipo:'agua', parede:0, x:1500, altura:600 }, { tipo:'tomada', parede:0, x:2500, altura:1200 }],
    modulos:[], tampo:{ esp:20, balanco:20 } },
  gerar: gerarAmbiente,
};
// cozinha em L de exemplo: gaveteiro no canto da A, balcão da pia, balcão; na B um balcão e uma torre; aéreos na A
(() => {
  const amb = TIPOS.ambiente.padrao, add = (k, p, x) => { const m = AMB.novoModulo(k, p, x ?? AMB.proximoX(amb, p, MODELOS_AMBIENTE[k].linha)); amb.modulos.push(m); return m; };
  add('gaveteiro', 0, 0); const pia = add('balcao', 0); pia.nome = 'Balcão da pia'; pia.modulo.largura = 1200; add('balcao', 0);
  add('balcao', 1); add('torre', 1);
  add('aereo', 0, 0); add('aereo', 0); add('aereo', 0);
})();
