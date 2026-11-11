# Fase 0.6 — diagnóstico histórico e solução

Conferência em 11/11/2026, base `c58936f` (PR #1). **Diagnóstico da tentativa inicial; resolvido pela implementação abaixo.**

## Experimento e resultado

Somente as duas entradas `gerar` de `TIPOS` foram ligadas ao núcleo: converter os parâmetros com `moduloDeGabinete`/`moduloDeArmario`, gerar com `gerarModuloV3` e adaptar com `resultadoModulo`. Os geradores antigos continuaram no arquivo durante o diagnóstico, pois ele também contém funções compartilhadas. Nenhuma verificação de teste foi alterada.

O comando `npm run testar`, executado pelo npm portátil com Chromium 151.0.7922.34, terminou com **10 caso(s) mudaram.**, código de saída 1. Os dez casos de referência dos formulários reprovaram; o caso `nucleo-armario-misto` permaneceu igual. A primeira tentativa de execução parou por tempo esgotado na abertura da página; a segunda completou a suíte e produziu as diferenças abaixo.

Na tentativa inicial, a alteração experimental foi desfeita. A implementação posterior preserva esses resultados sem atualizar referências.

## Exemplos confirmados

Os exemplos de compras abaixo comparam os resultados completos dos geradores com os parâmetros padrão, não apenas a posição das peças na lista.

| Resultado | Formulário atual | Caminho direto pelo núcleo |
| --- | --- | --- |
| Gabinete: parafusos 4 × 50 | 60 | 70 |
| Gabinete: parafusos 3,5 × 14 | 80 | 68 |
| Gabinete: puxadores barra 128 na compra | 3 | Item ausente |
| Gabinete: silicone na compra | 1 | Item ausente |
| Armário: fundo | Uma peça de 1920 × 1800 mm | Duas peças de 1920 × 900 mm |
| Armário: suportes de vassoura na compra | 3 | Item ausente |
| Armário: gancho do aspirador na compra | 1 | Item ausente |
| Armário: parafusos 3,5 × 14 | 280 | 272 |
| Armário: cavilhas | 12 | 10 |

Também mudam a ordem e os identificadores das peças, nomes exibidos e mensagens. No caso `gabinete-1-porta-parede-esq`, desaparece o aviso de que o tampo sobra 200 mm além do móvel. No caso com três gavetas sem portas, muda o texto do erro de espaço insuficiente para a prateleira.

O teste contou 360 diferenças no gabinete padrão e 1244 no armário padrão. Esses números incluem diferenças causadas pela ordem dos elementos; não representam 360 ou 1244 defeitos geométricos.

## Por que a comparação anterior passava

Em `testes/rodar.js`, a comparação intitulada `NÚCLEO NOVO IGUAL` reúne as partes do fundo antes de comparar, desconsidera dobradiças e furos de caneco/calço e aceita que o núcleo use mais dobradiças. Ela compara uma seleção de propriedades geométricas, não o resultado completo apresentado pelo formulário. Isso é distinto da comparação integral com `testes/referencia/*.json`.

Portanto, a afirmação anterior do plano de que os testes já provavam igualdade suficiente para a substituição precisava ser corrigida.

## Trabalho necessário para concluir preservando comportamento

1. Definir a adaptação dos formulários para o núcleo mantendo as regras atuais de fundo, dobradiças e furação dos formulários, sem mudar o Móvel livre e o Ambiente.
2. Preservar identificação, ordem, nomes e demais dados usados nas listas, no plano de corte, no iLogic e nos desenhos. Não resolver isso modificando os resultados esperados.
3. Preservar os itens e as quantidades de compra, incluindo puxadores genéricos, silicone, suportes, ganchos e reservas de parafusos/cavilhas.
4. Preservar validações de entrada, avisos de instalação e medidas fornecidas à tela, inclusive faixa de esgoto e altura do tampo.
5. Mover `sapateiraEmbaixo`, `avisoSapateira` e `calcularFixacoes` para os respectivos assuntos do núcleo antes de remover `geradores.js`; outras partes já dependem dessas funções.
6. Conferir valores válidos e inválidos dos formulários e abertura de projetos antigos. Rodar a suíte completa e só concluir com **Todos os casos iguais à referência**.

## Reprodução local

- Log da tentativa completa: `.ferramentas-codex/testar-06-diagnostico.log`.
- Alteração experimental: `.ferramentas-codex/tentativa-06.patch` (não aplicada).
- Comparação direta dos resultados: `.ferramentas-codex/gabinete-comparacao.json` e `.ferramentas-codex/armario-comparacao.json`.
- Navegador: `PLAYWRIGHT_BROWSERS_PATH=.ferramentas-codex/navegadores-atuais`.
- Comando portátil: `node .ferramentas-codex/package/bin/npm-cli.js run testar`.

Os arquivos de diagnóstico locais ficam fora do Git. Nenhuma referência foi atualizada, nenhum novo PR foi aberto e nenhuma publicação foi feita nesta etapa.

## Solução concluída em 11/11/2026

Os formulários agora usam o núcleo para a geometria e adaptadores próprios para validação, apresentação e compras. Fundo inteiro e quantidade anterior de dobradiças são opções explícitas do contrato; as opções padrão do editor livre continuam iguais. A lista preserva silicone, suportes, ganchos, puxadores, reservas e a ordem antiga. A furação durante preenchimento inválido, a seleção de ventilação e o puxador de perfil também foram conferidos.

Sapateira e fixações foram extraídas sem mudança; geradores.js foi removido. A suíte completa terminou com **Todos os casos iguais à referência.** Nenhuma referência foi atualizada. O próximo passo é o 0.7; publicação permanece com Nathan pelo Claude.
