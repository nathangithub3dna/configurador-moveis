Passo 1 do plano novo — peça livre e caixa livre (08/11/2026)
Pesquisa (o que o mercado faz)
Promob (Guia Maker V.13 R.20): não tem chapa genérica; usa itens prontos — Linha Painéis (10–2700 × 10–1800; ripado e canaletado), Tamponamentos (cadastro próprio; 15/18/25; engrosso; recorte 45°), Prateleiras de parede com suportes pela largura, "Composições" (peças de caixa avulsas para montar módulo novo, rasgo editável), usinagens avulsas (retas ou redondas, em qualquer peça), painel na parede inserido por 3 pontos (esquerda, direita, altura). "Explodir" só serve para visualizar.
Hellomob/Promob: usuários pediram "peça genérica" (nome, largura, comprimento, lados com fita); hoje improvisam com tamponamento.
Polyboard: painel solto pela função de montagem; ligações entre painéis (quem passa, tipo de junta); recortes internos.
Mozaik: cada peça tem posição 3D (aceita fórmula) e rotação (face principal + giros extras).
Decisões do Nathan (08/11/2026)
Posição: presa a uma parede (distância do canto, altura do chão, afastamento da parede) ou solta no ambiente (X, Y, Z).
Rotação: ângulo livre já, em qualquer eixo.
Formato da peça livre: retângulo + recortes retangulares (canto e meio) + furos e rasgos avulsos.
Caixa livre: módulo normal solto no ambiente; em qualquer módulo dá para desligar uma peça ou mudar a medida dela; a mudança fica salva no projeto e o resto continua seguindo a regra.
Fixação da peça livre: sempre escolhida à mão (confirmado pelo Nathan depois da 1a).
1b (tela) antes da caixa livre — feita em 08/11/2026.
1c dividida (08/11/2026, o Nathan: "pode dividir o quanto for necessário"): 1c-i desligar/mudar peça; 1c-ii caixa solta ou afastada da parede, virada para os 4 lados; 1c-iii giro em ângulo livre da caixa.
Como funciona
Peça livre
Campos: nome, função (painel de parede, forro, cortineiro, tamponamento, lateral de acabamento, tampo de mesa, pé em painel, prateleira de parede, bancada, peça genérica), comprimento × largura × espessura, material, veio, fita por lado (C1, C2, L1, L2), recortes, furos avulsos, ferragens de fixação escolhidas da biblioteca (com quantidade).
Nasce deitada (medida 1 ao longo da parede, medida 2 na profundidade, face A para baixo), em pé de frente (face A para a frente) ou em pé de lado (medida 1 na profundidade, face A para o lado do canto); depois giro livre (graus) nos três eixos, em volta do centro da peça.
Grupo: várias peças livres (e caixas livres) com o mesmo nome de grupo se movem juntas (mesa = tampo + pé; pórtico = painel + forro). No passo 3 o grupo vira modelo pronto.
Caixa livre
Módulo do catálogo (árvore de vãos, frentes, método) com a mesma posição e rotação da peça livre.
Ajuste por peça em qualquer módulo: desligar (ex.: base e fundo da caixa da geladeira) ou mudar medida; aviso quando o ajuste deixar de servir (peça sumiu da regra).
Regras e validações
Fixação da peça livre: sempre escolhida à mão (ferragens da biblioteca), alinhada ou girada: o cálculo por contato dos módulos poria parafuso aparente, por exemplo no tampo de uma mesa. Aviso quando a peça não tem fixação escolhida.
Erros: peça maior que a chapa; veio que não cabe; recorte ou furo fora da peça; passa do canto, do fim ou da altura da parede; abaixo do chão; entra na parede; função não escolhida; recortes que não cabem numa mesma borda.
Aviso: peça livre (não girada em ângulo) ocupando o mesmo lugar de um módulo.
Sub-etapas
	Entrega	Aceite	Situação
1a	Peça livre nos dados do ambiente e nas saídas	caso de teste com painel, forro, cortineiro, mesa e peças giradas	feita em 08/11/2026 (commit 96c8ea4, artifact v26)
1b	Tela: lista de peças livres no modo Ambiente, propriedades, giro, duplicar, grupo; peças livres na planta	montar o caso 1a pela tela	feita em 08/11/2026 (commit 85b1e8a, artifact v27) — o Nathan seguiu para a 1c
1c-i	Desligar ou mudar a medida de qualquer peça de qualquer módulo (dados + tela)	caixa da geladeira (aéreo em cima, laterais até o chão, sem fundo)	feita em 08/11/2026 (commit fb0a3d7, artifact v28) — aguarda aprovação
1c-ii	Caixa livre: módulo solto (X, Y, Z) ou afastado da parede, virado para os 4 lados	a definir	
1c-iii	Giro em ângulo livre da caixa (3D, planta, portas abrindo, choques, iLogic)	a definir	
1d	Caso real: partes da cozinha do Nathan que dependem só do passo 1 (pórtico/forro, painel, cortineiro, mesa com pé em painel, bancada fina, laterais da geladeira)	saem completas em todas as saídas	

O resto da cozinha (U, península, aberturas, vão de eletro) é do passo 2.

1a — o que ficou pronto (08/11/2026)
Dados: ambiente.livres[] (formato descrito no começo de fonte/js/livres.js).
Saídas conferidas pelo teste "PEÇAS LIVRES (1a)": 3D (forma igual à caixa calculada, inclusive girada e na parede B), lista de corte, plano de corte, códigos (A-L01…), CorteCloud com furos, iLogic (eixos próprios, vale girada), folha A3, compras (ferragens escolhidas, kits abertos, fita em metros).
Desenho: o app gira a peça no desenho (0/90/180/270°) para os recortes ficarem na borda de cima; vazados viram rasgo passante.
1a — limites que ficaram (entram depois)
Recortes só numa mesma borda (ou nos dois cantos dela); recorte em bordas opostas dá erro.
Furos só na face A; rasgo com profundidade (canal) e furo de topo ainda não.
CorteCloud não leva recortes nem vazados (limite que já existia para o tampo e a ventilação).
Volumes de transporte do ambiente não existem (só no móvel solto) — vale para módulos e peças livres.
Biblioteca sem mão-francesa, cantoneira e suporte invisível: precisam de pesquisa de itens reais antes de entrar.
3D com a cor da categoria (técnico), não a do material.
Fontes
Promob Maker — Guia do Produto V.13 R.20: https://promobsitestorage.blob.core.windows.net/download/Guia_Maker_BR/Guia%20do%20Produto%20MAKER%20BR%20-%20V.13%20R.20.pdf
Promob — Como inserir painéis: https://suporte.promob.com/hc/pt-br/articles/360059109773
Promob — Junções: https://suporte.promob.com/hc/pt-br/articles/360055234454
Hellomob — Peça genérica: https://comunidade.hellomob.com.br/t/peca-generica-light/821
Polyboard — recursos adicionais: https://wooddesigner.org/help-centre/polyboard-additional-design-features/
Mozaik — posição 3D da peça: https://sites.google.com/view/mozaikonlinehelp/help/editors/part-editor/3d-part-position
1b — o que ficou pronto (08/11/2026)
Modo Ambiente, bloco Peças livres: escolher a função e "+ Peça" (nasce com medidas iniciais da função); lista com uma peça aberta por vez (Editar/Fechar, Duplicar, Remover).
Campos: nome, função, grupo (com sugestão dos grupos existentes), medida 1, medida 2, espessura, material, veio (só em material com veio), fita por borda (nomeada pelo jeito que a peça nasce: de baixo/de cima/esquerda/direita/de trás/da frente), como nasce, onde (parede A, parede B ou solta), posição, giro (tombar, virar, inclinar), recortes, furos e ferragens da biblioteca com quantidade.
Trocar "onde" mantém a peça no mesmo lugar do ambiente (converte as coordenadas); na parede B avisa para conferir o giro, porque a peça nasce virada 90°.
Grupo: mexer na posição de uma peça move só ela; cada grupo tem um bloco "Mover X/Y/Z" (eixos do ambiente) + "Mover o grupo" e "Duplicar o grupo" (a cópia vira "<grupo> 2", ao lado). Escolha do Claude, para não arrastar o pé ao ajustar o tampo — o Nathan pode pedir outra forma.
Duplicar peça: a cópia nasce ao lado (deslocada em X pela largura que a peça ocupa).
Planta: peças livres desenhadas por cima dos módulos, com o contorno visto de cima (vale girada) e o rótulo L1, L2…; clicar abre a peça no painel.
Folha A3: a vista frontal passou a desenhar recortes de borda e vazados (antes saía só o retângulo — valia também para prateleira com recorte do sifão).
Teste "PEÇAS LIVRES PELA TELA (1b)": monta o caso da 1a clicando e digitando; o resultado é igual ao montado pelos dados (medidas, caixas no ambiente, desenho, furos, recortes, ferragens, avisos); confere planta, clique na planta, mover e duplicar grupo, duplicar e remover peça.
1b — limites que ficaram
Mover o grupo não gira o grupo (giro é por peça).
Rótulos da planta se sobrepõem em peças finas e próximas (cortineiro, painel encostado).
Nome longo da peça encosta no campo "QTD." do carimbo da folha A3 (já existia).
1c-i — o que ficou pronto (08/11/2026)
Dados: modulo.pecasAjuste = { '<id da peça>': { nome, desligar:true } | { nome, medidas:{ x|y|z: { valor, fixo:'ini'|'fim'|'centro' } } } } — vale no móvel livre e em cada módulo do ambiente. Eixos do próprio módulo: x largura, y altura, z profundidade; fixo = o lado que fica no lugar (esquerda/embaixo/atrás, direita/em cima/na frente, ou cresce dos dois lados).
O ajuste entra antes da furação: a furação das laterais passou a ser medida a partir da própria lateral (não do módulo) — sem ajuste dá igual ao de antes (todos os casos de referência iguais); com lateral esticada, os furos saem no lugar certo (ex.: base do aéreo a 1809 mm do pé da lateral de 2200).
Desligar leva junto o que é da peça (porta → dobradiças e puxador; frente da gaveta → caixa da gaveta e corrediças presas a ela). O resto do módulo continua seguindo a regra; fixações por contato e compras se recalculam.
Mudar a medida: só peças de caixa/fundo/enchimento sem furos próprios. Porta, gaveta, ferragem, prateleira com recorte e travessa de fixação dão erro explicando (mudar a medida deixaria a furação errada). Medida na espessura da chapa: erro.
Avisos/erros novos: ajuste de peça que não existe mais no módulo (aviso); peça esticada abaixo do chão (erro); peça esticada ocupando o lugar de outro módulo (aviso, conferido peça a peça).
Tela: no 3D, tocar na peça → a ficha mostra "Ajuste desta peça" (medidas com "o que fica no lugar", Aplicar medida, Desligar peça, Voltar à regra). No editor do módulo (no ambiente: "Abrir") há o bloco Peças ajustadas, com as desligadas, que somem do 3D, e "Voltar à regra".
Esquema de frente do módulo passou a enquadrar também as peças que saem do módulo.
Ficha à frente das cotas do 3D (no celular os números passavam por cima).
Teste "AJUSTE POR PEÇA (1c)": monta a caixa da geladeira pela tela e compara com a mesma caixa pelos dados (igual); confere furos da base na lateral esticada, sem fundo, lista de corte, folha A3, iLogic, os erros/avisos acima, desligar porta levando dobradiças e puxador, lista "Peças ajustadas" e "Voltar à regra".
1c-i — limites que ficaram
O ajuste é guardado pelo nome interno da peça (ex.: prateleira-2-1): se a árvore de vãos mudar, ele pode deixar de servir (vira aviso) — confira depois de mexer nos vãos.
Peças ajustadas no ambiente não entram na conferência de choque entre módulos pela caixa do módulo (só pelo aviso peça a peça).
Para escolher a peça é preciso o 3D (o Esquema não seleciona peças). No celular a ficha cobre boa parte do desenho.
