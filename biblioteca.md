Biblioteca de chapas e ferragens

Equivalente às bibliotecas de fabricantes do Promob. Hoje fica em dois lugares que precisam andar juntos:

Configurador — objeto BIBLIOTECA no código (codigo/configurador-moveis.html). Cada item tem: grupo, nome, marca, código, unidade e embalagem de compra, dados técnicos usados pelo gerador, nome do modelo 3D. Os puxadores escolhíveis ficam também no objeto PUXADORES (medidas usadas no 3D, na furação e no limite de abertura).
Blender — C:\Users\NATHAN.OLIVEIRA\Documents\Blender\Biblioteca\ferragens.blend, objetos marcados como Asset. Gerado pelo script Documents\Blender\ferragens_blender.py, que também coloca as ferragens no gabinete aberto.
Para ver no Asset Browser: Edit > Preferences > File Paths > Asset Libraries > + > pasta Documents\Blender\Biblioteca.

Na reestruturação (etapa 2) a biblioteca sai do código e vira arquivos de dados no repositório (dados/biblioteca.json, acabamentos.json, puxadores.json), com preços do Nathan separados. Planejado para a base nova (ver claude/pesquisa-base-parametrica.md, F5 e F6): kits (dobradiça + calço + parafusos como um item de compra), acabamentos reais (fabricante, padrão, código, veio, textura em escala, fita combinando, preço) e modelos 3D do fabricante (Blum, Hettich, FGV, Häfele, Zen — pacotes gratuitos quando houver).

Chapas
ID	Item	Compra
chapa-mdf-ru-branco-18	Chapa MDF RU branco fosco 18 mm	chapa 2750 × 1850
chapa-mdf-ru-branco-15	Chapa MDF RU branco fosco 15 mm	chapa 2750 × 1850
chapa-mdf-branco-6	Chapa MDF branco 6 mm (fundos)	chapa 2750 × 1850

Desde 06/11/2026 o Nathan compra o material e entrega o móvel, então o material pode ser especificado no que o cliente vê (ex.: MDF RU). (A regra antiga "não afirmar RU, quem compra é o cliente" valia quando o cliente comprava.)

Fontes de acabamentos reais a testar: Guararapes (PR) — imagens dos padrões, texturas para SketchUp e catálogo BIM em guararapes.com.br/en/downloads; Berneck (PR); Duratex; Arauco. Conferir quais as lojas de Ponta Grossa vendem e a licença de uso das texturas.

Ferragens
ID	Item	Marca / código	Compra	Dados que o gerador usa
dob-blum-71B3550	Dobradiça CLIP top BLUMOTION 110°, reta, com amortecedor	Blum 71B3550	un	caneco Ø35 × 13, centro a 22 da borda, furação 45 mm
calco-blum-0	Calço reto CLIP 0 mm	Blum 173L6100 (confirmar)	un	linha a 37 da frente, furos a 32 (calço em cruz 37/32; calço reto 20/32 — conferir o comprado)
corr-tel45-amort	Corrediça telescópica 45 mm com amortecedor, extração total	FGV / Telescópica (equivalente)	par	13 por lado (gaveta = vão − 26), comprimentos 250–550
pino-5	Suporte de prateleira, pino 5 mm	—	un	—
suporte-vassoura	Suporte para vassoura/rodo (garra de pressão)	—	un	3 por vão de vassoura
gancho-aspirador	Gancho duplo para aspirador e mangueira	—	un	1 por vão de vassoura
sapata	Sapata niveladora	—	un	—

Planejado (base nova): sistemas de porta de correr (ex.: Rometal RO-27 — altura da folha = vão − 7 embutido ou − 15 sobreposto, transpasse 20–30, até 20 kg; Dominus para guarda-roupa), pistões/articuladores para basculante (pelo peso), corrediças ocultas e telescópicas de 260 a 1800 mm, minifix e cavilhas, cabideiros, aramados, perfis de LED.

Puxadores (escolha no armário; o gabinete ainda usa a barra 128 genérica)
Nº	ID	Modelo	Código	Furação	Compr.	Larg.	Saliência	Acabamento
1	pux-hettich-brema-128	Hettich Brema	9069890	128	140	14	35	inox escovado
2	pux-hettich-como-320	Hettich Como	115078	320	332	26	45	inox escovado
3	pux-zen-citizen-96	Zen Design Citizen	ZP5463	96	130	12*	30*	gold escovado
4	pux-zen-elemento-128	Zen Design Elemento G	ZP5455.24	128	192	30	18	preto fosco (zamac)
5	pux-zen-shell-64	Zen Design Shell (concha)	ZP4318	64	90	34*	24*	gold escovado
6	pux-perfil-g-18x30	Perfil puxador G de encaixe 18 × 30 (cava na borda)	DMA (Mark Ferragens)	—	largura da porta	30 de altura	0	alumínio anodizado
—	pux-barra-128	Puxador barra genérico (gabinete)	—	128	160	—	25	—

* Medida não publicada pelo fabricante, estimada — confirmar na loja (a saliência muda o limite de abertura da porta e se cabe na gaveta interna).

Fontes consultadas em 06/11/2026: shop.hettich.com (Brema, Como); Casas Bahia / Ponto Frio / Extra (Zen Citizen, Elemento G, Shell — R$ 108 a 170 cada, preço de marketplace).

Perfil G (nº 6) — acrescentado em 09/11/2026 a pedido do Nathan (fotos de aéreo e balcão com puxador de borda)
Produto de referência: Perfil Puxador G em alumínio anodizado 18 × 30 mm, DMA — Mark Ferragens: encaixe 18 mm, altura 30 mm, fixação por encaixe e parafuso, 2 barras de 3 m por R$ 273,73 (11/2026). Só na cor alumínio nessa loja; o Nathan pediu "inox" — existe perfil cor inox em outros fabricantes (ex.: GMAD PGM028 Grap encaixe 18 mm inox), sem medidas publicadas.
[Suposição] encaixe de 10 mm na borda → a porta/frente fica 20 mm mais curta (reducao: 20 em dados/puxadores.json). Conferir na peça real: se a parte que sobra da porta for diferente, mudar só esse número.
Regra no programa (só Móvel livre e ambiente; não aparece no Gabinete/Armário antigos): porta mais curta pela reducao e o perfil ocupa a sobra na largura toda; vai na borda de baixo quando o puxador está no quarto de baixo da porta (aéreo) e na de cima nos outros (balcão, armário). Gavetas externas e internas: sempre em cima. Sem furos de puxador. Escolher o puxador no Móvel livre passa a valer para portas e gavetas.
Compra: item por metro (soma das larguras + 10% de perda), vendido em barra de 3 m.
Fixação
ID	Item	Compra	Onde
paraf-40x50	Parafuso 4,0 × 50	cento	juntas da caixa e da gaveta
paraf-40x30	Parafuso 4,0 × 30	cento	espaçador das corrediças
paraf-35x14	Parafuso 3,5 × 14	cento	fundos, dobradiças, corrediças, suportes
paraf-35x25	Parafuso 3,5 × 25	cento	frente da gaveta pela frente interna
paraf-50x60-bucha	Parafuso 5,0 × 60 + bucha S8	un	travessas de fixação na parede
cavilha-8x30	Cavilha de madeira 8 × 30 + cola	un	beiral sobre as laterais
fita-pvc-22 / 35	Fita de borda PVC branca	rolo 20 m	22 mm até MDF 19 (base nova: espessuras 0,45/1/2 e alturas 19–64, cor por padrão)
silicone	Silicone neutro	tubo	—
Lojas de Ponta Grossa (onde comprar e cortar)
Loja	Endereço	Telefone	Observação
GMAD Madcompen	Av. Gen. Carlos Cavalcanti, 585, Uvaranas	(42) 3220-6600	chapas, ferragens; "a mais completa da região" segundo clientes
MK Soluções para Móveis	Estr. José Kalinoski, 1994, Contorno	(42) 3227-3815	corte com entrega rápida segundo clientes
Di Casa Acessórios para Móveis	R. Prof. Kamal Tebcherani, 358, Oficinas	(42) 99934-2558	ferragens
J Imave (Supermercado do Compensado)	R. Balduíno Taques, 1333, Estrela	(42) 3026-7000	compensados, marcenaria
Compensados Madcompen	Av. Gen. Carlos Cavalcanti, 912, Uvaranas	(42) 3220-6600	compensados

Pendente (deixado para depois pelo Nathan): perguntar quem faz furação em CNC e que arquivo aceita (CorteCloud, Promob, CSV).

Modelos 3D (Blender)

Modelos representativos, feitos pelas medidas de catálogo (não são o CAD do fabricante):

Blum_71B3550_caneco (vai na porta, gira junto), Blum_71B3550_braco e Blum_173L6100_calco (fixos na lateral, linha a 37 mm).
Corredica45_400_externo (fixo na lateral), _intermediario (anda metade do curso, por driver), _interno (preso na gaveta).
Puxador_Barra_128. Os puxadores novos ainda não têm modelo no Blender (no configurador são formas simplificadas: barra, bloco, concha, perfil).
Limitação: ao abrir a porta, o braço fica parado e o caneco gira com a porta (não há a articulação real entre eles).

Fontes de CAD gratuito a testar: Hettich CAD (pacotes de dados), Blum no 3D Warehouse e interfaces CAD/CAM.

Como acrescentar um item
Acrescentar no BIBLIOTECA do configurador (puxador: também em PUXADORES; se mudar a construção, nas regras do gerador). Depois da etapa 2: no arquivo de dados correspondente.
Acrescentar a função do modelo em ferragens_blender.py e rodar de novo.
Registrar aqui.
