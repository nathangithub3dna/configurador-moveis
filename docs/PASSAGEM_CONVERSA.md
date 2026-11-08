# Passagem — Configurador de Móveis — 08/11/2026 (noite)

## Onde paramos
Sub-etapa **1c-i pronta e publicada** (commit `fb0a3d7`, artifact versão 28): em qualquer módulo (móvel livre ou módulo do ambiente) dá para **desligar uma peça** ou **mudar a medida** dela; aceite feito com a caixa da geladeira (aéreo a 1800 mm, laterais descendo até o chão, sem fundo). A 1c foi dividida a pedido do Nathan ("pode dividir o quanto for necessário"): 1c-i (feita), 1c-ii, 1c-iii. A 1c-i ainda não foi aprovada pelo Nathan. A 1b foi tomada como aprovada (o Nathan pediu para seguir para as próximas alterações).

## Próximo passo
1. Aprovação da 1c-i pelo Nathan (testar: 3D → tocar numa peça → "Ajuste desta peça"; no ambiente, "Abrir" o módulo → "Peças ajustadas").
2. **1c-ii — caixa livre:** módulo solto no ambiente (X, Y, Z) ou afastado da parede, virado para os 4 lados. Definir o aceite com o Nathan antes.
3. **1c-iii — giro em ângulo livre da caixa** (3D, planta, portas abrindo, choques, iLogic).
4. Confirmar no celular que o programa abre (artifact v30).

## Feito nesta conversa
- Ajuste por peça (`modulo.pecasAjuste`, lógica em `fonte/js/nucleo.js` → `aplicarAjustesPecas`): desligar (leva junto dobradiças/puxador da porta, caixa da gaveta) ou mudar medida por eixo do módulo com "o que fica no lugar". Aplicado antes da furação.
- Furação das laterais (e base/topo passantes) medida a partir da própria peça, não do módulo — sem ajuste, resultado idêntico (referências iguais).
- Ambiente: erro se peça esticada fica abaixo do chão; aviso se ocupa o lugar de outro módulo (peça a peça).
- Tela (`fonte/js/tela-ajuste.js`, `fonte/estilos/ajuste.css`, modelos `tplAjuste*`): bloco na ficha da peça e lista "Peças ajustadas" no editor do módulo.
- Esquema de frente enquadra peças que saem do módulo; ficha à frente das cotas do 3D (no celular os números passavam por cima).
- **Versão sem internet:** passou a declarar `<meta charset="utf-8">` (`ferramentas/offline.js`). Sem isso o navegador adivinhava a codificação; com o arquivo maior adivinhou errado e um acento quebrou o programa inteiro (teste "SEM INTERNET" falhou e voltou a passar com a correção).
- Teste novo "AJUSTE POR PEÇA (1c)" em `testes/rodar.js`. Todos os casos iguais à referência.
- Publicado: artifact v28; cópia em `codigo/configurador-moveis.html`; `claude/peca-caixa-livre.md` atualizado (divisão da 1c, o que ficou pronto, limites).

## Decisões tomadas
- 1c dividida em 1c-i / 1c-ii / 1c-iii (Nathan).
- Mudar a medida só em peças de caixa/fundo/enchimento sem furos próprios; porta, gaveta, ferragem, prateleira com recorte e travessa de fixação dão erro explicando — escolha do Claude para não gerar furação errada.
- Medida padrão do "o que fica no lugar": esquerda/embaixo/atrás — escolha do Claude.

## Tentado e descartado
- nada

## Sem testar / riscos
- **Celular (app do Claude, Android, Chrome 111): causa confirmada e corrigida, falta o Nathan confirmar no aparelho.** O diagnóstico de carregamento (`fonte/js/diagnostico.js`, aviso no topo se o programa não abrir em 10 s) mostrou: o app põe 2 scripts próprios antes da página e rejeita o `importmap`; sem ele o `'three'` não era achado e o programa inteiro não iniciava (por isso o tipo de móvel vazio e o desenho vazio). Correção: sem importmap — three.js principal por endereço completo e as partes extras (câmera, rótulos, GLB, juntar formas) embutidas pelo montador (`ferramentas/three-embutido.js`); a versão offline troca o endereço por um `data:`.
- Uso real da 1c-i pelo Nathan.
- Ajuste guardado pelo nome interno da peça: mexer na árvore de vãos pode fazê-lo deixar de servir (vira aviso).
- iLogic de peça girada continua sem rodar no Inventor.

## Pendências
- Decisão do Nathan sobre cópias duplicadas (A: parar de copiar o programa para `codigo/configurador-moveis.html`; B: também a passagem só no GitHub; C: deixar como está). Até lá, seguir copiando.
- Limites da 1c-i, 1b e 1a: ver `claude/peca-caixa-livre.md`.

## Arquivos tocados
- `fonte/js/nucleo.js` — `aplicarAjustesPecas`, `eixosDoDesenho`; furação relativa à peça.
- `fonte/js/ambiente.js` — erro/aviso de peça esticada.
- `fonte/js/tela-ajuste.js` (novo), `fonte/estilos/ajuste.css` (novo), `fonte/pagina.html` (modelos e inclusões), `fonte/js/tela.js` (ficha chama o ajuste; `selecionar` exposto aos testes), `fonte/js/tela-modulo.js` (lista no editor; enquadramento do esquema), `fonte/estilos/layout.css` (camada das cotas).
- `ferramentas/offline.js` — `<meta charset="utf-8">`.
- `testes/rodar.js` — teste "AJUSTE POR PEÇA (1c)".
- Projeto MÓVEIS PLANEJADOS: `claude/peca-caixa-livre.md`, `codigo/configurador-moveis.html`, `claude/passagem-conversa.md`.
