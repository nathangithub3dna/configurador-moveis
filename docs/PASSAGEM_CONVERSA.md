# Passagem — Configurador de Móveis — 16/11/2026 00:10

## Onde paramos
O item 29 (puxador por vão) está completo e publicado no link do Claude na **versão 64** (commit 4c16590; passagem em 88861a3). Cada vão pode ter modelo próprio, altura do puxador (em cima/meio/embaixo), "sem puxador · fecho toque" e o botão "Usar este puxador em todos os vãos". Faltam duas pendências curtas antes do bloco 1 (guarda-roupa).

## Próximo passo
1. Perguntar ao Nathan, em múltipla escolha: (a) se a **1c-i** (ajuste por peça) está aprovada; (b) se ele conferiu o item 29 na v64 (celular e PC).
2. Fechar o **0.9**: a skill configurador-moveis carregada em 15/11 já fala de testes por área e de `npm run pagina-publicar` [Provável: a proposta foi salva]. Conferir se falta o "cabeçalho curto em cada arquivo" pedido no 0.9 e marcar ✅ em `docs/plano-execucao.md`.
3. Começar o **item 19** (bloco 1): prateleira de vidro, prateleira "invisível", divisória dupla — `nucleo/conteudos/prateleiras.js`, `divisorias.js`, vidro em `dados/materiais.json`. Pesquisar itens reais antes (suporte de prateleira de vidro, suporte invisível).

## Feito nesta conversa
- Item 29 concluído — era a pendência combinada antes do bloco 1.
  - "Sem puxador · fecho toque": frente sem furo; 1 fecho por porta/gaveta/basculante nas compras; aviso por vão (porta: dobradiça sem amortecedor; gaveta: corrediça com abertura por toque; correr: continua com concha).
  - Altura do puxador por vão (Automática / Em cima / No meio / Embaixo), só em porta de giro com puxador de furo; o puxador nunca sai da porta.
  - "Usar este puxador em todos os vãos": copia modelo e altura; com "padrão do móvel" devolve todos ao padrão.
- Teste novo em `testes/casos/interface.js` (altura, fecho em porta/gaveta/basculante, aviso, usar em todos). Teste completo igual à referência; nenhuma referência mudou.
- Publicado v64; `codigo/configurador-moveis.html` e `claude/plano-mestre.md`, `plano-execucao.md`, `passagem-conversa.md` copiados para o projeto; arquivo sem internet enviado.
- Passagens antigas movidas para `docs/HISTORICO.md` (a passagem agora guarda só a última conversa).

## Decisões tomadas
- Fecho toque como modelo genérico [Suposição], sem marca/código — sugestão do Claude (Nathan não opinou).
- Dobradiça do kit não é trocada sozinha quando há fecho toque; só aviso — sugestão do Claude: falta uma dobradiça sem amortecedor real na biblioteca (Blum combina TIP-ON com CLIP top sem mola).
- Porta de correr ignora o fecho toque e fica com concha, com aviso — sugestão do Claude.
- Gavetas internas (atrás da porta) não seguem o puxador do vão — mantido como já era.

## Tentado e descartado
- Conferência visual com o `configurador.html` normal na nuvem: não abre (bibliotecas da internet bloqueadas). Usar o `configurador-offline.html`.
- Playwright avulso procura um Chromium que não existe; usar `/opt/pw-browsers/chromium-1243/chrome-linux*/chrome` (o `npm run testar` já acha sozinho).

## Sem testar / riscos
- v64 no celular e no PC do Nathan — abrir o link, tocar num vão com porta, trocar a altura (o puxador sobe/desce), escolher fecho toque (puxador some, aviso aparece), "Usar em todos".
- Aparência do fecho no 3D (cilindro pequeno atrás da frente).
- Posição do fecho na gaveta (atrás da traseira, 10 mm) e na porta (no lado do puxador) é simplificada [Suposição].

## Pendências
- 1c-i: aprovação do Nathan.
- 0.9: confirmar skill salva e cabeçalhos dos arquivos.
- Fecho toque real (marca/código) e dobradiça sem amortecedor na biblioteca.
- Do Nathan: dados da empresa para o carimbo; perguntas às lojas; peça de teste; catálogos de gola e cava; texturas Guararapes / arquivos 3D Blum e Hettich.
- Arquivo offline: sugestão de parar de enviar a cada versão continua sem resposta.

## Arquivos tocados
- `fonte/js/nucleo/ferragens/fecho-toque.js` — novo (fecho e avisos).
- `fonte/js/nucleo/arvore.js` — aplica o puxador e a altura do vão.
- `fonte/js/nucleo/frentes/giro.js`, `gaveta.js`, `basculante.js` — sem furo e fecho quando é toque; altura cima/meio/baixo na porta.
- `fonte/js/editor-modulo.js` — `ED.puxadorEmTodos`.
- `fonte/js/tela/paineis/modulo.js`, `fonte/telas/editor.html` — opção, campo de altura e botão.
- `dados/biblioteca.json` — item `fecho-toque`.
- `testes/casos/interface.js` — casos novos.
- `docs/plano-mestre.md`, `docs/plano-execucao.md` — item 29 ✅; `docs/PASSAGEM_CONVERSA.md`, `docs/HISTORICO.md` (novo).
