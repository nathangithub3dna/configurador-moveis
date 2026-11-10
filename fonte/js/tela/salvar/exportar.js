// TELA — exportar: projeto .json, PDF, iLogic, pacote .zip do Blender (parte do antigo tela.js, na mesma ordem: ver pagina.html)
/* =====================================================================
   7. EXPORTAÇÃO — projeto (.json) e pacote para o Blender (.zip)
   ===================================================================== */
let downloads = null, downloadsPronto = false;
(async () => { try { downloads = window.claude?.use ? await window.claude.use('downloads') : null; } catch(e) { downloads = null; } downloadsPronto = true; atualizarBotoesExport(); })();
function atualizarBotoesExport() {
  const ok = estado.res && estado.res.erros.length === 0;
  const disp = true;                                                   // fora do Claude baixa pelo navegador (salvar)
  $('btnZip').disabled = !ok || !window.JSZip; $('btnJson').disabled = !estado.res;   // o projeto salva mesmo com erros
  $('btnPdf').disabled = $('btnPdf2').disabled = !ok || !disp || !window.jspdf;
  $('btnIlogic').disabled = !ok || !disp; $('copIlogic').disabled = !ok;
  $('notaExport').textContent = !ok ? 'O projeto (.json) pode ser salvo mesmo com erros; o pacote, os desenhos e o iLogic esperam a correção.' : !window.JSZip ? 'O pacote .zip não carregou; o projeto .json continua disponível.' : 'O pacote leva o modelo 3D (.glb), os desenhos em PDF, o projeto e as listas em planilha.';
}
const slug = () => (estado.projeto.nome || 'projeto').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || 'projeto';
function dadosProjeto() {
  const r = estado.res;
  return { app:'Configurador de Móveis', versao:FORMATO.versao, exportadoEm:new Date().toISOString(), unidade:'mm',
    tipo:estado.projeto.tipo, nome:estado.projeto.nome, parametros:estado.projeto.parametros, codigo:estado.projeto.codigo, orcamento:estado.projeto.orcamento, liberacao:estado.projeto.liberacao, conferencia:estado.projeto.conferencia,
    situacao: rotuloDocumento(estado.projeto).longo,
    pecas: r.pecas.map(pc => ({ id:pc.id, nomeGLB:`${pc.cat}_${pc.mat}_${pc.id}`, nome:pc.nome, categoria:pc.cat, material:pc.mat, espessura:pc.esp, comprimento:pc.comp ?? null, largura:pc.larg ?? null, fita:pc.fita, listaDeCorte:pc.lista, caixa_mm:pc.box, forma:pc.forma||null, movimento:pc.mov, obs:pc.obs })),
    ferragens: r.ferragens,
    planoDeCorte: estado.plano, listaDeCompras: estado.compras, precos, biblioteca: BIBLIOTECA };
}
const csvNum = v => String(Math.round(v*10)/10).replace('.', ',');
function csvCorte() {
  const lc = listaDeCorte(estado.res.pecas), ls = ['Material;Espessura;Peça;Qtd;Comprimento;Largura;Fita;Observação'];
  for (const its of lc.grupos.values()) its.forEach(it => ls.push([MATERIAIS[it.mat].nome, csvNum(it.esp), it.nomeLista||it.nome, it.qtd, csvNum(it.comp), csvNum(it.larg), fitaTxt(it.fita), (it.obs||'').replace(/;/g,',')].join(';')));
  return '﻿' + ls.join('\r\n');
}
const csvFerr = () => '﻿' + ['Item;Qtd;Observação', ...estado.res.ferragens.map(f => [f.item, f.qtd, f.obs].join(';'))].join('\r\n');
async function gerarGLB() {
  const c = new THREE.Scene(), mats = {};
  for (const pc of estado.res.pecas) {
    const g = geometriaDe(pc);
    const ct = new THREE.Vector3((pc.box[0]+pc.box[1])/2, (pc.box[2]+pc.box[3])/2, (pc.box[4]+pc.box[5])/2);
    g.translate(-ct.x, -ct.y, -ct.z); g.scale(0.001, 0.001, 0.001);
    mats[pc.mat] ||= new THREE.MeshStandardMaterial({ name:pc.mat, color:MATERIAIS[pc.mat].cor, roughness: pc.mat==='cromado' ? 0.2 : 0.75, metalness: pc.mat==='cromado' ? 1 : 0 });
    const m = new THREE.Mesh(g, mats[pc.mat]);
    m.name = `${pc.cat}_${pc.mat}_${pc.id}`; m.position.copy(ct.multiplyScalar(0.001));
    m.userData = { nome:pc.nome, categoria:pc.cat, comprimento_mm:pc.comp ?? null, largura_mm:pc.larg ?? null, espessura_mm:pc.esp, fita:pc.fita,
      movimento: pc.mov ? (pc.mov.tipo==='porta' ? { tipo:'porta', lado:pc.mov.lado, pivo_m:[pc.mov.pivX/1000, 0, pc.mov.pivZ/1000], eixo:'y', angulo_max:pc.mov.angMax } : { tipo:'gaveta', curso_m:pc.mov.curso/1000, eixo:pc.mov.eixo || 'z' }) : null };
    c.add(m);
  }
  return await new GLTFExporter().parseAsync(c, { binary:true });
}
// salvar: dentro do Claude usa o recurso de downloads dele; em qualquer outro navegador, baixa direto (arquivo comum)
async function salvar(nome, dados) {
  if (downloads) {
    try { await downloads.save({ filename:nome, data:dados }); toast('Arquivo salvo.'); return true; }
    catch(e) { toast(e?.code === 'declined' ? 'Download cancelado.' : `Não foi possível salvar (${e?.code || 'erro'}).`); }
    return false;
  }
  try {
    const tipo = /\.json$/.test(nome) ? 'application/json' : /\.pdf$/.test(nome) ? 'application/pdf' : /\.zip$/.test(nome) ? 'application/zip' : 'text/plain';
    const url = URL.createObjectURL(new Blob([dados], { type:tipo })), a = document.createElement('a');
    a.href = url; a.download = nome; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 30000);
    toast('Arquivo baixado.'); return true;
  } catch(e) { toast('Não foi possível baixar o arquivo neste navegador.'); }
}
const baixarPDF = () => { if (estado.res.erros.length || !window.jspdf) return; try { salvar(slug()+'-desenhos.pdf', gerarPDF()); } catch(e) { toast('Falha ao montar o PDF.'); } };
$('btnIlogic').addEventListener('click', () => { if (estado.res.erros.length) return; salvar(slug()+'-inventor-ilogic.txt', gerarILogic()); });
$('copIlogic').addEventListener('click', () => { if (!estado.res.erros.length) copiar(gerarILogic(), 'copiaIlogic'); });
// Desenhos (.pdf): as folhas A3 no padrão do FreeCAD (uma por peça), as mesmas do bloco Desenhos técnicos
$('btnPdf').addEventListener('click', async () => {
  if (estado.res.erros.length || !window.jspdf) return;
  toast('Montando as folhas…');
  try { salvar(slug() + '-folhas-A3.pdf', await folhasPDF(pecasComFolha(), extraFolha)); } catch (e) { toast('Falha ao montar as folhas.'); }
});
$('btnPdf2').addEventListener('click', baixarPDF);
// o projeto como texto (.json): com erro, salva só o projeto para continuar depois (sem peças, que estão inconsistentes)
function projetoJSON() {
  const dados = estado.res.erros.length ? { app:'Configurador de Móveis', versao:FORMATO.versao, exportadoEm:new Date().toISOString(), incompleto:true, erros:estado.res.erros,
    tipo:estado.projeto.tipo, nome:estado.projeto.nome, parametros:estado.projeto.parametros, codigo:estado.projeto.codigo, orcamento:estado.projeto.orcamento, liberacao:estado.projeto.liberacao, conferencia:estado.projeto.conferencia, precos } : dadosProjeto();
  return JSON.stringify(dados, null, 2);
}
async function salvarJson() { if (!estado.res) return; if (await salvar(slug() + (estado.res.erros.length ? '-incompleto' : '') + '.json', projetoJSON())) marcarSalvo(); }
$('btnJson').addEventListener('click', salvarJson);
// clicar no aviso "Não salvo" salva: no Drive quando a ligação existe (app do Claude), senão baixa o .json
$('naoSalvo').addEventListener('click', () => { if (nuvemPronta()) salvarNuvem(); else if (mcpDrive && !$('btnDriveSalvar').hidden) $('btnDriveSalvar').click(); else salvarJson(); });
// menu Exportar da barra de cima: fecha ao clicar fora, com Esc e depois de escolher uma saída (o "Copiar iLogic" mantém aberto para mostrar o texto)
document.addEventListener('click', e => { const m = $('menuExportar'); if (m.open && !m.contains(e.target)) m.open = false; });
document.addEventListener('keydown', e => { if (e.key === 'Escape') $('menuExportar').open = false; });
$('menuExportar').addEventListener('toggle', e => { const m = e.currentTarget; if (m.open) m.style.setProperty('--exp-topo', Math.round(m.querySelector('summary').getBoundingClientRect().bottom + 8) + 'px'); });
$('menuExportar').addEventListener('click', e => { const b = e.target.closest('button'); if (b && b.id !== 'copIlogic') setTimeout(() => { $('menuExportar').open = false; }, 0); });
$('btnZip').addEventListener('click', async () => {
  if (estado.res.erros.length || !window.JSZip) return;
  $('btnZip').disabled = true; $('notaExport').textContent = 'Montando o pacote…';
  try {
    const zip = new JSZip();
    zip.file('modelo.glb', await gerarGLB());
    zip.file('projeto.json', JSON.stringify(dadosProjeto(), null, 2));
    zip.file('lista-de-corte.csv', csvCorte());
    zip.file('ferragens.csv', csvFerr());
    zip.file('pedido-loja-de-corte.csv', csvLoja());
    zip.file('lista-de-compras.csv', csvCompras());
    if (window.jspdf) {
      zip.file('desenhos-folhas-A3.pdf', await folhasPDF(pecasComFolha(), extraFolha));
      zip.file('lista-e-plano-de-corte.pdf', gerarPDF({ semDesenhos:true }));
    }
    zip.file('inventor-gerar-pecas.iLogicVb', gerarILogic());
    const rot = rotuloDocumento(estado.projeto);
    zip.file('SITUACAO.txt', `${estado.projeto.nome}\n${rot.longo}\n${rot.fabricar ? '' : '\nNÃO FABRICAR com estes arquivos: o projeto ainda não foi liberado para corte.\n'}`);
    zip.file('LEIA-ME.txt', `${estado.projeto.nome}\n${rot.longo}\n\nmodelo.glb — abrir no Blender: File > Import > glTF 2.0. Unidade: metro.\nCada peça se chama categoria_material_id (ex.: frente_mdf-ru-branco_porta-esq).\nPortas e gavetas levam o pivô e o curso nas propriedades personalizadas (Custom Properties).\nprojeto.json — reabre no Configurador (botão Abrir projeto).\ndesenhos-folhas-A3.pdf — uma folha A3 cotada por peça (padrão FreeCAD), para a marcenaria.\nlista-e-plano-de-corte.pdf — lista de corte, compras e plano de corte.\ninventor-gerar-pecas.iLogicVb — regra iLogic: cria as peças .ipt e a montagem .iam no Inventor.\nlista-de-corte.csv e ferragens.csv — abrem no Excel.\n`);
    await salvar(slug() + '-' + rot.curto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') + '.zip', await zip.generateAsync({ type:'blob' }));
  } catch(e) { toast('Falha ao montar o pacote.'); }
  atualizarBotoesExport();
});
