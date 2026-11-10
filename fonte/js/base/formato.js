/* =====================================================================
   FORMATO DO PROJETO SALVO — número da versão + conversores passo a passo
   Todo projeto que abre (cópia do aparelho, .json, Drive, nuvem) passa por converterFormato().
   - Projeto sem número de formato = formato 1 (tudo o que foi salvo até 10/11/2026).
   - Mudou o jeito de guardar o projeto (ex.: paredes em U, vários ambientes)? Aumente FORMATO.versao
     e acrescente FORMATO.conversores[n]: recebe o projeto no formato n e devolve no formato n+1.
   - O conversor trabalha numa cópia: o original nunca é alterado. Na nuvem, a primeira gravação depois
     de uma conversão guarda o original à parte (tela.js, salvarNuvem); Drive e .json sempre criam arquivo novo.
   - Projeto de formato mais novo que este programa: não abre (abriria pela metade e perderia o que não entende).
   ===================================================================== */
const FORMATO = { versao: 1, conversores: {} };
function converterFormato(d) {
  const de = Number.isInteger(d?.versao) && d.versao >= 1 ? d.versao : 1;
  if (de > FORMATO.versao) return { erro: 'mais-novo', de };
  let p = JSON.parse(JSON.stringify(d));
  for (let v = de; v < FORMATO.versao; v++) {
    const conv = FORMATO.conversores[v];
    if (typeof conv !== 'function') return { erro: 'sem-conversor', de };
    p = conv(p); p.versao = v + 1;
  }
  return { projeto: p, de, convertido: de < FORMATO.versao };
}
const AVISO_FORMATO_NOVO = 'Este projeto foi salvo por uma versão mais nova do programa. Abra pelo link do Claude (a versão atualizada); nada foi alterado.';
