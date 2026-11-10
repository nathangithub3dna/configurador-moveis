// TELA — tamanho da tela, animação e início (parte do antigo tela.js, na mesma ordem: ver pagina.html)
/* ---------- Tamanho e animação ---------- */
function redimensionar() {
  const w = palco.clientWidth, h = palco.clientHeight; if (!w || !h) return;
  renderer.setSize(w, h); rotulos.setSize(w, h);
  camP.aspect = w/h; camP.updateProjectionMatrix(); ajustarOrto();
}
new ResizeObserver(redimensionar).observe(palco);
const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
let expAtual = 0;
function quadro() {
  const k = reduz ? 1 : 0.14;
  expAtual += (estado.explode - expAtual) * k;
  for (const no of nos.values()) {
    const m = no.pc.mov;
    if (m?.tipo === 'porta') { const alvo = estado.portas ? m.angMax : 0; no.ang += (alvo - no.ang)*k; no.mover.rotation.y = (m.lado==='esq' ? -1 : 1) * no.ang*Math.PI/180; }
    if (m?.tipo === 'basculante') { const alvo = estado.portas ? m.angMax : 0; no.ang += (alvo - no.ang)*k; no.mover.rotation.x = -no.ang*Math.PI/180; }   // sobe para fora
    if (m?.tipo === 'correr') { const alvo = estado.portas ? m.curso * m.sentido : 0; no.slide += (alvo - no.slide)*k; no.mover.position.x = no.slide; }
    if (m?.tipo === 'gaveta') { const alvo = estado.gavetas ? m.curso : 0; no.slide += (alvo - no.slide)*k; if (m.eixo === 'x') no.mover.position.x = no.slide; else no.mover.position.z = no.slide; }
    no.wrapper.position.copy(no.dirExp).multiplyScalar(expAtual*0.9);
  }
  controles.update();
  renderer.render(cena, cam); rotulos.render(cena, cam);
  requestAnimationFrame(quadro);
}
aplicarTema();
carregarProjeto();
redimensionar();
quadro();
window.__configurador = { FORMATO, converterFormato, abrirProjetoTexto, salvarNuvem, atualizar, selecionar, nosAtual: () => nos, AMB, pecaDeTeste, conferenciaFabricacao, calcularOrcamento, congelarRevisao, orcamentoPDF, folhaPecaSVG, folhasPDF, ED, pedidoCorteCloud, codigosDasPecas, etiquetasPDF, planoDeCorte, gerarModuloV3, CONVERSORES_V3, resolverMetodo, METODOS_CONSTRUCAO, estado, TIPOS, listaDeCorte, nos, gerarPDF, listaDesenhos, gerarILogic, posicaoInventor, cam: () => ({ camera: cam, controles }) };
