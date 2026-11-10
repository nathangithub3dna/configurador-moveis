# Passagem — Configurador de Móveis — 10/11/2026 12:00

## Onde paramos
- **Novo plano mestre aprovado:** `claude/plano-mestre.md` no projeto. É a revisão completa do programa contra os programas de mercado (Mozaik, Promob, DinaBox, Polyboard, Cabinet Vision…), com 70 itens por área e blocos em ordem.
  - O Nathan: "isso é o que vamos seguir de agora em diante, esse documento é muito importante".
  - Render fica no Blender, fora do plano.
- Antes disso, em 09–10/11, a conversa foi de pedidos soltos de tela e de uso (artifact v49 → v62, último commit 72a9191). A lista está em `claude/proximas-alteracoes-tela.md`, que está encerrada.

## Próximo passo
1. Ler `claude/plano-mestre.md` (regras de uso no começo, ordem aprovada no fim) e `claude/plano-execucao.md` (onde cada função mora no código, custo, contratos e a **Fase 0**: separar nucleo.js, tela.js, geradores.js e os testes em arquivos pequenos com registro, sem mudar resultado). **Fase 0 aprovada (10/11):** começar por ela (0.1 → 0.9, um passo por vez, teste igual a cada passo). O 0.6 (aposentar os geradores antigos do formulário) também foi aprovado, se o teste der igual.
2. Pendências curtas antes do bloco 1:
   - perguntar em múltipla escolha se a **1c-i** está aprovada (teste: a caixa da geladeira, em `claude/peca-caixa-livre.md`);
   - fazer o **item 29**: puxador por vão (modelo + posição juntos, "usar em todos os vãos", altura em cima/meio/embaixo, "abre para baixo", "sem puxador (fecho toque)").
3. **Bloco 1 — guarda-roupa:**
   - item 13: cabideiro, maleiro, calceiro;
   - item 25: recobrimento e dobradiça curva/supercurva;
   - item 30: corrediça oculta;
   - item 14: modelos prontos.
   - Fecha com um guarda-roupa real saindo completo em todas as saídas.
4. Uma etapa por vez; o Nathan aprova antes da próxima.

## Feito nesta conversa (09–10/11)
- **Desenhos e barra de cima:**
  - folhas A3 (padrão FreeCAD);
  - Medidas em primeiro;
  - menu Exportar na barra de cima;
  - botão direito / toque longo no 3D (abrir portas e gavetas).
- **Painel do móvel:**
  - mini desenho dos espaços;
  - miniaturas das peças;
  - painel visual B;
  - largura e altura de cada vão;
  - juntar com qualquer vizinho (reorganiza a árvore);
  - divisórias em pé (conteúdo).
- **Puxadores e portas:**
  - "Puxador" com posição (antes "Dobradiça");
  - Perfil G nas 4 bordas e em correr/basculante;
  - portas que não se atravessam ao abrir;
  - correr e basculante animados;
  - correr "libera o lado".
- **Salvar:**
  - aviso "Não salvo";
  - **nuvem automática** (Meus projetos, cópia de hora em hora no Drive);
  - cópia velha de um aparelho nunca sobrescreve a nuvem (fica guardada à parte);
  - aviso vermelho "Sem nuvem" no arquivo aberto fora do Claude.
- **Perda de dados de 09/11:** aconteceu porque publiquei com edições não salvas.
  - Recuperado do .json em Downloads e enviado ao Drive.
  - O armário do Nathan está na nuvem: Meus projetos → Armário da área de serviço (11:13 de 10/11).

## Decisões tomadas
- Plano mestre como guia daqui em diante; render no Blender — Nathan.
- Nuvem do próprio app (db do artifact) para salvar sozinho; Drive como cópia — Nathan escolheu "2c".
- Painel visual B — Nathan.

## Sem testar / riscos
- **No celular de verdade:** toque longo, toque na miniatura, nuvem.
- **Botão Salvar no Drive** dentro do app do Claude.
- **Perfil G:** desconto de 20 mm suposto; conferir na peça.
- **Juntar vãos de colunas diferentes:** sem caso no teste automático.
- **Arquivo offline:** não tem nuvem. Sugeri parar de enviar a cada versão; ficou sem resposta.

## Arquivos tocados
- `fonte/js`: tela, nucleo, editor-modulo, tela-modulo, painel-b (novo), miniatura (novo), regras, ambiente.
- `fonte/pagina.html` e os CSS.
- `dados/puxadores.json`, `dados/biblioteca.json`.
- **Projeto:**
  - novo `claude/plano-mestre.md`;
  - `claude/lacunas-especificacao.md` apagado (substituído pelo plano mestre);
  - `claude/plano-reestruturacao.md` e `claude/proximas-alteracoes-tela.md` atualizados;
  - `claude/biblioteca.md` (Perfil G).
