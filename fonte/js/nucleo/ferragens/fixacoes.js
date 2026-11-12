/* =====================================================================
   3c. FIXAÇÕES — calculadas pelo contato entre as peças (vale para qualquer tipo)
   Face de uma peça encostada no topo de outra: parafuso atravessa a primeira e entra no topo da segunda.
   Topo com topo: cavilha. Fundo: parafuso 3,5 × 14 a cada ~150 mm.
   Cada item: { tipo, p:[x,y,z] entrada, dir:[x,y,z], comp, d, dono }
   ===================================================================== */
function calcularFixacoes(pecas) {
  const F = [], ext = pc => [0,1,2].map(i => pc.box[2*i+1] - pc.box[2*i]);
  const fino = pc => { const e = ext(pc); return e.indexOf(Math.min(...e)); };
  const P = pecas.filter(pc => pc.lista && ['caixa','gaveta','enchimento','fundo','frente'].includes(pc.cat) && pc.box);
  const linha = (a, b, margem, passo) => { const L = b - a, m = Math.min(margem, L*0.25); if (L < 60) return [(a+b)/2];
    const n = Math.max(2, Math.ceil((L - 2*m)/passo) + 1); return Array.from({ length:n }, (_, i) => a + m + (L - 2*m)*i/(n-1)); };
  const add = (tipo, p, dir, comp, d, dono) => F.push({ tipo, p, dir, comp, d, dono });
  for (const A of P) for (const B of P) {
    if (A === B) continue;
    for (let ax = 0; ax < 3; ax++) {
      const lado = Math.abs(A.box[2*ax+1] - B.box[2*ax]) < 0.6 ? 1 : Math.abs(A.box[2*ax] - B.box[2*ax+1]) < 0.6 ? -1 : 0;
      if (!lado) continue;
      const o = [0,1,2].filter(i => i !== ax), ov = {};
      o.forEach(i => ov[i] = [Math.max(A.box[2*i], B.box[2*i]), Math.min(A.box[2*i+1], B.box[2*i+1])]);
      if (o.some(i => ov[i][1] - ov[i][0] < 1)) continue;
      const fA = fino(A), fB = fino(B), dir = [0,0,0]; dir[ax] = lado;
      const xEntrada = lado === 1 ? A.box[2*ax] : A.box[2*ax+1], xContato = lado === 1 ? A.box[2*ax+1] : A.box[2*ax];
      const pt = (vAx, vals) => { const q = [0,0,0]; q[ax] = vAx; o.forEach(i => q[i] = vals[i]); return q; };
      const ehBeiral = pc => pc.papel === 'beiral-frontal' || pc.papel === 'beiral-lateral', bordaBeiral = ehBeiral(A) || ehBeiral(B);
      if (fA === ax && fB !== ax && A.cat !== 'frente' && B.cat !== 'frente') {
        // A atravessada, entra no topo de B; linha ao longo do eixo do plano que não é a espessura de B
        const q = o.find(i => i !== fB), meio = (ov[fB][0] + ov[fB][1]) / 2;
        if (A.cat === 'fundo') { for (const v of linha(ov[q][0], ov[q][1], 40, 150)) add('paraf-35x14', pt(xEntrada, { [q]:v, [fB]:meio }), dir, 14, 3.5, B.id); }
        else if (bordaBeiral && ehBeiral(A)) { for (const v of linha(ov[q][0], ov[q][1], 50, 300)) add('cavilha-8x30', pt(xContato - lado*15, { [q]:v, [fB]:meio }), dir, 30, 8, B.id); }
        else for (const v of linha(ov[q][0], ov[q][1], 50, 250)) add('paraf-40x50', pt(xEntrada, { [q]:v, [fB]:meio }), dir, 50, 4, B.id);
      } else if (fA === ax && fB === ax) {
        // face com face: frente da gaveta (pela frente interna) e espaçador das corrediças
        const [i, j] = o;
        if (B.cat === 'frente' && /-frente-interna$/.test(A.id)) {
          for (const u of linha(ov[i][0], ov[i][1], 60, 1e9)) for (const v of linha(ov[j][0], ov[j][1], 30, 1e9)) add('paraf-35x25', pt(xEntrada, { [i]:u, [j]:v }), dir, 25, 3.5, B.id);
        } else if (A.papel === 'espacador' && B.cat !== 'frente') {
          for (const u of linha(ov[i][0], ov[i][1], 60, 300)) for (const v of linha(ov[j][0], ov[j][1], 50, 1e9)) add('paraf-40x30', pt(xEntrada, { [i]:u, [j]:v }), dir, 30, 4, B.id);
        }
      } else if (fA !== ax && fB !== ax && A.id < B.id && bordaBeiral) {
        // topo com topo (beiral sobre a lateral): cavilhas
        const q = o.find(i => i !== fA), meio = (ov[fA][0] + ov[fA][1]) / 2;
        for (const v of linha(ov[q][0], ov[q][1], 50, 300)) add('cavilha-8x30', pt(xContato - lado*15, { [q]:v, [fA]:meio }), dir, 30, 8, B.id);
      }
    }
  }
  // parafusos de parede nas travessas
  for (const pc of pecas.filter(pc => pc.papel === 'travessa-fixacao')) for (const f of (pc.des?.furos || []).filter(f => f.tipo === 'parede'))
    add('paraf-50x60-bucha', [pc.box[0] + f.x, pc.box[2] + f.y, pc.box[5]], [0,0,-1], 60 + pc.box[5] - pc.box[4], 5, pc.id);
  // pinos das prateleiras soltas (4 por prateleira, nas paredes do vão)
  for (const pc of pecas.filter(pc => pc.papel === 'prateleira')) {
    const [x0,x1,y0,,z0,z1] = pc.box;
    for (const [x, dx] of [[x0 - 1, 1], [x1 + 1, -1]]) for (const z of [z0 + 40, z1 - 40]) add('pino-5', [x - dx*8, y0 - 3, z], [dx,0,0], 18, 5, pc.id);
  }
  return F;
}

