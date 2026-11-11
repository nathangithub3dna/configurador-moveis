# Passagem — Configurador de Móveis — 10/11/2026 13:05

## Item 29 — altura do puxador (11/11/2026)

Campo opcional para altura do centro do puxador, desde a base do módulo, nas portas de giro do vão ou da fachada. Vazio herda o padrão. Reaproveita os limites e a furação existentes; outras portas e puxadores internos não mudam. Perfil de borda e outras frentes não exibem nem aplicam esse ajuste. Aplicar modelo a todos continua preservando as alturas individuais. Formato 4, conversor de identidade preserva projetos anteriores. Teste direcionado passou: isolamento, retorno ao padrão, conjunto e reabertura. Validação completa: npm run testar terminou com Todos os casos iguais à referência., saída 0 (.ferramentas-codex/altura-completo.log). Referências intactas. Próximo: sem puxador/fecho toque (item 29 ainda parcial). Não publicar; PR continua pendente de autorização.

## Item 29 — aplicar puxador a todos (11/11/2026)

Próxima etapa autorizada por Nathan: botão abaixo do modelo de puxador repete a escolha em todos os vãos do módulo aberto, incluindo a fachada ativa. A opção de usar o padrão remove as escolhas individuais. Posições, alturas, frentes e conteúdos permanecem como estavam; outros módulos do Ambiente não são alterados. Usa o salvamento e Desfazer existentes. Item 29 continua parcial: faltam altura e sem puxador/fecho toque. 0.9 continua pendente de atualizar o roteiro externo para o fluxo atual. Não publicar nem abrir PR enquanto a confirmação anterior estiver pendente.

Diagnóstico anterior com JSON privado: uma largura fixa consumia o espaço do vão vizinho, impedindo a miniatura. Foi entregue uma cópia corrigida fora do repositório; nenhum projeto de cliente foi incluído no Git. A correção 78 protege contra falhas de peças, mas não torna válidas medidas incompatíveis.

Validação concluída: npm run testar terminou com Todos os casos iguais à referência., código 0 (log local .ferramentas-codex/testar-puxador-todos-final.log). Testes cobrem aplicação nas portas, retorno ao padrão, preservação dos parâmetros, Desfazer, fachada e reabertura. Referências intactas. Botão conferido visualmente no offline.


## Correção 78 — seletor não virar lista por erro de peças (11/11/2026)

Nathan mostrou a miniatura substituída por botões numerados. O editor dependia do resultado completo das peças para posicionar os vãos, descartando o desenho quando esse cálculo falhava. Agora usa somente a geometria da árvore, compartilhando a mesma região inicial e percurso do núcleo; erros nas peças continuam aparecendo, mas não retiram o seletor espacial. Mantida a organização do pedido 77. Teste com divisões novas e puxador inválido verifica desenho, posições, contagem e recuperação, além da igualdade da geometria com a geração normal. Validação completa: npm run testar terminou com Todos os casos iguais à referência., código 0 (.ferramentas-codex/testar-mini-espacial.log). O mesmo teste falha no desenho contra a versão anterior de HEAD; miniatura e ordem dos campos conferidas visualmente. Não houve acesso ao JSON real do Nathan; o teste usa projeto sintético de sete vãos.


## Pedido 77 — ordem dos campos (11/11/2026)

Dimensões do vão movidas para logo abaixo do esquema de seleção (antes de juntar/dividir). Portas e interior reunido ao bloco de escolha de frentes e conteúdos, em todos os modos de fechamento. Apenas reorganização do template; valores, seletores e ações preservados. HTML normal/offline regenerados. Validação: npm run testar terminou com Todos os casos iguais à referência., código 0. Log local .ferramentas-codex/testar-ordem-painel.log. Referências intactas.


## Pedido 76 — portas só sobre os vãos marcados (11/11/2026)

Nathan esclareceu que o conjunto é 2 + 4 + 5, e não o móvel inteiro. Em Portas e interior, escolher Só os vãos marcados e marcar esses três vãos. As outras frentes continuam próprias; selecionar um vão marcado permite editar as portas do conjunto, selecionar um fora dele permite editar sua frente individual.

O interior não é refeito. A seleção fica em cada folha (fecharEmConjunto), acompanhando a cópia ao dividir e a reconstrução ao juntar. O núcleo lê a geometria existente sem emitir peças e valida que as faces escolhidas formem um retângulo completo; seleção vazia ou com buracos gera erro. Por enquanto há um conjunto compartilhado por módulo; o fechamento inteiro e por vão continuam disponíveis. Formato salvo 3 preserva os projetos anteriores e impede versões antigas de tratar uma seleção como o móvel inteiro.

Teste reproduz sete vãos, marca 2+4+5 pela tela, confere duas portas no conjunto, quatro portas externas preservadas, interior igual, seleção incompleta bloqueada e JSON. Validação: npm run testar terminou com Todos os casos iguais à referência., código 0. Log local .ferramentas-codex/testar-grupo-portas.log. Referências intactas. Não publicar e não tentar abrir PR enquanto a confirmação anterior estiver pendente. O lote do plano continua nas pendências 0.9 e 29.


## Correção 75 — abertura com medidas ajustadas (11/11/2026)

Nathan encontrou erro EIXOS_TELA antes da inicialização ao abrir o offline com um projeto salvo. O início montava a lista de ajustes antes de inicializar as constantes do painel. Inclusão de tela/paineis/ajuste.js movida para antes de tela/inicio.js; não muda peças nem apaga projetos. Teste reabrir agora salva um móvel com lateral ajustada e fechamento independente, recarrega e compara parâmetros, medida e texto do painel. Arquivos normal/offline regenerados. Validação: npm run testar terminou com Todos os casos iguais à referência., código 0, incluindo moduloComMedidaAjustada: ok. Log local .ferramentas-codex/testar-abertura-ajustes.log. PR do pedido 74 segue sem abertura: a revisão automática confundiu PR com publicação; não tentar novamente sem a resposta de Nathan. Próximo trabalho planejado continua nas pendências 0.9 e 29.


## Pedido 74 — portas independentes do interior (11/11/2026)

Nathan pediu duas portas inteiras cobrindo também a sapateira inferior, mantendo os dois espaços superiores. Pediu pesquisar outros programas antes de decidir. Pesquisa e decisão em docs/portas-interior.md.

- Implementado no Móvel livre e no editor do módulo do Ambiente: Portas e interior → Fechamento → Portas independentes do interior. Começa com 2 portas. A frente do módulo fica separada da árvore interna; dividir/juntar não corta as portas. Voltar a Portas por vão recupera as frentes guardadas nos vãos.
- Esta etapa cobre o módulo inteiro, não grupos arbitrários de vãos. Registros de frente declaram suporte ao fechamento inteiro. Gavetas externas antigas geram erro orientando escolher gavetas internas; correr com gavetas internas exige resolver o acesso antes de fabricar. Espaçadores seguem os lados com dobradiças, inclusive ambos no vão largo.
- HTML normal e offline gerados. Projeto aberto do Nathan não foi modificado automaticamente. Referências não foram atualizadas; publicação continua com Nathan.
- Testes novos: reprodução da sapateira, preservação do interior, divisão e junção, redimensionamento, retorno ao modo anterior, JSON, identificação de peças e conflitos. Validação final: npm run testar terminou com **Todos os casos iguais à referência.**, código 0. Log local .ferramentas-codex/testar-fachada-final.log. Formato do projeto atualizado para 2 com preservação dos dados antigos e recusa pelos programas anteriores.
- Onde parou: pedido 74 implementado na branch codex/portas-interior-independentes, baseada no PR #5. Próximo: retomar as pendências 0.9 e item 29 do lote abaixo. O lote das dez mudanças não está concluído.


## Pedido 73 — fonte escolhida (11/11/2026)

Nathan escolheu a opção 2 dos três protótipos: Manrope nas letras e nos números. Aplicada nas variáveis do tema e embutida em fonte/fontes/manrope.css, com licença SIL OFL preservada, para funcionar também sem internet. Números de medidas usam alinhamento tabular. HTML normal e offline regenerados.

A skill configurador-moveis agora está disponível em C:/Users/NATHAN.OLIVEIRA/.codex/skills/configurador-moveis/SKILL.md; foi lida. Seu roteiro é da nuvem do Claude, mas esta sessão já tem autorização para trabalhar na cópia local/offline. Não publicar. As dez mudanças autorizadas continuam pendentes conforme o registro abaixo; não declarar o lote concluído.


## Lote autorizado por Nathan — 11/11/2026

Nathan autorizou as próximas dez mudanças listadas na conversa. Não pedir autorização novamente para esse escopo; seguir a ordem do plano. Este registro não declara o lote inteiro concluído.

- 0.8: corrigido o caminho de seleção ao dividir, cabeçalho responsivo e movimento de correr/basculantes da parede B (incluindo abertura para baixo). Não muda peças, listas nem compras.
- 0.9: arquitetura, CLAUDE.md e AGENTS.md atualizados para os caminhos atuais. Skill externa do Claude não está no repositório; foi solicitado a Nathan onde encontrá-la. Etapa ainda não concluída.
- Item 29 parcialmente implementado: modelo de puxador por vão, com opção de herdar o padrão do móvel. A escolha fica no nó do vão e é copiada ao dividir, preservada no JSON e afeta apenas suas frentes/conteúdos. Restam as opções mais amplas do plano: aplicar a todos, altura e sem puxador/fecho toque.
- Testes de regressão em testes/casos/interface.js: cabeçalho em 320/375/768 px, correr e basculantes na parede B, escolha independente de puxador e retorno ao padrão. editor.js verifica a seleção logo após dividir.
- Próximos após fechar 0.9 e 29: item 19 (prateleiras/dupla divisória), 13 (cabideiro/maleiro/calceiro), 30 (gavetas), 25 (recobrimentos), 14 (modelos), 7 (pontos), 17 (limites). Não iniciados. Aprovação da 1c-i continua registrada como pendência de conferência do Nathan, não como teste de software.
- Não publicar; Nathan publica pelo Claude. Nunca atualizar referências sem perguntar.


## Fase 0.7 — concluída em 11/11/2026

- Testes separados em dez áreas em testes/casos/. Comando completo preservado; filtros como npm run testar -- editor ou gabinete conferem só a área escolhida e avisam que a conferência é parcial. --listar mostra as opções. Guarda-roupa ainda não possui casos próprios.
- Mesmas entradas e verificações; cada área abre um contexto independente. Ambiente mantém juntos os cenários encadeados. Referência ausente causa falha, sem criar padrão automaticamente. Nenhuma referência alterada.
- Validação: npm run testar terminou com **Todos os casos iguais à referência.**, saída 0; filtro gabinete passou com quatro casos; cinco testes da seleção passaram. Logs locais: .ferramentas-codex/testar-07.log e testar-07-filtro.log.
- Inclui o pedido 72 pendente: Espaços → Juntar com o vizinho → Dividir em mais espaços → campos do vão. HTML normal e offline regenerados e conferidos na suíte completa.
- **Onde parou:** 0.7 concluído na branch codex/fase-0-7, baseada em codex/conteudos-separados (PR #3).
- **Próximo:** 0.8 — barra superior no celular, manter o vão escolhido ao dividir e animação das frentes de correr/basculante na parede B. Não iniciado. Não publicar; Nathan publica pelo Claude.


## Pedido 72 — juntar perto dos espaços (11/11/2026)

- A ordem solicitada por Nathan é: Espaços → Juntar com o vizinho → Dividir em mais espaços → campos do vão. Mesmas ações e critérios para mostrar os vizinhos; apenas os blocos do template mudaram de posição.
- Validação: `npm run testar` terminou com **Todos os casos iguais à referência.**, saída 0, incluindo juntar espaços pela tela. Referências intactas. Log local: `.ferramentas-codex/testar-juntar.log`. Esta alteração está no arquivo local; ainda não foi acrescentada ao PR #3.
- Ajuste posterior: dividir foi movido para abaixo de juntar; montagem normal/offline e ordem do template conferidas. A suíte completa acima refere-se à mudança anterior de juntar. Próximo passo da Fase 0 continua sendo 0.7; não iniciado. Publicação continua com Nathan pelo Claude.

## Pedido 71 — conteúdos separados no editor (11/11/2026)

- Nathan pediu e confirmou três opções separadas: **Vassoura e aspirador**, **Sapateira** e **Botijão**, retirando os botões dos conjuntos. Aplicado ao editor do Móvel livre e ao módulo aberto dentro do Ambiente.
- Sapateira independente ocupa o vão sem reservar 1,2 m para vassouras; altura dos níveis e quantidade são ajustáveis, com máximo automático. Botijão usa seu conteúdo existente, com tampo e verificações de ventilação, sem acrescentar gavetas.
- Projetos antigos não são convertidos nem perdem conteúdo: os conjuntos continuam reconhecidos, com campos de edição e aviso de que uma nova escolha substitui o conjunto. Eles não aparecem como botões para novas escolhas. Os formulários legados e os modelos existentes conservam os resultados anteriores.
- Conteúdo novo registrado em `nucleo/conteudos/sapateira.js`; o núcleo não ganhou ramificação por tipo. Novas peças usam o papel de prateleira já existente.
- `npm run testar`: **Todos os casos iguais à referência.** Nenhuma referência atualizada. HTML normal e offline regenerados. Log: `.ferramentas-codex/testar-separados.log`.
- **Onde parou:** pedido 71 implementado na branch `codex/conteudos-separados`, baseada no 0.6 (PR #2). **Próximo passo do plano: 0.7**, não iniciado. Não publicar; Nathan publica pelo Claude.

## Fase 0.6 — concluída em 11/11/2026

- Gabinete e Armário de formulário agora convertem os parâmetros em módulo e geram todas as peças por gerarModuloV3. fonte/js/geradores.js foi removido.
- fonte/js/formularios/ conserva validações, mensagens, identificação/ordem, instruções de montagem, medidas da tela e listas de compras. Não gera geometria. Sapateira e cálculo de fixações foram movidos sem alteração para seus assuntos no núcleo.
- Contrato opcional do núcleo conserva fundo inteiro, dobradiças por altura, furação em medidas inválidas e tratamento anterior do puxador de perfil nos formulários. O Móvel livre e o Ambiente continuam com suas regras atuais. A ventilação do formulário mantém a regra do primeiro botijão no último vão.
- **Validação:** npm run testar, com npm portátil e Chromium 151 no Windows: **“Todos os casos iguais à referência.”**, saída 0. Inclui referências dos dez formulários, editor, ambiente, desenhos/PDF, exportações, versão sem internet e reabertura de projetos guardados.
- Conferência adicional local comparou os resultados completos dos geradores antigos com os adaptadores: casos de referência, limites individuais, entradas inválidas e 180 combinações de parâmetros, incluindo os seis puxadores. Nenhuma diferença além de arredondamento numérico menor que 1e-8. Os scripts de auditoria ficam em .ferramentas-codex/; não são parte do aplicativo.
- Testes existentes, referências, dados e dependências intactos. HTML normal e offline regenerados pelos comandos de montagem. Log final: .ferramentas-codex/testar-06-final.log.
- **Onde parou:** 0.6 implementado e conferido na branch codex/fase-0-6, baseada em c58936f. O PR desta etapa depende do PR #1 (organização dos documentos e conferência do 0.5), que ainda estava aberto durante o trabalho.
- **Próximo:** 0.7 — separar testes por área e acrescentar execução rápida por área; a suíte completa continua obrigatória antes de gravar. Etapa 0.7 não iniciada.
- **Não publicar; o Nathan publica pelo Claude.** O diagnóstico anterior e a solução estão em docs/diagnostico-fase-0-6.md.

## Conferência no Codex — 11/11/2026

- Base consultada: `main` em `d00bb96` (documentos enviados pelo Nathan recebidos). O passo **0.5 já está implementado** no commit `b22df6b`, posterior ao `06f39bc` informado no pedido. Não foi refeito nem houve mudança no comportamento do programa nesta conferência.
- Conferido no código: escolhas, rótulos e ordem do editor vêm do registro; cada frente/conteúdo declara sua aplicação; reconhecimento do conteúdo e desenhos do painel B consultam esse registro; modelos da tela ficam em `fonte/telas/`.
- Criado `AGENTS.md` a partir de `CLAUDE.md`, com referências em `docs/` e a instrução: **não publicar; o Nathan publica pelo Claude**.
- Os planos enviados pelo Nathan foram lidos e organizados: `planomestre.md` → `docs/plano-mestre.md`, `planoexecucao.md` → `docs/plano-execucao.md`, `arquitetura.md` → `docs/arquitetura.md`, `planoreestruturacao.md` → `docs/plano-reestruturacao.md`. O 0.5 foi marcado como implementado no commit existente `b22df6b`, com teste completo igual no Codex em 11/11/2026.
- **Validação:** `npm run testar` terminou com **“Todos os casos iguais à referência.”**, código de saída 0, em 11/11/2026, usando Chromium 151.0.7922.34 no Windows. Nenhuma referência ou dependência do projeto foi alterada. Ferramentas portáteis foram preparadas em `.ferramentas-codex/` após autorização do Nathan; essa pasta está ignorada pelo Git.
- **Compatibilidade dos testes:** a primeira execução, com Chromium 130.0.6723.31, falhou no caso PEÇAS LIVRES PELA TELA (1b), com erros de `replaceChildren` durante a troca de foco. A mesma suíte passou integralmente com Chromium 151, sem mudar o aplicativo ou as verificações. O mecanismo de busca de navegador alternativo em `testes/rodar.js` passou a reconhecer também `chrome-win64/chrome.exe` e `chrome-win/chrome.exe`; os caminhos Linux continuam disponíveis. A falha no navegador antigo não foi corrigida no aplicativo.
- **Como repetir neste ambiente (PowerShell):** definir `$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path $PWD '.ferramentas-codex/navegadores-atuais'` e executar `node .ferramentas-codex/package/bin/npm-cli.js run testar` (o comando npm portátil). Log local: `.ferramentas-codex/testar-atual.log`.
- **Onde parou:** 0.5 conferido, documentos organizados e teste completo aprovado; alterações preparadas para revisão em PR. Nenhuma publicação ou mudança de comportamento do configurador.
- **Próximo passo do plano:** 0.6 — formulários do Gabinete e do Armário montados pelo núcleo, retirando o gerador antigo somente se os testes continuarem iguais. Não iniciado nesta solicitação. Revisar o PR desta conferência antes de continuar. **Não publicar; o Nathan publica pelo Claude.**


## Onde paramos
- **Plano mestre aprovado:** `claude/plano-mestre.md` no projeto. É a revisão completa do programa contra o mercado (Mozaik, Promob, DinaBox, Polyboard, Cabinet Vision…), com 70 itens por área e blocos em ordem.
  - O Nathan: "isso é o que vamos seguir de agora em diante, esse documento é muito importante".
  - Render fica no Blender, fora do plano.
- **Plano de execução aprovado:** `claude/plano-execucao.md` diz onde cada função mora no código, o custo de cada item (P/M/G/GG), as regras de cada tipo de arquivo e a **Fase 0**.
- O programa publicado está no **artifact v62** (commit 72a9191). O último commit é 3dc1374 (só documentos).

## Atualização — 10/11/2026 14:10 (Fase 0 em andamento)
- **Feito:** 0.1 (montador: `@inclui-pasta` e `dados/<nome>/*.json`, commit 3aa04c6) · 0.2 (número do formato + conversor; nuvem guarda o original antes de gravar convertido; teste FORMATO DO PROJETO, commit 8b0fe6a) · 0.3a (núcleo dividido em `fonte/js/nucleo/`, só mudança de lugar, commit 6e9a4a9) · 0.3b parte 1 (registro: `nucleo/registro.js`, `nucleo/frentes/*.js`, `nucleo/conteudos/*.js`; o `vao()` do gerador só consulta o registro).
- **Teste completo igual em todos os passos.** Nada publicado: artifact continua na v62 (o Nathan escolheu publicar uma vez depois do 0.4).
- **0.3b parte 2 feita:** `porta` (frentes/giro.js), `portasCorrer`, `basculante`, `gavetaExterna` (frentes/), `prateleira` e `gavetasInternas` (conteudos/) saíram do gerador; recebem tudo pelo `ctx` (lista no fim do roteiro, antes de `percorrer`). O gerador ficou com 294 linhas (era 562). Teste igual.
- **0.3c feita (0.3 concluído):** `gerar-modulo.js` virou só o roteiro (84 linhas): monta o `ctx` com as medidas, chama `fazerCaixa` (nucleo/caixa.js), `percorrerArvore`/`vaoDaArvore` (nucleo/arvore.js), `fazerFundoSobreposto` (nucleo/fundo.js), `fazerComplementos` (nucleo/complementos.js: fixação, ventilação, pés, enchimento, tampo), ajuste por peça, `fazerFuracao` (nucleo/ferragens/furacao-laterais.js), `avisarTransporte` (nucleo/validacoes.js), acabamento, volumes e colisão de portas. Teste igual.
- **0.4 feito:** `tela.js` dividido em `fonte/js/tela/` (estado, formulario, ciclo, inicio; `3d/` cena, cotas, camera, selecao, medir, clique; `paineis/` barra-abas, arvore-pecas, listas + os antigos tela-modulo/ambiente/ajuste/loja/orcamento/revisao, painel-b e miniatura; `salvar/` exportar, abrir, drive, nuvem, eventos-projeto). Mesma ordem de antes no pagina.html (os trechos dependem da ordem). Teste igual.
- **0.5 feito:** escolhas do painel do vão registradas (`registrarEscolha` em nucleo/registro.js; cada frente/conteúdo declara rótulo, ordem, desenho, `aplicar(no, m)` e, no conteúdo, `reconhece(no)` + prioridade). `FRENTES_EDITOR`/`CONTEUDOS_EDITOR`, `ED.definirFrente/definirConteudo/tipoConteudo` e os desenhos do painel B vêm do registro. Modelos `<template>` em `fonte/telas/` (editor, ambiente, ajuste, dialogos). Listas e desenhos conferidos iguais aos de antes; teste igual.
- **Pedidos do Nathan fora da Fase 0 (10/11 noite), feitos:** (1) frente **"Abre p/ baixo"** (`nucleo/frentes/basculante-baixo.js`; `fazerBasculante` ganhou `sentido`, com dobradiças embaixo, pistão a gás inverso, puxador/perfil em cima, giro no 3D com `mov.sentido`); 5 pistões inversos na biblioteca (100 N visto à venda, Zamar; 60/80/120/140 N [Suposição]) — parte do item 29. (2) **Largura de cada espaço nas "Divisórias em pé"** (`ct.larguras`, campo por espaço no painel; vazio = automático) — parte do item 19. Referência atualizada com aprovação do Nathan (só ganhou os 2 resultados novos do caso nucleo-armario-misto).
- **Publicação pendente:** o link do Claude está na v62. A publicação exige ler a versão publicada inteira (12 mil linhas): fazer numa conversa nova, primeira coisa.
- **Próximo:** 0.6 — o formulário do Gabinete e do Armário monta o módulo pelo núcleo e `geradores.js` sai, só se o teste der igual (aprovado pelo Nathan). Depois 0.7 → 0.9.
- **Entra no 0.8 (decisão do Nathan):** abrir um .json com o mesmo nome de um projeto da nuvem grava por cima da nuvem sem cópia (risco que já existia).
- **Codex:** o Nathan pode continuar no Codex quando o limite do Claude acabar. Instruções num Claude Doc ("Continuar o Configurador no Codex"). Decisão: a pasta `docs/` do repositório vira a fonte oficial dos documentos (o Nathan copia os do projeto à mão); o Codex cria o `AGENTS.md` a partir do `CLAUDE.md`.

## Próximo passo (de 10/11 13:05, já cumprido até o 0.3b parte 1)
1. Ler `claude/plano-mestre.md` e `claude/plano-execucao.md`.
2. **Começar a Fase 0, passo 0.1** (montador inclui pasta inteira e junta `dados/biblioteca/*.json`).
   - Depois seguir 0.2 → 0.9, um passo por vez, com teste igual a cada passo e sem mudar nada que o Nathan veja.
   - Exceção: o 0.8 corrige 3 defeitos e deve ser explicado ao Nathan.
   - O 0.2 (versão do formato + conversor) **nunca** sobrescreve projeto salvo na nuvem, no Drive ou em .json.
3. Depois da Fase 0:
   - perguntar em múltipla escolha se a **1c-i** está aprovada;
   - fazer o **item 29** (puxador por vão);
   - fazer o **bloco 1, guarda-roupa** (itens 19, 13, 30, 25, 14), que fecha com um guarda-roupa real saindo completo.

## Feito nesta conversa (09–10/11)
- **Desenhos e barra de cima:**
  - folhas A3 (padrão FreeCAD);
  - Medidas em primeiro;
  - menu Exportar na barra de cima;
  - botão direito / toque longo no 3D.
- **Painel do móvel:**
  - mini desenho dos espaços; miniaturas das peças; painel visual B;
  - largura e altura de cada vão;
  - juntar com qualquer vizinho;
  - divisórias em pé.
- **Puxadores e portas:**
  - "Puxador" com posição;
  - Perfil G nas 4 bordas e em correr/basculante;
  - portas que não se atravessam;
  - correr e basculante animados;
  - correr "libera o lado".
- **Salvar:** aviso "Não salvo"; nuvem automática (Meus projetos + cópia de hora em hora no Drive).
- **Correção (v62):** cópia velha de um aparelho nunca sobrescreve a nuvem; aviso "Sem nuvem" no arquivo aberto fora do Claude. Motivo: o Nathan achou que tinha perdido tudo, mas o trabalho estava na nuvem (11:13).
- **Plano mestre:** revisão completa de recursos de mercado. O manual do DinaBox foi a fonte nova mais útil. A conferência no programa foi feita pelos dados e pela busca no código.
- **Plano de execução:** estrutura de pastas alvo, regras de registro, Fase 0 em 9 passos, os 70 itens com arquivo e custo, e 35–45 conversas estimadas [Suposição].
- **Documentos atualizados:**
  - `plano-reestruturacao.md`;
  - `proximas-alteracoes-tela.md` (encerrada);
  - `CLAUDE.md` (aponta para os dois planos).

## Decisões tomadas
- Plano mestre como guia daqui em diante; render no Blender — Nathan.
- Ordem dos blocos — sugestão do Claude, aceita pelo Nathan ao aprovar o documento:
  1. guarda-roupa;
  2. cozinha (2a dentro do módulo, 2b forma do ambiente);
  3. frentes;
  4. acabamentos;
  5. documentos;
  6. obra/montagem;
  7. comercial;
  8. loja;
  9. avançados.
- **Fase 0 antes do bloco 1** — Nathan (opção recomendada).
- **0.6 aprovado:** formulários do Gabinete e do Armário passam a montar pelo núcleo e o gerador antigo sai, se o teste der igual — Nathan.
- Nuvem do próprio app para salvar sozinho; Drive como cópia — Nathan ("2c").
- Painel visual B — Nathan.

## Tentado e descartado
- Abrir o site do Gabster para a pesquisa: o site bloqueou a leitura. Ficou só a descrição geral.
- Publicar versões enquanto o Nathan editava: causou a perda de 09/11. Agora a nuvem salva sozinha, mas continua valendo pedir para salvar antes de publicar.

## Sem testar / riscos
- **No celular de verdade:** toque longo, toque na miniatura, nuvem. Para testar: abrir pelo link no celular, mudar uma medida, esperar 5 s e abrir no PC.
- **Botão Salvar no Drive** dentro do app do Claude.
- **Perfil G:** desconto de 20 mm suposto; conferir na peça.
- **Juntar vãos de colunas diferentes:** sem caso no teste automático.
- **Conferência de recursos do plano mestre:** feita pela busca no código, não usando cada função; algo pode ter escapado [Provável].
- **Fase 0:** mexe em quase todos os arquivos. A garantia é o teste completo igual a cada passo.

## Pendências
- **Arquivo offline:** sugeri parar de enviá-lo a cada versão (confunde, porque não tem nuvem). Sem resposta.
- **Do Nathan:**
  - dados da empresa para o carimbo;
  - perguntas às lojas;
  - peça de teste;
  - catálogos de gola e cava;
  - texturas Guararapes / arquivos 3D Blum e Hettich.
- 1c-i: aprovação.

## Arquivos tocados
- **Repositório:**
  - `fonte/js`: tela, nucleo, editor-modulo, tela-modulo, painel-b (novo), miniatura (novo), regras, ambiente;
  - `fonte/pagina.html` e os CSS;
  - `dados/puxadores.json`, `dados/biblioteca.json`;
  - `CLAUDE.md`, esta passagem.
- **Projeto:**
  - novos `claude/plano-mestre.md` e `claude/plano-execucao.md`;
  - `claude/lacunas-especificacao.md` apagado (substituído);
  - `claude/plano-reestruturacao.md`, `claude/proximas-alteracoes-tela.md` e `claude/biblioteca.md` atualizados;
  - `codigo/configurador-moveis.html` (v62).
- **Artifact:** v49 → v62.

Validação do pedido 73 e das alterações locais anteriores: npm run testar terminou com Todos os casos iguais à referência., saída 0 (log .ferramentas-codex/testar-manrope.log). Fonte Manrope carregada com rede bloqueada, zero pedidos externos; interface conferida em 320/375/768 px. Referências intactas.
