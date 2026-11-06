# Configurador de Móveis

Sistema do Nathan para projetar móveis planejados: 3D, lista de corte, plano de corte, compras, desenhos em PDF, script iLogic para o Inventor e pacote para o Blender.

## Arquivos

| Arquivo | O que é |
|---|---|
| `configurador.html` | O configurador pronto (é o que vai publicado no Claude). **Gerado — não editar** |
| `fonte/configurador.html` | O programa (tela, 3D, cálculos), sem os catálogos |
| `dados/regras.json` | Regras de marcenaria: folgas, corrediças, dobradiças por altura, chapa, serra, refilo… (cada valor tem explicação em `_explicacao`) |
| `dados/biblioteca.json` | Chapas, ferragens, fixação e acabamento: nome, marca, código, unidade de compra |
| `dados/puxadores.json` | Os 5 puxadores escolhíveis: furação, comprimento, largura, saliência, cor |
| `dados/materiais.json` | Materiais e cor no 3D |
| `dados/metodos-construcao.json` | Métodos de construção com nome (laterais passantes ou topo/base passantes, fundo sobreposto ou em rasgo, rodapé ou pés, furação de prateleira…) e o padrão que vale para todos |
| `ferramentas/montar.js` | Junta a fonte com os dados e gera o `configurador.html` |
| `testes/rodar.js` | Testes de referência: gera cada modelo e compara com o resultado guardado |
| `testes/referencia/` | Resultado "oficial" de cada modelo (peças, lista de corte, plano, ferragens, iLogic) |
| `package.json` | Lista das ferramentas usadas nos testes |

Projetos de clientes **não** ficam aqui: ficam no Google Drive.

## Mudar uma regra ou um item do catálogo

Editar o arquivo em `dados/` (dá para editar direto no site do GitHub: abrir o arquivo → lápis ✏️ → salvar).
Exemplo: em `dados/regras.json`, `"folgaPrat": 1` é a folga de cada lado da prateleira.
Depois o Claude monta, testa e publica. Os preços não ficam aqui: são digitados na lista de compras do configurador.

## Como testar (no PC — opcional; o Claude roda na nuvem)

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
