/* AJUSTE POR PEÇA (passo 1c) — em qualquer módulo: desligar uma peça ou mudar a medida dela.
   m.pecasAjuste = { '<id da peça>': { desligar:true } | { medidas:{ x|y|z: { valor, fixo:'ini'|'fim'|'centro' } } } }
   Eixos do módulo: x = largura (esquerda → direita), y = altura (chão → cima), z = profundidade (parede → frente).
   fixo = o lado que não se mexe: 'ini' = esquerda/embaixo/atrás, 'fim' = direita/em cima/na frente.
   Desligar leva junto o que é da peça (dobradiças e puxador da porta; caixa da gaveta). O resto segue a regra. */
const EIXOS_AJUSTE = { x:{ i:0, nome:'largura' }, y:{ i:1, nome:'altura' }, z:{ i:2, nome:'profundidade' } };
// eixo do desenho (w, h) de uma peça: pela medida; empate (peça quadrada) pela vista
function eixosDoDesenho(pc) {
  const ext = [0,1,2].map(i => pc.box[2*i+1] - pc.box[2*i]), esp = [0,1,2].reduce((a, i) => Math.abs(ext[i] - pc.esp) < Math.abs(ext[a] - pc.esp) ? i : a, 0);
  const planos = [0,1,2].filter(i => i !== esp), igual = (v, i) => Math.abs(ext[i] - v) < 0.6;
  const pelaVista = /lateral|lado|face interna/i.test(pc.des?.vista || '') && planos.includes(2) && pc.cat !== 'frente' ? [2, 1] : /cima/i.test(pc.des?.vista || '') ? [0, 2] : [0, 1];
  let w = planos.find(i => igual(pc.des?.w, i)), h = planos.find(i => i !== w);
  if (w === undefined || (igual(pc.des?.w, planos[0]) && igual(pc.des?.w, planos[1]))) [w, h] = planos.includes(pelaVista[0]) && planos.includes(pelaVista[1]) ? pelaVista : planos;
  return { esp, w, h, ext };
}
function aplicarAjustesPecas(pecas, ajustes, E, A) {
  if (!ajustes) return;
  const ids = new Set(pecas.map(p => p.id));
  for (const [id, aj] of Object.entries(ajustes)) {
    if (!aj) continue;
    const pc = pecas.find(p => p.id === id);
    if (!pc) { A.push(`Ajuste da peça "${id}": a peça não existe mais neste módulo — o ajuste ficou sem efeito (confira ou remova).`); continue; }
    if (aj.desligar) {
      const fora = new Set([id]); let mudou = true;
      while (mudou) { mudou = false; for (const p of pecas) if (p.expPai && fora.has(p.expPai) && !fora.has(p.id)) { fora.add(p.id); mudou = true; } }
      for (let k = pecas.length - 1; k >= 0; k--) if (fora.has(pecas[k].id)) pecas.splice(k, 1);
      continue;
    }
    const meds = Object.entries(aj.medidas || {}).filter(([, v]) => v && v.valor !== undefined && v.valor !== '');
    if (!meds.length) continue;
    const rot = pc.nome;
    if (pc.cat === 'ferragem' || pc.cat === 'referencia' || pc.cat === 'tampo') { E.push(`${rot}: ferragem e referência não mudam de medida (só dá para desligar).`); continue; }
    if (pc.cat === 'frente' || pc.cat === 'gaveta' || pc.mov) { E.push(`${rot}: porta e gaveta não mudam de medida por ajuste — mude o vão ou a frente no módulo.`); continue; }
    if ((pc.des?.furos || []).length || pc.forma?.tipo === 'recorte') { E.push(`${rot}: a peça tem furos ou recorte próprios; mudar a medida aqui deixaria a furação errada.`); continue; }
    const d = eixosDoDesenho(pc), box = [...pc.box];
    let ok = true;
    for (const [eixo, v] of meds) {
      const ex = EIXOS_AJUSTE[eixo], val = Number(v.valor);
      if (!ex) { E.push(`${rot}: eixo "${eixo}" não existe.`); ok = false; continue; }
      if (ex.i === d.esp) { E.push(`${rot}: a ${ex.nome} desta peça é a espessura da chapa — troque a chapa, não a medida.`); ok = false; continue; }
      if (!(val > 0)) { E.push(`${rot}: ${ex.nome} inválida.`); ok = false; continue; }
      const a = box[2*ex.i], b = box[2*ex.i+1];
      if (v.fixo === 'fim') box[2*ex.i] = b - val; else if (v.fixo === 'centro') { box[2*ex.i] = (a + b - val) / 2; box[2*ex.i+1] = (a + b + val) / 2; } else box[2*ex.i+1] = a + val;
      if (v.fixo === 'fim') box[2*ex.i+1] = b;
    }
    if (!ok) continue;
    const novo = [0,1,2].map(i => box[2*i+1] - box[2*i]), mudouC = Math.abs(novo[d.w] - d.ext[d.w]) > 0.01 || Math.abs(novo[d.h] - d.ext[d.h]) > 0.01;
    if (!mudouC) continue;
    // comp = maior medida; a fita acompanha o lado (se a peça "virar", troca de posição)
    const compEra = d.ext[d.w] >= d.ext[d.h] ? d.w : d.h, compAgora = novo[d.w] >= novo[d.h] ? d.w : d.h;
    if (compEra !== compAgora) pc.fita = [pc.fita[1], pc.fita[0]];
    pc.box = box; pc.comp = Math.max(novo[d.w], novo[d.h]); pc.larg = Math.min(novo[d.w], novo[d.h]);
    if (pc.des) { pc.des.w = novo[d.w]; pc.des.h = novo[d.h]; }
    if (pc.forma?.tipo === 'rasgos' && pc.des) {
      pc.des.rasgos = pc.forma.lista.map(r => ({ x:r.z0 - box[4], y:r.y0 - box[2], w:r.z1 - r.z0, h:r.y1 - r.y0 }));
      if (pc.forma.lista.some(r => r.z0 < box[4] || r.z1 > box[5] || r.y0 < box[2] || r.y1 > box[3])) E.push(`${rot}: com a medida nova os rasgos de ventilação ficam fora da peça.`);
    }
    pc.ajustada = true;
    pc.obs = [pc.obs, 'Medida mudada à mão (ajuste da peça).'].filter(Boolean).join(' ');
  }
}
