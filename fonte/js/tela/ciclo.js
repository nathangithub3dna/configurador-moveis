// TELA — ciclo: parâmetros → peças → 3D e listas (parte do antigo tela.js, na mesma ordem: ver pagina.html)
/* =====================================================================
   8. CICLO: parâmetros → peças → 3D e listas
   ===================================================================== */
function atualizar(primeira = false) {
  let res;
  try { res = TIPOS[estado.projeto.tipo].gerar(estado.projeto.parametros); }
  catch(err) { res = { pecas:[], erros:['Combinação de medidas que o gerador não conseguiu montar. Revise os campos.'], avisos:[], ferragens:[], dims:null }; console.error(err); }
  estado.res = res;
  if (res.erros.length === 0) {
    const mudouTam = !estado.valido || ['L','H','P'].some(k => estado.valido.dims[k] !== res.dims[k]);
    estado.valido = res; construirCena(res); aplicarCorte(); montarArvore(res.pecas);
    if (primeira || mudouTam) aplicarVista(estado.vista);
  }
  mostrarAlertas(res); mostrarListas(res); mostrarDesenhos(res); destacar(); salvarLocal(); atualizarEsquema(); mostrarLoja(); mostrarFolha(); mostrarSituacao();
}
function carregarProjeto() { $('nomeProjeto').value = estado.projeto.nome; montarFormulario(); estado.valido = null; atualizar(true); }
