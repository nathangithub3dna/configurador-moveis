# Estrutura atual — 11/11/2026

O configurador é montado a partir de fonte/pagina.html, templates em fonte/telas, estilos em fonte/estilos e lógica em fonte/js. Os arquivos configurador.html e configurador-offline.html são gerados; nunca editar à mão.

- nucleo/gerar-modulo.js coordena a geração; caixa, árvore, conteúdos, frentes, fundo, acabamento e ferragens ficam em arquivos próprios.
- nucleo/registro.js registra conteúdos e frentes. Cada novo conteúdo ou frente declara também suas escolhas para o editor.
- formularios/ converte Gabinete e Armário para o núcleo e preserva seus contratos antigos. geradores.js foi removido.
- tela/3d, tela/paineis e tela/salvar concentram os respectivos comportamentos. editor-modulo.js altera a árvore sem conhecer a tela.
- dados/ guarda materiais, puxadores, biblioteca e métodos. As saídas continuam consumindo a lista única de peças com papéis explícitos.
- testes/casos separa dez áreas. npm run testar é obrigatório antes de commit; filtros são apenas conferências parciais. Referências não podem ser atualizadas sem autorização de Nathan.
- Não publicar; Nathan publica pelo Claude. O arquivo offline é gerado localmente com as bibliotecas embutidas.

A especificação abaixo é histórica; os caminhos atuais acima prevalecem. A skill externa do Claude ainda precisa ser localizada para atualização.

---

Arquitetura do configurador — especificação (06/11/2026, revisada)

Revisão de 06/11/2026 (depois do questionário e da pesquisa profunda):

Código no GitHub (nathangithub3dna/configurador-moveis, privado), sincronizando os dois PCs. Projetos de clientes no Google Drive (não numa pasta local).
O gerador por divisões desta especificação passou a ser uma parte de uma base maior, no modelo dos programas de mercado: ambiente → módulos → árvore de vãos → frentes, com método de construção separado, regras de ferragem com furação, material por peça com veio, portas de correr, cantos, aéreos e tampo contínuo. O detalhamento está em claude/pesquisa-base-parametrica.md; a especificação final da base ainda será escrita e aprovada antes das etapas 4–5.
Etapas 1 a 3 desta especificação continuam valendo como estão e começam assim que o GitHub for liberado.
Instalar ferramentas no PC (Node, Playwright): autorizado, com uma pergunta antes da primeira instalação.
Desenhos: vistas geométricas podem vir do FreeCAD (teste em claude/teste-freecad.md); a folha final fica com o nosso gerador.
Conclusão

O núcleo atual está certo e deve ser mantido: tudo nasce de uma lista única de peças (pecas[], cada uma com caixa 3D, dados de desenho e movimento), e todas as saídas (corte, compras, PDF, iLogic, 3D, Blender) leem essa lista. O que não escala é o que fica antes dela e em volta dela:

Um gerador escrito à mão por tipo (gabinete ~220 linhas, armário ~210). Portas, dobradiças, gavetas, puxadores e ferragens são repetidos em cada um e já divergiram: o gabinete ainda usa contagem antiga de parafusos e puxador genérico; o armário usa fixações calculadas e 5 puxadores.
Dados dentro do código: biblioteca, puxadores e regras (R). Trocar um item ou um valor exige mexer no programa.
Um arquivo de 2.169 linhas (160 KB): qualquer ajuste arrisca o resto, não há histórico, e os testes ficam numa pasta temporária da sessão (se perdem).
Projetos: o navegador guarda só 1 projeto; o .json não tem versão de formato. A troca de chave v1 → v2 já descartou o projeto salvo sem aviso.
Saídas dependem do nome (id) da peça para saber orientação no Inventor, fita e vista (oriDe com expressões por id). Cada peça nova precisa de uma regra nova escondida.
(Achado da pesquisa) Um material por móvel e peças que giram livres no corte: não serve para frentes amadeiradas (veio) nem para caixa e frente de materiais diferentes.
(Achado da pesquisa) Método de construção soldado no gerador: não dá para trocar lateral passante por topo passante, fundo parafusado por fundo em rasgo etc. sem reescrever.
Objetivo

Criar qualquer móvel de caixa, num ambiente real, montando módulos e vãos, sem programar um gerador novo, mantendo as saídas idênticas às de hoje para os móveis já feitos.

Entradas → Saídas
Entra: briefing do cliente (depois), medidas do ambiente, arquivo de projeto (.json) ou modelo pronto, árvore de vãos editada na tela, catálogos (JSON), preços do Nathan; peças vindas do Blender, FreeCAD ou Inventor.
Sai: 3D, lista de corte, plano de corte com veio, pedido no formato de cada loja (CSV, CorteCloud), compras, orçamento com revisões, PDF por peça (A4/A3, template próprio), iLogic, STEP/FreeCAD, GLB/pacote, fixações, manual de montagem, catálogo do cliente — e o .json com versão de formato.
Modelo de dados do projeto (preliminar — será substituído pela especificação final da base)
Projeto
  versaoFormato: 3
  nome, cliente, data, revisões (Rev A, B… com preços congelados e aceite)
  ambientes: lista de Ambiente
Ambiente
  paredes (comprimento, altura, ângulo), aberturas, pontos (água, esgoto, gás, tomada), obstáculos, medidas reais
  modulos: lista de Módulo posicionados nas paredes
Módulo
  linha (inferior, superior, torre, painel, guarda-roupa, nicho, ilha, canto), volume, limites
  método de construção (herdado: padrão → projeto → ambiente → módulo → peça)
  raiz: Vão
Vão = um destes:
  DIVIDIR   direção (vertical | horizontal), separador (divisória | prateleira fixa | nenhum),
            partes: lista de { medida: "auto" | mm | %, vão: Vão }
  MÓDULO    frente: nenhuma | porta de giro (lado: auto/esq/dir) | 2 portas | correr | basculante | gaveta
            estilo e recobrimento da frente; puxador: id da biblioteca
            interior: Vão opcional (subdivisão SEM frentes, atrás da porta)
            conteúdo: prateleiras | cabideiro | sapateira | aramado | vassoura | botijão | gavetas internas | vazio

Exemplos (viram modelos prontos):

Gabinete do banheiro = DIVIDIR horizontal [ MÓDULO 2 portas + 1 prateleira ; MÓDULO gaveta 200 ], tampo de referência, enchimento à esquerda.
Armário da área de serviço = DIVIDIR vertical com divisória em 4 partes auto [ porta+vassoura ; porta+prateleiras 5 ; porta+prateleiras 5 ; porta + interior DIVIDIR horizontal [botijão 600 ; gavetas internas 4×190 ; prateleiras 1] ].
Regras
Toda peça nasce da caixa (laterais, topo, base, rodapé, fundo, beiral, travessas) ou de um nó da árvore. Nenhum código fora do gerador cria peças.
Um MÓDULO só conhece o seu retângulo (x0, x1, y0, y1) e o que está ao redor de cada lado: lateral, divisória, base, topo ou outra frente. Disso saem as folgas (1,5 na borda externa, 3 entre frentes) e o lado possível da dobradiça.
DIVIDIR: primeiro reserva as medidas fixas, depois desconta os separadores, e o que sobra vai em partes iguais para as "auto". Separador vertical = divisória; horizontal = prateleira fixa ou travessa.
Lado da dobradiça: "auto" alterna por vão (esq, dir, esq…); parede ao lado força o lado oposto; colisão de abertura usa o cálculo atual (limiteAbertura).
Cada peça recebe um papel explícito (lateral, topo, base, divisória-v, prateleira, prateleira-fixa, porta, frente-gaveta, lateral-gaveta, fundo, rodapé, beiral, travessa, espaçador, reforço…). Orientação no Inventor, fita padrão, vista do desenho e cor no 3D saem do papel — nunca do id.
Ferragens e fixações são calculadas no final, a partir das peças (dobradiças por altura e peso da porta, corrediças por gaveta, fixações por contato — já existe). Nenhuma contagem fica dentro de um tipo de móvel.
Catálogos (biblioteca, acabamentos, puxadores, regras, métodos de construção, módulos prontos, perfis de loja) ficam em arquivos JSON. O preço digitado pelo Nathan fica separado.
Toda validação aponta o vão responsável; a tela destaca esse vão no 3D e na árvore. Erro bloqueia exportação (como hoje).
O arquivo de projeto tem versaoFormato. Ao abrir uma versão antiga: converter passo a passo, mostrar o que mudou, nunca descartar em silêncio, e salvar como arquivo novo.
Corte, compras, PDF, iLogic, GLB e Blender leem só a lista de peças + papel — não sabem que tipo de móvel é.
Regras específicas viram validações de módulo: botijão exige vão ≥ 390, caixa ≥ 370, altura livre ≥ 520 e lateral externa livre para ventilação; gaveta interna exige puxador com saliência ≤ recuo − 8.
Peça com veio não gira no plano de corte; material e fita podem ser diferentes em cada peça.
Fluxo lógico
ABRIR projeto (arquivo, modelo pronto ou o último usado)
  SE arquivo sem versaoFormato ou versão antiga
    CONVERTER versão a versão (v1 gabinete → árvore; v2 armário → árvore)
    MOSTRAR "projeto convertido: …"; marcar como não salvo
  SE algum item da biblioteca não existe mais
    MANTER o código antigo na peça e AVISAR "item não encontrado na biblioteca"

GERAR
  PARA CADA ambiente → PARA CADA módulo
    montar CAIXA pelo método de construção → peças da caixa
    PERCORRER(raiz, retângulo interno, vizinhos)
      SE DIVIDIR
        calcular medidas das partes (fixas, separadores, auto)
        SE soma das fixas > espaço → ERRO no nó
        criar separadores
        PARA CADA parte → PERCORRER(parte, retângulo da parte, vizinhos)
      SE MÓDULO
        criar frente cobrindo o retângulo (com folgas pelos vizinhos)
        criar conteúdo
        SE tem interior → PERCORRER(interior, retângulo sem frentes)
  VALIDAR (mínimos, máximos, porta > 600, peso de porta de correr, colisões, pontos do ambiente, regras dos módulos)
  APLICAR regras de ferragem e usinagem → fixações → listas → plano de corte → compras → orçamento
  DESENHAR 3D, árvore e painéis
  SE houver erro → bloquear exportação

EDITAR na tela
  clique num vão (3D ou árvore) → opções: dividir vertical/horizontal, porta, 2 portas, correr, basculante,
  gaveta, prateleiras, cabideiro, vassoura, botijão, gavetas internas, vazio, apagar
  cada mudança → GERAR de novo (como hoje)
Organização dos arquivos (repositório GitHub privado)
configurador-moveis/        (GitHub: nathangithub3dna/configurador-moveis)
  index.html                tela (só estrutura e estilos)
  src/
    nucleo/                 projeto, ambiente, peça + papel, regras, validação, migração de versões
    gerador/                caixa por método de construção, dividir, módulos, frentes
    calculos/               regras de ferragem/usinagem, fixações, listas, plano de corte com veio, compras, orçamento
    saidas/                 desenho (SVG/PDF), iLogic, FreeCAD/STEP, CorteCloud/CSV por loja, GLB, pacote .zip
    tela/                   cena 3D, ambiente, árvore de vãos, painéis
  dados/
    biblioteca.json, acabamentos.json, puxadores.json, regras.json, metodos-construcao.json, lojas.json
    modelos/                gabinete-banheiro.json, armario-area-servico.json, …
  testes/                   testes de cálculo + testes no navegador (Playwright)
  publicar                  comando que junta tudo em UM configurador.html para o artifact
Google Drive / Projetos     FORA do repositório: cliente → projeto → revisões (.json)
Projetos de clientes ficam no Google Drive (decisão do Nathan), fora do GitHub, porque têm dados de cliente.
three.js, JSZip e jsPDF passam a vir junto no arquivo publicado (hoje vêm da internet).
Onde entra no sistema / o que não tocar
Muda: tudo antes da lista de peças (tipos → ambiente/módulos/árvore), dados para JSON, papel nas peças, tela ganha ambiente e árvore de vãos.
Não muda: lista de peças e saídas existentes (corte, compras, PDF, iLogic, GLB), valores das regras de marcenaria, itens da biblioteca, página do cliente, scripts do Blender (continuam lendo pecas.json/GLB no mesmo formato).
Não tocar: pasta e código do Visualizador Granfinale (GSA).
Casos de borda
Caso	Comportamento
Vão menor que o mínimo do módulo	Erro no vão, com a medida que falta
Soma das medidas fixas maior que o espaço	Erro no nó DIVIDIR, sem gerar as partes
Porta acima de 600	Erro sugerindo "dividir este vão" ou "2 portas"
Porta de correr acima do peso do sistema	Erro com o peso calculado e o sistema que aguenta
Botijão sem lateral externa livre (meio do móvel ou parede)	Erro: ventilação impossível
Gaveta interna com puxador alto	Erro listando os puxadores que cabem (como hoje)
Módulo sobre ponto de água/esgoto/tomada	Aviso no módulo
Parede fora de esquadro	Usa a menor medida e sugere sobra de ajuste
Arquivo .json corrompido ou de outro programa	Mensagem "arquivo não é um projeto do configurador"; projeto atual intacto
Projeto antigo (v1 gabinete, v2 armário)	Converte, mostra aviso, salva como novo
Item da biblioteca removido	Mantém na lista com aviso; não quebra
Árvore vazia	Só a caixa (nicho aberto)
Muitos projetos	Só um aberto por vez
Sem internet	Versão publicada funciona (bibliotecas embutidas)
Riscos
Reescrita do gerador: risco de mudar medidas sem perceber. Mitigação: o gabinete e o armário viram testes de referência — a lista de corte e as compras têm que sair idênticas antes de apagar os geradores antigos.
Conversão de projetos antigos grava arquivo: sempre como arquivo novo, nunca sobrescrever.
GitHub: repositório privado; projetos de cliente fora dele (Google Drive).
Publicação a cada etapa (decisão do Nathan): o publicado pode ficar com defeito; voltar versão pelo GitHub.
iLogic continua não testado no Inventor; testar antes de confiar nas saídas novas.
Etapas (cada uma entregável e testável sozinha)
Levar o arquivo atual para o repositório e criar os testes de referência (gabinete, armário). Nenhuma mudança de comportamento.
Tirar biblioteca, puxadores e regras para JSON.
Papel explícito nas peças; oriDe, fita e vista passam a usar o papel.
(após a especificação final aprovada) Base paramétrica (ambiente, módulos, árvore de vãos, métodos de construção, frentes, regras de ferragem) ao lado dos geradores antigos; quando gabinete e armário saírem idênticos, apagar os antigos.
Tela de montagem (ambiente + árvore de vãos; clique no vão → opções).
Versão de formato + conversão de projetos antigos + projetos no Google Drive.
Comando "publicar" gera o HTML único para o artifact.
Como testar (sem ler código)
Abra o modelo "Gabinete do banheiro": a lista de corte deve ter as mesmas 15 linhas e medidas de claude/gabinete-banheiro.md.
Abra o modelo "Armário da área de serviço": 4 portas de ~450, 0 erros, a mesma lista de corte da versão de hoje.
Comece do zero: caixa 1200 × 2000 × 500, divida em 2 na vertical; vão 1 = porta + 4 prateleiras; vão 2 = dividir na horizontal em gaveta 200 + gaveta 200 + porta. O 3D deve mostrar isso sem erro, e "Abrir gavetas" deve funcionar.
Abra um .json salvo hoje: deve abrir com o aviso "projeto convertido", com as mesmas medidas.
Mude o preço de uma dobradiça: só a lista de compras muda.
Rode "publicar": sai um único .html, e o artifact funciona igual a hoje, inclusive sem internet.
Prompt de implementação (etapas 1–3)
Projeto: Configurador de Móveis do Nathan (repositório GitHub privado nathangithub3dna/configurador-moveis).
Leia antes: docs/arquitetura.md, docs/plano-reestruturacao.md, claude/regras-marcenaria.md,
claude/tipos-de-movel.md, claude/biblioteca.md e o código atual codigo/configurador-moveis.html.

Objetivo das etapas 1–3: organizar o configurador atual sem mudar nenhum resultado.
1) Repositório + testes de referência: gabinete e armário geram lista de corte, compras e ferragens
   idênticas às de hoje (guardar como arquivos esperados).
2) Biblioteca, puxadores e regras (R) em dados/*.json; preços do usuário separados.
3) Cada peça ganha "papel"; orientação iLogic, fita e vista saem do papel, não do id.

Regras: manter a lista única de peças (pecas[] com box, des, mov) e todas as saídas.
Não tocar: Visualizador Granfinale (GSA); scripts do Blender (formato do pecas.json e GLB); página do cliente.
Instalar Node/Playwright no PC: perguntar uma vez antes da primeira instalação.
Projetos de clientes: Google Drive, nunca no repositório.
Cada etapa: testes passando, publicar, dizer ao Nathan o que mudou em comportamento, o que não foi
verificado e como ele testa; esperar o ok antes da próxima.

