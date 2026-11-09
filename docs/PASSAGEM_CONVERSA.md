# Passagem — Configurador de Móveis — 09/11/2026 00:20

## Onde paramos
A 1c-i (desligar ou mudar a medida de qualquer peça) está pronta e publicada. O programa voltou a abrir no celular (artifact v30), confirmado por print do Nathan. Começamos o **planejamento da tela nova do celular**, só com protótipos: nada da tela nova foi para o programa.

## Próximo passo
Continuar os protótipos da tela do celular no quadro de design "Configurador no celular — 3 protótipos" (artifact Xf8Ai3JkhcJCWCQdo13bHm), partindo das telas que o Nathan gostou: **D · Novo móvel** e **E1 · Desenho dominante**. Perguntar ao Nathan, em múltipla escolha, se segue por: completar a E1 mostrando onde fica cada função de hoje (menus Ver/Abrir/Medir, ficha da peça, vãos, ambiente, peças livres, saídas); ou versões de Obra e Conferir no estilo da E1, fiéis às funções de hoje. Usar o inventário de funções em `claude/tela-celular.md` e marcar com "novo" o que não existe no programa. **Só planejamento: não mexer no código** até o Nathan escolher e aprovar um plano.

## Feito nesta conversa
- 1c-i: desligar ou mudar a medida de qualquer peça de qualquer módulo, com tela (ficha da peça + "Peças ajustadas") e teste com a caixa da geladeira (commit fb0a3d7, artifact v28). Detalhes em `claude/peca-caixa-livre.md`.
- Furação das laterais medida pela própria peça (sem ajuste, resultado idêntico).
- Versão offline passou a declarar `<meta charset="utf-8">` — sem isso um acento quebrava o programa inteiro.
- Diagnóstico de carregamento (`fonte/js/diagnostico.js`): aviso no topo quando o programa não abre em 10 s (commit fc4bcc0, v29).
- **Celular:** a causa foi confirmada pelo diagnóstico. O app do Claude no Android (Chrome 111) põe scripts próprios antes da página e rejeita o `importmap`, e o 3D não carregava. A correção tirou o importmap: o three.js principal vem por endereço completo e as partes extras são embutidas pelo montador (`ferramentas/three-embutido.js`) (commit cd605cb, v30). O Nathan confirmou que o programa abre.
- Protótipos da tela do celular (quadro de design): A, B, C, D (4 telas) e E (4 variações da tela Projetar).
- `claude/tela-celular.md` no projeto: escolhas do Nathan e inventário das funções que existem hoje.

## Decisões tomadas
- 1c dividida em 1c-i / 1c-ii (caixa solta ou afastada, virada para os 4 lados) / 1c-iii (giro em ângulo livre) — Nathan ("pode dividir o quanto for necessário").
- Tela do celular no estilo Samsung/Apple, sem neomorfismo — Nathan.
- Base visual C (One UI) e três modos embaixo: Projetar · Obra · Conferir — Nathan.
- Projetar: guiado só ao criar, com opção de modelo; depois livre, com cartão "Falta" e menus de contexto por função e proximidade; o desenho abre na última vista usada — Nathan.
- Obra: uma medida por vez, grande. Conferir: marcar peça por peça — Nathan.
- Gostou de **D · Novo móvel** e **E1 · Desenho dominante** — Nathan.
- **Estamos em planejamento:** só protótipos, sem executar nem mudar o sistema — Nathan.
- Mudar medida só em peças de caixa/fundo/enchimento sem furos próprios; padrão "o que fica no lugar" = esquerda/embaixo/atrás — sugestões do Claude, não contestadas.

## Tentado e descartado
- Versões E (2, 3, 4) da tela Projetar — o Nathan achou todas parecidas entre si e não fiéis às funções de hoje (ficou só a E1).
- D · Obra com só largura/altura/profundidade — não corresponde ao que o programa mede (paredes, formato, pontos de esgoto/água/gás/tomada).

## Sem testar / riscos
- Uso real da 1c-i pelo Nathan — testar no 3D: tocar numa peça → "Ajuste desta peça"; no ambiente, "Abrir" o módulo → "Peças ajustadas".
- O programa abriu no celular, mas o print mostrava "2 erros · exportação bloqueada" no armário. A causa não foi vista: provavelmente medidas mudadas ou guardadas no aparelho. Testar com "Restaurar medidas padrão" ou mandar o print da lista de erros.
- iLogic de peça girada continua sem rodar no Inventor.

## Pendências
- **Botão de tema** (automático/claro/escuro no topo): feito e testado só na cópia de trabalho da nuvem, **não foi para o GitHub** e se perde com a sessão. O Nathan interrompeu antes de publicar. Refazer se ele quiser; a ideia é entrar no menu de opções da tela nova.
- Aprovação da 1c-i; depois 1c-ii e 1c-iii.
- Tela nova: definir como fica no computador e onde entram Ambiente e Peças livres.
- Decisão sobre cópias duplicadas (parar de copiar o programa para `codigo/configurador-moveis.html`?).

## Arquivos tocados
- `fonte/js/nucleo.js`, `fonte/js/ambiente.js`, `fonte/js/tela-ajuste.js` (novo), `fonte/estilos/ajuste.css` (novo), `fonte/pagina.html`, `fonte/js/tela.js`, `fonte/js/tela-modulo.js`, `fonte/estilos/layout.css` — 1c-i.
- `fonte/js/diagnostico.js` (novo), `fonte/estilos/componentes.css` — diagnóstico de carregamento.
- `ferramentas/three-embutido.js` (novo), `ferramentas/montar.js`, `ferramentas/offline.js` — 3D sem importmap; offline com UTF-8.
- `testes/rodar.js` — teste "AJUSTE POR PEÇA (1c)".
- Projeto MÓVEIS PLANEJADOS: `claude/peca-caixa-livre.md`, `claude/tela-celular.md` (novo), `codigo/configurador-moveis.html`, `claude/passagem-conversa.md`.
