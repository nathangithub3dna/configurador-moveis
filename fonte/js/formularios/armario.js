function vaosFormulario(p) {
  return String(p.vaos).split(',').map(x => x.trim().toLowerCase().replace(/\s+/g,'')).filter(Boolean).map(x => x === 'botijao+gavetas' ? 'gavetas+botijao' : x);
}
function armarioPeloNucleo(p) {
  const E = [], A = [], pecas = [];
  const n = k => Number(p[k]);
  const L=n('largura'), H0=n('altura'), P=n('profundidade'), t=n('espMDF'), tf=n('espFundo'), RD=n('rodape'), rec=n('recuoRodape'), HB=n('alturaBeiral');
  const faixa = (v,a,b,nome) => { if (!(v>=a && v<=b)) E.push(`${nome}: use de ${a} a ${b} mm (está ${isNaN(v)?'vazio':fmt(v)}).`); };
  faixa(L,400,3000,'Largura'); faixa(H0,600,2700,'Altura'); faixa(HB,0,200,'Altura do beiral'); faixa(P,250,700,'Profundidade'); faixa(RD,0,200,'Rodapé'); faixa(rec,0,100,'Recuo do rodapé');
  faixa(t,12,25,'Espessura do MDF'); faixa(tf,3,15,'Espessura do fundo');
  const PxP = PUXADORES[n('puxadorPorta')], PxG = PUXADORES[n('puxadorGaveta')];
  if (!PxP || !PxG) E.push('Escolha os puxadores.');
  const vaos = vaosFormulario(p);
  const validos = ['prateleiras','vassoura','vassoura+sapateira','gavetas','gavetas+botijao','vazio'];
  if (!vaos.length || vaos.length > 8) E.push('Informe de 1 a 8 vãos no conteúdo.');
  vaos.forEach((v,i) => { if (!validos.includes(v)) E.push(`Vão ${i+1}: "${v}" não é reconhecido. Use: ${validos.join(', ')}.`); });
  if (E.length) return { pecas, erros:E, avisos:A, ferragens:[], dims:null };

  const nV = vaos.length;
  const Wi = L - 2*t, w = (Wi - (nV-1)*t) / nV;
  if (w < 250) E.push(`Cada vão fica com ${fmt(w)} mm (mínimo 250). Diminua o número de vãos ou aumente a largura.`);
  if (w + t > R.portaMaxLarg) E.push(`Portas de ${fmt(w+t)} mm passam do máximo (${R.portaMaxLarg}). Aumente o número de vãos.`);

  const m = moduloDeArmario(p);
  // O formulário reserva ventilação para o primeiro compartimento de botijão,
  // e somente quando ele é o último vão (mesma regra dos projetos existentes).
  if (vaos.indexOf('gavetas+botijao') !== vaos.length-1) {
    const folhas = m.raiz.tipo === 'dividir' ? m.raiz.partes.map(p=>p.no) : [m.raiz];
    folhas.forEach(no => no.conteudo.filter(c=>c.tipo==='botijao').forEach(c=>c.ventilar=false));
  }
  const r = gerarModuloV3(m, { dobradicas:dobradicasPorAltura, fundoInteiro:true, perfilDeBorda:false, finalizar:false });
  apresentarFormulario('armario', p, r);
  mensagensArmario(p, r, E, A);
  return comprasArmarioFormulario(p,r.pecas,E,A);
}
