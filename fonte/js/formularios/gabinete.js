// Formulário → módulo → peças do núcleo → listas e mensagens do formulário.
function gabinetePeloNucleo(p) {
  const E = [], A = [], pecas = [];
  const n = k => Number(p[k]);
  const L=n('largura'), H=n('altura'), P=n('profundidade'), t=n('espMDF'), tf=n('espFundo'), pes=n('pes');
  const faixa = (v,a,b,nome) => { if (!(v>=a && v<=b)) E.push(`${nome}: use de ${a} a ${b} mm (está ${isNaN(v)?'vazio':fmt(v)}).`); };
  faixa(L,300,2400,'Largura'); faixa(H,300,2200,'Altura'); faixa(P,250,800,'Profundidade');
  faixa(t,12,25,'Espessura do MDF'); faixa(tf,3,15,'Espessura do fundo'); faixa(pes,0,200,'Altura dos pés');
  faixa(n('tampoLarg'),0,3000,'Largura do tampo'); faixa(n('tampoProf'),0,1000,'Profundidade do tampo'); faixa(n('tampoEsp'),0,60,'Espessura do tampo');
  faixa(n('puxadorProj'),0,60,'Saliência do puxador'); faixa(n('esgoto'),0,2000,'Altura do esgoto');
  faixa(n('gavetas'),0,6,'Gavetas (un)'); faixa(n('prateleiras'),0,6,'Prateleiras (un)');
  if (E.length) return { pecas, erros:E, avisos:A, ferragens:[], dims:null };

  const eE = (p.paredeEsq && p.enchimento) ? R.enchimento : 0;
  const eD = (p.paredeDir && p.enchimento) ? R.enchimento : 0;
  const Wi=L-eD-eE-2*t, Hc=H-pes, Dc=P-t-tf;
  if (Wi < 150) E.push(`O vão interno fica com ${fmt(Wi)} mm (mínimo 150). Aumente a largura.`);
  if (Dc < 150) E.push(`A caixa fica com ${fmt(Dc)} mm de fundo (mínimo 150). Aumente a profundidade.`);

  // Gavetas
  const nP=Number(p.portas), nG=Math.max(0,Math.round(n('gavetas'))), nS=Math.max(0,Math.round(n('prateleiras')));
  let alts = [];
  if (nG > 0) {
    const lst = String(p.alturasGavetas).split(/[;,\s]+/).filter(Boolean).map(s => Number(s.replace(',','.')));
    if (!lst.length || lst.some(isNaN)) E.push('Altura das gavetas: escreva números separados por vírgula, ex.: 150, 200.');
    else if (lst.length === 1) alts = Array(nG).fill(lst[0]);
    else if (lst.length === nG) alts = lst;
    else E.push(`São ${nG} gavetas, mas há ${lst.length} alturas informadas.`);
  }
  const somaG = alts.reduce((s,v)=>s+v,0);
  const zonaSup = Hc - somaG;
  const temSup = zonaSup > 0.5;
  if (nP > 0 && zonaSup < 200) E.push(`Sobram só ${fmt(zonaSup)} mm para as portas (mínimo 200). Diminua as gavetas.`);
  if (nP === 0 && zonaSup < 0) E.push('As gavetas passam da altura do móvel.');
  alts.forEach((h,i) => { if (h < 100) E.push(`Gaveta ${i+1}: altura ${fmt(h)} mm (mínimo 100).`); });
  const Lc = [...R.corredicas].reverse().find(c => c <= Dc - 10);
  if (nG > 0 && !Lc) E.push(`A caixa tem ${fmt(Dc)} mm de fundo: não cabe a menor corrediça (250 mm).`);


  const m = moduloDeGabinete(p, alts);
  const r = gerarModuloV3(m, { dobradicas:dobradicasPorAltura, fundoInteiro:true, limitarInterior:false, finalizar:false });
  apresentarFormulario('gabinete', p, r);
  mensagensGabinete(p, r, E, A, { nG,nS,nP,alts,temSup,Lc });
  return comprasGabineteFormulario(p,r.pecas,E,A);
}
