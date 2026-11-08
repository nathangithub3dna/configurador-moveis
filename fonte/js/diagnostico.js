/* =====================================================================
   DIAGNÓSTICO DE CARREGAMENTO — script comum (não é módulo), roda antes de tudo.
   Se o programa não terminar de iniciar em 10 s (window.__configurador não existe),
   mostra no topo da tela o motivo: erros, scripts que falharam, se o navegador aceita
   importmap e WebGL. Serve para descobrir por que algo não abre num aparelho (ex.: app do Claude no celular).
   Quando o programa abre normalmente, não aparece nada.
   ===================================================================== */
(function () {
  var t0 = Date.now(), erros = [];
  function anota(txt) { if (erros.length < 12 && erros.indexOf(txt) < 0) erros.push('[' + ((Date.now() - t0) / 1000).toFixed(1) + ' s] ' + txt); }
  window.addEventListener('error', function (e) {
    var alvo = e.target;
    if (alvo && alvo !== window && alvo.tagName) anota('Não carregou ' + alvo.tagName.toLowerCase() + ': ' + (alvo.src || alvo.href || alvo.type || '(sem endereço)'));
    else anota((e.message || 'erro') + (e.filename ? ' — ' + e.filename.slice(-60) + ':' + e.lineno : ''));
  }, true);
  window.addEventListener('unhandledrejection', function (e) { anota('Promessa: ' + (e.reason && (e.reason.message || e.reason) || '?')); });
  function suporte() {
    var gl = false; try { var c = document.createElement('canvas'); gl = !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (x) {}
    var im = typeof HTMLScriptElement !== 'undefined' && HTMLScriptElement.supports ? HTMLScriptElement.supports('importmap') : 'não sei';
    var scripts = [].map.call(document.scripts, function (s) { return (s.type || 'comum') + (s.src ? ' ' + s.src.replace(/^https?:\/\//, '').slice(0, 60) : ' (no próprio arquivo)'); });
    return ['importmap: ' + im, 'WebGL: ' + (gl ? 'sim' : 'NÃO'), '3D carregado: ' + (window.__configurador ? 'sim' : 'não'),
      'jsPDF: ' + (window.jspdf ? 'sim' : 'não') + ' · JSZip: ' + (window.JSZip ? 'sim' : 'não'),
      'Navegador: ' + navigator.userAgent, 'Scripts na página (em ordem): ' + scripts.join(' | ')];
  }
  setTimeout(function () {
    if (window.__configurador) return;
    var caixa = document.createElement('div');
    caixa.className = 'diag-carga';
    caixa.setAttribute('role', 'alert');
    var texto = ['O programa não terminou de abrir neste aparelho.', '', 'Erros:'].concat(erros.length ? erros : ['(nenhum erro registrado)'], ['', 'Aparelho:'], suporte()).join('\n');
    var tit = document.createElement('strong'); tit.textContent = 'Diagnóstico: o programa não abriu';
    var pre = document.createElement('pre'); pre.textContent = texto;
    var bt = document.createElement('button'); bt.type = 'button'; bt.className = 'btn'; bt.textContent = 'Copiar o diagnóstico';
    bt.onclick = function () { try { navigator.clipboard.writeText(texto).then(function () { bt.textContent = 'Copiado'; }); } catch (x) { bt.textContent = 'Não deu para copiar: tire um print'; } };
    caixa.appendChild(tit); caixa.appendChild(pre); caixa.appendChild(bt);
    document.body.insertBefore(caixa, document.body.firstChild);
  }, 10000);
})();
