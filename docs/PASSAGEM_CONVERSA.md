# Passagem — Configurador de Móveis — 08/11/2026 16:00

## Onde paramos
Sub-etapa **1a do passo 1 (peça livre) pronta**: o ambiente aceita peças livres (painel, forro, cortineiro, tampo de mesa, pé em painel, lateral de acabamento, prateleira de parede, bancada, tamponamento, peça genérica), presas a uma parede ou soltas, giradas em qualquer ângulo, e elas saem em 3D, lista e plano de corte, códigos, CorteCloud, iLogic, folha A3 e compras. **Ainda não dá para criá-las pela tela** — só pelos dados do projeto. Commit `96c8ea4`, artifact versão 26.

## Próximo passo
Sub-etapa **1b — tela das peças livres** (aprovada pelo Nathan):
1. Ler `CLAUDE.md`, esta passagem e `claude/peca-caixa-livre.md` (projeto MÓVEIS PLANEJADOS).
2. No modo Ambiente (`fonte/pagina.html` com `<template>`, `fonte/js/tela-ambiente.js`): lista de peças livres; adicionar por função; campos de medidas, material, veio, fita por lado, apoio (deitada / em pé de frente / em pé de lado), posição (parede ou solta), giro nos 3 eixos, recortes, furos, ferragens da biblioteca; duplicar; remover; grupo (peças do mesmo grupo andam juntas).
3. Peças livres na planta (`desenharPlanta`), inclusive giradas.
4. Aceite: montar pela tela o caso do teste "PEÇAS LIVRES (1a)" (pórtico com painel e forro, cortineiro, mesa com tampo recortado e pé em painel, peça girada).

## Feito nesta conversa
- Testes voltaram a rodar na nuvem — o repositório guardava um atalho `node_modules` para uma pasta de outra sessão e o Playwright exigia uma versão exata do navegador; agora `npm install` traz as bibliotecas e o teste usa o Chromium que existir em `/opt/pw-browsers` (commit `57b817e`).
- Pesquisa de mercado (Promob, Hellomob, Polyboard, Mozaik) sobre peças avulsas e proposta aprovada — registrada em `claude/peca-caixa-livre.md`.
- Peça livre implementada em `fonte/js/livres.js` e ligada ao ambiente, 3D, iLogic, códigos (`A-L01…`), furo avulso; aviso de peça livre ocupando o lugar de um módulo; cor própria no 3D.
- Teste novo "PEÇAS LIVRES (1a)" em `testes/rodar.js` (8 peças, inclusive giradas e na parede B; casos de erro). Todos os casos antigos iguais à referência. 3D conferido por imagem.

## Decisões tomadas
- Posição: presa à parede (distância do canto, altura, afastamento) ou solta (X, Y, Z) — Nathan.
- Rotação: ângulo livre já, em qualquer eixo — Nathan (o Claude avisou que custa mais; seguiu a escolha).
- Formato: retângulo + recortes retangulares + furos avulsos — Nathan.
- Caixa livre: módulo solto + desligar ou mudar medida de qualquer peça de módulo — Nathan.
- Fixação da peça livre sempre escolhida à mão, com aviso quando falta — sugestão do Claude (o cálculo por contato poria parafuso aparente no tampo da mesa), confirmada pelo Nathan.
- Ordem: 1b (tela) antes de 1c (caixa livre) — Nathan.

## Tentado e descartado
- Fixação automática por contato nas peças livres alinhadas (estava na proposta) — trocada pela fixação à mão pelo motivo acima.

## Sem testar / riscos
- Nada foi testado pela tela pelo Nathan: não há tela para peça livre até a 1b.
- iLogic de peça girada em ângulo: eixos conferidos só no app, não rodados no Inventor — testar no trabalho quando houver um caso.
- Folha A3 de peça com recorte: o teste só confere que a folha é gerada; conferir visualmente na 1b.

## Pendências
- Limites da 1a (em `claude/peca-caixa-livre.md`): recortes só numa mesma borda; furos só na face A (sem canal nem furo de topo); CorteCloud não leva recortes nem vazados; planta sem peças livres (vai na 1b); volumes de transporte não existem no ambiente; biblioteca sem mão-francesa, cantoneira e suporte invisível (precisa pesquisar itens reais); 3D na cor da categoria, não do material.
- Sub-etapas 1c (caixa livre) e 1d (caso real da cozinha) do passo 1.
- Herdadas: posição do puxador na tela nova (A/B/C); folha A4; rasgos nas vistas da folha; correr e basculante da parede B no 3D; conferência de abertura no móvel solto; juntar pilhas pequenas nos volumes; levantamento da obra; manual de montagem; peça de teste e perguntas às lojas; catálogo de gola e cava; "NÃO FABRICAR" no PDF antigo e orientação da furação na loja sem conferir. Lista completa em `claude/lacunas-especificacao.md`.

### Caso de aceite — cozinha do Nathan (fotos de 08/11/2026)
Em U: parede do fogão (fogão de piso Dako entre balcões, purificador na parede, aéreos com nicho aberto do micro-ondas); parede da pia sob a janela (gaveteiro + portas, aéreos interrompidos pela janela, cortineiro em MDF); caixa da geladeira (lateral alta até o chão + aéreo por cima, sem base nem fundo); península de costas para a passagem (balcão de 2 portas, lateral aparente, espelho de granito elevado); mesa em MDF com pé em painel, encostada num pórtico (painel de parede que sobe e vira forro), bancada fina na parede e prateleira com mão-francesa. Tampo de granito preto; rodapé preto recuado; frentes amadeiradas com veio vertical.

## Arquivos tocados
- `fonte/js/livres.js` — novo: lógica da peça livre.
- `fonte/js/regras.js` — funções das peças livres (`FUNCOES_LIVRE`, `PAPEIS`), categoria "Peças livres".
- `fonte/js/ambiente.js` — peças livres entram no ambiente; aviso de sobreposição com módulo.
- `fonte/js/saidas.js` — furo avulso; posição no iLogic pelos eixos da peça; ordem das listas.
- `fonte/js/saidas-loja.js` — código `A-L01…` para peça livre.
- `fonte/js/tela.js` — forma 3D da peça livre; `atualizar` e `nosAtual` expostos para o teste.
- `fonte/estilos/tema.css` — cor `--v-livre`.
- `fonte/pagina.html` — inclui `livres.js`.
- `testes/rodar.js` — Chromium da nuvem; teste "PEÇAS LIVRES (1a)".
- `.gitignore`, `package-lock.json`; `node_modules` saiu do repositório.
- Projeto: `claude/peca-caixa-livre.md` (novo), `codigo/configurador-moveis.html`, `claude/passagem-conversa.md`.
