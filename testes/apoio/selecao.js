const areas = ['referencia', 'nucleo', 'editor', 'ambiente', 'livres', 'livres-tela', 'ajustes', 'offline', 'reabrir', 'formato', 'interface'];
function selecionar(args) {
  const atualizar = args.includes('--atualizar');
  const listar = args.includes('--listar') || args.includes('--ajuda');
  const nomes = [...new Set(args.filter(a => !['--atualizar', '--listar', '--ajuda'].includes(a)))];
  for (const nome of nomes) if (![...areas, 'gabinete', 'armario'].includes(nome)) throw new Error('Área desconhecida: ' + nome + '. Use --listar para consultar as opções.');
  if (atualizar && (nomes.length || listar)) throw new Error('A atualização de referência exige a suíte completa, sem filtros.');
  const selecionadas = nomes.length ? areas.filter(a => nomes.includes(a) || (a === 'referencia' && nomes.some(n => ['gabinete', 'armario'].includes(n)))) : [...areas];
  const tipos = nomes.filter(n => ['gabinete', 'armario'].includes(n));
  const tipoFormulario = !nomes.includes('referencia') && tipos.length === 1 ? tipos[0] : undefined;
  return { atualizar, listar, selecionadas, tipoFormulario, parcial: nomes.length > 0 };
}
module.exports = { areas, selecionar };
