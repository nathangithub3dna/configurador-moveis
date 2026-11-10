// TELA — abrir projeto (.json, Drive, nuvem passam por aqui; conversor de formato) (parte do antigo tela.js, na mesma ordem: ver pagina.html)
/* ---------- Abrir projeto / padrão ---------- */
$('btnAbrir').addEventListener('click', () => $('arqProjeto').click());
const AVISO_CONVERTIDO = 'Projeto aberto e atualizado para o formato novo. O original não foi alterado.';
function abrirProjetoTexto(texto) {
  try {
    const c = converterFormato(JSON.parse(texto));
    if (c.erro === 'mais-novo') { toast(AVISO_FORMATO_NOVO); return false; }
    const d = c.projeto;
    if (!d || !TIPOS[d.tipo] || typeof d.parametros !== 'object') throw 0;
    estado.projeto = { tipo:d.tipo, nome:d.nome || 'Projeto', parametros:{ ...JSON.parse(JSON.stringify(TIPOS[d.tipo].padrao)), ...d.parametros }, codigo:d.codigo, orcamento:d.orcamento, liberacao:d.liberacao, conferencia:d.conferencia };
    if (d.precos && typeof d.precos === 'object') { precos = { ...precos, ...d.precos }; salvarPrecos(); }
    formatoConvertidoDe = c.convertido ? c.de : 0;
    carregarProjeto(); marcarSalvo(); toast(c.convertido ? AVISO_CONVERTIDO : 'Projeto aberto.'); return true;
  } catch(err) { toast('Esse arquivo não é um projeto do Configurador.'); return false; }
}
