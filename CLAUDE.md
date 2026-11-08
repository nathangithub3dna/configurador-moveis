# Configurador de Móveis — instruções para o Claude

- O Nathan não é programador e só fala português. **Toda resposta em português, inclusive o texto final depois das ferramentas — nunca em inglês.** Explique mudanças pelo comportamento, não linha a linha.
- Documentação completa no projeto "MÓVEIS PLANEJADOS" do Claude (claude/*.md). Leia `claude/arquitetura.md` e `claude/plano-reestruturacao.md` antes de mudar a estrutura.
- Reestruturação em etapas (arquitetura.md): uma etapa por vez, o Nathan aprova antes da próxima.
- **Antes de qualquer commit: `npm run testar` precisa dar IGUAL em todos os casos.** Se algo mudou de propósito, explique ao Nathan o que mudou e só então rode `npm run atualizar-referencia`.
- Editar só `fonte/` e `dados/*.json`; `configurador.html` é **gerado** por `npm run montar` (o `testar` já monta). A fonte é separada por assunto (pedido do Nathan: não misturar código com visual):
  - `fonte/estilos/tema.css` — cores, fontes e sombras (mudar o visual = só aqui); `fonte/estilos/layout.css` — posições e tamanhos.
  - `fonte/pagina.html` — estrutura da tela; inclui as outras partes com `/*@inclui:caminho*/`.
  - `fonte/js/` — lógica: `regras`, `tipos`, `geradores`, `nucleo`, `ambiente`, `editor-modulo`, `saidas` (listas, plano, desenhos, Inventor), `saidas-loja` (códigos, CorteCloud, etiquetas), `folha-peca` (folha A3), `orcamento`, `revisao` (estudo/aprovado/liberado, o que mudou); tela: `tela` (3D, eventos, salvar), `tela-modulo`, `tela-ambiente`, `tela-loja`, `tela-orcamento`, `tela-revisao`.
- Salvar: dentro do Claude usa o recurso de downloads; fora dele, baixa pelo navegador. O projeto (.json) salva mesmo com erros.
- `configurador-offline.html` (gerado por `ferramentas/offline.js`, junto com o montar): mesmo programa com as bibliotecas embutidas (de node_modules), abre sem internet e sem o Claude. O teste abre o arquivo com a rede bloqueada.
  - Estrutura dos painéis novos em `<template>` no `pagina.html`; o JS só preenche (`data-texto`, `data-se`, `data-acao`).
- Visual escolhido para a tela (5a): neomorfismo **só na interface**; o móvel (desenho e 3D) fica nas cores reais do material.
- `configurador.html` é o arquivo publicado no artifact https://claude.ai/artifact/HsqccQZfs2utTfs3jVHp1Q (publicar sempre a partir dele).
- Nunca colocar projetos de clientes no repositório (vão para o Google Drive).
- Não tocar no Visualizador 3D Granfinale (GSA).
- O Nathan não quer ficar preso a um PC: nada instalado nos computadores dele; testes rodam na nuvem do Claude.
- Toda peça nova precisa ter uma função na tabela `PAPEIS` (fonte/js/regras.js); orientação no Inventor vem de `ORIENTACAO` por função. O teste falha com "SEM FUNÇÃO" se faltar.
