// COMPRAS DO FORMULÁRIO — preserva as quantidades e descrições já usadas no Gabinete. Não gera peças.
function comprasGabineteFormulario(p, pecas, E, A) {
  const n = k => Number(p[k]);
  const L=n('largura'), H=n('altura'), P=n('profundidade'), t=n('espMDF'), pes=n('pes'), top=H, te=n('tampoEsp');
  const eE=p.paredeEsq && p.enchimento ? R.enchimento : 0, eD=p.paredeDir && p.enchimento ? R.enchimento : 0;
  const Lc=[...R.corredicas].reverse().find(c=>c<=P-t-n('espFundo')-10);
  // FERRAGENS
  const conta = c => pecas.filter(c).length;
  const nDob = conta(pc => pc.papel === 'dobradica');
  const nPux = conta(pc => pc.papel === 'puxador');
  const nGv = pecas.filter(pc => pc.papel === 'frente-interna-gaveta').length;
  const nPrat = conta(pc => pc.papel === 'prateleira');
  const temDiv = conta(pc => pc.id==='divisoria');
  const nEnch = (eE?1:0) + (eD?1:0);
  const red10 = v => Math.ceil(v*1.2/10)*10;
  const perim = pc => 2*(pc.comp+pc.larg);
  const fundos = pecas.filter(pc => pc.papel === 'fundo' || pc.papel === 'fundo-gaveta');
  const fitaMm = pecas.filter(pc=>pc.lista).reduce((s,pc)=>s + pc.fita[0]*pc.comp + pc.fita[1]*pc.larg, 0);
  const fitaLarg = t <= 19 ? 22 : 35;
  const ferragens = [];
  const F = (ref, qtd, obs='', var_='') => {
    if (!(qtd > 0)) return;
    const b = BIBLIOTECA[ref];
    const nome = b.nome + (var_ ? ' ' + var_ : '');
    ferragens.push({ ref, item: nome + (b.marca ? ` — ${b.marca}${b.codigo ? ' ' + b.codigo : ''}` : ''), nome, marca:b.marca, codigo:b.codigo, qtd, unid: b.metro ? 'm' : (b.unid==='par' ? 'par' : 'un'), obs: b.metro ? 'metros, com 10% de perda' : obs, var:var_ });
  };
  F('dob-blum-71B3550', nDob, 'Caneco Ø35 × 13, centro a 22 mm da borda.');
  F('calco-blum-0', nDob, 'Na lateral, linha a 37 mm da frente.');
  if (nGv) F('corr-tel45-amort', nGv, 'Gaveta 26 mm mais estreita que o vão.', `${Lc} mm`);
  F('pux-barra-128', nPux);
  F('pino-5', nPrat*4);
  F('paraf-40x50', red10(((2 + (temDiv?2:0) + 6) * 3) + nGv*12 + nEnch*6));
  F('paraf-35x14', red10(nDob*4 + nGv*12 + fundos.reduce((s,pc)=>s+Math.ceil(perim(pc)/150),0)));
  F('paraf-35x25', nGv*4);
  F('paraf-50x60-bucha', 3, 'Na travessa de fixação.');
  if (pes > 0) F('sapata', L > 1000 ? 6 : 4, `Altura ${fmt(pes)} mm.`);
  F(fitaLarg === 22 ? 'fita-pvc-22' : 'fita-pvc-35', Math.ceil(fitaMm*R.perdaFita/1000));
  if (pecas.some(pc=>pc.cat==='tampo')) F('silicone', 1, 'Colar o tampo e vedar.');

  return { pecas, erros:E, avisos:A, ferragens, dims:{ L, H, P, t, top, faixaEsgoto:[n('esgoto')-R.faixaEsgoto, n('esgoto')+R.faixaEsgoto], paredeEsq:!!p.paredeEsq, paredeDir:!!p.paredeDir, alturaTampo:top+(te>0?te:0) } };
}
