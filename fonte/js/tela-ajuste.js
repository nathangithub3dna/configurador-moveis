/* =====================================================================
   PASSO 1c. AJUSTE POR PEÇA — tela. Em qualquer módulo (móvel livre ou módulo do ambiente):
   - na ficha da peça clicada no 3D: desligar a peça, mudar a medida dela ou voltar à regra;
   - no editor do módulo: lista das peças ajustadas (inclusive as desligadas, que somem do 3D).
   Lógica em nucleo.js (aplicarAjustesPecas); estrutura em pagina.html (tplAjuste*); aparência em estilos/ajuste.css.
   ===================================================================== */
const EIXOS_TELA = {
  x: { rot:'Largura',      fixos:[['ini','fica a esquerda'], ['fim','fica a direita'], ['centro','cresce dos dois lados']] },
  y: { rot:'Altura',       fixos:[['ini','fica embaixo'],     ['fim','fica em cima'],    ['centro','cresce dos dois lados']] },
  z: { rot:'Profundidade', fixos:[['ini','fica atrás'],       ['fim','fica na frente'],  ['centro','cresce dos dois lados']] },
};
const PAPEIS_COM_FUROS_PROPRIOS = ['travessa-fixacao'];   // furos nascem com a peça: mudar a medida deixaria a furação errada

// de quem é a peça: o módulo (dados), o id dentro dele e, no ambiente, o módulo posicionado
function donoDaPeca(pc) {
  const T = TIPOS[estado.projeto.tipo], p = estado.projeto.parametros;
  if (!pc || pc.cat === 'livre') return null;
  if (T.editor === 'modulo') return { m: p, idLocal: pc.id, mod: null };
  if (T.editor === 'ambiente' && pc.modulo !== undefined && p.modulos?.[pc.modulo]) return { m: p.modulos[pc.modulo].modulo, idLocal: pc.id.replace(/^M\d+-/, ''), mod: p.modulos[pc.modulo] };
  return null;
}
// medidas da peça nos eixos do próprio módulo (no ambiente, a parede B troca largura e profundidade)
function medidasLocais(pc, mod) {
  const b = pc.box, ext = [b[1] - b[0], b[3] - b[2], b[5] - b[4]];
  return mod && mod.parede === 1 ? { x: ext[2], y: ext[1], z: ext[0] } : { x: ext[0], y: ext[1], z: ext[2] };
}
function podeMudarMedida(pc) {
  return !['ferragem', 'referencia', 'tampo', 'frente', 'gaveta'].includes(pc.cat) && !pc.mov && pc.forma?.tipo !== 'recorte' && !PAPEIS_COM_FUROS_PROPRIOS.includes(pc.papel);
}
const nomeSemModulo = pc => pc.nome.replace(/^M\d+ · /, '');

function preencherAjustePeca(pc) {
  const caixa = $('fAjuste'), dono = donoDaPeca(pc);
  if (!dono) { caixa.replaceChildren(); return; }
  const aj = dono.m.pecasAjuste?.[dono.idLocal], med = medidasLocais(pc, dono.mod);
  const eixos = podeMudarMedida(pc) ? Object.keys(EIXOS_TELA).filter(k => Math.abs(med[k] - pc.esp) > 0.01) : [];
  if (eixos.length === 3) eixos.splice(eixos.findIndex(k => med[k] === Math.min(...eixos.map(q => med[q]))), 1);   // a menor é a espessura
  const t = modeloDe('tplAjustePeca');
  preencherModelo(t, { mede: eixos.length > 0, ajustada: !!aj, situacao: aj?.medidas ? '· medida mudada' : '',
    nota: eixos.length ? 'Escolha o que fica no lugar quando a medida mudar. O resto do móvel continua seguindo a regra.'
      : pc.cat === 'ferragem' ? 'Ferragem: só dá para desligar.' : 'Esta peça não muda de medida por aqui (porta, gaveta ou peça com furos próprios): mude o vão ou o módulo.' });
  t.querySelector('.aj-medidas').replaceChildren(...eixos.map(k => {
    const l = modeloDe('tplAjusteMedida'), inp = l.querySelector('[data-aj-valor]'), sel = l.querySelector('[data-aj-fixo]');
    preencherModelo(l, { rot: EIXOS_TELA[k].rot });
    inp.value = Math.round(med[k] * 10) / 10; inp.dataset.eixo = k; inp.dataset.atual = med[k];
    sel.replaceChildren(...EIXOS_TELA[k].fixos.map(([v, r]) => el('option', { value: v }, r))); sel.dataset.eixo = k;
    sel.value = aj?.medidas?.[k]?.fixo || 'ini';
    return l;
  }));
  caixa.replaceChildren(t);
}

function mudarAjustes(m, fn) { m.pecasAjuste = { ...(m.pecasAjuste || {}) }; fn(m.pecasAjuste); if (!Object.keys(m.pecasAjuste).length) delete m.pecasAjuste; montarFormulario(); atualizar(); }

$('fAjuste').addEventListener('click', e => {
  const b = e.target.closest('[data-aj]'); if (!b) return;
  const pc = nos.get(estado.sel)?.pc, dono = donoDaPeca(pc); if (!dono) return;
  const { m, idLocal } = dono, nome = nomeSemModulo(pc), a = b.dataset.aj;
  if (a === 'desligar') {
    mudarAjustes(m, aj => { aj[idLocal] = { nome, desligar: true }; });
    toast(dono.mod ? 'Peça desligada. Para trazer de volta: "Abrir" o módulo → Peças ajustadas.' : 'Peça desligada. Para trazer de volta: Peças ajustadas, no painel.');
  }
  if (a === 'voltar') mudarAjustes(m, aj => { delete aj[idLocal]; });
  if (a === 'aplicar') {
    const atual = m.pecasAjuste?.[idLocal]?.medidas || {}, medidas = { ...atual };
    let mudou = false;
    $('fAjuste').querySelectorAll('[data-aj-valor]').forEach(inp => {
      const k = inp.dataset.eixo, v = Number(String(inp.value).replace(',', '.')), fixo = $('fAjuste').querySelector(`[data-aj-fixo][data-eixo="${k}"]`).value;
      if (Math.abs(v - Number(inp.dataset.atual)) > 0.01 || atual[k]) { medidas[k] = { valor: v, fixo }; mudou = true; }
    });
    if (!mudou) { toast('A medida é a mesma: nada mudou.'); return; }
    mudarAjustes(m, aj => { aj[idLocal] = { nome, medidas }; });
  }
});

// lista no editor do módulo: tudo o que foi ajustado, com "voltar à regra"
function preencherAjustesEditor(ed, m) {
  const lista = Object.entries(m.pecasAjuste || {});
  const desc = aj => aj.desligar ? 'desligada' : Object.entries(aj.medidas || {}).map(([k, v]) => `${EIXOS_TELA[k]?.rot.toLowerCase() || k} ${fmt(v.valor)} mm (${EIXOS_TELA[k]?.fixos.find(f => f[0] === v.fixo)?.[1] || ''})`).join(', ');
  ed.querySelector('[data-lista="ajustes"]').replaceChildren(...lista.map(([id, aj]) => {
    const li = modeloDe('tplAjusteItem'); preencherModelo(li, { nome: aj.nome || id, desc: desc(aj) });
    li.querySelector('button').dataset.id = id; return li;
  }));
  ed.querySelector('[data-texto="notaAjustes"]').textContent = lista.length ? '' : 'Nenhuma. Para desligar uma peça ou mudar a medida dela: no 3D, toque na peça.';
}
$('form').addEventListener('click', e => {
  const b = e.target.closest('[data-acao="ajuste-voltar"]'); if (!b || !ehModulo()) return;
  mudarAjustes(moduloEmEdicao(), aj => { delete aj[b.dataset.id]; });
});
