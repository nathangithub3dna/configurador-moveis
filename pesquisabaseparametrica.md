Pesquisa profunda — base paramétrica própria (06/11/2026)

Decisão do Nathan: construir a base própria, no modelo dos programas de mercado, completa desde o início. Escopo confirmado: ambiente completo (vários módulos, cantos, aéreos, tampo contínuo); todos os ambientes (cozinha, guarda-roupa/closet, banheiro, lavanderia, painel/home, escritório, comercial); portas de correr desde o início; medição com trena + combinação (trena, laser, planta); material por peça com veio respeitado; FreeCAD a testar e comparar com o Inventor (em casa só há Blender e FreeCAD); revisões de orçamento congeladas com aceite; considerar todos os pontos levantados (fora de esquadro, loja de corte, fornecedor/contrato).

Programas estudados: Promob Maker (guia do produto, 268 slides), Polyboard (lista de recursos), Mozaik (métodos de construção), Woodwork for Inventor, Cabinet Vision, Blum Cabinet Configurator, CorteCloud (formato de importação), Rometal RO-27 (manual técnico), guias de precificação.

Estrutura: para cada função — o que o mercado faz → o que já temos → o que a nossa base precisa → o que falta verificar.

F1. Ambiente (paredes, aberturas, pontos, medição)

Mercado

Polyboard: paredes, pisos e bancadas em qualquer posição; "snap" automático dos módulos nas paredes; ferramenta de medição; desvio de obstáculos (colunas, canos: "un-boxings").
Promob: ambiente com paredes; afastamento da parede editável; ilhas; inserção automática de acessórios por ambiente.

Temos: paredes fixas em volta de um móvel; faixa do esgoto do gabinete.

A base precisa

Ambiente = planta com paredes (comprimento, altura, espessura, ângulo entre paredes — não supor 90°), aberturas (porta, janela: posição, largura, altura, peitoril), pontos (água, esgoto, gás, tomada, interruptor, registro: posição x/altura) e obstáculos (coluna, viga, cano, rodapé existente, sanca).
Medição real: cada parede com medida em 3 alturas (embaixo, meio, em cima) e prumo/esquadro → o sistema calcula a menor medida útil e sugere sobras de ajuste (enchimento/acabamento de ajuste lateral e rodateto). Entrada por formulário de medição (trena) ou planta (PDF/DWG como imagem de fundo em escala).
Módulos encostam em paredes e uns nos outros; o sistema avisa conflito com ponto (tomada atrás de lateral, esgoto atrás de gaveta).

Verificar: formato de planta que você recebe (DWG/PDF); quanto de tolerância usar (proposta: folga de instalação 5–10 mm por lado, ajustada no acabamento). [Suposição]

F2. Módulos e divisões (o "esqueleto")

Mercado

Promob: módulos por linha (inferior, superior, torre/despenseiro, coluna, ilha, canto reto/L/oblíquo de 1 e 2 portas, cantoneira diagonal/chanfrada/curva, basculante, adega, micro-ondas); "Construtor de Armários": monta armário por vãos (divisórias, prateleiras, agregados, portas, gavetas); dimensões com mínimo e máximo por módulo; agregados (aramados, lixeiras, tulhas, divisor de talheres); explodir/agrupar; espelhar.
Polyboard: painéis com relações entre vizinhos; elementos internos em posição proporcional ou fixa; casings internos (prateleira + lateral num comando); divisões em qualquer ângulo; laterais/topo inclinados; forma livre; modo catálogo (vários módulos editados em planilha).
Woodwork for Inventor: esqueleto sólido revestido por painéis; iBox que se adapta ao volume interno.

Temos: gabinete e armário com vãos fixos no código.

A base precisa

Módulo = volume (L × A × P) com tipo de linha (inferior, superior, torre, painel, guarda-roupa, nicho, ilha) e limites (mín./máx.).
Dentro do módulo, árvore de vãos (já especificada em claude/arquitetura.md): DIVIDIR (vertical/horizontal; medida fixa, proporcional ou "auto") e CONTEÚDO (prateleiras, gavetas, cabideiro, sapateira, aramado, lixeira, vazio, agregados).
Cantos como módulos próprios: canto reto (com cego/enchimento), canto L (dobradiça 165°), canto oblíquo — cada um com regra de folga para a porta do vizinho não bater.
Biblioteca de módulos prontos por ambiente, todos editáveis (equivalente ao catálogo do Promob).
Módulo pode ser explodido em peças avulsas para casos especiais (sair da regra sem perder o resto).
F3. Método de construção (separado do desenho)

Mercado

Mozaik: cada detalhe da caixa é um parâmetro; o conjunto forma um método de construção com nome, salvo e carregado em outros trabalhos. Parâmetros: laterais até o chão ou não; travessas (frontal/traseira) ou topo inteiro; direção das travessas; ligação fundo–lateral (sobre, encostado, entre); recuo do fundo; tipo de junção; furação de prateleira (System 32); espessura do fundo. Níveis: padrão global → por trabalho → por armário (override). Valores podem ser fórmulas.
Promob: montagem da caixa (laterais interna ou externa, travessas, com/sem fundo); fundo e travessas com posição, profundidade e folga de rasgos e rebaixos; rodapés frontais/laterais/traseiros removíveis; espessuras 15/18/25; tampos simples, compostos, engrossurados.
Polyboard: elementos configurados por métodos e regras de fabricação, com override manual de qualquer peça.

Temos: um método fixo dentro de cada gerador (laterais passantes, fundo sobreposto parafusado, rodapé recuado).

A base precisa

Método de construção como objeto próprio, com nome, em níveis: padrão → projeto → ambiente → módulo → peça. Mudar o método refaz as peças sem mexer no desenho.
Parâmetros mínimos (a partir de Mozaik e Promob):
Laterais: passantes (topo/base entre elas) ou topo/base passantes.
Laterais até o chão (rodapé recuado entre elas) ou sobre pés/rodapé.
Topo: inteiro ou travessas (frontal/traseira, largura).
Fundo: sobreposto parafusado, encaixado em rasgo (profundidade, recuo, folga) ou rebaixo; espessura.
Rodapé: recuado (altura, recuo), pés reguláveis, sem.
Junção: parafuso, minifix, cavilha, cavilha + minifix; face de inserção (interna/externa).
Furação de prateleira: System 32 (linha a 37, passo 32) ou 4 furos por prateleira.
Espessuras por tipo de peça (caixa, frente, fundo, prateleira, tampo).
Tampo: simples, engrossurado (com travessas), pedra (referência).
Fórmulas permitidas nos parâmetros (ex.: largura da travessa = 100 ou P/4).
F4. Frentes (portas, gavetas, correr, basculante)

Mercado

Promob: portas reta, perfil 45/50, perfil borda, gola, versatile, ripada, perfil Y, provençal, almofadada, cava, alumínio com vidro ou MDF; frentes de gaveta reta, com rebaixo, usinada, gola, fecho toque, sem frente; portas deslizantes simples/duplas (15/18/25); tamburato (porta grossa com miolo colmeia); cálculo de portas por folgas laterais e centrais.
Rometal RO-27 (correr): altura da folha = vão − 7 (embutido) ou vão − 15 (sobreposto); transpasse 20–30 mm; porta de 15 a 25 mm; até 20 kg por porta; carros com furo Ø35 × 12; kit por porta = 2 carros inferiores, 2 superiores, 2 freios. Linhas maiores (Dominus 50–80 kg) para guarda-roupa.

Temos: porta reta de giro (sobreposição total), frente de gaveta reta, gaveta interna recuada.

A base precisa

Frente como objeto com: tipo de abertura (giro, correr, basculante, gaveta, fixa/painel, fecho toque), recobrimento (total, parcial, embutida), estilo (reta, gola, cava, ripada, perfil, vidro/alumínio, provençal), material e fita próprios.
Folgas por regra (borda, entre frentes, contra parede) e cálculo automático de quantas portas por vão e a largura de cada uma.
Correr: sistema escolhido na biblioteca define descontos de altura, transpasse, trilhos (superior/inferior), peso máximo → erro se a porta passar do peso (peso = área × espessura × densidade do MDF ~ 700–750 kg/m³ [Provável]).
Basculante: pistão/articulador escolhido pelo peso e altura da porta (Promob: pistão padrão, força inversa, configuráveis com força e carga).
F5. Ferragens e usinagens por regra

Mercado

Promob: dobradiças reta/curva/supercurva escolhidas pelo recobrimento; com amortecedor, Blum, fecho toque; 2 a 5 por porta conforme altura; dobradiça de canto 165°. Corrediças telescópicas e ocultas de 260 a 1800 mm, passo 50, com amortecedor e fecho toque; desconto na caixa configurável; corrediça oculta com avanço traseiro de 10 mm. Kits orçados juntos (dobradiça + calço + caneco + parafusos). Prateleiras em múltiplos de 32 a partir do furo a 37. Acessórios sem furação (cabideiro, lixeira, LED). Furo de marcação 1 mm para CNC nas corrediças.
Polyboard: ferragens e usinagens (furos, fresas, rasgos) aplicadas por regra, com quantidade e deslocamentos; inseridas ou removidas sozinhas quando a medida muda.
Woodwork for Inventor: ferragem colocada automaticamente onde precisa, com a furação gerada junto.
Blum (documentação técnica): número de dobradiças cresce com peso da porta (ex.: 5 até 22 kg, 6 até 27 kg, 7 até 32 kg em portas altas); calço em cruz com furos 37/32, calço reto 20/32; fresta mínima de referência 2 mm. Configurador Blum gratuito gera lista de peças, ferragens, corte e posição de furos — serve de conferência.

Temos: dobradiça Blum por altura, corrediça por profundidade, fixações por contato, pinos, puxadores.

A base precisa

Regra de ferragem = (quando se aplica) → (qual item da biblioteca) → (quantas e onde) → (que furos/usinagens cria em cada peça) → (que parafusos consome). Uma regra por família: dobradiça, corrediça, correr, basculante, junção (parafuso/minifix/cavilha), prateleira, puxador, pé, cabideiro, LED.
Dobradiças pelo maior entre altura e peso.
Kits na biblioteca (um item de compra que reúne vários).
Toda usinagem tem: face, posição (x, y), Ø, profundidade, passante ou não — no formato que a loja de corte aceita (ver F7).
F6. Materiais, acabamentos e fita

Mercado

Promob: acabamento por caixa, corpo, frente de gaveta, fita, fita frontal, vidro; fita 0,45 / 1 / 1,5 / 2 mm, PVC ou ABS, alturas 19, 22, 29, 35, 45, 64; aplicação por lado A, B, C, D; fita frontal separada; tapa-furo por cartela.
Polyboard: espessura e direção do veio por peça; fita definida por peça; divisão de espessura (laminados).
Fabricantes: Guararapes (PR) oferece downloads de imagens dos padrões, texturas para SketchUp e catálogo BIM; Berneck (PR) e Duratex têm linhas de padrões; texturas genéricas PBR em BlenderKit. Uso em render de cliente: verificar licença de cada fabricante.

Temos: um material por móvel, fita 22 genérica, peças giram livres no corte.

A base precisa

Biblioteca de acabamentos real: fabricante, linha, nome do padrão, código, espessuras disponíveis, tem veio ou não, textura (imagem + escala real em mm), fita combinando (código), preço por chapa.
Material por peça, herdado em níveis (projeto → módulo → peça) — padrão de mercado: caixa branca, frente com padrão.
Veio: peça com padrão amadeirado tem direção (comprimento ou largura) e não gira no plano de corte; frentes vizinhas podem pedir veio contínuo (cortadas na sequência).
Fita: espessura e altura por lado (C1, C2, L1, L2), cor ligada ao padrão, desconto de espessura de fita na medida de corte (fita de 1–2 mm altera a medida final). [Provável: lojas cortam já descontando — confirmar]
Troca de acabamento para o cliente (decisão do Nathan: junto com o gerador paramétrico).
F7. Plano de corte e integração com a loja

Mercado

Polyboard: envia para otimizador (Opticut) e exporta CSV; integra com nesting CNC (BiesseNest etc.).
Promob: plugins exportam para otimizadores e máquinas; cantos L vão como peça inteira.
CorteCloud (Serrabits, plataforma brasileira de serviço de corte): importa JSON com lista de peças — quantidade, medidas C e L, função ("Lateral"), complemento ("Balcão A"), material, fita por lado c1, c2, l1, l2, e usinagens: furos verticais (na face; passante ou não; Ø, profundidade), furos horizontais (no topo da chapa), rasgos/rebaixos (face, largura, profundidade, distância). Sistema de cantos 0–3 e lados C1/C2/L1/L2 — igual à notação que já usamos.

Lojas em Ponta Grossa encontradas (serviços de CNC não confirmados):

GMAD Madcompen — Av. Gen. Carlos Cavalcanti, 585, Uvaranas — (42) 3220-6600 (rede GMAD; "a loja mais completa da região" segundo clientes).
MK Soluções para Móveis — Estr. José Kalinoski, 1994, Contorno — (42) 3227-3815 (clientes citam plano de corte com entrega no dia seguinte).
Di Casa Acessórios para Móveis — R. Prof. Kamal Tebcherani, 358 — (42) 99934-2558 (ferragens).
J Imave (Supermercado do Compensado) — R. Balduíno Taques, 1333 — (42) 3026-7000.
Compensados Madcompen — Av. Gen. Carlos Cavalcanti, 912 — (42) 3220-6600.

Temos: plano em faixas (guilhotina), refilo 10, serra 4, peça gira livre; pedido em texto e CSV.

A base precisa

Otimizador com: veio (não girar), material por peça, sobras reaproveitáveis registradas, refilo e serra por loja.
Saída por loja: perfil da loja (o que faz: corte, fita, furação CNC; formato aceito: CSV próprio, CorteCloud JSON, Promob, papel).
Exportar no formato CorteCloud (lista + fitas + usinagens) — se uma loja de PG usar, a furação vai pronta para a máquina.

Verificar (perguntar às lojas): 1) cortam, colam fita e furam em CNC? 2) que arquivo aceitam (CorteCloud, Promob, CSV, Corte Certo)? 3) refilo e espessura de serra? 4) a medida enviada é com ou sem a fita? 5) aceitam veio contínuo/sequência? 6) prazo e preço por corte e por metro de fita.

F8. Documentos técnicos

Mercado

Promob: Builder View gera documentação técnica em PDF com furos e rasgos.
Woodwork for Inventor: conjuntos de desenhos de produção e montagem por template, anotação automática.
Polyboard: plantas, elevações, vistas 3D cotadas, cortes, lista de módulos, de peças e de materiais; DXF 3D em camadas.

Temos: PDF com 1 página por peça (furação), plano por chapa, iLogic para Inventor.

A base precisa

Template próprio (nome, logo, cidade, nome da empresa) e dados básicos da peça; A4 para peças pequenas, A3 para grandes (decisão do Nathan).
Pacote por projeto: planta e elevações do ambiente cotadas; vista de cada módulo; desenho de cada peça com cotas, furos (Ø e profundidade), rasgos, fita por lado, veio, material, quantidade; lista de materiais; plano de corte; manual de montagem (sequência, vista explodida, fixações).
Gerador de desenho: comparar (a) o nosso próprio (SVG → PDF, já existe) com (b) FreeCAD TechDraw (vistas e cotas reais a partir do sólido, PDF, STEP) e (c) Inventor via iLogic (só no trabalho).

Verificar: se o FreeCAD gera PDF de TechDraw sem tela (na nuvem); a página oficial bloqueou a leitura automática — testar na prática (pedido do Nathan: testar e comparar).

F9. Orçamento, revisões e comercial

Mercado

Promob: orçamento por item (kits de ferragem, puxador gola/cava por metro linear, tamburato por m², portas de alumínio por m² ou metro); acessório só entra com preço cadastrado.
Método de precificação recomendado (guia de marcenaria sob medida): Preço = Material × (1 + markup 15–25%) + Horas × (taxa + custos indiretos/h) × (1 + lucro 10–20%); desperdício de chapa 20–30% na estimativa; registrar horas de projeto, compras e acabamento (25–40% a mais do que se imagina); sinal de 50%; mudança de escopo só por ordem escrita; reservar impostos; "material × 3" só como conferência.

Temos: lista de compras com preço digitado por item.

A base precisa

Orçamento em blocos (decisão do Nathan): móvel (material + fabricação) e instalação (terceirizada nos grandes; própria nos pequenos).
Custos: material da lista (com perda), ferragens/kits, serviços da loja (corte, fita, furação), horas (projeto, compra, montagem) × taxa, terceiros (instalação, frete, pedra, vidro), impostos, margem.
Revisões congeladas (Rev A, B…): cada envio guarda preços e projeto daquele dia; aceite do cliente registrado; mudança depois do aceite = nova revisão com diferença de valor.
Condições: sinal, prazo, garantia, o que não está incluso (pedra, elétrica, hidráulica, gás).
F10. Apresentação ao cliente

Mantém o catálogo atual (fotos + 3D), mais: orçamento (blocos, revisão vigente, aceite), troca de acabamentos (padrões reais), e, depois do negócio fechado, manual de montagem — para itens pequenos e simples, também para o cliente (decisão do Nathan).

F11. Entradas externas (Blender, Inventor, FreeCAD)
Formato único de projeto; três portas de entrada:
Blender (em casa): cada chapa modelada como bloco → medidas, espessura, posição, material; furos e ferragens gerados pelas regras.
FreeCAD (em casa, grátis, paramétrico): a testar como entrada e como saída (STEP, desenhos).
Inventor (só no trabalho): iLogic lê a montagem de MDF → peças exatas, inclusive furos.
O configurador é sempre a fonte das medidas; os outros programas recebem ou enviam peças.
F12. Projetos, revisões e dados
Projetos no Google Drive (decisão do Nathan): uma pasta por cliente → projeto → revisões; o arquivo do projeto tem versão de formato.
Catálogos (biblioteca, acabamentos, métodos de construção, módulos prontos) versionados no GitHub; preços do Nathan separados.
Modelo proposto da base (resumo)
PROJETO (cliente, revisões, condições)
 └─ AMBIENTE (paredes, aberturas, pontos, obstáculos, medidas reais)
     └─ MÓDULO (linha, volume, posição na parede, limites, método de construção herdado)
         └─ ÁRVORE DE VÃOS (dividir / conteúdo)
             └─ FRENTES (giro, correr, basculante, gaveta; estilo; recobrimento)
 → REGRAS DE FERRAGEM E USINAGEM (aplicadas sozinhas)
 → PEÇAS (papel, material, veio, fita por lado, furos e rasgos)
 → SAÍDAS (3D, corte por loja, compras, orçamento, desenhos, montagem, iLogic/FreeCAD, catálogo do cliente)

CATÁLOGOS (dados, não código): acabamentos reais · ferragens/kits reais com 3D · métodos de construção · módulos prontos · perfis de loja de corte · preços
CONFIGURAÇÃO EM NÍVEIS: padrão → projeto → ambiente → módulo → peça (override)
O que falta para fechar a proposta
Perguntar às 5 lojas de Ponta Grossa as 6 perguntas de F7 (define o formato de saída e se a furação vai para CNC).
Testar FreeCAD sem tela: gerar uma peça com furos, vista com cotas e PDF; comparar com o nosso PDF e com o Inventor.
Baixar e testar texturas Guararapes (resolução, escala, licença) e CAD de ferragens (Blum, Hettich).
Detalhar Mozaik/Polyboard pelos manuais completos (níveis de override, fórmulas) — o manual oficial do Mozaik não abriu na leitura automática.
Promob Maker — completar a leitura (o texto do guia termina no slide 268; especificações técnicas e plugins não vieram).
Montar a especificação final da base para aprovação, antes das etapas 4–5.
Fontes
Promob Maker — Guia do Produto V.13 R.20: https://promobsitestorage.blob.core.windows.net/download/Guia_Maker_BR/Guia%20do%20Produto%20MAKER%20BR%20-%20V.13%20R.20.pdf
Polyboard — lista de recursos: https://www.fittingsoftware.com.au/index_htm_files/polyboard%20features%20list.pdf
Polyboard — conceito: https://wooddesigner.org/simple-furniture-design-with-polyboard/
Mozaik — métodos de construção: https://www.phillanton.com/blogs/mozaik-guides/how-to-build-cabinets-your-own-way-in-mozaik
Mozaik x Polyboard (preços): https://slashdot.org/software/comparison/Mozaik-vs-Polyboard/
Woodwork for Inventor — recursos: https://www.symetri.co.uk/products/woodwork-for-inventor/features/
Blum Cabinet Configurator: https://www.blum.com/br/pt/services/planning-construction-product-selection/dynaplan/
Blum — documentação técnica de dobradiças: https://d2.blum.com/services/BEC003/me67527046_td_dok_bau_spt_ aof_$v4.pdf
CorteCloud — importação JSON: https://cortecloud.com/api-docs/en/guias/json_import
Rometal RO-27 — manual: https://www.rometal.com.br/index.php/download/d0404876-8f9a-42b6-936e-49e89053f8b7
Precificação de marcenaria sob medida: https://beancount.io/pt/blog/2026/09/17/custom-woodworking-pricing-material-markup-shop-overhead-margin-guide
Guararapes — downloads: https://www.guararapes.com.br/en/downloads
Hettich CAD: https://www.hettich.com/en-al/services/hettich-cad/cad-data-packages
Blum no 3D Warehouse: https://www.blum.com/us/en/services/e-services/softwarepartners/3d-warehouse/
Lojas de Ponta Grossa: dados do Google Maps (consulta de 06/11/2026)
