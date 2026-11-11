# Portas independentes do interior — pedido 74

## Pesquisa em documentação oficial, 11/11/2026

- [PolyBoard — Additional design features](https://wooddesigner.org/help-centre/polyboard-additional-design-features/): a demonstração de gavetas atrás de portas expande a seleção do volume interno até o gabinete inteiro para aplicar duas portas sobre as divisões.
- [PolyBoard — orientação sobre portas](https://wooddesigner.org/forum/polyboard/doors/): a equipe explica como expandir a seleção para cobrir vários espaços internos.
- [Promob — Construtor de Armários](https://suporte.promob.com/hc/pt-br/articles/31121711014545-Construtor-de-Arm%C3%A1rios): a documentação organiza estrutura, divisões, interior e portas em ferramentas distintas.

Essas fontes descrevem o uso dos programas, não seus modelos internos de dados. A implementação abaixo é uma decisão deste configurador.

## Decisão e comportamento

O usuário escolhe o fechamento do móvel separadamente de sua organização interna. No caso de Nathan, duas portas inteiras cobrem os dois espaços superiores e a sapateira inferior. Prateleiras e divisórias permanecem nas posições anteriores.

O modo antigo é o padrão dos projetos existentes. Ao ativar o fechamento independente, o programa conserva as frentes dos vãos para permitir voltar. A edição das divisões continua funcionando; não modifica o fechamento inteiro. A mudança aparece nas peças, furação, compras e visualização através dos geradores existentes, sem uma representação paralela apenas para o desenho.

No Móvel livre ou módulo aberto do Ambiente: **Portas e interior → Fechamento → Portas independentes do interior → 2 portas**. O esquema mostra o interior e os puxadores; o botão 3D mostra as portas.

## Contrato e limites desta etapa

- `m.fachada = { frente, puxador? }` descreve o fechamento inteiro; `m.raiz` continua descrevendo os espaços. `fachadaGuardada` lembra a opção ao retornar ao modo por vão. Formato do projeto passa a 2: a conversão do formato 1 conserva os parâmetros e mantém o fechamento por vão. Versões antigas recusam o formato 2, evitando ignorar a fachada e gerar portas diferentes.
- Apenas registros com `fachada:true` são oferecidos: giro simples/duplo, correr e basculantes. Não se cria uma lista paralela de geradores no editor. A ausência de fachada mantém o caminho anterior.
- O escopo é **um módulo inteiro**. Escolher grupos de espaços, misturar várias regiões de fechamento e ligar portas entre módulos são etapas futuras, não entregues aqui.
- Frentes antigas de gaveta não são escondidas silenciosamente: geram erro de conflito e exigem escolher gavetas internas ou voltar ao modo por vão. Gavetas internas sob portas de correr permanecem bloqueadas até resolver o acesso.
- Gavetas internas têm espaçador no lado da dobradiça; um vão largo sob duas portas recebe espaçadores nos dois lados. Mantêm-se as regras existentes de dimensões, ferragens e limites de abertura. Não foi acrescentada uma simulação completa de colisões entre todos os interiores e ferragens.
- Ajustes manuais por peça continuam usando os IDs existentes: após mudar o fechamento, conferir os ajustes aplicados às portas. Não se promete equivalência desses ajustes entre layouts diferentes.
- Novos testes verificam o caso de três vãos com duas portas, interior preservado, dividir/juntar, medidas, restauração, reabertura e espaçadores. Nenhuma referência existente foi substituída.

Não publicar; o Nathan publica pelo Claude. O arquivo offline local é regenerado junto com o normal.
