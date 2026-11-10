// TELA — estado da página, salvar no aparelho, desfazer, aviso "Não salvo" (parte do antigo tela.js, na mesma ordem: ver pagina.html)
/* =====================================================================
   5. ESTADO DA PÁGINA
   ===================================================================== */
const CHAVE = 'configurador-moveis:v2';
const projetoPadrao = (tipo = 'armario') => ({ tipo, nome:TIPOS[tipo].nomePadrao, parametros:JSON.parse(JSON.stringify(TIPOS[tipo].padrao)) });
const estado = {
  projeto: projetoPadrao('modulo'), res:null, valido:null, sel:null, ocultas:new Set(),
  portas:false, gavetas:false, explode:0, cotas:true, medir:false, corte:'nenhum', cortePos:50,
  tampo:true, fundo:true, paredes:true, esgoto:false, fix:false, orto:false, vista:'perspectiva',
};
let temProjetoLocal = false;   // havia projeto salvo neste aparelho ao abrir (sem ele, a nuvem abre o mais recente)
let localMaisNovo = false;     // a cópia do aparelho é de uma versão mais nova do programa: não abre e não é sobrescrita
let formatoConvertidoDe = 0;   // o projeto aberto veio de um formato antigo: a nuvem guarda o original antes de gravar por cima
try { const c = converterFormato(JSON.parse(localStorage.getItem(CHAVE)||'null')); if (c.erro === 'mais-novo') localMaisNovo = true; const s = c.projeto; if (c.convertido) formatoConvertidoDe = c.de; if (s && TIPOS[s.tipo] && s.parametros && (temProjetoLocal = true)) estado.projeto = { tipo:s.tipo, nome:s.nome||'Projeto', parametros:{ ...JSON.parse(JSON.stringify(TIPOS[s.tipo].padrao)), ...s.parametros }, codigo:s.codigo, orcamento:s.orcamento, liberacao:s.liberacao, conferencia:s.conferencia }; } catch(e) {}
const CHAVE_PRECOS = 'configurador-moveis:precos';
let precos = {}; try { precos = JSON.parse(localStorage.getItem(CHAVE_PRECOS) || '{}') || {}; } catch(e) {}
const salvarPrecos = () => { try { localStorage.setItem(CHAVE_PRECOS, JSON.stringify(precos)); } catch(e) {} };
// DESFAZER: cada gravação guarda a versão anterior do projeto (até 20); mudanças em menos de 0,8 s contam como uma (digitar um número)
const HIST = [], HIST_MAX = 20; let histUltimo = null, histT = 0, histPulando = false;
const salvarLocal = () => {
  const atual = JSON.stringify(estado.projeto);
  if (!histPulando && histUltimo !== null && atual !== histUltimo) {
    const agora = Date.now();
    if (!(HIST.length && agora - histT < 800)) { HIST.push(histUltimo); if (HIST.length > HIST_MAX) HIST.shift(); }
    histT = agora;
  }
  histUltimo = atual; histPulando = false; atualizarDesfazer();
  if (!localMaisNovo) try { localStorage.setItem(CHAVE, JSON.stringify({ ...estado.projeto, versao: FORMATO.versao })); } catch(e) {}
  mostrarNaoSalvo();
};
// AVISO "NÃO SALVO": compara o projeto com o último salvo de verdade (Drive ou .json, ou aberto de um arquivo).
// O salvamento automático do navegador pode se perder no app do Claude (ex.: quando o programa é atualizado), então o aviso fica até salvar.
const CHAVE_SALVO = 'configurador-moveis:ultimo-salvo';
let ultimoSalvo = null; try { ultimoSalvo = localStorage.getItem(CHAVE_SALVO); } catch(e) {}
// Com a nuvem do programa ligada, "salvo" quer dizer salvo nela (Drive e .json viram cópias extras e a nuvem salva logo em seguida)
function marcarSalvo(origem) {
  if (nuvemPronta() && origem !== 'nuvem') { agendarNuvem(0); return; }
  ultimoSalvo = JSON.stringify(estado.projeto); try { localStorage.setItem(CHAVE_SALVO, ultimoSalvo); } catch(e) {} mostrarNaoSalvo();
}
function mostrarNaoSalvo() {
  const b = document.getElementById('naoSalvo'), mudou = JSON.stringify(estado.projeto) !== ultimoSalvo;
  if (b) b.hidden = !mudou;
  if (mudou && nuvemPronta()) agendarNuvem();
}
function atualizarDesfazer() { const b = document.getElementById('btnDesfazer'); if (b) { b.disabled = !HIST.length; b.title = HIST.length ? `Desfazer (${HIST.length} guardada${HIST.length > 1 ? 's' : ''})` : 'Nada para desfazer'; } }
function desfazer() {
  if (!HIST.length) return;
  estado.projeto = JSON.parse(HIST.pop()); histPulando = true; histT = 0;
  estado.ocultas.clear(); carregarProjeto(); toast('Desfeito.');
}

const $ = id => document.getElementById(id);
const el = (tag, attrs={}, ...filhos) => { const e = document.createElement(tag); for (const [k,v] of Object.entries(attrs)) { if (k==='class') e.className=v; else if (k==='text') e.textContent=v; else if (k.startsWith('on')) e.addEventListener(k.slice(2),v); else if (v!==false && v!=null) e.setAttribute(k, v===true?'':v); } filhos.flat().forEach(f => f!=null && e.append(f)); return e; };
let toastT; const toast = msg => { const t=$('toast'); t.textContent=msg; t.hidden=false; clearTimeout(toastT); toastT=setTimeout(()=>t.hidden=true, 2600); };
