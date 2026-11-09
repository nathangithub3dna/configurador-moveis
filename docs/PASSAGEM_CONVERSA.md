# Passagem — Configurador de Móveis — 09/11/2026 19:15

## Onde paramos
A conversa de hoje foi de ajustes práticos no armário da lavanderia do Nathan, feito no Móvel livre ("Armário da área de serviço"). Sapateira, Desfazer, Salvar no Drive, edição pelo esquema para todos os armários, juntar escolhendo o vizinho, altura de cada prateleira, tampo acima das gavetas e portas que não batem: tudo publicado (artifact v48) e no GitHub (main, commit 72ed517). O plano do projeto foi retomado no fim: a próxima etapa é a **1c-ii (caixa livre)**.

## Próximo passo
1. Perguntar em múltipla escolha se a **1c-i** foi aprovada. O Nathan "ainda não testou direito"; o caso de aceite é a caixa da geladeira, em `claude/peca-caixa-livre.md`.
2. Explicar a **1c-ii** em palavras simples antes de qualquer coisa, porque o Nathan disse que não lembra o que ela faz: módulo solto no ambiente (ilha) ou afastado da parede, virado para os 4 lados. Depois perguntar, em múltipla escolha, qual caso real serve de aceite (ilha da cozinha, módulo afastado da parede, ou os dois) e se ele quer fazer agora.
3. Só então planejar e fazer a 1c-ii. Uma etapa por conversa.

## Feito nesta conversa
- **Vassoura + sapateira** (conteúdo do vão, nos dois geradores e no editor do Móvel livre): a sapateira fica **embaixo**, com níveis de altura livre (padrão 220 mm), e as vassouras ficam em pé sobre ela, com ≥ 1200 mm até o teto do vão. Os suportes e o gancho sobem junto. Campos: "Altura de cada nível", "Níveis da sapateira" (0/máx = quantos couberem) e aviso quando os níveis pedidos não cabem. — Pedido do Nathan, depois de várias mudanças de rumo (em cima → 1 nível → 25 cm → embaixo com 22 cm).
- **Tipo de móvel na barra de cima** e **topo 2.0 no computador**: linha 1 com nome, tipo, "Editar no esquema" e situação; linha 2 com Desfazer, Salvar/Abrir do Drive e Abrir projeto, as etapas em forma de abas, e "Restaurar medidas padrão" discreto à direita.
- **Editar no esquema**: botão no Armário com vãos e no Gabinete que converte para o Móvel livre com as mesmas peças (conversor do núcleo). A barra passa a mostrar "Armário com vãos — esquema" (`parametros.origem`). Isso não volta ao formulário antigo.
- **Editor do Móvel livre**:
  - nomes da lista de Espaços corrigidos (sumiam);
  - contador de gavetas internas e campos de altura da gaveta e do botijão;
  - altura de cada prateleira (vazio = automático, repartido entre as vizinhas);
  - juntar escolhendo o vizinho (← Esquerda / Direita →, ↓ De baixo / ↑ De cima), mantendo a medida dos outros vãos;
  - painel reordenado: Espaços e vão no topo, Medidas logo abaixo, Construção e peças ajustadas recolhidas no fim (abre sozinho se há peça ajustada).
- **Desfazer**: botão ↶ e Ctrl+Z, com as últimas 20 mudanças. Mudanças em menos de 0,8 s contam como uma.
- **Salvar no Drive / Abrir do Drive** (só no programa publicado, pelo app do Claude, capability `mcp` com o Google Drive: search_files, create_file, download_file_content): cada salvamento cria um arquivo novo com data e hora na pasta **"Projetos de móveis"** (id 13UyZtIqUJD-qy1PjQZq8rzj7TAbm5U2j, criada hoje). A ligação não permite substituir o conteúdo de um arquivo.
- **Tampo das gavetas**: prateleira fixa logo acima da última gaveta interna quando sobram mais de t + 100 mm (papel prateleira-fixa, id `prateleira-fixa-g<V>`).
- **Portas que batiam**: o armário alternava as dobradiças (esq, dir, esq, dir) e duas portas ficavam presas na mesma divisória. Agora as dobradiças ficam nas pontas e os puxadores no meio (metade esquerda abre pela esquerda). A dobradiça automática evita a divisória da vizinha, e há aviso quando duas dobradiças ficam na mesma divisória.
- **Erro de porta larga** diz o vão e o que fazer. A faixa "3D desatualizado" aparece por cima das cotas, também no celular.
- **Teste**: passo do editor atualizado para "juntar-prox". Casos novos: armario-vassoura-sapateira e armario-sapateira-1-nivel.

## Decisões tomadas
- Sapateira embaixo, vassouras em cima; 22 cm entre prateleiras; 2 níveis no armário dele (vassouras + 4 níveis não cabem em 1,88 m) — Nathan.
- Barra de cima mantém o nome do tipo de origem depois de "Editar no esquema" — Nathan.
- Salvar no **Google Drive** (não na conta do Claude) — Nathan.
- Dobradiças nas pontas e puxadores no meio como padrão do armário — sugestão do Claude, feita a pedido do Nathan ("as portas estão batendo").
- Juntar: fica o conteúdo do vão escolhido; o vão junto mede a soma dos dois mais a divisória (vira "auto" só se não sobrar outro vão automático) — sugestão do Claude.
- Teste rápido durante os ajustes e teste completo antes de gravar no GitHub — o Nathan reclamou da demora; isso foi seguido na prática, mas não está escrito no CLAUDE.md.
- Próxima etapa do plano: 1c-ii, em conversa nova — Nathan.

## Tentado e descartado
- Sapateira em cima das vassouras (1 ou 2 níveis, 25 cm repartidos) — o Nathan quis embaixo.
- "Script para colar no app" para economizar tokens — explicado que só ajuda em mudanças que usam funções existentes; ficou sem decisão. A alternativa existente: o Nathan manda o .json (ou salva no Drive) e o Claude edita.

## Sem testar / riscos
- **Salvar/Abrir do Drive dentro do app do Claude**: não testado pelo Claude (os botões só aparecem lá). O Nathan não confirmou. A cópia "salvei" das 18h51 não está no Drive: só há a das 12h43, então ele provavelmente usou o .json. Como testar: Salvar no Drive → conferir a pasta → Abrir do Drive.
- **"A dobradiça não está movendo de lugar"** — o Nathan relatou e depois preferiu seguir sem explicar. Não foi reproduzido: no teste, trocar o lado muda a porta. Pedir um print do vão e do 3D, ou o arquivo salvo no Drive.
- **O armário dele foi convertido antes das correções**: as portas guardam o lado antigo e vão mostrar o aviso de "mesma divisória"; ele troca à mão. A barra mostra "Móvel livre" (não "Armário — esquema").
- Prateleira fixa larga (~87 cm) entre colunas juntadas, com divisória apoiada em cima, pode envergar — avisado ao Nathan [Provável].
- No celular, a lista de tipos troca e recomeça o móvel sem confirmar; o salvamento automático do navegador pode não durar no app do Claude e no arquivo aberto pelo navegador do Android (content://).

## Pendências
- Aprovação da 1c-i; fazer 1c-ii e 1c-iii.
- Prateleiras inclinadas na sapateira — combinado para depois, como etapa separada.
- Teste rápido separado (só os casos afetados) — oferecido, não feito.
- Botão "Salvar no Drive" sempre visível, com o motivo quando indisponível — oferecido, sem resposta.
- Confirmação antes de trocar o tipo de móvel ou restaurar o padrão — oferecido, sem resposta.
- Juntar vãos de colunas diferentes direto (reestruturar a árvore) — oferecido; o Nathan fez à mão.
- Esquema (desenho de frente) no Gabinete e no Armário com vãos sem converter — oferecido; resolvido com "Editar no esquema".
- Pendências antigas: "2 erros · exportação bloqueada" no armário no celular; iLogic de peça girada sem rodar no Inventor; cópia duplicada em `codigo/configurador-moveis.html`; botão de tema; protótipo da tela do celular guardado.

## Arquivos tocados
- `fonte/js/geradores.js` — sapateira embaixo, tampo das gavetas, lado das portas do armário.
- `fonte/js/nucleo.js` — o mesmo no núcleo; altura de cada prateleira; dobradiça automática e aviso; erro de porta com o vão.
- `fonte/js/tipos.js` — campos da sapateira.
- `fonte/js/editor-modulo.js` — conteúdo vassoura+sapateira, gavetas, níveis, juntar(lado).
- `fonte/js/tela-modulo.js` — campos do vão, nomes dos espaços, juntar, bloco recolhido.
- `fonte/js/tela.js` — Desfazer, Editar no esquema, Drive, projetoJSON/abrirProjetoTexto, nome de origem.
- `fonte/js/regras.js` — id prateleira-fixa-g.
- `fonte/pagina.html`, `fonte/estilos/layout.css`, `fonte/estilos/componentes.css` — topo 2.0, editor, janela do Drive.
- `testes/rodar.js` e `testes/referencia/*` — casos novos e referências atualizadas.
- Artifact do programa: v33 → v48 (capabilities: downloads + mcp Google Drive).
- Google Drive: pasta "Projetos de móveis" criada.
- Ramo `sapateira-embaixo-sem-teste` no GitHub — já juntado no main; pode ser apagado.
