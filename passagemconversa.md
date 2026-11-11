Passagem — Configurador de Móveis — 10/11/2026 13:05
Onde paramos
Plano mestre aprovado: claude/plano-mestre.md no projeto. É a revisão completa do programa contra o mercado (Mozaik, Promob, DinaBox, Polyboard, Cabinet Vision…), com 70 itens por área e blocos em ordem.
O Nathan: "isso é o que vamos seguir de agora em diante, esse documento é muito importante".
Render fica no Blender, fora do plano.
Plano de execução aprovado: claude/plano-execucao.md diz onde cada função mora no código, o custo de cada item (P/M/G/GG), as regras de cada tipo de arquivo e a Fase 0.
O programa publicado está no artifact v62 (commit 72a9191). O último commit é 3dc1374 (só documentos).
Próximo passo
Ler claude/plano-mestre.md e claude/plano-execucao.md.
Começar a Fase 0, passo 0.1 (montador inclui pasta inteira e junta dados/biblioteca/*.json).
Depois seguir 0.2 → 0.9, um passo por vez, com teste igual a cada passo e sem mudar nada que o Nathan veja.
Exceção: o 0.8 corrige 3 defeitos e deve ser explicado ao Nathan.
O 0.2 (versão do formato + conversor) nunca sobrescreve projeto salvo na nuvem, no Drive ou em .json.
Depois da Fase 0:
perguntar em múltipla escolha se a 1c-i está aprovada;
fazer o item 29 (puxador por vão);
fazer o bloco 1, guarda-roupa (itens 19, 13, 30, 25, 14), que fecha com um guarda-roupa real saindo completo.
Feito nesta conversa (09–10/11)
Desenhos e barra de cima:
folhas A3 (padrão FreeCAD);
Medidas em primeiro;
menu Exportar na barra de cima;
botão direito / toque longo no 3D.
Painel do móvel:
mini desenho dos espaços; miniaturas das peças; painel visual B;
largura e altura de cada vão;
juntar com qualquer vizinho;
divisórias em pé.
Puxadores e portas:
"Puxador" com posição;
Perfil G nas 4 bordas e em correr/basculante;
portas que não se atravessam;
correr e basculante animados;
correr "libera o lado".
Salvar: aviso "Não salvo"; nuvem automática (Meus projetos + cópia de hora em hora no Drive).
Correção (v62): cópia velha de um aparelho nunca sobrescreve a nuvem; aviso "Sem nuvem" no arquivo aberto fora do Claude. Motivo: o Nathan achou que tinha perdido tudo, mas o trabalho estava na nuvem (11:13).
Plano mestre: revisão completa de recursos de mercado. O manual do DinaBox foi a fonte nova mais útil. A conferência no programa foi feita pelos dados e pela busca no código.
Plano de execução: estrutura de pastas alvo, regras de registro, Fase 0 em 9 passos, os 70 itens com arquivo e custo, e 35–45 conversas estimadas [Suposição].
Documentos atualizados:
plano-reestruturacao.md;
proximas-alteracoes-tela.md (encerrada);
CLAUDE.md (aponta para os dois planos).
Decisões tomadas
Plano mestre como guia daqui em diante; render no Blender — Nathan.
Ordem dos blocos — sugestão do Claude, aceita pelo Nathan ao aprovar o documento:
guarda-roupa;
cozinha (2a dentro do módulo, 2b forma do ambiente);
frentes;
acabamentos;
documentos;
obra/montagem;
comercial;
loja;
avançados.
Fase 0 antes do bloco 1 — Nathan (opção recomendada).
0.6 aprovado: formulários do Gabinete e do Armário passam a montar pelo núcleo e o gerador antigo sai, se o teste der igual — Nathan.
Nuvem do próprio app para salvar sozinho; Drive como cópia — Nathan ("2c").
Painel visual B — Nathan.
Tentado e descartado
Abrir o site do Gabster para a pesquisa: o site bloqueou a leitura. Ficou só a descrição geral.
Publicar versões enquanto o Nathan editava: causou a perda de 09/11. Agora a nuvem salva sozinha, mas continua valendo pedir para salvar antes de publicar.
Sem testar / riscos
No celular de verdade: toque longo, toque na miniatura, nuvem. Para testar: abrir pelo link no celular, mudar uma medida, esperar 5 s e abrir no PC.
Botão Salvar no Drive dentro do app do Claude.
Perfil G: desconto de 20 mm suposto; conferir na peça.
Juntar vãos de colunas diferentes: sem caso no teste automático.
Conferência de recursos do plano mestre: feita pela busca no código, não usando cada função; algo pode ter escapado [Provável].
Fase 0: mexe em quase todos os arquivos. A garantia é o teste completo igual a cada passo.
Pendências
Arquivo offline: sugeri parar de enviá-lo a cada versão (confunde, porque não tem nuvem). Sem resposta.
Do Nathan:
dados da empresa para o carimbo;
perguntas às lojas;
peça de teste;
catálogos de gola e cava;
texturas Guararapes / arquivos 3D Blum e Hettich.
1c-i: aprovação.
Arquivos tocados
Repositório:
fonte/js: tela, nucleo, editor-modulo, tela-modulo, painel-b (novo), miniatura (novo), regras, ambiente;
fonte/pagina.html e os CSS;
dados/puxadores.json, dados/biblioteca.json;
CLAUDE.md, esta passagem.
Projeto:
novos claude/plano-mestre.md e claude/plano-execucao.md;
claude/lacunas-especificacao.md apagado (substituído);
claude/plano-reestruturacao.md, claude/proximas-alteracoes-tela.md e claude/biblioteca.md atualizados;
codigo/configurador-moveis.html (v62).
Artifact: v49 → v62.
