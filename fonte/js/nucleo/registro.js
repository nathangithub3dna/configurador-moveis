/* REGISTRO DO NÚCLEO — cada frente e cada conteúdo de vão mora no seu arquivo e se registra aqui.
   O gerador (gerar-modulo.js) só pergunta ao registro: FRENTES[tipo].gerar(ctx, g, fr, V) e CONTEUDOS[tipo].gerar(ctx, ct, est).
   Função nova = arquivo novo em frentes/ ou conteudos/ (incluídos sozinhos, em ordem de nome) + papel em PAPEIS + caso de teste.
   Se precisar de um "se tipo === …" no gerador, o contrato está errado: corrigir o contrato antes. */
const FRENTES = {}, CONTEUDOS = {};
function registrarFrente(d) { if (FRENTES[d.id]) throw new Error('Frente registrada duas vezes: ' + d.id); FRENTES[d.id] = d; }
function registrarConteudo(d) { if (CONTEUDOS[d.id]) throw new Error('Conteúdo registrado duas vezes: ' + d.id); CONTEUDOS[d.id] = d; }

/* ESCOLHAS DO EDITOR — o que aparece no painel do vão (botões de frente e lista de conteúdo).
   Cada escolha mora no arquivo do seu assunto: { grupo:'frente'|'conteudo', id, rotulo, ordem (posição na lista),
   icone (desenho do botão, SVG 34×40), aplicar(no, m) (o que a escolha cria no vão),
   reconhece(no) + prioridade (conteúdo: qual escolha um vão já montado mostra; menor prioridade é testada antes) }.
   O editor (editor-modulo.js) monta FRENTES_EDITOR e CONTEUDOS_EDITOR a partir daqui. */
const ESCOLHAS = { frente: {}, conteudo: {} };
function registrarEscolha(d) { if (ESCOLHAS[d.grupo][d.id]) throw new Error('Escolha registrada duas vezes: ' + d.id); ESCOLHAS[d.grupo][d.id] = d; }
const escolhasDe = grupo => Object.values(ESCOLHAS[grupo]).sort((a, b) => a.ordem - b.ordem);
// "Nada" na frente e "Vazio" no conteúdo não geram peças: só existem como escolha
registrarEscolha({ grupo:'frente', id:'nenhuma', rotulo:'Nada', ordem:0, icone:'<rect x="4" y="3" width="26" height="34" stroke-dasharray="3 2"/>',
  aplicar(no) { no.frente = { tipo:'nenhuma' }; } });
registrarEscolha({ grupo:'conteudo', id:'vazio', rotulo:'Vazio', ordem:0, prioridade:999, icone:'<rect x="4" y="3" width="26" height="34"/>',
  reconhece: () => true, aplicar(no) { no.conteudo = []; } });
