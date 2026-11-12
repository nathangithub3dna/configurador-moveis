// COMPRAS DO FORMULÁRIO — preserva itens, reservas e ordem da lista do Armário. Não gera peças.
function comprasArmarioFormulario(p, pecas, E, A) {
  const n = k => Number(p[k]);
  const L=n('largura'), H0=n('altura'), H=H0-n('alturaBeiral'), P=n('profundidade'), t=n('espMDF'), RD=n('rodape');
  const nV=vaosFormulario(p).length, nd=dobradicasPorAltura(H-RD-2*R.borda);
  const nGavTotal=pecas.filter(q=>q.papel==='frente-gaveta').length, nSup=pecas.filter(q=>/^vao-\d+-suporte-/.test(q.id)).length, nGancho=pecas.filter(q=>/^vao-\d+-gancho$/.test(q.id)).length;
  const Lc=[...R.corredicas].reverse().find(c=>c<=P-t-n('espFundo')-45-t-10);
  // FERRAGENS
  const conta = c => pecas.filter(c).length;
  const nDob = conta(pc => pc.papel === 'dobradica');
  const nPux = conta(pc => pc.papel === 'puxador');
  const nPrat = conta(pc => pc.papel === 'prateleira');
  const juntas = 2 /*topo*/ + 2 /*base*/ + (RD > 0 ? 4 : 0) + 2*(nV-1) + 2*nV /*travessas*/ + 2*conta(pc => pc.papel === 'prateleira-fixa') + 2*conta(pc => pc.papel === 'reforco');
  const fundos = pecas.filter(pc => pc.papel === 'fundo' || pc.papel === 'fundo-gaveta');
  const perim = pc => 2*(pc.comp + pc.larg);
  const fitaMm = pecas.filter(pc => pc.lista).reduce((s,pc) => s + pc.fita[0]*pc.comp + pc.fita[1]*pc.larg, 0);
  const fitaLarg = t <= 19 ? 22 : 35;
  const red10 = v => Math.ceil(v*1.2/10)*10;
  const ferragens = [];
  const F = (ref, qtd, obs='', var_='') => {
    if (!(qtd > 0)) return; const b = BIBLIOTECA[ref], nome = b.nome + (var_ ? ' ' + var_ : '');
    ferragens.push({ ref, item: nome + (b.marca ? ` — ${b.marca}${b.codigo ? ' ' + b.codigo : ''}` : ''), nome, marca:b.marca, codigo:b.codigo, qtd, unid: b.metro ? 'm' : (b.unid==='par' ? 'par' : 'un'), obs: b.metro ? 'metros, com 10% de perda' : obs, var:var_ });
  };
  F('dob-blum-71B3550', nDob, `${nd} por porta. Caneco Ø35 × 13, centro a 22 mm da borda.`);
  F('calco-blum-0', nDob, 'Linha a 37 mm da frente da lateral/divisória.');
  if (nGavTotal) F('corr-tel45-amort', nGavTotal, 'Gaveta interna: 26 mm mais estreita que o espaço entre espaçador e lateral.', `${Lc} mm`);
  const porRef = {}; pecas.filter(pc => pc.papel === 'puxador').forEach(pc => porRef[pc.ref] = (porRef[pc.ref]||0) + 1);
  for (const [ref, q] of Object.entries(porRef)) { const px = Object.values(PUXADORES).find(x => x.ref === ref); F(ref, q, `Furação ${px.furacao} mm, parafuso M4 (vem com o puxador).` + (px.conf ? ` [Suposição] ${px.conf} estimadas: confirmar na loja.` : '')); }
  F('pino-5', nPrat*4);
  F('suporte-vassoura', nSup); F('gancho-aspirador', nGancho);
  const fx = calcularFixacoes(pecas), nF = tipo => fx.filter(f => f.tipo === tipo).length;
  F('paraf-40x50', red10(nF('paraf-40x50')), `${nF('paraf-40x50')} nas juntas (ver "Fixações" no 3D) + reserva.`);
  F('paraf-40x30', red10(nF('paraf-40x30')));
  F('paraf-35x14', red10(nF('paraf-35x14') + nDob*4 + nGavTotal*12 + nSup*2 + nGancho*2), 'Fundos, dobradiças, corrediças e suportes.');
  F('paraf-35x25', nF('paraf-35x25'));
  F('cavilha-8x30', Math.ceil(nF('cavilha-8x30')*1.2), 'Com cola PVA.');
  F('paraf-50x60-bucha', nF('paraf-50x60-bucha'), 'Nas travessas de fixação, 2 por vão.');
  F(fitaLarg === 22 ? 'fita-pvc-22' : 'fita-pvc-35', Math.ceil(fitaMm*R.perdaFita/1000));
  if (H > 1800) A.push('Móvel alto: fixe na parede antes de colocar peso (risco de tombar).');
  return { pecas, erros:E, avisos:A, ferragens, fixacoes:fx, dims:{ L, H:H0, P, t, top:H0, faixaEsgoto:null, paredeEsq:!!p.paredeEsq, paredeDir:!!p.paredeDir, alturaTampo:H0 } };
}
