Teste do FreeCAD sem tela (06/11/2026)

Objetivo: ver se o FreeCAD (grátis) pode substituir o Inventor na geração de peças e desenhos, rodando na nuvem, sem abrir na tela. Pedido do Nathan: "testar e comparar". O Nathan já instalou o FreeCAD no PC.

Versão testada: FreeCAD 26.3.0 (conda-forge), na nuvem do Claude, modo sem tela (freecadcmd).

Teste 1 — recursos básicos
Recurso	Resultado
Sólido paramétrico com furos e rasgos	✅
Exportar STEP	✅
Salvar .FCStd (abre no FreeCAD do PC)	✅
Vistas técnicas calculadas (frente, lateral, superior, isométrica) com linhas ocultas	✅ (TechDraw.viewPartAsSvg, grupo de linhas visíveis + grupo de ocultas)
Corte (fatia do sólido pelo centro do furo)	✅
Exportar folha em DXF	✅
Exportar folha em PDF sem tela	❌ sai vazio (a função exige interface gráfica)
Cotas automáticas do TechDraw sem tela	⚠️ criadas, mas sem valor calculado
Teste 2 — folha completa de uma peça real (porta 1 do armário)

Fluxo testado: dados da peça do configurador → FreeCAD gera o sólido e as vistas → nosso montador põe cotas, chamadas de furo, notas e carimbo → PDF A3 (rsvg).

Conteúdo da folha de teste: vista frontal 1:10 (face interna) com cotas gerais, cotas de coordenada a partir da base para os 4 canecos e os 2 furos do puxador, chamadas "4× Ø35 prof. 13" e "2× Ø5 passante"; lateral (1º diedro, à direita) mostrando os canecos ocultos tracejados; vista superior (abaixo); corte A-A 1:2 do caneco (Ø35, prof. 13, centro a 22 da borda); perspectiva isométrica 1:20; notas; carimbo NBR 10582 (logo, nome da empresa, Nathan, Ponta Grossa – PR, projeto, peça, material, quantidade, dimensões, fita, escala, folha, data, revisão, símbolo de 1º diedro); margens NBR 10068 (esquerda 25, demais 7).

Comparação com o PDF atual do configurador:

Item	PDF atual	Folha de teste (FreeCAD + nosso carimbo)
Vistas	só a frontal	frontal, lateral, superior, corte, isométrica
Linhas ocultas	não	sim (projeção real)
Cotas de furo	tabela de furos (X, Y, Ø, prof.)	cotas na vista + chamadas; falta trazer a tabela
Fita de borda	marcada em cor nas bordas	só em texto; falta marcar na vista
Carimbo / template	rodapé simples	carimbo ABNT com dados do Nathan
Formato	página do PDF geral	A3 (A4 para peças pequenas — decisão do Nathan)
Conclusão
Caminho escolhido para os desenhos: FreeCAD calcula a geometria e as vistas (na nuvem, sem tela); o nosso gerador monta a folha (cotas, tabela de furos, fita marcada, carimbo, A4/A3) e gera o PDF.
Juntar o melhor dos dois: vistas + corte + isométrica do FreeCAD com a tabela de furos e a fita colorida do PDF atual.
O .FCStd e o STEP de cada peça podem ir junto no pacote (abre no FreeCAD do PC de casa ou em qualquer CAD).
Limitação: o FreeCAD roda aqui na nuvem; dentro da página publicada (navegador) não. Os desenhos completos saem quando o Claude gera o pacote; a página continua com o desenho rápido atual.

Arquivos do teste (enviados ao Nathan em 06/11/2026): folha-porta-1.pdf, porta-1.FCStd, comparacao-desenho.png.
