Chapas de mercado, transporte e volumes (pesquisa e decisões de 06/11/2026)
MDF / MDF RU / BP (melamínico)
Fabricante	Comprimento × largura (mm)	Espessuras (mm)	Fonte
Guararapes	2750 × 1850 (BP); cru 2440–2750 × 1220–1850	6, 9, 12, 15, 18, 25 (fino 2,8)	catálogo Guararapes
Arauco	2750 × 1850 e 2750 × 2100 (BP); também 2440 × 1850, 2750 × 1830	6, 9, 12, 15, 18, 25 (cru até 30)	ficha técnica Arauco 2024
Berneck	2750 × 1850 (até 2200 de largura)	9, 12, 15, 18, 22, 25	site Berneck
Duratex	2750 × 1840	6, 15, 18, 25	cartilha MDF Duratex
Padrão do configurador: 2750 × 1850. Com Duratex a chapa é 1840, por isso o perfil de cada loja precisa guardar a marca/medida.
Tolerâncias (Arauco):
espessura ±0,2 mm (±0,3 acima de 19);
comprimento e largura ±2 mm [Provável — tabela mal legível].
Densidade do MDF de 15 a 18 mm: 700–770 kg/m³.
Chapa de fibra (HDF) para fundo de móveis
Medidas de mercado: 2440 × 1220, 2750 × 1220 e 2750 × 2130 (Eucatex, vendidas no varejo). As linhas T-HDF também têm larguras de 1850 e 2200.
Espessura 2,5 ou 3 mm (o configurador usa 3). Marca indiferente.
Fundo: divisão e escolha da chapa
Limita as peças pelo transporte (ver abaixo).
A emenda fica no meio de uma divisória, onde as duas peças são parafusadas.
Onde não há divisória, as peças saem iguais e são unidas com perfil H plástico.
É peça de mercado, vendida em barra, de PS ou PVC, branco ou preto.
[Provável] alma de 1 mm e barra de 3 m — confirmar na loja.
Fundo de MDF sem divisória no ponto da emenda dá erro, porque não existe emenda padrão.
Entre as chapas do material, fica a que dá menos chapas compradas. No empate, fica a de menos área comprada.
O plano de corte usa a mesma chapa que o fundo escolheu.

Exemplo: armário de 1800, desmontado, com limite de 1220. O fundo sai em 2 peças de 900, com a emenda na divisória do meio, e as duas saem de 1 chapa 2750 × 2130.

Transporte (decidido pelo Nathan em 06/11/2026; implementado no núcleo novo)
O limite é um valor informado por projeto: menor lado máximo, padrão 1220 (transporteMenorLado em regras.json; o módulo pode trazer transporte.menorLadoMax). [Suposição: confirmar com o veículo e com as portas e escadas da obra.]
Entrega por módulo: entrega: montado | desmontado (padrão desmontado), porque depende do projeto.
Desmontado:
o fundo é dividido para caber no limite;
peça que não pode ser dividida e passa do limite → aviso (a peça não muda).
Montado:
o fundo não é dividido por transporte;
se o menor lado do módulo passar do limite → aviso.
Fundo em mais de 3 peças → aviso: "limite baixo demais?".
O armário publicado (gerador antigo) só muda quando o núcleo novo for para a tela.
Volumes — embalagem simulada (versão simples, a aprimorar)
Frentes (portas e frentes de gaveta) em volumes próprios.
Caixa em pilhas:
a peça maior fica embaixo e define a base;
uma peça entra na pilha se couber na base;
pilha nova acima de 25 kg ou de 150 mm de altura;
margem de 20 mm por lado.
Todos esses valores são [Suposição] e ajustáveis em regras.json.
Peça sozinha acima de 25 kg → volume próprio com aviso "carregar a dois".
Ferragens e parafusos numa caixa.
Módulo montado = 1 volume.
Peso = área × espessura × densidade (MDF 730; fibra 900 [Provável]).
Etiqueta: "Volume k de N" (numerado por módulo; a numeração no projeto inteiro vem com o modo ambiente).
Hoje o armário de 1800 desmontado dá 12 volumes: 2 de frentes, 9 de caixa e 1 de ferragens. Ainda é muito: a melhorar juntando as pilhas pequenas.
Refilo e serra
Dependem da máquina da loja, não do fabricante da chapa (o Promob também pede por máquina).
Hoje: refilo 10 mm e serra 4 mm [Suposição]. Vão para o perfil da loja (lojas.json, 5c).
Fontes
Arauco: fichas técnicas MDF e MDF melamínico 2024.
Guararapes: catálogo de produtos.
Berneck: site.
Duratex: cartilha MDF.
Eucatex: Casa Medeiros e AECweb.
Guerplas: perfil H.
