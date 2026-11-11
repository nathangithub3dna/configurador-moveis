Plano de reestruturação — decisões (06/11/2026, atualizado 10/11/2026)

10/11/2026: o plano a seguir agora é claude/plano-mestre.md. É a revisão completa contra o mercado, aprovada pelo Nathan.

As decisões abaixo continuam valendo como contexto.
A "Ordem A", as tarefas médias e a fila da tela foram absorvidas no plano mestre: levantamento da obra = item 12; manual de montagem = item 51; folha A4 = item 47; puxador = item 29.

Complementa:

claude/arquitetura.md (especificação técnica);
claude/pesquisa-base-parametrica.md (pesquisa profunda, função por função);
claude/teste-freecad.md.

Este documento guarda o que o Nathan decidiu e o que está pendente. Onde a última conversa parou: claude/passagem-conversa.md.

Decisões do Nathan (questionários de 06/11/2026)
#	Tema	Decisão
1	Ordem	Reestruturar primeiro (7 etapas antes de desenhos ABNT, skill e montagem)
2	Acompanhamento	Aprovar cada etapa antes da próxima
3	Onde	Tudo no GitHub: repositório privado nathangithub3dna/configurador-moveis (gravação do Claude liberada e em uso)
4	PCs	Os dois PCs, sincronizados pelo GitHub
6	Projetos de clientes	Google Drive
7	Projetos já feitos	Abrem na versão nova com conversão automática
8	Gerador paramétrico	Base própria (não comprar), no modelo dos programas de mercado, completa desde o início, após pesquisa profunda
9	Publicação	Cada etapa pronta substitui o configurador publicado (risco aceito; voltar versão pelo GitHub)
10	Ferramentas no PC	Decisão posterior: nada instalado nos PCs para o configurador; testes rodam na nuvem do Claude
—	Etapas 1–3	Começam assim que o GitHub estiver liberado; etapas 4–5 só após a especificação final da base aprovada
11	Plano a seguir (10/11)	claude/plano-mestre.md — 70 itens por área, blocos em ordem (guarda-roupa → cozinha real → frentes → acabamentos → documentos → obra/montagem → comercial → loja); render fica no Blender, fora do plano
Escopo da base (confirmado)
Ambiente completo desde o início: vários módulos, cantos, aéreos, tampo contínuo.
Todos os ambientes: cozinha, guarda-roupa/closet, banheiro, lavanderia, painel/home, escritório, comercial.
Portas de correr desde o início.
Medição: trena + combinação (trena, laser, planta).
Material por peça, com veio respeitado no corte.
FreeCAD instalado no PC do Nathan; testar e comparar com o Inventor (em casa só há Blender e FreeCAD; Inventor só no trabalho).
Revisões de orçamento congeladas (Rev A, B…) com aceite do cliente.
Considerar todos os pontos levantados: parede fora de esquadro, loja de corte (formato/CNC), revisões, correr/basculante/cantos, responsabilidades de fornecedor.
Pedidos do Nathan para o sistema
Um único criador/configurador de móveis, com todas as funções atuais.
Modelos prontos editáveis; incluir modelos novos vindos do Blender (em casa), FreeCAD ou Inventor (trabalho) — todos gravando o mesmo formato. Fluxo possível: base no configurador/Blender → orçamento aprovado → detalhamento no Inventor ou FreeCAD.
Detalhamento de cada peça em PDF com template padrão: nome, logo, cidade, nome da empresa (ainda não existe) + dados da peça; A4 para peças pequenas, A3 para grandes.
Catálogo do cliente como está, mais orçamento (móvel = material + fabricação; instalação = terceirizada nos grandes) e troca de acabamentos (junto com o gerador paramétrico).
Manual de montagem: uso do Nathan e do montador; para itens pequenos e simples, também enviado ao cliente.
Biblioteca real de ferragens, fixadores e acessórios com 3D de fabricantes encontrados em Ponta Grossa — Claude busca pacotes livres/gratuitos; se custar muito, o Nathan baixa.
Sistema de acabamentos com catálogos reais.
Robô de briefing do cliente (ver abaixo).
Mudança de modelo de negócio

Antes: Nathan só projetava. Agora: Nathan compra tudo e entrega; terceiriza a instalação dos móveis grandes. Orçamento em dois blocos (móvel / instalação). O material pode ser especificado (ex.: MDF RU).

Estado das etapas (10/11/2026)
Prontas:
etapas 1–3, 4a–4e, 5a, 5b e 5c (ver claude/arquitetura.md);
Ordem A, passos 1–4: salvar fora do Claude + orçamento; estudo/aprovado/liberado; versão offline; conferência de fabricação;
peça livre (1a, 1b) e ajuste por peça (1c-i, aguarda aprovação);
pedidos de tela de 09–10/11 (ver claude/proximas-alteracoes-tela.md).
Daqui em diante: claude/plano-mestre.md.
Decisão do Nathan (08/11): não esperar a peça de teste nem as respostas das lojas; melhorar bastante o app antes de ir para a prática.
Robô de briefing do cliente (F13 — plano mestre, item 62)

Decidido em 06/11/2026:

Para quem: clientes, antes do projeto.
Como: link de uma página no celular, uma pergunta por vez, com botões e fotos — nada para instalar.
Coleta: ambiente e o que quer guardar (uso); fotos e vídeos do local; medidas aproximadas (com explicação simples de como medir); estilo e cores escolhidos por imagens; prazo. Não pergunta endereço nem faixa de investimento.
Para não espantar o cliente: no máximo 8 perguntas; o resto opcional ("quer contar mais?").
Resultado: o Nathan recebe tudo organizado, pronto para virar projeto (ambiente + medidas + fotos + estilo).
Quando: depois que a base estiver pronta.
Pendências (fora do app)
 GitHub: gravação do Claude liberada.
 Lojas de Ponta Grossa (deixar para depois, não bloquear o app):
lojas: GMAD Madcompen, MK Soluções, Di Casa e J Imave;
perguntas: corte/fita/CNC, arquivo aceito, refilo e serra, medida com ou sem fita, desconto da fita, veio contínuo, prazo e preço;
mensagem pronta em claude/pesquisa-base-parametrica.md (F7).
 Peça de teste de furação na loja (botões na aba Lista de corte). Confirma canto, face e topo da furação.
 Gola e cava (esperando catálogo).
 Texturas Guararapes e CAD de ferragens (Blum, Hettich): baixar, testar escala e licença.
 Dados da empresa (nome, logo, cidade) para o carimbo das folhas.
