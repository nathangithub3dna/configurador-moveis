// Validações próprias dos formulários e seus textos públicos.
function mensagensGabinete(p, r, E, A, v) {
  const n = k => Number(p[k]), {nG,nS,nP,alts,temSup,Lc} = v;
  const t=n('espMDF'), H=n('altura'), L=n('largura'), P=n('profundidade');
  alts.forEach((h,i) => { const hb = Math.floor((h-R.folgaAltGaveta)/10)*10; if (Lc && hb<60 && h>=100) E.push(`Gaveta ${i+1}: a caixa ficaria com ${hb} mm de altura (mínimo 60). Aumente a altura dela.`); });
  for (const q of r.pecas.filter(q => q.papel === 'porta')) {
    const nomeL = nP === 2 ? (q.mov.lado === 'esq' ? ' esquerda' : ' direita') : '', dw=q.des.w;
    if (dw>R.portaMaxLarg) E.push(`Porta${nomeL} com ${fmt(dw)} mm de largura (máximo ${R.portaMaxLarg}). Use 2 portas.`);
    const parede = q.mov.lado === 'esq' ? p.paredeEsq : p.paredeDir, eW = parede && p.enchimento ? R.enchimento : 0;
    const pux = r.pecas.find(x => x.expPai === q.id && x.papel === 'puxador');
    const lim = limiteAbertura({temParede:!!parede,eW,u0:R.borda,u1:R.borda+dw,uPx:Math.abs((pux.box[0]+pux.box[1])/2-q.mov.pivX),proj:n('puxadorProj'),t,P});
    if (parede && lim.ang<90) A.push(`Porta${nomeL} abre só até ${fmt(lim.ang)}°: ${lim.motivo}.${eW ? ' Aumente o enchimento ou use puxador mais baixo.' : ' Ligue o enchimento de 25 mm.'}`);
  }
  if (nS && !temSup) A.push('Não sobra espaço acima das gavetas: as prateleiras foram ignoradas.');
  if (nS && temSup) {
    const piso = nG ? n('pes')+alts.reduce((s,h)=>s+h,0) : n('pes')+t;
    const vao = (H-t-piso-nS*t)/(nS+1);
    if (vao<100) E.push(`Com ${nS} prateleira${nS>1?'s':''} o vão fica com ${fmt(vao)} mm (mínimo 100). Diminua as prateleiras ou as gavetas.`);
    const fx=[n('esgoto')-R.faixaEsgoto,n('esgoto')+R.faixaEsgoto];
    for (const q of r.pecas.filter(q=>q.papel==='prateleira')) if (q.box[3]>fx[0] && q.box[2]<fx[1]) {
      const rl=n('recorteLarg'),rp=n('recorteProf');
      if (!q.forma) E.push(`Recorte do sifão (${fmt(rl)} × ${fmt(rp)}) não cabe na prateleira de ${fmt(q.des.w)} × ${fmt(q.des.h)}.`);
      A.push(`Prateleira${nS>1?' '+q.id.split('-')[1]:''} cruza a faixa do esgoto (${fmt(fx[0])} a ${fmt(fx[1])} mm do chão) e recebeu recorte.`);
    }
  }
  if (r.pecas.some(q=>q.id==='tampo')) {
    const tl=n('tampoLarg'),tp=n('tampoProf');
    if(tl<L) A.push(`O tampo (${fmt(tl)} mm) é mais estreito que o móvel (${fmt(L)} mm).`);
    if(tl>L+60) A.push(`O tampo sobra ${fmt(tl-L)} mm além do móvel.`);
    if(tp<P) A.push(`As frentes ficam ${fmt(P-tp)} mm para fora do tampo.`);
  }
}

function mensagensArmario(p, r, E, A) {
  const n=k=>Number(p[k]), vaos=vaosFormulario(p), t=n('espMDF'), tf=n('espFundo');
  const H=n('altura')-n('alturaBeiral'), yI0=n('rodape')+t,yI1=H-t,Dc=n('profundidade')-t-tf;
  const w=(n('largura')-2*t-(vaos.length-1)*t)/vaos.length;
  const bot=vaos.indexOf('gavetas+botijao');
  if(bot>=0) {
    if(bot!==vaos.length-1) A.push('O botijão não está no último vão: a ventilação na lateral direita não alcança o compartimento. Coloque "gavetas+botijao" por último.');
    else if(p.paredeDir) E.push('O botijão precisa de ventilação pela lateral direita, mas ela está marcada como encostada na parede.');
  }
  A.push(...r.avisos.filter(a=>a.startsWith('Porta ')).map(a=>a+' Use enchimento.'));
  vaos.forEach((v,i)=>{
    const V=i+1;
    if(v==='prateleiras') {
      const ns=Math.max(0,Math.round(n('prateleiras'))),esp=(yI1-yI0-ns*t)/(ns+1);
      if(ns && esp<150) E.push(`Vão ${V}: com ${ns} prateleiras o espaço fica ${fmt(esp)} mm (mínimo 150).`);
    }
    if(v==='vassoura+sapateira') {
      const sap=sapateiraEmbaixo(yI0,yI1,t,n('alturaNivelSapateira')||220,n('niveisSapateira')||0);
      if(sap.n<1) E.push(`Vão ${V}: não cabe sapateira embaixo das vassouras (o vão tem ${fmt(yI1-yI0)} mm; as vassouras precisam de ${fmt(sap.livreVassoura)}).`);
      else A.push(...avisoSapateira(V,sap));
    }
    if(v==='vassoura') { const yb=n('alturaPratVassoura')-t; if(yb<yI0+1200 || yb+t>yI1-100) E.push(`Vão ${V}: a prateleira das vassouras deve ficar entre ${fmt(yI0+1200+t)} e ${fmt(yI1-100)} mm.`); }
    if(!v.startsWith('gavetas')) return;
    let yAc=yI0;
    if(v==='gavetas+botijao') {
      const hb=n('alturaBotijao');
      if(hb<520) E.push(`Vão ${V}: altura livre do botijão de ${fmt(hb)} mm é pouca (mínimo 520 para P13 + regulador).`);
      if(w<390) E.push(`Vão ${V}: largura de ${fmt(w)} mm não passa o botijão P13 (Ø360 + folga).`);
      if(Dc<370) E.push(`Profundidade interna de ${fmt(Dc)} mm não comporta o botijão P13 (Ø360).`);
      yAc+=hb+t;
    }
    const ng=Math.max(0,Math.round(n('gavetas'))),gh=n('alturaGaveta');
    if(!ng) return;
    const Lc=[...R.corredicas].reverse().find(c=>c<=Dc-45-t-10),px=PUXADORES[n('puxadorGaveta')];
    if(!Lc) E.push(`Vão ${V}: não cabe corrediça para gaveta interna (fundo útil ${fmt(Dc-45-t-10)} mm).`);
    if(px.proj>37) E.push(`O puxador das gavetas (${px.rot}) sai ${px.proj} mm e bate na porta: as gavetas ficam 45 mm atrás dela. Use um que saia até 37 mm: ${Object.values(PUXADORES).filter(x=>x.proj<=37).map(x=>x.rot.split(' · ')[0]).join(', ')}.`);
    if(px.comp>w-t-40) E.push('O puxador das gavetas é maior que a frente da gaveta.');
    if(yAc+ng*gh>yI1-50) E.push(`Vão ${V}: as ${ng} gavetas de ${fmt(gh)} mm não cabem (sobra ${fmt(yI1-yAc)} mm).`);
    if(Lc && Math.floor((gh-40)/10)*10<60) for(const q of r.pecas.filter(q=>q.papel==='frente-gaveta' && q.box[0]>=t+i*(w+t) && q.box[1]<=t+i*(w+t)+w)) E.push(`Gaveta ${q.id.split('-')[1]}: caixa com ${Math.floor((gh-40)/10)*10} mm (mínimo 60). Aumente a altura das gavetas.`);
  });
}
