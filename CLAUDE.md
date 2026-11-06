# Configurador de Móveis — instruções para o Claude

- O Nathan não é programador e só fala português. Explique mudanças pelo comportamento, não linha a linha.
- Documentação completa no projeto "MÓVEIS PLANEJADOS" do Claude (claude/*.md). Leia `claude/arquitetura.md` e `claude/plano-reestruturacao.md` antes de mudar a estrutura.
- Reestruturação em etapas (arquitetura.md): uma etapa por vez, o Nathan aprova antes da próxima.
- **Antes de qualquer commit: `npm run testar` precisa dar IGUAL em todos os casos.** Se algo mudou de propósito, explique ao Nathan o que mudou e só então rode `npm run atualizar-referencia`.
- Editar só `fonte/configurador.html` e `dados/*.json`; `configurador.html` é **gerado** por `npm run montar` (o `testar` já monta).
- `configurador.html` é o arquivo publicado no artifact https://claude.ai/artifact/HsqccQZfs2utTfs3jVHp1Q (publicar sempre a partir dele).
- Nunca colocar projetos de clientes no repositório (vão para o Google Drive).
- Não tocar no Visualizador 3D Granfinale (GSA).
- O Nathan não quer ficar preso a um PC: nada instalado nos computadores dele; testes rodam na nuvem do Claude.
