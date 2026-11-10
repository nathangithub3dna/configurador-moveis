// contorno visto de cima (x, z) de uma porta de giro aberta no ângulo `ang` (graus), girando em volta do eixo da dobradiça
function contornoPortaAberta(pc, ang) {
  const [x0, x1, , , z0, z1] = pc.box, m = pc.mov, f = (m.lado === 'esq' ? -1 : 1) * ang * Math.PI / 180, c = Math.cos(f), s = Math.sin(f);
  return [[x0, z0], [x1, z0], [x1, z1], [x0, z1]].map(([x, z]) => { const dx = x - m.pivX, dz = z - m.pivZ; return [m.pivX + dx*c + dz*s, m.pivZ - dx*s + dz*c]; });
}
// dois polígonos convexos se sobrepõem? (eixos separadores; folga de 1 mm)
function poligonosSeTocam(a, b) {
  for (const P of [a, b]) for (let i = 0; i < P.length; i++) {
    const [x1, y1] = P[i], [x2, y2] = P[(i + 1) % P.length], nx = y2 - y1, ny = x1 - x2;
    const pa = a.map(([x, y]) => x*nx + y*ny), pb = b.map(([x, y]) => x*nx + y*ny), L = Math.hypot(nx, ny) || 1;
    if (Math.max(...pa) + L <= Math.min(...pb) || Math.max(...pb) + L <= Math.min(...pa)) return false;   // separados com pelo menos 1 mm
  }
  return true;
}
function limitarPortasQueBatem(pecas, A) {
  const portas = pecas.filter(q => q.cat === 'frente' && q.mov?.tipo === 'porta');
  for (let i = 0; i < portas.length; i++) for (let j = i + 1; j < portas.length; j++) {
    const a = portas[i], b = portas[j];
    if (Math.min(a.box[3], b.box[3]) - Math.max(a.box[2], b.box[2]) < 1) continue;            // alturas diferentes: não se encontram
    const max = Math.min(a.mov.angMax, b.mov.angMax); let ok = max;
    for (let ang = 1; ang <= max; ang++) if (poligonosSeTocam(contornoPortaAberta(a, ang), contornoPortaAberta(b, ang))) { ok = ang - 1; break; }
    if (ok < max) {
      a.mov.angMax = Math.min(a.mov.angMax, ok); b.mov.angMax = Math.min(b.mov.angMax, ok);
      A.push(`${a.nome} e ${b.nome}: abrem só até ${ok}° juntas para não baterem uma na outra (abertas uma de cada vez, abrem tudo).`);
    }
  }
}
