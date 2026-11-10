// TELA — nuvem do próprio programa: salvar sozinho, Meus projetos, cópia no Drive (parte do antigo tela.js, na mesma ordem: ver pagina.html)
/* ---------- Projetos guardados no próprio programa (capability db do artifact) ----------
   Cada projeto vira um documento privado do Nathan (data/users/<id>/<nome do projeto>): o mesmo no computador e no celular,
   e não se perde quando o programa é atualizado. O salvamento é automático, 3 s depois de cada mudança.
   De hora em hora, enquanto há mudanças, vai também uma cópia para o Google Drive (pasta "Projetos de móveis").
   Fora do Claude (arquivo solto ou sem internet) nada disso existe: vale o aviso "Não salvo" + Drive/.json. */
const CHAVE_NUVEM = 'configurador-moveis:nuvem';           // { id, salvoEm } do último salvamento na nuvem feito neste aparelho
const COPIA_DRIVE_MS = 60 * 60 * 1000;
var nuvem = null, nuvemUid = null, nuvemTimer = null, nuvemSalvando = false, ultimaCopiaDrive = 0;   // var: o aviso "Não salvo" consulta antes desta linha rodar
function nuvemPronta() { return !!(nuvem && nuvemUid); }
const colNuvem = () => nuvem.collection('data/users/' + nuvemUid);
const idNuvem = () => slug().slice(0, 150);
const horaCurta = iso => { const d = new Date(iso); return `${doisDig(d.getDate())}/${doisDig(d.getMonth()+1)} ${doisDig(d.getHours())}:${doisDig(d.getMinutes())}`; };
function estadoNuvem(texto, erro) { const e = $('estadoNuvem'); e.hidden = !texto; e.textContent = texto || ''; e.classList.toggle('erro', !!erro); }
function agendarNuvem(ms = 3000) { clearTimeout(nuvemTimer); nuvemTimer = setTimeout(salvarNuvem, ms); }
async function salvarNuvem() {
  if (!nuvemPronta()) return;
  if (nuvemSalvando) { agendarNuvem(); return; }
  const atual = JSON.stringify(estado.projeto); if (atual === ultimoSalvo) return;
  nuvemSalvando = true; estadoNuvem('☁ Salvando…');
  const id = idNuvem(), salvoEm = new Date().toISOString();
  try {
    const texto = JSON.stringify(JSON.parse(projetoJSON()));     // compacto: cada documento cabe até 256 KB
    if (formatoConvertidoDe) await guardarOriginalNuvem(id, formatoConvertidoDe);
    await colNuvem().doc(id).set({ nome: estado.projeto.nome || 'Projeto', tipo: estado.projeto.tipo, salvoEm, projeto: texto });
    ultimoSalvo = atual; try { localStorage.setItem(CHAVE_SALVO, atual); localStorage.setItem(CHAVE_NUVEM, JSON.stringify({ id, salvoEm })); } catch(e) {}
    estadoNuvem('☁ Salvo ' + horaCurta(salvoEm)); mostrarNaoSalvo();
    copiaDriveDeHoraEmHora();
  } catch (e) {
    estadoNuvem(e?.code === 'invalid_argument' ? '☁ Projeto grande demais para a nuvem: salve no Drive' : e?.code === 'quota_exceeded' ? '☁ Nuvem cheia: apague projetos antigos' : '☁ Não salvou (sem conexão?)', true);
  }
  nuvemSalvando = false;
}
// o documento da nuvem com este nome ainda está no formato antigo: copia ele à parte, uma vez, antes de gravar por cima
async function guardarOriginalNuvem(id, de) {
  const d = await colNuvem().doc(id).get();
  if (d.exists) {
    let versao = 1; try { versao = JSON.parse(d.data().projeto).versao || 1; } catch(e) {}
    const idOrig = (id + '-original-formato-' + versao).slice(0, 190);
    if (versao < FORMATO.versao && !(await colNuvem().doc(idOrig).get()).exists)
      await colNuvem().doc(idOrig).set({ ...d.data(), nome: `${d.data().nome || 'Projeto'} (original, formato ${versao})`, copia: true });
  }
  formatoConvertidoDe = 0;
}
async function copiaDriveDeHoraEmHora() {
  if (!mcpDrive || Date.now() - ultimaCopiaDrive < COPIA_DRIVE_MS) return;
  ultimaCopiaDrive = Date.now();
  try {
    const d = new Date(), quando = `${d.getFullYear()}-${doisDig(d.getMonth()+1)}-${doisDig(d.getDate())} ${doisDig(d.getHours())}h${doisDig(d.getMinutes())}`;
    await mcpDrive.callTool(DRIVE, 'create_file', { title:`${estado.projeto.nome || 'Projeto'} — ${quando}.json`, parentId:await pastaDrive(),
      textContent:projetoJSON(), contentMimeType:'application/json', disableConversionToGoogleType:true });
  } catch (e) { /* a cópia no Drive é extra: a nuvem já guardou */ }
}
function abrirDaNuvem(doc, aviso) {
  if (!abrirProjetoTexto(doc.projeto)) return false;
  ultimoSalvo = JSON.stringify(estado.projeto); try { localStorage.setItem(CHAVE_SALVO, ultimoSalvo); localStorage.setItem(CHAVE_NUVEM, JSON.stringify({ id: idNuvem(), salvoEm: doc.salvoEm })); } catch(e) {}
  clearTimeout(nuvemTimer); estadoNuvem('☁ Salvo ' + horaCurta(doc.salvoEm)); mostrarNaoSalvo(); if (aviso) toast(formatoConvertidoDe ? AVISO_CONVERTIDO : aviso);
  return true;
}
(async () => {
  try {
    const [db, user] = await Promise.all([window.claude?.use ? window.claude.use('db') : null, window.claude?.use ? window.claude.use('user') : null]);
    const semNuvem = () => estadoNuvem('Sem nuvem: abra pelo link do Claude para salvar sozinho', true);
    if (!db || !user) { semNuvem(); return; }
    const uid = await user.id(); if (!uid) { semNuvem(); return; }
    nuvem = db; nuvemUid = uid; $('btnNuvem').hidden = false;
    let loc = null; try { loc = JSON.parse(localStorage.getItem(CHAVE_NUVEM) || 'null'); } catch(e) {}
    // ao abrir: se a nuvem tem uma versão mais nova deste projeto (salva em outro aparelho), abre ela; num aparelho novo, abre o mais recente
    let alvo = null;
    if (temProjetoLocal && loc?.id && loc.id === idNuvem()) { const d = await colNuvem().doc(loc.id).get(); if (d.exists && String(d.data().salvoEm) > String(loc.salvoEm || '')) alvo = d.data(); }
    else if (temProjetoLocal) {
      // cópia deste aparelho que nunca foi salva na nuvem com este nome: se a nuvem já tem esse projeto, a nuvem vence
      // (a cópia do aparelho costuma ser mais velha) — e a cópia do aparelho fica guardada à parte, para não se perder
      const d = await colNuvem().doc(idNuvem()).get();
      if (d.exists) {
        const agora = new Date().toISOString(), marca = agora.slice(0, 16).replace(/[-:T]/g, '');
        await colNuvem().doc((idNuvem() + '-copia-aparelho-' + marca).slice(0, 190)).set({ nome: `${estado.projeto.nome || 'Projeto'} (cópia deste aparelho)`, tipo: estado.projeto.tipo, salvoEm: agora, copia: true, projeto: JSON.stringify(JSON.parse(projetoJSON())) });
        alvo = d.data();
      }
    } else { const q = await colNuvem().orderBy('salvoEm', 'desc').limit(20).get(); alvo = q.docs.map(x => x.data()).find(x => !x.copia) || null; }   // aparelho novo: o mais recente (sem contar as cópias guardadas à parte)
    if (alvo && abrirDaNuvem(alvo, 'Abri a versão mais nova, salva na nuvem em ' + horaCurta(alvo.salvoEm) + '.')) return;
    if (!loc || loc.id !== idNuvem()) ultimoSalvo = null;        // este projeto ainda não está na nuvem: guarda já
    else if (JSON.stringify(estado.projeto) === ultimoSalvo) estadoNuvem('☁ Salvo ' + horaCurta(loc.salvoEm));
    mostrarNaoSalvo();                                            // mudança ainda não guardada: salva agora
  } catch (e) { nuvem = null; nuvemUid = null; estadoNuvem('Sem nuvem agora (sem conexão?): use Salvar no Drive ou .json', true); }
})();
$('btnNuvem').addEventListener('click', async () => {
  if (!nuvemPronta()) return;
  const dlg = $('dlgNuvem'), lista = dlg.querySelector('[data-lista="projetos"]'), nota = dlg.querySelector('[data-texto="nota"]');
  lista.replaceChildren(); nota.textContent = 'Buscando…'; dlg.showModal();
  try {
    const q = await colNuvem().orderBy('salvoEm', 'desc').limit(100).get();
    nota.textContent = q.docs.length ? 'Toque para abrir. O projeto aberto agora já está salvo.' : 'Nenhum projeto guardado ainda.';
    lista.replaceChildren(...q.docs.map(d => { const v = d.data(), bt = el('button', { type:'button', class:'btn nuvem-arq' }, `${v.nome} · ${horaCurta(v.salvoEm)}`); bt.dataset.id = d.id; return el('li', {}, bt); }));
  } catch (e) { nota.textContent = 'Não deu para ler os projetos agora. Tente de novo.'; }
});
$('dlgNuvem').addEventListener('click', async e => {
  const dlg = $('dlgNuvem');
  if (e.target.closest('[data-acao="fechar-nuvem"]')) { dlg.close(); return; }
  const bt = e.target.closest('.nuvem-arq'); if (!bt) return;
  if (JSON.stringify(estado.projeto) !== ultimoSalvo) await salvarNuvem();   // guarda o atual antes de trocar
  try { const d = await colNuvem().doc(bt.dataset.id).get(); if (d.exists && abrirDaNuvem(d.data(), 'Projeto aberto.')) dlg.close(); else dlg.querySelector('[data-texto="nota"]').textContent = 'Não deu para abrir esse projeto.'; }
  catch (err) { dlg.querySelector('[data-texto="nota"]').textContent = 'Não deu para abrir agora. Tente de novo.'; }
});
