# Passagem — Configurador de Móveis — 08/11/2026 14:10

## Onde paramos
Os passos 1 a 4 da ordem A (auditoria do ChatGPT) e as 4 tarefas baratas estão prontos, testados (8 casos IGUAIS + testes de situação, orçamento, abertura e sem internet), no GitHub (commit `e0cbc5f`) e publicados (artifact versão 25). O configurador abre em "Móvel livre"; o projeto guarda situação (estudo/aprovado/liberado), conferência e furação.

## Próximo passo
O Nathan escolhe entre:
- **A)** bloco de tarefas médias (lista abaixo, em "Pendências — médias"), numa rodada só; ou
- **B)** passo 5 da ordem A: levantamento completo da obra.

Se não disser nada, perguntar em múltipla escolha. Antes de mudar a estrutura, ler `claude/arquitetura.md` e `claude/plano-reestruturacao.md` (projeto MÓVEIS PLANEJADOS) e o `CLAUDE.md` do repositório.

## Feito nesta conversa
- Chapas de mercado (MDF/HDF), transporte (limite informado por projeto), móvel montado/desmontado, lista de volumes com embalagem simples, fundo dividido com perfil H plástico — pedido do Nathan (peças padrão, considerar transporte).
- Etapas 4c (correr, basculante, portas/lado automáticos), 4d (dobradiças por altura/peso/largura, minifix/cavilha, kits), 4e (material frentes/caixa, veio, fita C1/C2/L1/L2, medida de corte).
- 5a: tela do Móvel livre em neomorfismo (só a interface); fonte separada em estrutura (`pagina.html`), visual (`estilos/`) e lógica (`js/`).
- 5b: Ambiente (parede reta ou em L, pontos, aéreos, torre, canto, tampo, planta).
- 5c: código das peças, etiquetas com QR, pedido CorteCloud, folha A3 da peça no padrão FreeCAD (PDF vetorial), orçamento com revisões e aceite.
- Ordem A, passo 1: salvar fora do Claude (download do navegador); projeto .json salva mesmo com erros.
- Passo 2: situação estudo/aprovado/liberado, rótulo e "NÃO FABRICAR" nos documentos, quadro "o que mudou".
- Passo 3: `configurador-offline.html` (bibliotecas embutidas, abre sem internet).
- Passo 4: portas/gavetas da parede B abrem no 3D; pivô da parede A corrigido; conferência de abertura entre módulos; balcão de canto cego no exemplo; conferência obrigatória antes de liberar; peça de teste de furação.
- Baratas: abre em Móvel livre; rótulo no PDF antigo e no zip (`SITUACAO.txt`, nome do zip com a situação); furação gravada no projeto; orçamento com serviços da loja separados (corte, fita, furação, outros) e despesas fixas (gasto do mês ÷ horas do mês × horas do projeto); taxa e despesas lembradas para projetos novos.
- Corrigido erro: liberação e conferência se perdiam ao recarregar e não iam no .json.

## Decisões tomadas
- Ordem A da auditoria: 1 salvar+orçamento, 2 revisão, 3 offline, 4 conferência+peça de teste, 5 levantamento da obra, 6 manual de montagem — Nathan.
- Neomorfismo só na interface; móvel nas cores do material — Nathan.
- Fita "use o padrão"; desconto da fita fica como opção da loja — Nathan.
- Transporte: um valor informado por projeto — Nathan.
- Não depender da peça de teste nem das perguntas às lojas (vão demorar); prioridade é melhorar o app — Nathan.
- Despesas fixas cobradas por hora do projeto, sem lucro em cima; serviços da loja entram com o markup do material — sugestão do Claude aceita (Nathan pediu "fazer as baratas").
- Trabalhar em conversas curtas, uma etapa por conversa (custo de token) — sugestão do Claude.

## Tentado e descartado
- QR das etiquetas desenhado em quadradinhos — PDF de 5,9 MB; trocado por imagem PNG.
- Conferência de abertura com a caixa do módulo inteiro — gerava alarme falso (puxador do outro lado); trocada por peça a peça.
- Gaveteiro no canto da cozinha de exemplo — gavetas bloqueadas pela parede B; trocado por balcão de canto cego.

## Sem testar / riscos
- Posição do texto "NÃO FABRICAR" no PDF antigo não foi vista com os olhos — Nathan: aba Desenhos → "PDF antigo", olhar o topo da 1ª página.
- Orientação da furação na loja (canto 0, face, topo) é [Provável] — só a peça de teste confirma.
- Portas de correr e basculantes da parede B não se movem no 3D.
- Modelo de etiqueta 2×7 (99 × 38) é [Suposição].

## Pendências
Médias (uma rodada):
- Posição do puxador na tela nova (Nathan ainda não escolheu A/B/C).
- Folha A4 para peças pequenas (hoje só A3).
- Rasgos/canais desenhados nas vistas da folha.
- Correr e basculante da parede B se movendo no 3D.
- Conferência de abertura também no móvel solto.
- Juntar pilhas pequenas na lista de volumes.

Caras (cada uma numa conversa):
- Passo 5: levantamento da obra (portas, janelas, pilares, rodapé, desnível, parede fora de esquadro, eletrodomésticos, acesso ao sifão, retirar gaveta).
- Passo 6: manual de montagem (depois do 5).

Dependem de terceiros (não esperar):
- Peça de teste na loja; perguntas às lojas (refilo, serra, fita, desconto, CNC); gola e cava (catálogo).

## Arquivos tocados
- `fonte/js/` — nucleo, ambiente, editor-modulo, saidas, saidas-loja, folha-peca, orcamento, revisao, tela, tela-modulo, tela-ambiente, tela-loja, tela-orcamento, tela-revisao.
- `fonte/estilos/` — tema, layout, componentes, editor, ambiente.
- `fonte/pagina.html` — estrutura da tela e modelos.
- `dados/regras.json`, `dados/biblioteca.json`, `dados/materiais.json`.
- `ferramentas/montar.js`, `ferramentas/offline.js` (novo), `package.json`.
- `testes/rodar.js` e `testes/referencia/`.
- `CLAUDE.md` — regra do português, estrutura da fonte, versão offline.
