PLANO MESTRE — Configurador de Móveis (10/11/2026)

Este é o plano que o Nathan aprovou para seguir daqui em diante. Onde cada item mora no código, quanto custa e a Fase 0 (preparar o código): docs/plano-execucao.md. Ele vem da revisão completa do programa contra os programas de mercado.

Substitui a conferência de 08/11 (lacunas-especificacao.md, apagada).
A ordem dos blocos substitui a "Ordem A" e a fila da tela.
Como usar (regras)
Começo de cada conversa: ler este documento junto com a passagem. O próximo trabalho sai da ordem aprovada (fim do documento), um bloco por vez, com aprovação do Nathan antes do próximo.
Pedido novo do Nathan:
se já está na lista, citar o número (ex.: "item 29");
se não está, acrescentar com número novo na área certa e dizer em que bloco entra.
Pedido urgente (defeito, perda de dados) passa na frente; o resto entra na fila.
Ao terminar um item: marcar ✅ feito dd/mm (commit, artifact vN) na linha do item e mover o resumo para "Já existe".
Antes de cada bloco: reler a pesquisa (pesquisa-base-parametrica.md) e as fontes abaixo para não deixar detalhe de fora. O bloco fecha com um caso real saindo completo em todas as saídas.
Divagação: se a conversa sair do plano por muitos pedidos soltos, o Claude avisa e mostra onde o plano parou.
Como foi feita
Mercado:
pesquisa de 06/11: Promob Maker, Polyboard, Mozaik, Woodwork for Inventor, Cabinet Vision, Blum, CorteCloud;
mais, em 10/11:
tabela completa de recursos do Mozaik;
artigos de suporte do Promob Plus e do Promob Maker;
Cabinet Vision (Hexagon);
manual completo do DinaBox, o concorrente brasileiro mais parecido com o nosso escopo (cobre do projeto à produção);
Gabster (o site bloqueou a leitura; só a descrição geral);
Pro100, SketchList, CabinetSense, Flatma (comparativo de 2026).
Programa:
inventário de dados/ (biblioteca com 47 itens, materiais, métodos, puxadores);
opções do editor (frentes, conteúdos), campos e botões da tela;
busca no código, conferindo os casos duvidosos.
Não usei cada função na tela, então um recurso com outro nome pode ter escapado [Provável no conjunto].
Fora desta revisão:
render: será feito no Blender (decisão do Nathan, 10/11);
realidade virtual;
ERP financeiro e multiusuário com permissões;
G-code próprio para CNC (o Nathan não tem CNC; a loja fura).
Já existe (resumo)
Estrutura do móvel:
árvore de vãos (dividir em pé/deitado, juntar qualquer vizinho, medida de cada vão);
frentes: porta, 2 portas, correr (RO-27, Dominus), basculante com pistão, gaveta;
conteúdos: prateleiras, divisórias em pé, vassoura, vassoura + sapateira, gavetas internas, botijão + gavetas.
Construção:
métodos de construção (lateral passante/entre, topo inteiro/travessas, rodapé/pés/clip, fundo sobreposto ou em rasgo, junção parafuso/minifix/cavilha, sistema 32/4 furos);
dobradiças por altura, peso e distância; colisão de abertura.
Ambiente:
parede reta ou em L;
balcão, gaveteiro, canto cego, aéreo, torre;
pontos de água, esgoto, gás e tomada;
tampo de pedra contínuo; planta;
peça livre (1a, 1b); ajuste por peça (1c-i).
Material: veio no plano de corte; material das frentes.
Puxadores: 5 modelos + Perfil G.
Saídas:
lista e plano de corte (guilhotina), compras;
CorteCloud, etiquetas com QR, folha A3, iLogic, GLB, pacote do Blender, volumes (só no móvel solto).
Comercial: orçamento com horas, despesas, markup, impostos, sinal, prazo, validade, "não incluso" e revisões; estudo/aprovado/liberado.
Arquivo: salvar .json e no Drive, nuvem automática, versão sem internet, desfazer.
Falta — por área

Entre parênteses, quem tem. ★ = destrava trabalho real (guarda-roupa ou cozinha).

A. Ambiente e obra
★ Formato em U e ângulo real entre paredes. Hoje só reta ou L a 90° (Mozaik, Polyboard).
★ Ilha e península (Mozaik, Promob). A 1c-ii cobre a ilha em parte.
★ Portas e janelas na parede (largura, altura, peitoril), com o móvel respeitando o vão (Mozaik, DinaBox).
★ Obstáculos: pilar, viga, cano; móvel recortado em volta (Polyboard, DinaBox).
Medição real: 3 alturas por parede, prumo e esquadro, menor medida útil, sobra de ajuste (pesquisa F1).
Planta (PDF ou foto) como fundo em escala.
Pontos que faltam: interruptor e registro.
★ Vão de eletro de piso: geladeira, fogão, lava-louças, com folga do fabricante (Mozaik).
Rodapé corrido, rodateto/sanca, lateral de acabamento e tamponamento automáticos (Mozaik, DinaBox).
★ Bancada:
recorte de cuba e cooktop;
rodabanca/frontão;
tampo em cascata até o chão (Mozaik).
Vários ambientes no mesmo projeto; copiar e espelhar ambiente (Mozaik) [Provável: hoje é um ambiente por projeto].
Levantamento completo da obra (auditoria, passo 5).
B. Módulos e conteúdos
72. ✅ Feito 11/11/2026 — “Juntar com o vizinho” movido para logo abaixo da seleção dos Espaços, seguido de “Dividir em mais espaços”, antes dos campos do vão. Pedido de facilidade de uso do Nathan; funcionamento de juntar preservado.
71. ✅ Feito 11/11/2026 — separar as escolhas do editor: Vassoura e aspirador, Sapateira e Botijão. Retirados os botões Vassoura + sapateira e Botijão + gavetas; projetos antigos conservam seus conjuntos. Pedido adicional do Nathan, antecipado durante a Fase 0; o próximo passo da Fase 0 continua sendo 0.7.
★ Guarda-roupa: cabideiro (tubo + suportes), maleiro, calceiro, cabide basculante (Promob, DinaBox). Sem isso não sai guarda-roupa.
★ Modelos prontos por ambiente e "salvar o meu como modelo" (todos; DinaBox salva na nuvem por categoria). É o passo 3 do plano.
Canto em L com dobradiça 165°; torre de canto 45° (Promob, DinaBox).
Copiar e espelhar módulo; girar 90° (Mozaik, DinaBox).
Medida mínima e máxima por módulo (Promob).
Módulo com formato:
chanfrado ou curvo;
inclinado embaixo de escada ou de telhado (Polyboard, Mozaik).
Prateleira de vidro; prateleira "invisível"; divisória dupla estrutural (DinaBox).
Agregados: aramado, cesto, lixeira, divisor de talheres, tulha, sapateira inclinada, rodízio, LED (Promob, DinaBox).
★ Eletro embutido: forno, micro-ondas, cooktop, coifa (nicho pela medida do aparelho; Promob, Mozaik).
Cama de casal e de solteiro com gaveteiro (DinaBox).
C. Frentes e ferragens
★ Gola e cava, incluindo perfil cava em L ou C (Promob, DinaBox, Mozaik).
Estilos:
ripada;
provençal ou almofadada;
vidro com alumínio;
espelho;
tamburato (Promob).
★ Recobrimento total, parcial ou embutido, com dobradiça reta, curva ou supercurva e calço certo. A biblioteca só tem a reta.
Painel fixo e frente falsa; fecho toque em porta e gaveta.
Veio contínuo entre frentes vizinhas.
Ajuste de dobradiça por porta: quantidade, posição, recuo (DinaBox).
Puxador por vão: **em andamento (11/11): escolha de modelo por vão e herança do móvel implementadas.** Restante: modelo + posição juntos, "usar em todos os vãos", altura (em cima/meio/embaixo), "abre para baixo", "sem puxador (fecho toque)". Já combinado em 10/11.
Corrediça oculta (undermount) e gaveta metálica tipo Tandembox (Mozaik, Promob).
Junção confirmat; mão-francesa, cantoneira, suporte invisível na biblioteca.
D. Construção
Ligação entre peças editável (quem passa por cima de quem) e meia-esquadria 45° (Polyboard, Mozaik).
Fórmulas e parâmetros próprios; mostrar de onde vem cada valor (Mozaik).
Tampo engrossado e peça dupla (DinaBox, Promob).
E. Materiais e fita
★ Acabamentos reais: fabricante, código, textura, preço por chapa, fita que combina (Guararapes, Berneck, Duratex).
Fita por lado: espessura (0,45 / 1 / 2), altura (19 a 64), PVC ou ABS; desconto da fita na medida, configurável. Hoje: fita genérica de 22 e 35.
Material por grupo: portas, gavetas, caixa, prateleiras e tamponamentos separados (DinaBox). Hoje só "frentes".
Vidro e espelho com preço por m² (Promob).
Tapa-furo por cartela.
F. Corte e loja
Sobras registradas e reaproveitadas; etiqueta de retalho (Mozaik, DinaBox).
Otimizador melhor: escolher o sentido do 1º corte; vários tamanhos de chapa do mesmo material (Mozaik, DinaBox).
Juntar vários projetos num só plano de corte (lote; DinaBox).
Perfil de cada loja e "enviar pedido para a loja" (Promob Maker). Depende das respostas das lojas.
CorteCloud com recortes e vazados.
DXF por peça (para loja com CNC ou arquiteto).
Etiqueta com modelo editável (DinaBox). Hoje o modelo é fixo.
G. Documentos
★ Folha A4 para peças pequenas.
★ Carimbo com logo, nome da empresa e cidade (faltam os dados da empresa).
★ Para o cliente: planta e elevações cotadas do ambiente, capa, legenda (Mozaik, DinaBox).
Prancha por módulo com tabela de peças (DinaBox).
Manual de montagem (auditoria, passo 6).
STEP.
Cotas e notas manuais no desenho.
H. Comercial
Cadastro de clientes; projetos com situação (rascunho, fechado, produção, perdido) e busca (DinaBox, Mozaik). Hoje: "Meus projetos" sem situação.
Contrato de venda gerado do orçamento, com garantia (DinaBox, Mozaik).
Preço por m², por metro, condicional (ex.: só se tiver gaveta) para insumos (DinaBox).
Descontos pré-definidos; comissão de arquiteto (DinaBox).
Custo × lucro por categoria com gráfico; custo real × orçado depois da obra (DinaBox, Mozaik).
Orçamento alternativo (mesmo móvel, outro acabamento) lado a lado (Mozaik).
Página do cliente: catálogo, troca de acabamento, aceite.
Pedido de compra por fornecedor.
Robô de briefing do cliente (F13, já planejado).
I. Produção
Acompanhar peça por peça (cortada, fitada, furada, montada); checklist de carregamento (DinaBox PCP).
Volumes de transporte do ambiente (hoje só no móvel solto).
Pedido de peça de reposição (Mozaik).
J. Entradas e tela
Importar peças do Blender, FreeCAD ou Inventor (pedido nº 2 do Nathan).
Inserir modelo 3D próprio (eletro, acessório) na cena (Mozaik, Promob).
Histórico de versões do projeto, voltar a uma versão (Promob). A nuvem guarda só a última.
Localizar peça pelo código (DinaBox).
Cubo de navegação no 3D.
Ordem aprovada (10/11/2026)

O Nathan aprovou este documento ("é o que vamos seguir de agora em diante"); a ordem é a sugerida pelo Claude, sem mudança pedida.

Antes do bloco 1: Fase 0 (separar o código em arquivos pequenos, sem mudar resultado — ver plano-execucao.md) e duas pendências curtas:

aprovar a 1c-i;
fechar o item 29 (puxador por vão), que já estava combinado.
Guarda-roupa: 13, 25, 30, 14 (modelos prontos).
Cozinha real:
1c-ii/1c-iii (ilha);
3, 4, 8, 10, 21, 1/2;
1d.
Frentes: 23, 26, 29.
Acabamentos e fita: 35, 36, 37.
Documentos: 47, 48, 49.
Obra e montagem: 12, 51.
Comercial: 54, 55, 56.
Loja: 43, 44, 40, depois das respostas das lojas.

Itens de Ambiente que dependem da caixa livre: 1c-ii (solta/afastada, 4 lados) e 1c-iii (giro livre). Detalhe em peca-caixa-livre.md. Entram no bloco 2.

Defeitos conhecidos, que entram quando tocar na área:

no celular, a barra de cima passa da largura da tela;
ao dividir, o vão escolhido volta para o Vão 1;
correr e basculante da parede B não animam no 3D;
Perfil G com desconto suposto de 20 mm (conferir na peça).

Pendências fora do app (do Nathan):

perguntas às lojas de Ponta Grossa;
peça de teste de furação;
catálogos de gola e cava;
texturas Guararapes e arquivos 3D Blum/Hettich;
dados da empresa (nome, logo, cidade) para o carimbo.
Fontes
Mozaik — recursos por versão
Mozaik — visão geral (Cyncly)
DinaBox — manual geral do plugin
DinaBox — planos e módulos
Promob — central de ajuda (categorias)
Promob Maker — seção de ajuda
Promob Maker — página do produto
Cabinet Vision (Hexagon)
Gabster (Portal Software)
Comparativo de 12 programas (2026)
Pesquisa de 06/11: claude/pesquisa-base-parametrica.md

73. ✅ 11/11/2026 — Manrope nos textos e números (opção 2 escolhida por Nathan), embutida para funcionar offline; dígitos alinhados nas medidas.

74. ✅ 11/11/2026 — Fechamento do módulo independente do interior: duas portas inteiras podem cobrir a sapateira e as divisões superiores. Modo por vão preservado e reversível; escopo atual é o módulo inteiro. Pesquisa e limites em docs/portas-interior.md.

75. ✅ 11/11/2026 — Corrigida abertura do offline com medidas de peças ajustadas: painel preparado antes de recuperar o projeto; regressão na área reabrir.
