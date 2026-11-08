# Passagem — Configurador de Móveis — 08/11/2026 18:50

## Onde paramos
Sub-etapa **1b do passo 1 (tela das peças livres) pronta e publicada** (commit `85b1e8a`, artifact versão 27): no modo Ambiente dá para criar e editar peças livres pela tela, juntar em grupos e vê-las na planta. **Ficou aberto um problema relatado pelo Nathan:** no celular, abrindo o artifact pelo app do Claude, os botões e campos aparecem mas a área do desenho fica vazia (nenhum móvel). Na nuvem, numa tela de celular (390 × 844), o móvel aparece no Esquema e no 3D — não foi reproduzido. A 1b ainda não foi aprovada pelo Nathan.

## Próximo passo
1. Investigar o "móvel não aparece no celular" antes de qualquer outra coisa. O Nathan ainda não respondeu as duas perguntas que separam as causas:
   - Antes de hoje o móvel aparecia no celular? (Se parou hoje, suspeitar da 1b: `fonte/js/tela-ambiente.js`, `fonte/pagina.html`, `fonte/estilos/ambiente.css`, `fonte/js/folha-peca.js`.)
   - Em "Lista de corte" a tabela aparece preenchida? (Preenchida = programa roda e só o desenho falha: tamanho da área `.vista`/`.palco` no app, ou WebGL do aparelho. Vazia = o programa não carrega no app: ex. a biblioteca three vinda de cdn.jsdelivr.net pelo importmap.)
   - Confirmar a causa antes de corrigir (pedir print; se possível abrir o artifact no Chrome do PC em largura de celular). Depois corrigir, rodar `npm run testar`, publicar.
2. Depois: aprovação da 1b pelo Nathan e a sub-etapa **1c — caixa livre + desligar/mudar peça de qualquer módulo** (aceite: caixa da geladeira com lateral alta + aéreo, sem base nem fundo). Especificação em `claude/peca-caixa-livre.md`.

## Feito nesta conversa
- Tela das peças livres no modo Ambiente — para montar painel, forro, cortineiro, mesa etc. sem mexer nos dados:
  - "+ Peça" por função (nasce com medidas iniciais da função); lista com uma peça aberta por vez; Editar/Fechar, Duplicar, Remover.
  - Campos: nome, função, grupo, medida 1, medida 2, espessura, material, veio (só em material com veio), fita por borda (nomeada como a peça nasce: de baixo, de cima, lado do canto, de trás, da frente…), como nasce, onde (parede A, parede B, solta), posição, giro (tombar, virar, inclinar), recortes, furos, ferragens da biblioteca com quantidade.
  - Trocar "onde" mantém a peça no mesmo lugar do ambiente; na parede B avisa para conferir o giro (a peça nasce virada 90°).
  - Grupo: bloco por grupo com "Mover X/Y/Z" (eixos do ambiente), "Mover o grupo" e "Duplicar o grupo" (cópia "<grupo> 2", ao lado). Duplicar peça: cópia nasce ao lado.
- Planta (vista de cima): peças livres desenhadas por cima dos módulos com o contorno real visto de cima (vale girada), rótulo L1, L2…; clicar abre a peça no painel.
- Folha A3: a vista frontal passou a desenhar recortes de borda e vazados (antes saía só o retângulo — valia também para a prateleira com recorte do sifão). Conferido por imagem no tampo da mesa.
- Teste novo "PEÇAS LIVRES PELA TELA (1b)" em `testes/rodar.js`: monta pela tela as 8 peças do caso da 1a e compara com o caso montado pelos dados (igual); confere planta, clique na planta, mover/duplicar grupo, duplicar/remover peça. Todos os casos iguais à referência.
- Publicado: artifact versão 27; cópia em `codigo/configurador-moveis.html` no projeto; `configurador-offline.html` enviado ao Nathan; `claude/peca-caixa-livre.md` atualizado (1b feita, o que ficou pronto e limites).
- Explicado ao Nathan o plano do passo 1 (1a–1d) e o escopo dos passos 2 e 3.

## Decisões tomadas
- Mexer na posição de uma peça move só ela; o grupo se move pelo bloco do grupo (Mover/Duplicar) — sugestão do Claude, para não arrastar o pé ao ajustar o tampo; informada ao Nathan, sem resposta contrária.
- Duplicar peça/grupo: a cópia nasce ao lado, não por cima — sugestão do Claude.

## Tentado e descartado
- nada

## Sem testar / riscos
- **Móvel não aparece no celular (artifact no app do Claude)** — causa não confirmada; ver "Próximo passo".
- Uso real da tela pelo Nathan (montar a mesa no celular) — ainda não feito.
- 3D das peças criadas pela tela não conferido por imagem nesta etapa (dados iguais aos da 1a, que foi conferida).
- iLogic de peça girada continua sem rodar no Inventor.

## Pendências
- Decisão do Nathan sobre cópias duplicadas (pergunta feita, sem resposta): A) parar de copiar o programa para `codigo/configurador-moveis.html` no projeto (recomendação do Claude: o código já está no GitHub e a versão de uso no artifact; a cópia de 360 KB fica desatualizada e pesa nas buscas); B) também deixar a passagem só no GitHub; C) deixar como está. Mudar exige ajustar `CLAUDE.md`, a skill do configurador e a skill de fechar conversa. Até lá, seguir copiando.
- Limites da 1b: "Mover o grupo" não gira o grupo; rótulos da planta se sobrepõem em peças finas e próximas; nome longo da peça encosta no "QTD." do carimbo da folha A3 (já existia).
- Limites da 1a continuam (recortes só numa borda, furos só na face A, CorteCloud sem recortes, volumes de transporte do ambiente, biblioteca sem mão-francesa/cantoneira/suporte invisível, 3D na cor da categoria).

## Arquivos tocados
- `fonte/pagina.html` — bloco "Peças livres" no modelo do Ambiente e modelos `tplLivre`, `tplLivreRec`, `tplLivreFuro`, `tplLivreFer`, `tplGrupo`.
- `fonte/js/tela-ambiente.js` — lista e edição das peças livres, grupos, peças livres na planta e clique nelas.
- `fonte/estilos/ambiente.css` — aparência da lista de peças livres e das peças na planta.
- `fonte/js/folha-peca.js` — recortes e vazados na vista frontal da folha A3.
- `testes/rodar.js` — teste "PEÇAS LIVRES PELA TELA (1b)".
- Projeto MÓVEIS PLANEJADOS: `claude/peca-caixa-livre.md`, `codigo/configurador-moveis.html`.
