// TELA — seleção de peça e ficha (parte do antigo tela.js, na mesma ordem: ver pagina.html)
/* ---------- Seleção e ficha ---------- */
function destacar() {
  for (const { pc, mesh } of nos.values()) mesh.material = pc.id === estado.sel ? matSel : matDe(pc);
  document.querySelectorAll('.arvore li').forEach(li => li.classList.toggle('sel', li.dataset.id === estado.sel));
  marcarDesenho();
  const card = estado.sel && [...document.querySelectorAll('.des[data-ids]')].find(a => a.dataset.ids.split(' ').includes(estado.sel));
  $('fDesenho').hidden = !card;
  const no = estado.sel && nos.get(estado.sel);
  if (!no) { if (!medida.pts.length) $('ficha').hidden = true; return; }
  const pc = no.pc;
  $('fNome').textContent = pc.nome;
  if (pc.cat === 'ferragem') { $('fMed').textContent = pc.forma?.tipo==='cil' ? 'Ø 35 mm' : `${fmt(pc.box[1]-pc.box[0])} × ${fmt(pc.box[3]-pc.box[2])} × ${fmt(pc.box[5]-pc.box[4])} mm`; $('fDet').textContent = 'Ferragem · não entra na lista de corte'; }
  else { $('fMed').textContent = `${fmt(pc.comp)} × ${fmt(pc.larg)} × ${fmt(pc.esp)} mm`; $('fDet').textContent = `${MATERIAIS[pc.mat].nome} · fita ${fitaTxt(pc.fita)}${pc.lista ? '' : ' · fora da lista de corte'}`; }
  $('fObs').textContent = pc.obs || '';
  $('fGlb').textContent = `${pc.cat}_${pc.mat}_${pc.id}`;
  preencherAjustePeca(pc);                                             // desligar / mudar medida (tela/paineis/ajuste.js)
  $('ficha').hidden = false;
}
function selecionar(id) { estado.sel = id; limparMedida(false); destacar(); construirCotas(); }
$('fDesenho').addEventListener('click', () => { const card = [...document.querySelectorAll('.des[data-ids]')].find(a => a.dataset.ids.split(' ').includes(estado.sel)); card?.scrollIntoView({ behavior:'smooth', block:'start' }); });
$('fFechar').addEventListener('click', () => { selecionar(null); limparMedida(); $('ficha').hidden = true; });
