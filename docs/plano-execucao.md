Plano de execução e arquitetura — plano mestre (10/11/2026)

Complementa docs/plano-mestre.md. Aquele diz o que falta, com 70 itens numerados. Este diz onde cada função mora no código, quanto custa e em que ordem fazer.

Conclusão

Antes do bloco 1 vem uma Fase 0 que separa o código em peças pequenas. Ela não muda nada na tela nem nos resultados (o teste prova que tudo sai igual). Hoje:

nucleo.js (72 KB) tem o gerador inteiro numa função só;
tela.js (72 KB) mistura 3D, listas, menus, salvar local, nuvem e Drive;
testes/rodar.js tem todos os testes num arquivo;
os geradores antigos do Gabinete e do Armário (geradores.js, 48 KB) repetem regras do núcleo.

Colocar 70 funções nesses arquivos faria cada mudança ler e arriscar o arquivo inteiro: mais tokens por item, mais chance de quebrar o que já funciona. Com a Fase 0, cada função nova vira um arquivo próprio que se registra sozinho (ex.: conteudos/cabideiro.js). A tela monta os campos a partir desse arquivo e o núcleo não ganha um "se for cabideiro…". Editar depois = abrir só aquele arquivo.

Custo estimado do plano inteiro: 35 a 45 conversas de trabalho [Suposição: medido pelo tamanho das etapas já feitas]. A Fase 0 custa 3 a 4 e deve pagar a si mesma a partir do bloco 2.

Escala de custo
Sigla	Tamanho	Quanto custa
P	pequeno	mexe em 1–2 arquivos, sem regra nova de marcenaria; várias por conversa
M	médio	regra nova ou saída nova; cerca de meia conversa
G	grande	mexe no 3D + núcleo + saídas, ou exige pesquisa de itens reais; 1 conversa
GG	muito grande	muda o modelo de dados ou a geometria; 2 ou mais conversas

A complexidade conta junto: GG são os itens que mudam o modelo de dados (paredes em U, formato livre da peça, manual de montagem). Erro neles se espalha.

Estrutura de arquivos alvo
fonte/
  pagina.html                    só o esqueleto; inclui as telas abaixo
  telas/*.html                   <template> de cada painel (modulo, vao, ambiente, livres, orcamento, loja, revisao, nuvem…)
  estilos/                       como hoje (tema.css = visual; layout.css = posições)
  js/
    base/       util.js · regras.js (PAPEIS, ORIENTACAO) · formato.js (versão do projeto + conversores) · registro.js
    nucleo/     gerar-modulo.js (só o roteiro) · caixa.js · arvore.js (dividir/juntar/medidas) · fundo.js
                ajustes.js (1c-i) · validacoes.js · colisao-portas.js
      frentes/    giro.js · duas-portas.js · correr.js · basculante.js · gaveta.js · puxador.js
                  estilos/ gola.js · cava.js · ripada.js · vidro-aluminio.js · tamburato.js · painel-fixo.js
      conteudos/  prateleiras.js · divisorias.js · vassoura.js · sapateira.js · gavetas-internas.js · botijao.js
                  cabideiro.js · maleiro.js · calceiro.js · aramados.js · eletro.js · lixeira.js …
      ferragens/  dobradicas.js · corredicas.js · furacao-laterais.js · fixacoes.js · juncoes.js
    ambiente/   ambiente.js (roteiro) · paredes.js · aberturas.js · obstaculos.js · medicao.js · modulos.js
                eletros-piso.js · bancada.js · arremates.js (rodapé, rodateto, lateral de acabamento) · livres.js
    saidas/     corte.js · plano-corte.js · compras.js · volumes.js · folha-peca.js (A3/A4) · pranchas-cliente.js
                montagem.js · ilogic.js · glb-blender.js · step.js · dxf.js
      loja/       cortecloud.js · csv.js · etiquetas.js · perfis-loja.js
    comercial/  orcamento.js · revisao.js · clientes.js · contrato.js · pagina-cliente.js
    producao/   acompanhamento.js
    tela/       inicio.js · estado.js · desfazer.js
      3d/         cena.js · camera.js (cubo de navegação) · selecao.js · cotas-medir.js · animacao.js · menu-3d.js
      salvar/     local.js · arquivo-json.js · nuvem.js · drive.js · modelos.js (salvar como modelo pronto)
      paineis/    modulo.js · vao.js (gerado do registro) · ambiente.js · livres.js · ajuste.js · listas.js
                  orcamento.js · loja.js · revisao.js · exportar.js · painel-b.js · miniatura.js
dados/
  regras.json · metodos-construcao.json · puxadores.json · materiais.json
  biblioteca/  chapas.json · dobradicas.json · corredicas.json · puxadores.json · fixadores.json · acessorios.json …
  acabamentos.json (padrões reais) · eletros.json (medidas de geladeira, forno…) · lojas.json · empresa.json (carimbo)
  modelos/     guarda-roupa-2-portas.json · balcao-pia.json · … (modelos prontos)
testes/
  rodar.js (só o roteiro) · casos/ referencia.js · editor.js · ambiente.js · livres.js · ajuste.js · nuvem.js · guarda-roupa.js …
Contratos (o que cada tipo de arquivo precisa ter)
Conteúdo do vão:
registrarConteudo({ id, rotulo, icone, campos, gerar(ctx), validar(ctx) });
ctx traz o retângulo do vão, as espessuras, o método e o lado do puxador, e as funções peca(), ferragem() e aviso()/erro();
cada peça nova tem papel em PAPEIS.
Frente e estilo de frente: o mesmo formato, mais folgas() e ferragens(). O estilo (gola, cava, ripada…) altera só a peça da frente e as usinagens.
Elemento do ambiente (abertura, obstáculo, eletro de piso, arremate, bancada): registrarElemento({ id, campos, gerar(amb), planta(svg), validar(amb) }).
Saída: registrarSaida({ id, rotulo, onde: 'exportar'|'loja'|'cliente', gerar(res) → arquivo }). O menu Exportar se monta sozinho.
Painéis da tela: só preenchem templates (data-texto, data-se, data-acao), como já combinado.
Regra de ouro: função nova = arquivo novo + registro + papel em PAPEIS + caso de teste em testes/casos/. Se precisar de um "se tipo === …" no núcleo, o contrato está errado e deve ser corrigido antes.
Fase 0 — preparar a casa (antes do bloco 1)

Aprovada pelo Nathan em 10/11/2026:

Fase 0 primeiro, depois o puxador por vão, a 1c-i e o bloco 1;
0.6 aprovado: os formulários passam a montar pelo núcleo e o gerador antigo sai, se o teste der igual.
#	O que	Arquivos	Custo
0.1	Montador aceita incluir uma pasta inteira (/*@inclui-pasta:js/conteudos*/, em ordem de nome) e juntar dados/biblioteca/*.json	ferramentas/montar.js, offline.js	P
0.2	Versão do formato do projeto + conversor passo a passo (não existe hoje [Provável]). Projetos da nuvem, do Drive e .json antigos continuam abrindo; o original nunca é sobrescrito. Base para U, vários ambientes etc.	base/formato.js, tela/salvar/*	M
0.3	Separar o núcleo: roteiro + caixa + árvore + frentes + conteúdos + ferragens + fundo + ajustes + validações, com registro. Saída igual	nucleo/**	G
0.4	Separar a tela: 3D, seleção/cotas, menus, listas, salvar (local/json/nuvem/Drive), exportar. Comportamento igual	tela/**	G
0.5 ✅ implementado em 10/11/2026 (b22df6b; teste completo igual no Codex em 11/11/2026 com Chromium 151)	Editor do vão montado pelo registro (campos de cada conteúdo e frente vêm do arquivo dele); templates em fonte/telas/	tela/paineis/vao.js, telas/*.html	M
0.6	✅ Feito 11/11/2026 — formulários do Gabinete e do Armário montam pelo núcleo; geradores.js removido. Adaptadores em formularios/ conservam listas, nomes, ordem e validações; contrato do núcleo preserva fundo, dobradiças, furação e puxadores. npm run testar: Todos os casos iguais à referência. Referências intactas. Sem publicação.	formularios/*.js, nucleo/*, tipos.js; geradores.js removido	M
0.7	✅ Feito 11/11/2026 — testes separados em dez áreas, filtros por área e formulário, --listar; conferência parcial identificada. Teste completo obrigatório passou: Todos os casos iguais à referência. Referências intactas.	testes/**	P
0.8	Defeitos conhecidos: barra de cima do celular; vão escolhido volta ao Vão 1 ao dividir; correr e basculante da parede B sem animação	tela/**	P
0.9	Atualizar arquitetura.md, CLAUDE.md e a skill com a estrutura nova; cabeçalho curto em cada arquivo dizendo o que ele faz	docs	P

Pendências curtas antes do bloco 1 (podem ir junto com a Fase 0):

aprovação da 1c-i;
item 29 (puxador por vão: frentes/puxador.js + painel do vão), custo M.
Blocos (ordem aprovada; dentro de cada bloco, do mais barato ao mais caro)
Bloco 1 — Guarda-roupa (≈ 3 conversas)
Item	Onde	Custo
19 prateleira de vidro, "invisível", divisória dupla	conteudos/prateleiras.js, divisorias.js; vidro em materiais.json	P
13 cabideiro, maleiro, calceiro	conteudos/cabideiro.js, maleiro.js, calceiro.js; tubo oval e suportes em biblioteca/acessorios.json (pesquisar itens reais)	M
30 corrediça oculta e gaveta metálica	ferragens/corredicas.js, frentes/gaveta.js, biblioteca/corredicas.json	M
25 recobrimento total/parcial/embutido + dobradiça curva/supercurva + calço	frentes/giro.js, ferragens/dobradicas.js, biblioteca/dobradicas.json	M–G (a furação muda)
14 modelos prontos + "salvar o meu como modelo" (nuvem)	dados/modelos/*.json, tela/salvar/modelos.js	M
Aceite: um guarda-roupa real (correr ou giro, gavetas, cabideiro, maleiro) saindo completo em todas as saídas	testes/casos/guarda-roupa.js	—
Bloco 2a — Cozinha: dentro e em volta do módulo (≈ 3 conversas)
Item	Onde	Custo
7 interruptor e registro	ambiente/aberturas.js (pontos)	P
17 medida mínima e máxima por módulo	ambiente/modulos.js + validacoes.js	P
16 copiar, espelhar, girar 90°	ambiente/modulos.js, tela/paineis/ambiente.js	P–M
9 rodapé corrido, rodateto, lateral de acabamento	ambiente/arremates.js	M
10 bancada: recorte de cuba e cooktop, rodabanca, cascata	ambiente/bancada.js	M
8 vão de eletro de piso	ambiente/eletros-piso.js, dados/eletros.json	M
21 eletro embutido (forno, micro-ondas, cooktop, coifa)	conteudos/eletro.js, dados/eletros.json	M
15 canto em L 165°, torre de canto 45°	ambiente/modulos.js, ferragens/dobradicas.js	M–G
Bloco 2b — Cozinha: forma do ambiente (≈ 5–6 conversas; o mais complexo)
Item	Onde	Custo
3 portas e janelas · 4 pilar, viga, cano	ambiente/aberturas.js, obstaculos.js, choque em validacoes.js	M + M
5 medição real · 6 planta de fundo	ambiente/medicao.js, tela/paineis/ambiente.js	M + M
1c-ii caixa solta/afastada · 1c-iii giro livre	ambiente/modulos.js, tela/3d/*, saidas/ilogic.js	G + G
1 formato em U e ângulo real · 2 ilha e península	ambiente/paredes.js: paredes viram uma lista com ângulo, e não mais "A e B"; conversor em base/formato.js	GG
11 vários ambientes no projeto	base/formato.js, tela/estado.js	G
Aceite (1d): a cozinha do Nathan saindo completa	testes/casos/cozinha.js	—
Bloco 3 — Frentes e acessórios (≈ 4 conversas)
Item	Onde	Custo
26 painel fixo, frente falsa, fecho toque	frentes/estilos/painel-fixo.js, ferragens/	P–M
28 ajuste de dobradiça por porta	ferragens/dobradicas.js + campo no vão	P–M
31 confirmat, mão-francesa, cantoneira, suporte invisível	ferragens/juncoes.js, metodos-construcao.json, biblioteca	P–M (pesquisa de itens)
23 gola e cava	frentes/estilos/gola.js, cava.js (reaproveita o Perfil G)	M (depende do catálogo)
20 aramado, cesto, lixeira, divisor de talheres, tulha, sapateira inclinada, rodízio, LED	conteudos/aramados.js, lixeira.js…; biblioteca	M
27 veio contínuo entre frentes	saidas/plano-corte.js	M
24 ripada, vidro/alumínio, espelho, tamburato · provençal/almofadada	frentes/estilos/*.js	M cada · provençal G (usinagem 3D)
Bloco 4 — Construção, materiais e fita (≈ 4 conversas)
Item	Onde	Custo
38 vidro e espelho por m² · 39 tapa-furo	materiais.json, saidas/compras.js	P
37 material por grupo (caixa, portas, gavetas, prateleiras, tamponamentos)	nucleo/gerar-modulo.js (herança), painel	P–M
36 fita por lado (espessura, altura, PVC/ABS, desconto configurável)	base/fita.js, saidas/corte.js, loja/*	M
34 tampo engrossado e peça dupla	ambiente/bancada.js, nucleo/caixa.js	M
35 acabamentos reais com textura e preço	dados/acabamentos.json + pesquisa; depende do Nathan baixar as texturas	M–G
32 ligação entre peças editável e meia-esquadria 45°	nucleo/caixa.js, ferragens/juncoes.js, desenho	G
33 fórmulas e parâmetros próprios, com origem do valor	base/formulas.js, métodos	G
Bloco 5 — Documentos (≈ 4 conversas)
Item	Onde	Custo
48 carimbo com logo, empresa e cidade	dados/empresa.json + saidas/folha-peca.js; o Nathan fornece os dados	P
47 folha A4 para peças pequenas	saidas/folha-peca.js	P–M
50 prancha por módulo com tabela de peças	saidas/pranchas-cliente.js	M
45 DXF por peça	saidas/dxf.js	M
52 STEP (caixas retas)	saidas/step.js	M
49 planta e elevações cotadas para o cliente, capa, legenda	saidas/pranchas-cliente.js	G
53 cotas e notas manuais no desenho	saidas/folha-peca.js + ajustes guardados no projeto	G
Bloco 6 — Obra e montagem (≈ 4–5 conversas)
Item	Onde	Custo
65 pedido de peça de reposição	producao/acompanhamento.js	P
64 volumes do ambiente	saidas/volumes.js	M
63 acompanhar peça por peça, checklist de carregamento	producao/acompanhamento.js (nuvem)	M
12 levantamento completo da obra	ambiente/medicao.js + tela Obra	G
51 manual de montagem (sequência, vista explodida, fixações)	saidas/montagem.js	GG
Bloco 7 — Comercial (≈ 4 conversas)
Item	Onde	Custo
57 descontos e comissão · 61 pedido por fornecedor	comercial/orcamento.js, saidas/compras.js	P + P–M
56 preço por m², metro e condicional	saidas/compras.js, biblioteca	M
58 custo × lucro com gráfico · 59 orçamento alternativo	comercial/orcamento.js	M + M
54 clientes e situação do projeto	comercial/clientes.js, tela/salvar/nuvem.js	M
55 contrato com garantia	comercial/contrato.js (modelo de texto editável em dados/)	M
60 página do cliente (catálogo, troca de acabamento, aceite) · 62 briefing	comercial/pagina-cliente.js — outro artifact	G + G
Bloco 8 — Loja (depois das respostas das lojas; ≈ 3 conversas)
Item	Onde	Custo
46 etiqueta editável · 44 CorteCloud com recortes	loja/etiquetas.js, loja/cortecloud.js	M + M
43 perfil de cada loja e envio do pedido	dados/lojas.json, loja/perfis-loja.js	M
40 sobras · 42 vários projetos num plano	saidas/plano-corte.js	M + M
41 otimizador melhor (sentido do 1º corte, vários tamanhos de chapa)	saidas/plano-corte.js	G
Bloco 9 — Avançados e tela (≈ 4–5 conversas)
Item	Onde	Custo
69 localizar peça pelo código	tela/paineis/listas.js	P
70 cubo de navegação	tela/3d/camera.js	M
68 histórico de versões	tela/salvar/nuvem.js	M
67 modelo 3D próprio na cena	tela/3d/cena.js, dados/	M
66 importar do Blender, FreeCAD, Inventor	base/formato.js + importar/*.js	G
22 cama com gaveteiro	dados/modelos/ + conteudos/	G
18 módulo chanfrado, curvo, inclinado	geometria não retangular em núcleo, 3D, corte e desenho	GG
Regras para cada item sair certo
Antes: pesquisar o item real (medidas, código, fabricante) quando houver ferragem ou acessório novo. Sem item real, marcar [Suposição] na biblioteca.
Durante:
arquivo novo pelo contrato;
papel em PAPEIS;
caso de teste na área;
teste rápido da área enquanto ajusta.
Depois:
teste completo igual (ou mudança explicada ao Nathan antes de atualizar a referência);
commit, publicar, copiar para o projeto;
marcar ✅ no plano mestre.
Projeto do Nathan: mudança no formato passa pelo conversor (0.2); nunca sobrescrever o que está na nuvem ou no Drive.
Bloco fecha com um caso real saindo completo em todas as saídas, e não só com o teste.
Riscos
Fase 0 sem resultado visível: são 3–4 conversas em que o Nathan só confere que nada mudou. O teste de referência (lista de corte, compras, furos e desenhos iguais) é a garantia.
0.6 apaga código antigo (geradores do formulário). Volta pelo GitHub, mas os formulários do Gabinete e do Armário passam a usar o núcleo. Se algum caso der diferente, ele aparece no teste antes de gravar.
0.2 e bloco 2b mexem no formato dos projetos salvos. O conversor guarda o original e abre uma cópia convertida, nunca sobrescreve.
Estimativas de conversas: [Suposição], baseadas nas etapas 4a–5c e nas de 09–10/11.
Como o Nathan testa a Fase 0
Abrir "Meus projetos" → Armário da área de serviço: igual ao de antes (medidas, portas, 3D, lista de corte).
Abrir um .json antigo salvo em Downloads: abre, avisa "convertido", e o arquivo original continua intacto.
Exportar o pacote do Blender e o PDF: mesmas páginas de antes.
No celular: a barra de cima cabe na tela; dividir um vão mantém o vão escolhido.
Escolher o tipo "Armário com vãos" no formulário: abre o mesmo armário de antes, agora pelo núcleo.
Prompt de implementação (Fase 0)
Projeto: Configurador de Móveis (nathangithub3dna/configurador-moveis). Ler CLAUDE.md, docs/plano-mestre.md
e docs/plano-execucao.md. Fazer a Fase 0, um passo por vez (0.1 → 0.9), sem mudar comportamento.
Objetivo: separar nucleo.js, tela.js, geradores.js e testes/rodar.js em arquivos pequenos com registro
(conteúdos, frentes, elementos do ambiente, saídas), conforme a estrutura alvo e os contratos do plano.
Regras: npm run testar igual em todos os casos a cada passo; nenhuma referência atualizada na Fase 0
(exceto 0.8, explicando ao Nathan); 0.2 nunca sobrescreve projeto salvo (nuvem, Drive, .json);
0.6 só depois que o formulário do Gabinete e do Armário gerar pelo núcleo exatamente a referência.
Não tocar: Visualizador Granfinale; formato do pecas.json/GLB do Blender; capabilities do artifact.
Aceite: app igual ao v62 para o Nathan; arquivo publicado do mesmo tamanho ±10%; o teste rápido por área
funciona; arquitetura.md e CLAUDE.md descrevem a estrutura nova.
