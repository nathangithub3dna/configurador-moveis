Tipos de móvel do configurador

Os documentos do projeto registram tipos de móvel e regras, não cada móvel feito. Cada móvel projetado é um arquivo .json salvo pelo configurador ("Projeto (.json)"), que já contém medidas, lista de corte, plano de corte, compras e preços. Para refazer ou alterar um móvel: "Abrir projeto". Um tipo novo entra no registro TIPOS do código e ganha uma seção aqui.

Escolha do tipo: campo "Tipo de móvel" no configurador. "Restaurar medidas padrão" volta aos valores abaixo do tipo atual.

Gabinete (gabinete) — portas em cima, gavetas embaixo

Exemplo feito: gabinete do banheiro (claude/gabinete-banheiro.md).

Caixa: laterais na altura total, base, divisória horizontal, travessas superiores (frontal e traseira) que apoiam o tampo, travessa de fixação atrás.
Em cima: 0, 1 ou 2 portas + prateleiras (com recorte para o esgoto, se cruzar a faixa).
Embaixo: gavetas com corrediça telescópica 45 mm.
Tampo (ex.: mármore) é peça de referência, não vai para o corte de MDF.
Parede à esquerda/direita: enchimento de 25 mm.
Padrão: 800 × 800 × 450, tampo 800 × 450 × 20, 2 portas, 1 gaveta de 200, puxador barra 128.
Armário com vãos (armario) — despensa / área de serviço

Exemplo feito: armário da área de serviço (06/11/2026).

Padrão: 1800 largura × 2100 altura (com o beiral) × 400 profundidade, rodapé 100 recuado 40, MDF 18 e fundo 6, encostado na parede.

Construção

Uma caixa só: laterais até o chão, topo e base entre as laterais, rodapé frontal (recuado) e traseiro, fundo 6 mm parafusado atrás.
Divisórias verticais entre base e topo: nº de vãos − 1. Cada vão tem uma porta.
Travessa de fixação de 80 atrás, sob o topo, em cada vão, com 2 parafusos de parede.
Beiral em cima (padrão 80 de altura): frontal + 2 laterais, aberto atrás (parede). A altura total inclui o beiral; a caixa fica com altura total − beiral. 0 = sem beiral.

Conteúdo dos vãos — campo de texto, da esquerda para a direita, separado por vírgula:

Valor	O que gera
prateleiras	N prateleiras soltas em pinos, distribuídas por igual (padrão 5)
vassoura	1 prateleira no alto (topo a 1750) + 3 suportes de vassoura/rodo + 1 gancho de aspirador, presos em réguas de reforço atrás
gavetas	gavetas internas atrás da porta
gavetas+botijao	compartimento do botijão embaixo (altura livre 600, prateleira fixa em cima) + gavetas internas + prateleira acima
vazio	vão livre

Padrão atual: vassoura, prateleiras, prateleiras, gavetas+botijao → 4 portas de ~450.

Portas: altura do rodapé até o topo da caixa, menos as folgas. Dobradiças em pares (vão 1 à esquerda, vão 2 à direita, …), então duas portas vizinhas podem dividir a mesma divisória.

Gavetas internas: frente 45 mm atrás da porta; espaçador de 18 no lado da dobradiça para a corrediça não bater nela; padrão 4 gavetas de 190, corrediça 300.

Botijão P13: cilindro de referência Ø360 × 480 no 3D (não é fabricado). Exige vão ≥ 390 de largura e caixa ≥ 370 de fundo. Precisa ficar no último vão (direita): a lateral direita recebe 18 rasgos de ventilação 15 × 150 passantes (grupo embaixo e grupo em cima do compartimento). Se "parede à direita" estiver marcada, dá erro.

Puxadores: um modelo para as portas (padrão Hettich Como 320) e outro para as gavetas internas (padrão Zen Elemento G 128). Lista dos 5 em claude/biblioteca.md.

Avisos do sistema: móvel acima de 1800 de altura → fixar na parede antes de carregar; botijão fora do último vão → ventilação não alcança.
