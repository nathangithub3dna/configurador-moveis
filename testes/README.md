# Conferências por área

`npm run testar` executa todas as áreas e continua obrigatório antes de qualquer commit. Só a execução completa pode terminar com **Todos os casos iguais à referência.**

Durante uma alteração, use por exemplo:

- `npm run testar -- editor`: ações do editor.
- `npm run testar -- gabinete`: referências dos gabinetes.
- `npm run testar -- armario`: referências dos armários.
- `npm run testar -- ambiente offline`: ambiente e arquivo sem internet.
- `npm run testar -- --listar`: áreas disponíveis.

Filtros terminam com uma mensagem de conferência parcial. Nome desconhecido falha; não é interpretado como uma área sem casos. Guarda-roupa ainda não tem um grupo próprio. Os dez formulários existentes ficam em referencia, com filtros gabinete/armario.

Cada arquivo em casos/ exporta id, descricao e executar. Cadastre novas áreas na lista de apoio/selecao.js; todas são incluídas na execução sem filtros. Cada área recebe seu próprio contexto de navegador. Ambiente mantém juntos os cenários encadeados de cozinha, loja, desenhos, orçamento e exportação.

`node --test testes/selecao.test.js` confere a seleção de áreas sem abrir navegador.

As referências existentes não foram alteradas. Referência ausente agora provoca falha, em vez de ser criada durante uma conferência comum. Atualizá-las exige autorização de Nathan e o comando específico já existente; filtros de atualização são recusados.
