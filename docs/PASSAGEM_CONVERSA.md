# Passagem — Configurador de Móveis — 08/11/2026 15:05

## Onde paramos
Nenhuma mudança no código nesta conversa (app igual ao commit `e0cbc5f`, artifact versão 25). O Nathan mostrou fotos da cozinha da casa dele e o configurador não consegue montá-la. A conferência da especificação contra o código mostrou muitas lacunas. Foi decidido um plano novo para chegar ao nível dos melhores programas do mercado (Promob). A lista completa está em `claude/lacunas-especificacao.md` no projeto MÓVEIS PLANEJADOS.

## Próximo passo
Começar o **passo 1 do plano novo: peça livre e caixa livre**.
1. Ler `claude/lacunas-especificacao.md` e `claude/especificacao-base.md` (projeto) e `CLAUDE.md`.
2. Pesquisar como o Promob e os outros da pesquisa (`claude/pesquisa-base-parametrica.md`) fazem peças avulsas, painéis, tamponamentos e caixas soltas.
3. Propor ao Nathan, em múltipla escolha, como a peça livre e a caixa livre funcionam (posição, rotação, material, fita, furação, o que entra nas saídas). Só implementar depois da aprovação.
Caso de aceite: forro/pórtico, painel de parede, cortineiro, mesa e bancada em MDF e laterais da geladeira da cozinha das fotos (descrição em "Caso de aceite" abaixo).

## Feito nesta conversa
- Análise das 5 fotos da cozinha do Nathan contra o app — para ver o que falta.
- Conferência da especificação aprovada (06/11) contra o código, por busca de palavras — resultado em `claude/lacunas-especificacao.md` (projeto).

## Decisões tomadas
- Não comprar software; seguir construindo o próprio app (Nathan; marcou "comprar" por engano e corrigiu).
- Objetivo: qualidade e **todas as funcionalidades dos melhores do mercado**; o Nathan não tem pressa de começar a trabalhar com o app (Nathan).
- Plano novo (sugestão do Claude aceita, ajustada ao objetivo do Nathan):
  1. Peça livre e caixa livre primeiro (saída de emergência: qualquer móvel passa a ser possível).
  2. Cobrir a lista completa de lacunas, bloco a bloco, na ordem do que mais destrava; antes de cada bloco, revisar a lista contra a pesquisa de mercado.
  3. Catálogo próprio: salvar qualquer móvel montado como modelo pronto.
- Cada bloco só fecha quando um **caso real** sai completo (móvel que existe, usado como teste; nada é fabricado). O primeiro caso é a cozinha das fotos (Nathan).
- Ao fechar cada etapa, comparar com a especificação, não só com o teste (sugestão do Claude aceita).

## Tentado e descartado
- Teste de aceite do ambiente com "cozinha em L de exemplo" (5b) — passou, mas escondeu as lacunas; trocado por casos reais.
- Automatizar só o que se repetir nos projetos — não atende o objetivo de ter tudo antes de trabalhar.

## Sem testar / riscos
- A conferência foi por busca de palavras; um recurso com outro nome pode existir sem ter sido achado. Conferir na tela antes de implementar cada item.
- Itens "já dá para fazer" na cozinha (nicho do micro-ondas pela árvore de vãos com frente "nenhuma") não foram montados na tela — [Provável].

## Pendências
Lista completa em `claude/lacunas-especificacao.md`. Herdadas da passagem anterior, ainda abertas:
- Posição do puxador na tela nova (Nathan ainda não escolheu A/B/C).
- Folha A4; rasgos nas vistas da folha; correr e basculante da parede B se movendo no 3D; conferência de abertura no móvel solto; juntar pilhas pequenas na lista de volumes.
- Levantamento da obra (antigo passo 5) e manual de montagem (passo 6) — agora fazem parte da lista de lacunas.
- Dependem de terceiros: peça de teste na loja; perguntas às lojas; catálogo de gola e cava.
- "NÃO FABRICAR" no PDF antigo e orientação da furação na loja continuam sem conferir.

### Caso de aceite — cozinha do Nathan (fotos de 08/11/2026)
Em U: parede do fogão (fogão de piso Dako entre balcões, purificador na parede, aéreos com nicho aberto do micro-ondas); parede da pia sob a janela (gaveteiro + portas, aéreos interrompidos pela janela, cortineiro em MDF); caixa da geladeira (lateral alta até o chão + aéreo por cima, sem base nem fundo); península de costas para a passagem (balcão de 2 portas, lateral aparente, espelho de granito elevado); mesa em MDF com pé em painel, encostada num pórtico (painel de parede que sobe e vira forro), bancada fina na parede e prateleira com mão-francesa. Tampo de granito preto; rodapé preto recuado; frentes amadeiradas com veio vertical.

## Arquivos tocados
- `docs/PASSAGEM_CONVERSA.md` — esta passagem.
- Projeto: `claude/lacunas-especificacao.md` (novo) e `claude/passagem-conversa.md` (cópia desta).
