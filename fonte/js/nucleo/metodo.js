// MÉTODO DE CONSTRUÇÃO — níveis: padrão → método com nome → ajustes do projeto → ajustes do módulo
const unirFundo = (a, b) => { const r = { ...a }; for (const [k, v] of Object.entries(b || {})) r[k] = (v && typeof v === 'object' && !Array.isArray(v) && typeof r[k] === 'object') ? unirFundo(r[k], v) : v; return r; };
function resolverMetodo(m) {
  const cat = METODOS_CONSTRUCAO, nome = m.metodo || cat.metodoPadrao;
  if (!cat.metodos[nome]) throw new Error(`Método de construção "${nome}" não existe no catálogo.`);
  const origem = {};
  let c = unirFundo({}, cat.padrao); Object.keys(c).forEach(k => origem[k] = 'padrão');
  for (const [nivel, aj] of [[`método "${cat.metodos[nome].nome}"`, cat.metodos[nome].ajustes], ['projeto', m.metodoProjeto], ['módulo', m.metodoAjustes]])
    if (aj) { c = unirFundo(c, aj); Object.keys(aj).forEach(k => origem[k] = nivel); }
  c = { ...c, ...m.construcao };                 // medidas próprias do módulo (espessuras, paredes, tampo…)
  c.origem = origem;
  return c;
}
