const { test } = require('node:test');
const assert = require('node:assert/strict');
const { areas, selecionar } = require('./apoio/selecao');
test('sem filtros inclui todas as áreas', () => assert.deepEqual(selecionar([]).selecionadas, areas));
test('filtros combinam e não repetem áreas', () => {
  const r = selecionar(['editor', 'gabinete', 'editor']);
  assert.deepEqual(r.selecionadas, ['referencia', 'editor']);
  assert.equal(r.tipoFormulario, 'gabinete'); assert.equal(r.parcial, true);
});
test('referencia ou os dois tipos executam todos os formulários', () => {
  assert.equal(selecionar(['gabinete', 'armario']).tipoFormulario, undefined);
  assert.equal(selecionar(['referencia', 'gabinete']).tipoFormulario, undefined);
});
test('erro de digitação não dá sucesso sem executar casos', () => {
  assert.throws(() => selecionar(['editro']), /Área desconhecida/);
  assert.throws(() => selecionar(['--inexistente']), /Área desconhecida/);
});
test('atualização parcial de referência é recusada antes de executar', () => {
  assert.throws(() => selecionar(['--atualizar', 'editor']), /suíte completa/);
  assert.throws(() => selecionar(['--atualizar', '--listar']), /suíte completa/);
});
