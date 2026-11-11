Configurador de Móveis — visão geral

Projeto pessoal do Nathan. Sistema para projetar móveis planejados por medidas e levar o projeto até a entrega: briefing do cliente, apresentação, orçamento, lista de materiais real, pedido de corte, detalhamento e montagem. Referência de fluxo: Promob (biblioteca de itens reais → projeto → orçamento/compras → plano de corte → produção).

Modelo de negócio (atualizado em 06/11/2026): o Nathan compra todo o material e entrega o móvel; a instalação dos móveis grandes é terceirizada, e o que ele consegue fazer sozinho vai junto. O orçamento tem dois blocos: móvel (material + fabricação) e instalação. O material pode ser especificado no material do cliente (ex.: MDF RU). (Antes: só projetava e o cliente comprava — substituído.)

Configurador (artifact privado, só o Nathan): https://claude.ai/artifact/HsqccQZfs2utTfs3jVHp1Q
Apresentação do cliente — gabinete do banheiro: https://claude.ai/artifact/F2RGcaT9htXTBPc7JVi5FC
Repositório (privado): nathangithub3dna/configurador-moveis — criado; falta liberar a gravação do Claude.
Código atual: codigo/configurador-moveis.html, codigo/blender-cena-banheiro.py.
Projeto separado do Visualizador 3D GSA (Granfinale). Não misturar código.
Onde fica cada coisa
O quê	Onde
Cada móvel projetado (medidas, corte, compras, preços)	arquivo .json do configurador, guardado no Google Drive — não vai para os documentos
Decisões e pendências da reestruturação	claude/plano-reestruturacao.md
Pesquisa da base paramétrica (12 funções, mercado, lojas de Ponta Grossa)	claude/pesquisa-base-parametrica.md
Especificação técnica da nova estrutura	claude/arquitetura.md
Teste do FreeCAD	claude/teste-freecad.md
Tipos de móvel do configurador atual	claude/tipos-de-movel.md
Regras de marcenaria	claude/regras-marcenaria.md
Chapas, ferragens, puxadores reais	claude/biblioteca.md
Conexão com o Blender	claude/blender-conexao.md
Primeiro móvel (exemplo)	claude/gabinete-banheiro.md

Os documentos mudam quando muda o sistema, não a cada móvel.

Fluxo de trabalho
0. BRIEFING       robô do cliente (link no celular, até 8 perguntas, fotos, medidas, estilo, prazo) — depois da base
1. AMBIENTE       medição real (trena/laser/planta), paredes, aberturas, pontos, obstáculos
2. PROJETO        módulos + divisões + método de construção + frentes → peças pelas regras
3. BIBLIOTECA     acabamentos, ferragens e kits reais (fabricante, código, 3D, preço)
4. APRESENTAÇÃO   fotos (Blender) + 3D + troca de acabamentos + orçamento com revisão e aceite
5. COMPRAS/CORTE  lista de compras, plano de corte com veio, pedido no formato da loja (CSV/CorteCloud)
6. DETALHAMENTO   PDF por peça (template próprio, A4/A3), vistas pelo FreeCAD, iLogic no Inventor
7. MONTAGEM       manual (Nathan e montador; para itens pequenos, também ao cliente)
Estado atual do configurador (antes da reestruturação)
Recurso	Status
Tipos gabinete e armário com vãos	Pronto
3D técnico, lista de corte, plano de corte, compras com preços, pedido para loja	Pronto
Desenhos por peça (PDF), script iLogic	Pronto (iLogic não testado no Inventor)
Fixações calculadas e mostradas no 3D	Pronto (06/11)
5 puxadores reais (Hettich, Zen)	Pronto no armário (06/11)
Blender: fotos Cycles e biblioteca 3D de ferragens	Pronto (gabinete)
Página do cliente com fotos e 3D	Pronto (gabinete)
Reestruturação (decidida em 06/11/2026)

Decisões completas em claude/plano-reestruturacao.md. Resumo:

Base paramétrica própria, no modelo dos programas de mercado (Promob, Polyboard, Mozaik, Woodwork for Inventor), completa desde o início: ambiente → módulos → árvore de vãos → frentes, com método de construção separado do desenho, regras de ferragem com furação, material por peça com veio e catálogos como dados.
Escopo: ambiente completo, todos os ambientes, portas de correr, cantos, aéreos, tampo contínuo, revisões de orçamento congeladas.
Código no GitHub (dois PCs sincronizados); projetos de clientes no Google Drive.
FreeCAD (grátis) testado na nuvem: gera peças, STEP e vistas técnicas reais; a folha final em PDF fica com o nosso gerador. O Nathan já instalou o FreeCAD no PC.
Sequência: etapas 1–3 (pasta + testes de referência, catálogos fora do código, função de cada peça) assim que o GitHub for liberado → especificação final da base para aprovação → etapas 4–7.
Cada etapa aprovada pelo Nathan antes da próxima; cada etapa pronta substitui o configurador publicado.
Fases
Fase	Conteúdo	Status
R1–R3	Repositório + testes de referência; catálogos em dados; função (papel) de cada peça	Aguardando liberação do GitHub
R4–R5	Base paramétrica (ambiente, módulos, vãos, métodos de construção) + tela de montagem	Após especificação final aprovada
R6–R7	Versões de projeto, Google Drive, publicação em um HTML	A fazer
Parte 2	Desenhos com cotas ABNT, diâmetros, isométrica, carimbo próprio (A4/A3), vistas pelo FreeCAD	Depois da base
Parte 3	Skill de desenho técnico	Depois da base
Parte 4	Detalhamento/manual de montagem (vista explodida, balões, lista de materiais)	Depois da base
—	Orçamento com revisões e aceite; troca de acabamentos no catálogo do cliente	Junto com a base
F13	Robô de briefing do cliente	Depois da base
3	Animações, fotos 1080×1350, Reels, QR code	A fazer
Decisões que continuam valendo
Só o Nathan opera o configurador; o resultado é para qualquer pessoa ver.
Ferragens reais: dobradiça Blum CLIP top BLUMOTION 71B3550 + calço 0 mm; corrediça telescópica 45 mm com amortecedor; puxadores Hettich e Zen Design.
O público vê medidas gerais, não lista de corte nem desenhos (exceto móveis pequenos: corte, lista e manual podem ir ao cliente).
Blender: sistema híbrido — script faz o repetitivo, Nathan ajusta à mão. Dois PCs com Blender (usuários NATHAN.OLIVEIRA e User, RTX 2060); "Allow Online Access" ligado para o MCP.
Template dos documentos: nome, logo, cidade e nome da empresa (a empresa ainda não existe).
Pendências

Do Nathan

Liberar a gravação do Claude no repositório do GitHub.
(Depois) Perguntar às lojas de Ponta Grossa: corte, fita, CNC, arquivo aceito, refilo/serra, medida com ou sem fita, veio contínuo, prazo e preço.
Medir o gabinete do banheiro (mármore, esgoto, registros, cuba) — ver claude/gabinete-banheiro.md.
Armário da área de serviço: confirmar se o beiral entra nos 2100; cliente confirmar com o instalador de gás se o botijão pode ficar no móvel.

Do Claude

Folha de teste completa com vistas do FreeCAD + cotas + carimbo, comparada com o PDF atual e o Inventor.
Testar texturas Guararapes e CAD de Blum/Hettich (escala, licença).
Completar leitura de Mozaik e Promob Maker; escrever a especificação final da base.
Testar o iLogic no Inventor (precisa do Nathan no trabalho).
Refazer fotos Blender do gabinete com sifão e dobradiças novos (precisa do Blender aberto).
