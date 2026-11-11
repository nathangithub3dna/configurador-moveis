Gabinete do banheiro (primeiro projeto — guardado como exemplo)

Exemplo do tipo gabinete. Os próximos móveis não ganham documento próprio: ficam no .json do configurador (ver claude/visao-geral.md). A lista abaixo é a versão de 05/11/2026; a versão válida é sempre a que o configurador gera.

Pia de banheiro de canto, tampo de mármore existente, espelho redondo grande em frente. Parede à esquerda (olhando de frente).

Parâmetros
Móvel: 800 largura × 800 altura (sem tampo) × 450 profundidade. Apoiado no chão (pés = 0). [Suposição: 80 cm é só o móvel]
MDF branco fosco 18 mm (recomendado RU, quem compra é o cliente); fundos MDF branco 6 mm.
Tampo: 800 × 450 × 20 (largura real a medir).
Em cima: 2 portas abrindo pelo meio, 1 prateleira na metade. Embaixo: 1 gaveta de 200.
Enchimento de 25 à esquerda → caixa com 775.
Esgoto: centro 525 (faixa 450–600) → prateleira (topo a 500) recebe recorte 300 × 150.
Lista de corte (mm, comprimento × largura) — versão de 05/11/2026 (corrediça 45 mm)

MDF 18 mm — 1 chapa, 55% aproveitada no plano de corte

Nº	Qtd	Peça	Medida	Fita
1	2	Lateral	800 × 426	1C
2	1	Base	739 × 426	1C
3	1	Travessa superior frontal	739 × 100	1C
4	1	Travessa superior traseira	739 × 100	—
5	1	Travessa de fixação	739 × 100	—
6	1	Divisória	739 × 426	1C
7	1	Prateleira com recorte 300 × 150	737 × 400	1C
8	1	Enchimento frontal	800 × 25	1C
9	1	Sarrafo do enchimento	800 × 60	—
10	1	Frente da gaveta	772 × 197	2C 2L
11	2	Porta	597 × 384,5	2C 2L
12	2	Frente/traseira da gaveta	677 × 130	1C
13	2	Lateral da gaveta	400 × 130	1C

MDF branco 6 mm — 1 chapa (18% aproveitada; melhor comprar só o corte)

Nº	Qtd	Peça	Medida
14	1	Fundo da gaveta	713 × 400
15	1	Fundo do móvel	800 × 775
Compras (unidade de compra)
Comprar	Item
1 chapa	MDF branco fosco 18 mm (recomendado RU)
1 chapa (ou só o corte)	MDF branco 6 mm
4	Dobradiça Blum CLIP top BLUMOTION 110° reta 71B3550
4	Calço reto Blum CLIP 0 mm (confirmar código, ex. 173L6100)
1 par	Corrediça telescópica 45 mm com amortecedor, 400 mm
3	Puxador barra 128 mm
4	Pino de prateleira 5 mm
1 cento cada	Parafuso 4,0 × 50 / 3,5 × 14 / 3,5 × 25
3	Parafuso 5,0 × 60 + bucha S8
1 rolo 20 m	Fita de borda PVC 22 mm branca (precisa 15 m)
1 tubo	Silicone neutro
Observações
Porta esquerda abre até 90° (parede); direita até 105°.
Furação completa de cada peça: desenhos técnicos (PDF do configurador).
Blender: gabinete montado com ferragens da biblioteca (script criar_gabinete_blender_v3.py + ferragens_blender.py).
Página do cliente com fotos e 3D (fixações, sifão articulado tipo Deca, dobradiças completas): ver link em claude/visao-geral.md.
Pendências deste móvel
Medir a largura real do mármore ("cerca de 70, considere 80").
Medir altura real do esgoto e dos registros (padrão: centro 525, faixa 450–600) e o tamanho real da cuba (render usa oval 400 × 210, 120 de fundo).
Conferir se a cuba invade os 100 mm da travessa frontal.
Salvar o .blend da cena no PC do Blender.
