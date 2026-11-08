/* =====================================================================
   1. REGRAS DE MARCENARIA (mm) — valem para todos os tipos de móvel
   ===================================================================== */
const R = (({ _explicacao, ...r }) => r)(/*@dados:regras*/null);
// Puxadores reais (medidas do fabricante; "conf" = medida não publicada, estimada — confirmar na loja)
const PUXADORES = Object.fromEntries(Object.entries(/*@dados:puxadores*/null).map(([k, v]) => [k, { ...v, cor: parseInt(v.cor.slice(1), 16) }]));
const opcoesPuxador = Object.entries(PUXADORES).map(([k,v]) => [Number(k), v.rot]);
const dobradicasPorAltura = h => R.dobradicasPorAltura.find(f => f.ateAltura === null || h <= f.ateAltura).quantidade;
// REGRA DE DOBRADIÇA (núcleo novo): o maior entre altura, peso (Blum) e distância máxima (Duratex); +1 se a porta passa de 600 de largura
function dobradicasRegra(h, w, esp) {
  const peso = h * w * esp * R.densidade.mdf / 1e9, tab = R.dobradicasPorPeso, fPeso = tab.find(f => peso <= f.atePeso);
  const porDist = Math.ceil((h - 2*R.dobradicaBorda) / R.dobradicaDistMax) + 1;
  const n = Math.max(dobradicasPorAltura(h), fPeso ? fPeso.quantidade : tab.at(-1).quantidade + 1, porDist, 2) + (w > R.dobradicaLarguraExtra ? 1 : 0);
  return { n, peso, acimaTabela: !fPeso };
}

const MATERIAIS = /*@dados:materiais*/null;
/* =====================================================================
   1b. BIBLIOTECA — chapas e ferragens reais (como os catálogos do Promob).
   Cada item: o que é, marca/código, unidade e embalagem de compra, dados técnicos
   que o gerador usa e o nome do modelo 3D na biblioteca do Blender.
   Preços não vêm daqui: o Nathan preenche na lista de compras.
   ===================================================================== */
const BIBLIOTECA = /*@dados:biblioteca*/null;
const METODOS_CONSTRUCAO = /*@dados:metodos-construcao*/null;

/* =====================================================================
   1c. FUNÇÃO (PAPEL) DE CADA PEÇA — definida num lugar só.
   Orientação no Inventor, contagens de ferragem e fixações usam o papel, nunca o nome da peça.
   ===================================================================== */
const PAPEIS = [   // [expressão do id, papel] — o lado (esq/dir) vem do próprio id quando existir
  [/^lateral-(esq|dir)$/, 'lateral'], [/^topo$/, 'topo'], [/^base$/, 'base'],
  [/^divisoria(-h-\d+)?$/, 'divisoria'], [/^divisoria-v-\d+$/, 'divisoria-vertical'],
  [/^travessa-(frontal|traseira)$/, 'travessa'], [/^travessa-fixacao(-\d+)?$/, 'travessa-fixacao'],
  [/^rodape-(frontal|traseiro|encaixe)$/, 'rodape'], [/^fundo(-\d+)?$/, 'fundo'], [/^pe-regulavel-\d+$/, 'pe'], [/^perfil-h-fundo-\d+$/, 'emenda-fundo'], [/^ponto-\d+$/, 'ponto'], [/^peca-teste$/, 'teste'],
  [/^prateleira-\d+(-\d+)?$/, 'prateleira'], [/^prateleira-fixa-\d+$/, 'prateleira-fixa'],
  [/^reforco-/, 'reforco'], [/^beiral-frontal$/, 'beiral-frontal'], [/^beiral-(esq|dir)$/, 'beiral-lateral'],
  [/^enchimento-(esq|dir)$/, 'enchimento'], [/^sarrafo-(esq|dir)$/, 'sarrafo'], [/^espacador-\d+$/, 'espacador'],
  [/^porta-(esq|dir|\d+)$/, 'porta'], [/^porta-correr-\d+$/, 'porta-correr'], [/^porta-basculante-\d+$/, 'porta-basculante'],
  [/-kit-correr$/, 'kit-correr'], [/-desempenador-\d+$/, 'desempenador'], [/^trilho-(superior|inferior)-\d+$/, 'trilho-correr'], [/-pistao-\d+$/, 'pistao'], [/^gaveta-\d+-frente$/, 'frente-gaveta'],
  [/^gaveta-\d+-frente-interna$/, 'frente-interna-gaveta'], [/^gaveta-\d+-traseira$/, 'traseira-gaveta'],
  [/^gaveta-\d+-lateral-(esq|dir)$/, 'lateral-gaveta'], [/^gaveta-\d+-fundo$/, 'fundo-gaveta'],
  [/-dobradica-\d+$/, 'dobradica'], [/-puxador$/, 'puxador'], [/-corredica-(esq|dir)$/, 'corredica'],
  [/-suporte-\d+$/, 'suporte-vassoura'], [/^minifix-/, 'minifix'], [/^cavilha-/, 'cavilha'], [/-gancho$/, 'gancho'], [/^botijao-/, 'botijao'], [/^tampo$/, 'tampo'],
];
function papelDe(id) {
  for (const [re, papel] of PAPEIS) if (re.test(id)) { const m = id.match(/(?:^|-)(esq|dir)(?:-|$)/); return { papel, lado: m && papel !== 'porta' && papel !== 'dobradica' && papel !== 'puxador' ? m[1] : null }; }
  return { papel: null, lado: null };
}
// Orientação da peça no Inventor (eixo da largura do desenho, eixo da altura do desenho), por papel
const ORIENTACAO = {
  'lateral:esq': ['-z','+y'], 'lateral:dir': ['+z','+y'],
  'porta': ['-x','+y'], 'porta-correr': ['-x','+y'], 'porta-basculante': ['-x','+y'], 'frente-gaveta': ['-x','+y'], 'fundo': ['-x','+y'],
  'divisoria-vertical': ['-z','+y'], 'espacador': ['-z','+y'], 'beiral-lateral': ['-z','+y'],
  'rodape': ['+x','+y'], 'travessa-fixacao': ['+x','+y'], 'beiral-frontal': ['+x','+y'],
  'frente-interna-gaveta': ['+x','+y'], 'traseira-gaveta': ['+x','+y'], 'enchimento': ['+x','+y'],
  'lateral-gaveta:esq': ['+z','+y'], 'lateral-gaveta:dir': ['-z','+y'], 'sarrafo': ['+z','+y'],
};
const chapasDe = (mat, esp) => Object.entries(BIBLIOTECA).filter(([,b]) => b.unid==='chapa' && b.mat===mat && b.esp===esp).map(([k]) => k);
const chapaDe = (mat, esp) => chapasDe(mat, esp)[0] || null;

const CATS = { caixa:'Caixa', enchimento:'Enchimento', frente:'Frentes', gaveta:'Caixa das gavetas', fundo:'Fundo', ferragem:'Ferragens', tampo:'Tampo', referencia:'Referência (não fabricar)' };

const fmt = v => { const r = Math.round(v*10)/10; return Number.isInteger(r) ? String(r) : r.toFixed(1).replace('.', ','); };
const fitaTxt = f => { const s = []; if (f[0]) s.push(f[0]+'C'); if (f[1]) s.push(f[1]+'L'); return s.length ? s.join(' ') : '—'; };

