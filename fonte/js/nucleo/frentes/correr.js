// FRENTE: correr — portas de correr (sistema da biblioteca; a função mora no gerador por enquanto)
registrarFrente({ id:'correr', fachada:true, gerar(ctx, g, fr, V) { ctx.portasCorrer(g, fr, V); } });

// PORTA DE CORRER — sistema da biblioteca: desconto de altura, transpasse, peso máximo, desempenador
function fazerPortasCorrer(ctx, g, fr, V) {
  const { E, A, entre, t, P, zFr, add, ferr, cont, porta, m } = ctx;
  const sisRef = fr.sistema || 'correr-rometal-ro27', sis = BIBLIOTECA[sisRef];
  if (!sis) { E.push(`Vão ${V}: sistema de correr "${sisRef}" não está na biblioteca.`); return; }
  const d = sis.dados, emb = (fr.montagem || 'embutido') === 'embutido', tp = t;
  if (tp < d.espMin || tp > d.espMax) E.push(`Vão ${V}: o sistema ${sis.nome} aceita porta de ${d.espMin} a ${d.espMax} mm (a porta tem ${fmt(tp)}).`);
  // embutido: dentro do vão (entre laterais, base e topo); sobreposto: cobre a frente do vão
  const X0 = emb ? g.ix0 : g.fx0, X1 = emb ? g.ix1 : g.fx1, Y0 = emb ? g.iy0 : g.fy0, Y1 = emb ? g.iy1 : g.fy1;
  const n = fr.n && fr.n !== 'auto' ? fr.n : Math.max(2, Math.ceil((X1 - X0) / 1000)), tr = d.transpasse;
  const w = (X1 - X0 + (n - 1)*tr) / n, h = (Y1 - Y0) - d.descAltura[emb ? 'embutido' : 'sobreposto'];
  const z1 = emb ? zFr : P, gapTr = 5;                               // 2 trilhos: frente e trás [Suposição: 5 mm entre as folhas — conferir no sistema]
  if (d.largMin && w < d.largMin) E.push(`Vão ${V}: porta de correr com ${fmt(w)} mm de largura (mínimo ${d.largMin} no ${sis.nome}).`);
  if (d.proporcaoMax && h > d.proporcaoMax * w) E.push(`Vão ${V}: porta de correr ${fmt(h)} × ${fmt(w)} passa da proporção máxima ${d.proporcaoMax}:1.`);
  if (!emb) A.push(`Vão ${V}: portas de correr sobrepostas — a folha de trás fica no plano das frentes e a da frente ${fmt(tp + gapTr)} mm à frente do móvel.`);
  for (let i = 0; i < n; i++) {
    const k = ++cont.porta, id = `porta-correr-${k}`, xa0 = X0 + i*(w - tr), frenteTr = i % 2 === 1;
    const zz1 = frenteTr ? z1 + (emb ? 0 : tp + gapTr) : z1 - (emb ? tp + gapTr : 0), zz0 = zz1 - tp;
    const peso = pesoPeca({ comp:h, larg:w, esp:tp, mat:'mdf' });
    if (peso > d.pesoMax) E.push(`Porta de correr ${k}: ${fmt(peso)} kg passa do máximo de ${d.pesoMax} kg do ${sis.nome}.`);
    // perfil G: a folha fica mais curta e o perfil ocupa a sobra — por padrão em pé, na borda de fora da folha (onde ficaria a concha)
    const pxC = m.puxadorPorta, perfilC = pxC?.modelo === 'perfil', redC = perfilC ? pxC.reducao : 0;
    const bordaC = !perfilC ? null : fr.perfil === 'cima' || fr.perfil === 'baixo' ? fr.perfil : (i === 0 ? 'esq' : 'dir');
    let fx0 = xa0, fx1 = xa0 + w, fy0 = Y0 + (emb ? d.descAltura.embutido/2 : 0), fy1 = fy0 + h;
    if (bordaC === 'cima') fy1 -= redC; else if (bordaC === 'baixo') fy0 += redC; else if (bordaC === 'esq') fx0 += redC; else if (bordaC === 'dir') fx1 -= redC;
    // abrir: libera o lado esquerdo (padrão) — as folhas de trás (pares) correm para a direita, para trás da vizinha;
    // libera o direito (fr.abrir 'dir') — as folhas da frente (ímpares) correm para a esquerda, na frente da vizinha
    const dirC = fr.abrir === 'dir', movC = { tipo:'correr', eixo:'x', curso: w - tr,
      sentido: dirC ? (frenteTr ? -1 : 0) : (frenteTr ? 0 : (i === n - 1 ? -1 : 1)) };
    add({ id, nome:`Porta de correr ${k}`, nomeLista:'Porta de correr', cat:'frente', a:fy1 - fy0, b:fx1 - fx0, fita:[2,2], box:[fx0, fx1, fy0, fy1, zz0, zz1],
      mov:movC, obs:`${sis.nome}. Peso ${fmt(peso)} kg. Trilho da ${frenteTr ? 'frente' : 'trás'}.`,
      des:{ w:fx1 - fx0, h:fy1 - fy0, fita:['t','b','l','r'], vista:'Vista pela face interna' } });
    if (perfilC) { const deLado = bordaC === 'esq' || bordaC === 'dir', compP = deLado ? fy1 - fy0 : fx1 - fx0;
      const boxP = { cima:[fx0,fx1,fy1,fy1+redC,zz0,zz1], baixo:[fx0,fx1,fy0-redC,fy0,zz0,zz1], esq:[fx0-redC,fx0,fy0,fy1,zz0,zz1], dir:[fx1,fx1+redC,fy0,fy1,zz0,zz1] }[bordaC];
      ferr({ id:`${id}-puxador`, nome:`Perfil puxador da porta de correr ${k}`, forma:{ tipo:'puxador', dir: deLado ? 'v' : 'h', modelo:'perfil', saida:bordaC, embaixo: bordaC === 'baixo' }, cor:pxC.cor, ref:pxC.ref, comp:compP, larg:redC,
        box:boxP, mov:movC, expPai:id, obs:`${pxC.rot}: cortar com ${fmt(compP)} mm.` });
    } else { const pc = Object.values(PUXADORES).find(x => x.modelo === 'concha'), ypc = Y0 + h/2, xpc = i === 0 ? xa0 + 50 : xa0 + w - 50;
      if (pc) ferr({ id:`${id}-puxador`, nome:`Puxador concha da porta de correr ${k}`, forma:{ tipo:'puxador', dir:'v', modelo:pc.modelo, furacao:pc.furacao }, cor:pc.cor, ref:pc.ref, box:[xpc-pc.larg/2, xpc+pc.larg/2, ypc-pc.comp/2, ypc+pc.comp/2, zz1, zz1 + Math.min(pc.proj, 5)], mov:movC, expPai:id, obs:'Concha: na porta de correr o puxador não pode sair da face (bate na outra folha).' }); }
    ferr({ id:`${id}-kit-correr`, nome:`Kit do sistema de correr da porta ${k}`, ref:sisRef, box:[xa0 + 40, xa0 + w - 40, Y0, Y0 + 20, zz0, zz1], expPai:id, obs:d.kitPorPorta || '' });
    const nDes = d.desempenadorObrigatorio || h > 2*w ? 2 : 0;
    for (let j = 0; j < nDes; j++) ferr({ id:`${id}-desempenador-${j+1}`, nome:`Desempenador ${j+1} da porta ${k}`, ref:'desempenador-dp100', box:[xa0 + w*(j ? 0.75 : 0.25) - 10, xa0 + w*(j ? 0.75 : 0.25) + 10, Y0 + 100, Y0 + h - 100, zz0 - 8, zz0], mov:movC, expPai:id });
  }
  ['superior','inferior'].forEach(q => ferr({ id:`trilho-${q}-${V}`, nome:`Trilho ${q} do vão ${V}`, ref:sisRef, box:[X0, X1, q === 'superior' ? Y1 - 10 : Y0, q === 'superior' ? Y1 : Y0 + 10, z1 - 2*tp - gapTr - (emb ? 0 : -tp - gapTr), z1 + (emb ? 0 : tp + gapTr)] }));
}

registrarEscolha({ grupo:'frente', id:'correr', rotulo:'Correr', ordem:40, icone:'<rect x="4" y="3" width="15" height="34"/><rect x="15" y="5" width="15" height="32"/><path d="M8 20h6m-2-2 2 2-2 2"/>',
  aplicar(no) { no.frente = { tipo:'correr', sistema: 'correr-rometal-dominus', n: 'auto' }; } });
