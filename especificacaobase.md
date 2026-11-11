Especificação final da base paramétrica — APROVADA (06/11/2026)

Base própria do configurador, desenhada a partir da pesquisa (claude/pesquisa-base-parametrica.md: Promob Maker, Polyboard, Mozaik, Woodwork for Inventor, Blum, CorteCloud, Rometal) e das decisões do Nathan (claude/plano-reestruturacao.md). Substitui o "modelo preliminar" de claude/arquitetura.md. Aprovada pelo Nathan em 06/11/2026 (decisões na seção 13).

1. Objetivo

Projetar ambientes inteiros (cozinha, guarda-roupa/closet, banheiro, lavanderia, painel, escritório, comercial) montando módulos a partir de regras — sem programar um gerador por móvel — e tirar de um único projeto: 3D para o cliente, orçamento com revisões, lista de compras, pedido para a loja de corte, desenhos de cada peça, etiquetas, manual de montagem e arquivos para CAD.

2. As 7 camadas da base
1 AMBIENTE        paredes reais, aberturas, pontos, obstáculos
2 MÓDULO          volume posicionado no ambiente (inferior, superior, torre, canto, painel…)
3 ÁRVORE DE VÃOS  como o volume é dividido e o que vai em cada vão
4 FRENTES         portas de giro, correr, basculante, gavetas, painéis
5 CONSTRUÇÃO      método de construção + ligações entre painéis (quem passa, quem encosta)
6 REGRAS          ferragens e usinagens aplicadas sozinhas (com furação)
7 CATÁLOGOS       acabamentos, ferragens/kits, métodos, módulos prontos, lojas, preços
→ PEÇAS (lista única) → todas as saídas
2.1 Ambiente
Paredes: comprimento, altura, espessura, ângulo real entre paredes; medida em 3 alturas (baixo, meio, alto) e prumo.
Aberturas: porta, janela (posição, largura, altura, peitoril).
Pontos: água, esgoto, gás, tomada, interruptor, registro (posição e altura).
Obstáculos: coluna, viga, cano, sanca, rodapé existente.
Entrada: formulário de medição (trena/laser) ou planta (PDF/imagem) como fundo em escala.
O sistema usa a menor medida útil de cada parede e propõe sobras de ajuste (acabamento lateral/rodateto) — folga de instalação padrão por lado nas regras. [Suposição: 5–10 mm, confirmar com o montador]
2.2 Módulo
Linha: inferior, superior (aéreo), torre/coluna, painel, guarda-roupa, nicho, ilha, canto (reto, L, oblíquo).
Volume (L × A × P) com mínimo e máximo; posição na parede (distância do canto, altura do chão).
Encaixe automático na parede e nos módulos vizinhos; aviso se cobrir ponto (tomada, esgoto) ou obstáculo.
Cantos são módulos próprios, com regra de folga para a porta vizinha não bater (enchimento/cego).
Tampo contínuo, rodapé corrido e fechamentos (laterais acabadas, tamponamentos) como elementos do ambiente que atravessam vários módulos.
2.3 Árvore de vãos
DIVIDIR (vertical/horizontal; separador: divisória, prateleira fixa, travessa ou nenhum; partes com medida fixa, % ou "auto").
CONTEÚDO: prateleiras (soltas/fixas), gavetas, gavetas internas, cabideiro, sapateira, aramado, lixeira, vassoura, botijão, nicho aberto, eletro (forno, micro-ondas — vão com medida do aparelho), vazio.
Posição proporcional ou fixa (Polyboard). Cada vão aponta o erro que gerar (vão menor que o mínimo etc.).
2.4 Frentes
Abertura: giro (lado auto/esq/dir), 2 portas, correr (sistema da biblioteca: descontos de altura, transpasse, trilhos, peso máximo), basculante (articulador/pistão pelo peso), gaveta, painel fixo, fecho toque.
Recobrimento: total, parcial ou embutida (define dobradiça reta/curva/supercurva).
Estilo: reta, gola, cava, ripada, perfil, provençal, vidro/alumínio (lista do Promob como referência; começa por reta, gola e cava). [Suposição]
Folgas pelos vizinhos (borda, entre frentes, contra parede) e cálculo automático de largura e quantidade de portas por vão.
Material, fita e puxador próprios da frente.
2.5 Construção: método + ligações
Método de construção = conjunto de parâmetros com nome, salvo no catálogo (modelo Mozaik):
laterais passantes ou topo/base passantes;
laterais até o chão (rodapé recuado) ou sobre pés/rodapé;
topo inteiro ou travessas (frontal/traseira, largura);
fundo: sobreposto parafusado, em rasgo (profundidade, recuo, folga) ou rebaixo; espessura;
rodapé: altura, recuo, ou pés reguláveis;
junção: parafuso, minifix, cavilha ou combinação; face de inserção;
furação de prateleira: sistema 32 (linha a 37, passo 32) ou 4 furos;
espessuras por tipo de peça; tampo simples ou engrossurado.
Herança em níveis: padrão → projeto → ambiente → módulo → peça. A tela mostra de onde veio cada valor e permite sobrescrever.
Ligação entre painéis vizinhos (modelo Polyboard "links"): para cada encontro, quem passa (sobrepõe) e quem encosta, sobreposição (pode ser negativa), tipo (encosto, recuo, rasgo, meia-esquadria) e posição. O método de construção define as ligações padrão; a peça pode sobrescrever.
Fórmulas permitidas nos parâmetros (ex.: largura da travessa = 100 ou P/4).
2.6 Regras de ferragem e usinagem

Cada regra = quando se aplica → item da biblioteca → quantidade e posição → furos/rasgos em cada peça → parafusos consumidos.

Dobradiça pela altura e peso da porta; calço e caneco pelo recobrimento.
Corrediça (telescópica, oculta) pela profundidade: 260 a 1800, passo 50; desconto na gaveta pelo modelo.
Porta de correr: sistema escolhido; erro se passar do peso (peso = área × espessura × densidade do MDF ~730 kg/m³ [Provável]).
Basculante: articulador/pistão pelo peso e altura.
Junção (parafuso, minifix, cavilha), prateleira, puxador, pé, cabideiro, LED.
Kits: um item de compra que reúne vários (dobradiça + calço + parafusos).
Toda usinagem guarda: face, x, y, Ø, profundidade, passante ou não — no formato que a loja/CNC aceita.
Fixações por contato (já existe) continuam, agora a partir das ligações.
2.7 Catálogos (arquivos de dados no GitHub)
Arquivo	Conteúdo
acabamentos.json	fabricante, linha, padrão, código, espessuras, tem veio, textura (imagem + tamanho real em mm), fita que combina
biblioteca.json	ferragens, kits, fixação, fitas (espessura 0,45/1/2; altura 19–64), acessórios, com modelo 3D quando houver
metodos-construcao.json	métodos com nome (ex.: "Padrão Nathan", "Cozinha com rodapé recuado", "Fundo em rasgo")
modulos.json	módulos prontos por ambiente (gabinete do banheiro, armário da área de serviço, balcão de pia, aéreo, torre quente, guarda-roupa de correr…) — todos editáveis
lojas.json	perfil de cada loja: chapa, refilo, serra, fita, se fura em CNC, formato de arquivo, medida com ou sem fita
regras.json	folgas, limites, tabelas (já existe)
preços	separados por usuário (Google Drive), com data
3. Peças (lista única) — o que cada peça carrega

id, papel (já existe), lado, módulo e vão de origem, material (herdado), veio (sentido ou "sem veio"), espessura, medida final e medida de corte (descontada a fita conforme a loja), fita por lado (C1, C2, L1, L2: espessura, altura, cor), furos e rasgos, ligações, posição 3D, movimento, número de etiqueta.

4. Saídas
3D técnico e do cliente (com troca de acabamento).
Lista de corte e plano de corte com veio (peça com veio não gira; frentes podem pedir veio contínuo), sobras reaproveitáveis registradas.
Pedido para a loja no formato do perfil da loja: planilha (CSV) e CorteCloud JSON (peças, fitas por lado, furos e rasgos); outros formatos quando as lojas responderem.
Etiquetas das peças (aprovado): código (seção 15), módulo, peça, medida, fita, veio e QR que abre a peça no manual de montagem.
Desenho de cada peça (A4 para pequenas, A3 para grandes), gerado no próprio configurador: vistas, corte, isométrica, cotas de furo com distância entre furos (seção 14), tabela de furos, fita marcada, carimbo ABNT com dados do Nathan e código da peça (seção 15).
Desenhos do ambiente: planta e elevações cotadas.
Lista de compras e orçamento com revisões congeladas (Rev A, B…), blocos móvel/instalação, aceite do cliente.
Manual de montagem: sequência, vista explodida, fixações; para itens pequenos, também ao cliente.
iLogic (Inventor), FreeCAD/STEP, GLB (Blender), pacote .zip.
Catálogo do cliente: fotos, 3D, troca de acabamentos, orçamento vigente.
5. Entradas externas

Formato único de projeto. Blender (chapas como blocos → peças; furos pelas regras), FreeCAD e Inventor (iLogic lê a montagem de MDF). O configurador é sempre a fonte das medidas.

6. Tela (como o Nathan vai trabalhar)
Modo Ambiente: planta vista de cima + elevação de cada parede; arrastar módulos do catálogo; medidas do ambiente.
Modo Módulo: clicar no módulo → árvore de vãos ao lado + clique no vão no 3D → opções (dividir, porta, gaveta, prateleiras…).
Modo Peça: propriedades da peça, mostrando o que é herdado e o que foi sobrescrito.
Painel de construção: método do projeto/ambiente/módulo.
Erros e avisos clicáveis levam ao vão/módulo responsável.
7. Validações principais

Mínimos e máximos de módulo e vão; porta > largura máxima; peso de porta de correr e basculante; colisão de abertura com parede/vizinho; módulo sobre ponto ou obstáculo; botijão sem ventilação; gaveta interna × puxador; peça maior que a chapa; peça com veio que não cabe sem girar; peça sem papel; método de construção incompatível (ex.: fundo em rasgo com fundo de 18).

8. Casos de borda
Caso	Comportamento
Parede fora de esquadro/prumo	menor medida útil + sobra de ajuste sugerida
Soma de módulos maior que a parede	erro na parede com a diferença
Canto sem folga para a porta	aviso + sugestão de enchimento
Item de catálogo removido	mantém no projeto com aviso
Projeto antigo (gabinete, armário)	converte para módulos e salva como arquivo novo
Preço mudou depois do orçamento enviado	revisão enviada continua com o preço antigo; nova revisão usa o novo
Loja sem perfil cadastrado	saída em planilha genérica
9. Riscos
Tamanho: é a parte maior do projeto. Mitigação: sub-etapas pequenas, cada uma testável e publicada.
Mudar medidas sem perceber: gabinete e armário continuam como testes de referência — a conversão para módulos tem que gerar as mesmas peças.
FreeCAD só na nuvem: resolvido em D3 — desenhos no navegador; FreeCAD só para STEP.
Dados de cliente: projetos no Google Drive, nunca no GitHub.
Normas de gás/instalação: o sistema avisa; a responsabilidade técnica fica com o instalador.
10. Fora desta etapa (entram depois)

Robô de briefing do cliente (F13); formatos específicos de cada loja (após as respostas das lojas); estilos de frente além de reta/gola/cava; CNC direto.

11. Ordem de implementação (sub-etapas, cada uma aprovada antes da próxima)
Sub-etapa	Entrega	Teste de aceite
4a	Núcleo: projeto → ambiente → módulo → árvore de vãos → peças, ao lado do atual	gabinete e armário convertidos geram as mesmas peças da referência
4b	Método de construção + ligações + herança em níveis	trocar "laterais passantes" por "topo passante" refaz as medidas certas
4c	Frentes: giro, gaveta, correr, basculante; folgas por vizinho	guarda-roupa de correr de teste sem erro; peso validado
4d	Regras de ferragem/usinagem com kits	dobradiças por altura e peso; corrediça 260–1800
4e	Materiais por peça, veio, fita por lado, medida de corte	plano não gira peça com veio; medida de corte descontada
5a	Tela: modo módulo (árvore + clique no vão)	montar um armário do zero pela tela
5b	Tela: modo ambiente (paredes, pontos, cantos, aéreos, tampo)	cozinha em L de teste
5c	Saídas novas: CorteCloud, etiquetas, desenho de peça novo, orçamento com revisões	arquivos gerados e conferidos
6	Projetos e revisões no Google Drive; conversão de projetos antigos	abrir o armário de hoje no formato novo
7	Publicar com bibliotecas embutidas	funciona sem internet
12. Como o Nathan testa (ao final)
Abrir o modelo "Gabinete do banheiro" e o "Armário da área de serviço": mesmas listas de hoje.
Desenhar uma cozinha em L de 3,0 × 2,2 m com pia, cooktop, aéreos e torre de forno; ver erros de ponto/canto.
Trocar o método de construção do projeto e ver as peças mudarem sem redesenhar.
Trocar o acabamento das frentes para um amadeirado e ver o plano de corte respeitar o veio.
Gerar orçamento Rev A, mudar uma porta, gerar Rev B: a Rev A continua igual.
Gerar pedido para a loja (planilha e CorteCloud) e as etiquetas.
13. Decisões do Nathan (aprovadas em 06/11/2026)
Especificação aprovada. Começa a sub-etapa 4a.
D1 — Ordem: módulo e árvore de vãos primeiro (4a–5a); ambiente inteiro depois (5b).
D2 — Frentes iniciais: reta, gola e cava.
D3 — Desenhos: gerados no próprio configurador, no navegador, com o layout da folha de teste (vistas, corte, isométrica, cotas, tabela de furos, fita marcada, carimbo). FreeCAD só para STEP/.FCStd quando precisar.
Tipo novo de móvel também pela tela: qualquer móvel de caixa nasce de módulo + árvore de vãos + frentes e pode ser salvo como modelo pronto no catálogo (modulos.json), sem programar. Só precisa do Claude o que for regra nova (ex.: peça curva, ferragem com comportamento novo, conteúdo novo como "adega").
D4 — Etiquetas com QR: incluir, junto com um sistema de codificação (abaixo).
D5 — Junção: opção do método de construção, com parafuso como padrão; minifix, cavilha e confirmat disponíveis. Base de conhecimento de fixadores e acessórios por função: claude/catalogo-fixadores-acessorios.md (usar na 4d).
14. Cotagem dos desenhos (pedido do Nathan: atenção especial aos furos)

Regras para o desenho de peça (sub-etapa 5c), conforme NBR 10126 (cotagem):

Cota total de largura e altura sempre presentes.
Furos com cotas de coordenada a partir de uma referência (canto da peça) e cotas em cadeia entre furos do mesmo grupo — a distância entre um furo e outro aparece direto no desenho (ex.: canecos 100 / 572,3 / 572,4 / 572,3 / 100; puxador 320 entre furos).
Distância do primeiro e do último furo até a borda sempre cotada.
Grupos de furos iguais com chamada única (ex.: "4× Ø35 prof. 13") e posição do grupo (centro a 22 da borda).
Tabela de furos (nº, X, Y, Ø, profundidade, face, função) — como no PDF atual.
Furos na face oposta desenhados tracejados e indicados na tabela; furos no topo (cavilha, minifix) em vista lateral ou corte.
Cotas nunca cruzam outras cotas; texto sempre legível pela base ou pela direita; espaço mínimo entre linhas de cota.
Fita marcada nas bordas (linha grossa colorida) e listada no carimbo; veio com seta.
Escala escolhida para a peça caber; A4 para peças pequenas, A3 para grandes (decidido pelo tamanho).
Diagramação em grade (pedido do Nathan): a folha é dividida em colunas; cada vista com seu título fica centralizada na área livre da sua coluna (calculando o tamanho real do bloco: título + cotas + vista + vistas auxiliares); margens iguais em cima e embaixo; títulos de todas as colunas na mesma linha; nada encosta no quadro nem no carimbo (mínimo 10 mm); textos e cotas nunca sobrepõem outras vistas.
Cotas em cadeia (entre furos) e cotas a partir da base em colunas separadas, para as linhas de chamada não riscarem os números.
Distância das cotas (pedido do Nathan: não ficar distante): 1ª linha de cota a 10 mm da peça, as seguintes a 7–9 mm uma da outra (NBR 10126); linhas de chamada começam a 1,5 mm da peça.
Ajustes manuais (decisão do Nathan, 06/11/2026): só no detalhamento — mover vista, mover cota, acrescentar cota ou nota — feitos dentro do configurador e guardados no projeto (reaplicados se a peça mudar; aviso quando um ajuste deixar de servir). Prioridade é a diagramação automática sair certa, para os ajustes quase nunca serem necessários. Medidas e peças nunca são editadas no desenho, sempre no projeto.
15. Codificação (proposta — confirmar formato na sub-etapa 5c)
Nível	Formato	Exemplo
Projeto	AAMM-NN (ano, mês, sequência do mês)	2611-03
Ambiente	letra	A (cozinha), B (lavanderia)
Módulo	M + nº no ambiente	M02
Peça	P + nº no projeto	P014
Código completo da peça	projeto · ambiente-módulo · peça	2611-03 · A-M02 · P014
Revisão	letra	Rev B
O código vai na etiqueta (com QR), no desenho da peça, na lista de corte, no pedido da loja, no manual de montagem e no iLogic (nome do arquivo da peça).
O QR abre a peça no manual de montagem (onde ela entra e o que se prende nela).
Itens da biblioteca têm código próprio por família (ex.: FX- fixação, DB- dobradiça, CR- corrediça, PX- puxador, AC- acessório) além do código do fabricante. [Suposição]
