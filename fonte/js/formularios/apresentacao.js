// Contrato das listas dos formulários. A geometria vem exclusivamente do núcleo.
// Nomes, instruções de montagem e ordem são preservados para desenhos e exportações.
function apresentarFormulario(tipo, p, r) {
  const gab = tipo === 'gabinete', ps = r.pecas, n = k => Number(p[k]);
  const vaos = gab ? [] : vaosFormulario(p);
  const portas = ps.filter(q => q.papel === 'porta');
  const ids = {};
  if (gab) for (const q of portas) ids[q.id] = 'porta-' + q.mov.lado;
  for (const q of ps) {
    if (gab) {
      for (const [a,b] of Object.entries(ids)) {
        if (q.id === a || q.id.startsWith(a+'-')) q.id = b + q.id.slice(a.length);
        if (q.expPai === a) q.expPai = b;
      }
      if (q.papel === 'prateleira') q.id = q.id.replace(/^prateleira-\d+-/, 'prateleira-');
    }
    const id = q.id, y = q.box[3], k = +(id.match(/-(\d+)/)?.[1] || 0);
    if (q.papel === 'lateral') q.obs = gab ? 'Altura total da caixa.' : 'Altura total, até o chão (rodapé recuado).';
    if (!gab && id === 'lateral-dir') {
      q.forma ||= null; q.des.rasgos ||= [];
      if (q.des.rasgos.length) q.obs = `Ventilação do botijão: ${q.des.rasgos.length} rasgos 15 × 150 passantes, embaixo e em cima do compartimento (usinar na CNC ou com tupia e gabarito). Este lado não pode encostar em parede.`;
    }
    const obs = {
      base:gab ? 'Entre as laterais.' : `Apoiada no rodapé, a ${fmt(n('rodape'))} mm do chão.`,
      topo:'Entre as laterais.',
      'travessa-frontal':'Apoia o tampo. Confira a folga da cuba.',
      'travessa-traseira':'Apoia o tampo.',
      fundo:gab ? 'Pregado atrás. Recortar para os canos na obra.' : 'Parafusado atrás em todo o contorno e nas divisórias.',
      'rodape-frontal':`Recuado ${fmt(n('recuoRodape'))} mm da frente da caixa.`,
      'rodape-traseiro':'Apoio da base atrás.',
      'beiral-frontal':'Em cima do topo, alinhado com a frente da caixa. Parafusado por baixo do topo; cavilhas nas laterais.',
      'beiral-esq':'Sobre a lateral: 2 cavilhas Ø8 × 30 com cola no topo da lateral e 2 no beiral frontal.',
      'beiral-dir':'Sobre a lateral: 2 cavilhas Ø8 × 30 com cola no topo da lateral e 2 no beiral frontal.',
      tampo:'Não entra na lista de corte. Colar com silicone neutro.'
    };
    if (obs[id]) q.obs = obs[id];
    if (q.papel === 'travessa-fixacao') q.obs = gab ? 'Vertical, atrás. Recebe os parafusos da parede.' : 'Atrás, sob o topo. 2 parafusos na parede.';
    if (id === 'divisoria') { q.nome = 'Divisória (piso das portas)'; q.obs = `Topo a ${fmt(y)} mm do chão. Separa gavetas e portas.`; }
    if (id.startsWith('divisoria-v-')) q.obs = 'Entre base e topo. Recebe dobradiças dos dois lados.';
    if (q.papel === 'porta') {
      const pos = q.des.furos.filter(f => f.tipo === 'caneco').map(f => f.y);
      if (gab) { q.nome = 'Porta' + (n('portas') === 2 ? (q.mov.lado === 'esq' ? ' esquerda' : ' direita') : ''); q.obs = `${pos.length} dobradiças. Caneco Ø35 com centro a 22 mm da borda, a ${pos.map(fmt).join(' / ')} mm da base da porta. Abre até ${fmt(q.mov.angMax)}°.`; }
      else q.obs = `${pos.length} dobradiças do lado ${q.mov.lado === 'esq' ? 'esquerdo' : 'direito'}. Caneco Ø35 × 13 com centro a 22 mm da borda, a ${pos.map(fmt).join(' / ')} mm da base da porta.`;
    }
    if (q.papel === 'dobradica') {
      delete q.ref;
      q.obs = 'Blum CLIP top BLUMOTION 110°, reta (71B3550).' + (gab ? ' Caneco Ø35 × 13.' : '');
      if (gab) q.nome = `Dobradiça ${id.match(/dobradica-(\d+)/)[1]} da ${ps.find(x => x.id === q.expPai).nome.toLowerCase()}`;
    }
    if (q.papel === 'puxador') {
      if (gab) { q.forma = { tipo:'puxador', dir:q.forma.dir }; delete q.cor; delete q.ref; q.obs = 'Barra, furação 128 mm.'; q.nome = 'Puxador da ' + ps.find(x => x.id === q.expPai).nome.toLowerCase().replace('frente da ', ''); }
      else { const px = PUXADORES[n(id.startsWith('porta-') ? 'puxadorPorta' : 'puxadorGaveta')]; q.obs = id.startsWith('porta-') ? `${px.rot}, furação ${px.furacao} mm.` : `${px.rot}. Fica ${fmt(45-px.proj)} mm atrás da porta.`; }
    }
    if (id.startsWith('gaveta-')) {
      if (gab && Math.round(n('gavetas')) === 1) q.nome = q.nome.replace(/ 1$/, '');
      if (q.papel === 'frente-gaveta') q.obs = gab ? 'Presa à caixa da gaveta por dentro (parafuso 3,5 × 25).' : 'Gaveta interna, atrás da porta (frente recuada 45 mm).';
      if (gab && q.papel === 'frente-interna-gaveta') q.obs = 'Entre as laterais da gaveta.' + (q.des.furos.length ? ' Furar o puxador junto com a frente (parafuso M4 longo).' : '');
      if (gab && id.endsWith('-traseira')) q.obs = 'Entre as laterais da gaveta.';
      if (gab && q.papel === 'fundo-gaveta') q.obs = 'Pregado por baixo.';
      if (q.papel === 'corredica') { q.ref = 'corr-tel45-amort'; q.obs = gab ? 'Telescópica 45 mm com amortecedor, extração total.' : 'Telescópica 45 mm com amortecedor.'; q.nome = `Corrediça ${q.box[5]-q.box[4]} mm ${q.lado === 'esq' ? 'esquerda' : 'direita'}` + (gab ? (Math.round(n('gavetas')) > 1 ? ' '+k : '') : ' da gaveta '+k); }
    }
    if (q.papel === 'prateleira') {
      q.obs = `Topo a ${fmt(y)} mm do chão. Apoiada em 4 pinos.`;
      if (gab) {
        q.nome = Math.round(n('prateleiras')) > 1 ? `Prateleira ${k}` : 'Prateleira';
        if (q.forma) q.obs = `Recorte traseiro ${fmt(q.forma.rl)} × ${fmt(q.forma.rp)} mm no centro, para o sifão. ` + q.obs;
      } else {
        delete q.forma; delete q.des.recortes;
        const num = +id.split('-')[2], v = vaos[k-1];
        q.nome = Math.round(n('prateleiras')) > 1 ? `Prateleira ${num} do vão ${k}` : `Prateleira do vão ${k}`;
        if (v === 'vassoura') { q.nome = `Prateleira do vão ${k} (vassouras)`; q.obs = `Topo a ${fmt(y)} mm. Embaixo fica livre para vassoura, rodo e aspirador.`; }
        if (v === 'vassoura+sapateira') q.nome = `Prateleira ${num} da sapateira (vão ${k})` + (ps.some(x => x.id === `prateleira-${k}-${num+1}`) ? '' : ' — piso das vassouras');
        if (v?.startsWith('gavetas')) q.nome = `Prateleira ${num} acima das gavetas (vão ${k})`;
      }
    }
    if (id.startsWith('enchimento-')) q.obs = `Fecha a folga de ${q.box[1]-q.box[0]} mm entre a caixa e a parede.`;
    if (id.startsWith('sarrafo-')) { q.nome = `Sarrafo do enchimento ${q.lado === 'esq' ? 'esquerdo' : 'direito'}`; q.obs = 'Parafusado na lateral; segura o enchimento.'; }
    if (/^vao-\d+-suporte-/.test(id)) q.obs = 'Garra de pressão, parafusada na régua de reforço.';
    if (/^vao-\d+-gancho$/.test(id)) q.obs = 'Gancho duplo para aspirador e mangueira.';
    if (id.startsWith('reforco-vassoura-')) { const b = id.endsWith('b'); q.nome = `Régua de reforço ${b ? 'dos suportes' : 'do gancho'} (vão ${k})`; q.obs = b ? 'Os suportes de vassoura são parafusados nesta régua.' : 'Atrás do fundo não dá para parafusar (6 mm): o gancho é parafusado nesta régua.'; }
    if (id.startsWith('botijao-')) q.obs = 'Só para conferir o espaço. Não é fabricado.';
    if (id.startsWith('espacador-')) { q.nome = `Espaçador das corrediças (vão ${k})`; q.obs = 'Afasta as corrediças das dobradiças. Parafusado na lateral/divisória.'; }
    if (id.startsWith('prateleira-fixa-')) {
      const g = id.startsWith('prateleira-fixa-g'), v = id.match(/(\d+)$/)[1];
      q.nome = g ? `Tampo das gavetas (vão ${v})` : `Tampo do compartimento do botijão (vão ${v})`;
      q.obs = g ? `Fixa (parafusada), logo acima da última gaveta; topo a ${fmt(y)} mm do chão.` : `Fixa (parafusada), topo a ${fmt(y)} mm do chão.`;
    }
  }
  const iniciais = gab ? ['lateral-esq','lateral-dir','base','travessa-frontal','travessa-traseira','travessa-fixacao','fundo','divisoria'] : ['lateral-esq','lateral-dir','topo','base','rodape-frontal','rodape-traseiro','beiral-frontal','beiral-esq','beiral-dir','fundo'];
  const ordem = q => {
    const i = iniciais.indexOf(q.id); if (i >= 0) return i;
    if (gab) return q.id.startsWith('gaveta-') ? 20 : q.id.startsWith('porta-') ? 30 : q.papel === 'prateleira' ? 40 : q.id === 'tampo' ? 60 : 50;
    if (q.id.startsWith('divisoria-v-')) return 20;
    if (q.papel === 'travessa-fixacao') return 30;
    if (q.id.startsWith('porta-')) return 40;
    return 50 + q.vaoFormulario;
  };
  ps.sort((a,b) => ordem(a)-ordem(b));
  ps.forEach(q => delete q.vaoFormulario);
  return ps;
}
