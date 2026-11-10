// TELA — Google Drive: salvar e abrir na pasta "Projetos de móveis" (parte do antigo tela.js, na mesma ordem: ver pagina.html)
/* ---------- Google Drive (só no programa publicado, pelo app do Claude) ----------
   Salvar grava uma cópia nova na pasta "Projetos de móveis" (o Drive não deixa trocar o conteúdo pela ligação:
   cada salvamento vira um arquivo com data e hora). Abrir lista os arquivos da pasta, do mais novo ao mais antigo. */
const DRIVE = 'Google Drive', PASTA_DRIVE = 'Projetos de móveis';
let mcpDrive = null, pastaDriveId = null;
(async () => { try { mcpDrive = window.claude?.use ? await window.claude.use('mcp') : null; } catch(e) { mcpDrive = null; }
  $('btnDriveSalvar').hidden = $('btnDriveAbrir').hidden = !mcpDrive; })();
const erroDrive = e => e?.code === 'not_granted' || e?.code === 'denied' ? 'Permissão do Google Drive recusada.' : e?.code === 'server_not_connected' ? 'O Google Drive não está ligado à sua conta do Claude.' : `Não deu para usar o Drive (${e?.code || e?.message || 'erro'}).`;
async function pastaDrive() {
  if (pastaDriveId) return pastaDriveId;
  const q = `title = '${PASTA_DRIVE}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  const r = await mcpDrive.callTool(DRIVE, 'search_files', { query:q, excludeContentSnippets:true, pageSize:1 }, { cache:false });
  pastaDriveId = r.payload?.files?.[0]?.id;
  if (!pastaDriveId) pastaDriveId = (await mcpDrive.callTool(DRIVE, 'create_file', { title:PASTA_DRIVE, contentMimeType:'application/vnd.google-apps.folder' })).payload?.id;
  if (!pastaDriveId) throw { message:'pasta não encontrada' };
  return pastaDriveId;
}
const doisDig = n => String(n).padStart(2, '0');
$('btnDriveSalvar').addEventListener('click', async () => {
  if (!mcpDrive || !estado.res) return;
  const b = $('btnDriveSalvar'); b.disabled = true; b.textContent = 'Salvando…';
  try {
    const d = new Date(), quando = `${d.getFullYear()}-${doisDig(d.getMonth()+1)}-${doisDig(d.getDate())} ${doisDig(d.getHours())}h${doisDig(d.getMinutes())}`;
    await mcpDrive.callTool(DRIVE, 'create_file', { title:`${estado.projeto.nome || 'Projeto'} — ${quando}.json`, parentId:await pastaDrive(),
      textContent:projetoJSON(), contentMimeType:'application/json', disableConversionToGoogleType:true });
    toast(`Salvo no Drive, na pasta "${PASTA_DRIVE}".`); marcarSalvo();
  } catch(e) { toast(erroDrive(e)); }
  b.disabled = false; b.textContent = 'Salvar no Drive';
});
// conteúdo baixado vem em base64 (às vezes no formato de URL); decodifica como UTF-8
function textoDeBase64(b64) { const bin = atob(String(b64).replace(/-/g, '+').replace(/_/g, '/')); return new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0))); }
$('btnDriveAbrir').addEventListener('click', async () => {
  if (!mcpDrive) return;
  const dlg = $('dlgDrive'), lista = dlg.querySelector('[data-lista="arquivos"]'), nota = dlg.querySelector('[data-texto="nota"]');
  lista.replaceChildren(); nota.textContent = 'Buscando no Drive…'; dlg.showModal();
  try {
    const r = await mcpDrive.callTool(DRIVE, 'search_files', { query:`'${await pastaDrive()}' in parents and trashed = false`, orderBy:'modifiedTime desc', pageSize:40, excludeContentSnippets:true }, { cache:false });
    const arqs = (r.payload?.files || []).filter(f => /\.json$/i.test(f.title || ''));
    nota.textContent = arqs.length ? `${arqs.length} projeto(s) na pasta "${PASTA_DRIVE}", do mais novo ao mais antigo.` : `Nenhum projeto na pasta "${PASTA_DRIVE}" ainda.`;
    lista.replaceChildren(...arqs.map(f => { const bt = el('button', { type:'button', class:'btn drive-arq' }, f.title.replace(/\.json$/i, '')); bt.dataset.id = f.id; return el('li', {}, bt); }));
  } catch(e) { nota.textContent = erroDrive(e); }
});
$('dlgDrive').addEventListener('click', async e => {
  const dlg = $('dlgDrive');
  if (e.target.closest('[data-acao="fechar-drive"]')) { dlg.close(); return; }
  const bt = e.target.closest('.drive-arq'); if (!bt) return;
  dlg.querySelector('[data-texto="nota"]').textContent = 'Abrindo…';
  try {
    const r = await mcpDrive.callTool(DRIVE, 'download_file_content', { fileId:bt.dataset.id }, { cache:false });
    if (abrirProjetoTexto(textoDeBase64(r.payload?.content ?? r.payload?.base64Content ?? ''))) dlg.close();
    else dlg.querySelector('[data-texto="nota"]').textContent = 'Esse arquivo não é um projeto do Configurador.';
  } catch(err) { dlg.querySelector('[data-texto="nota"]').textContent = erroDrive(err); }
});
