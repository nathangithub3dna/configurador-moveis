# Configurador de Móveis

Sistema do Nathan para projetar móveis planejados: 3D, lista de corte, plano de corte, compras, desenhos em PDF, script iLogic para o Inventor e pacote para o Blender.

## Arquivos

| Arquivo | O que é |
|---|---|
| `configurador.html` | O configurador inteiro (é o que vai publicado no Claude) |
| `testes/rodar.js` | Testes de referência: gera cada modelo e compara com o resultado guardado |
| `testes/referencia/` | Resultado "oficial" de cada modelo (peças, lista de corte, plano, ferragens, iLogic) |
| `package.json` | Lista das ferramentas usadas nos testes |

Projetos de clientes **não** ficam aqui: ficam no Google Drive.

## Como testar (no PC)

Precisa do Node.js instalado (nodejs.org, versão LTS). Uma vez só, dentro da pasta:

```
npm install
npx playwright install chromium
```

Depois, sempre que quiser conferir:

```
npm run testar
```

- `IGUAL` em todos os casos → nenhuma medida mudou.
- `MUDOU` → mostra exatamente o que mudou (peça, medida antes e depois).
- Se a mudança foi de propósito: `npm run atualizar-referencia` grava o novo resultado como padrão.

## Abrir o configurador no PC

Abrir `configurador.html` no Chrome ou Edge. Precisa de internet (o 3D e o PDF vêm de bibliotecas on-line). Os botões de exportar (PDF, zip, iLogic) só funcionam na versão publicada no Claude, por enquanto.

## Documentação

Fica no projeto "MÓVEIS PLANEJADOS" do Claude: `claude/visao-geral.md`, `claude/arquitetura.md`, `claude/plano-reestruturacao.md`, `claude/regras-marcenaria.md`, `claude/biblioteca.md`.
