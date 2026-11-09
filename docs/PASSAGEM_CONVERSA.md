# Passagem — Configurador de Móveis — 09/11/2026 07:10

## Onde paramos
Continuamos só o **planejamento da tela nova do celular**; o programa não foi alterado nesta conversa. Existe agora um **protótipo navegável (v1)**, que começa em "D · Novo móvel" e vai até Projetar (E1 completa) e Conferir. O Nathan pediu para guardar essa versão para aprimorar e aplicar no programa no futuro. Ele ainda não avaliou o uso do protótipo.

## Próximo passo
Perguntar ao Nathan, em múltipla escolha, o que achou do protótipo "P · Protótipo navegável" no quadro de design (artifact Xf8Ai3JkhcJCWCQdo13bHm; cópia congelada em `codigo/prototipo-celular-v1.dc.html` no projeto) e por onde seguir:
- aprimorar o protótipo (Obra, ambiente com módulos, peças livres, menu "Parede", dividir deitado);
- ou montar o plano em etapas para aplicar a tela nova no programa.

Ler `claude/tela-celular.md` antes. **Não mexer no código** até o Nathan aprovar um plano.

## Feito nesta conversa
- Linha **F · E1 completa** no quadro de design (9 telas: F1 Ver, F2 Medir, F3 vão, F4 peça, F5 este móvel, F6 menu ⋮, F7 Falta, F8 ambiente, F9 peça livre), com um quadro azul que liga cada função de hoje à sua tela — a pedido do Nathan ("completar a E1").
- **P · Protótipo navegável** (P-navegavel.dc.html) — pedido do Nathan, partindo do D · Novo móvel. O que faz:
  - 4 modelos e "do zero" em 3 passos;
  - menu ao lado do vão; folha do vão (frente, dobradiça, conteúdo, prateleiras, dividir em pé, juntar);
  - Ver, Abrir e Medir (cotas, linha de corte); 3D com toque no tampo, na lateral e no fundo, abrindo a ficha da peça e o ajuste;
  - folha do móvel, Falta, menu ⋮;
  - Conferir peça por peça, com "Liberar para corte" só depois de tudo marcado.
- Versão guardada a pedido do Nathan: memória do projeto, cópia em `codigo/prototipo-celular-v1.dc.html` e seção nova em `claude/tela-celular.md`.
- Inventário de funções corrigido em `claude/tela-celular.md`: faltavam as prateleiras com contador, e os nomes das frentes estavam errados.

## Decisões tomadas
- Completar a E1 mostrando onde fica cada função de hoje, antes de Obra e Conferir — Nathan.
- **D · Novo móvel é o ponto de partida** do protótipo navegável — Nathan.
- Guardar o protótipo v1 para aprimorar e aplicar no programa no futuro — Nathan.
- Lugar de cada função na E1 (Ver/Abrir/Medir na barra, vão e peça por toque, nome → móvel, ⋮ → projeto/saídas/exportar, Falta → erros e avisos de hoje) — sugestão do Claude, ainda não aprovada.
- Saídas de corte e loja no menu ⋮ — sugestão do Claude. A alternativa (levar para o modo Conferir) ficou em aberto.

## Tentado e descartado
- nada

## Sem testar / riscos
- **Protótipo navegável:** o Claude não o abriu depois de publicar. Pode ter botão que não responde ou desenho fora do lugar.
  - Como testar: no quadro, linha P → Play → modelo → tocar num vão → trocar a frente → cubo 3D → tocar no tampo → Conferir.
- **Valores inventados no protótipo:** medidas dos modelos e das peças são exemplo. Limites "móvel alto" (1,5 m) e vão mínimo (100 mm) são [Suposição].
- **F8:** mostra dois menus abertos juntos só para caber numa imagem.
- **Pendentes da conversa anterior:**
  - uso real da 1c-i pelo Nathan;
  - "2 erros · exportação bloqueada" no armário no celular (testar "Restaurar medidas padrão" ou mandar o print);
  - iLogic de peça girada sem rodar no Inventor.

## Pendências
- **Protótipo:** Obra sem tela (precisa seguir o que o programa mede: formato, paredes, pontos de esgoto, água, gás e tomada). Também sem tela: ambiente com módulos, peças livres, menu "Parede", menu Abrir em tela própria e dividir deitado.
- **Decisões em aberto:** onde ficam as saídas de corte e loja (⋮ ou Conferir); como a tela nova fica no computador.
- **Botão de tema:** não foi para o GitHub. Refazer se o Nathan quiser; a ideia é que entre no menu ⋮.
- **Aprovação da 1c-i;** depois 1c-ii e 1c-iii.
- **Cópias duplicadas:** decidir se para de copiar o programa para `codigo/configurador-moveis.html`.

## Arquivos tocados
- Quadro de design (artifact Xf8Ai3JkhcJCWCQdo13bHm) — telas F1–F9 e P-navegavel novas, mais notas de ajuda.
- Projeto MÓVEIS PLANEJADOS: `claude/tela-celular.md` (linha F, protótipo v1, inventário corrigido); `codigo/prototipo-celular-v1.dc.html` (novo); `claude/passagem-conversa.md`.
- Repositório: só `docs/PASSAGEM_CONVERSA.md`. Nenhum arquivo do programa mudou.
