// TELA — botões de projeto: abrir arquivo, desfazer, medidas padrão, passar para o esquema, trocar tipo (parte do antigo tela.js, na mesma ordem: ver pagina.html)
$('arqProjeto').addEventListener('change', e => {
  const f = e.target.files[0]; if (!f) return;
  const fr = new FileReader();
  fr.onload = () => { abrirProjetoTexto(fr.result); e.target.value = ''; };
  fr.readAsText(f);
});
$('btnDesfazer').addEventListener('click', desfazer);
document.addEventListener('keydown', e => {
  if (!(e.ctrlKey || e.metaKey) || e.shiftKey || e.key.toLowerCase() !== 'z' || e.target.closest('input,textarea,select')) return;
  e.preventDefault(); desfazer();
});
$('btnPadrao').addEventListener('click', () => { estado.projeto = projetoPadrao(estado.projeto.tipo); estado.ocultas.clear(); carregarProjeto(); toast('Medidas padrão restauradas.'); });
// Editar no esquema: o Armário com vãos e o Gabinete viram Móvel livre com as mesmas peças (conversor do núcleo, conferido pelo teste)
$('btnParaLivre').addEventListener('click', () => {
  const conv = CONVERSORES_V3[estado.projeto.tipo]; if (!conv) return;
  const antigo = estado.projeto;
  estado.projeto = { ...antigo, tipo:'modulo', parametros:{ ...conv(antigo.parametros), entrega:'desmontado', origem:antigo.tipo } };
  estado.ocultas.clear(); estado.vaoSel = ''; carregarProjeto();
  toast('Agora é editado pelo Esquema: toque nos vãos. Este móvel não volta para o formulário antigo.');
});
$('tipoMovel').addEventListener('change', e => { estado.projeto = projetoPadrao(e.target.value); estado.ocultas.clear(); carregarProjeto(); });
