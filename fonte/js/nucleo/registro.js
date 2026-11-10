/* REGISTRO DO NÚCLEO — cada frente e cada conteúdo de vão mora no seu arquivo e se registra aqui.
   O gerador (gerar-modulo.js) só pergunta ao registro: FRENTES[tipo].gerar(ctx, g, fr, V) e CONTEUDOS[tipo].gerar(ctx, ct, est).
   Função nova = arquivo novo em frentes/ ou conteudos/ (incluídos sozinhos, em ordem de nome) + papel em PAPEIS + caso de teste.
   Se precisar de um "se tipo === …" no gerador, o contrato está errado: corrigir o contrato antes. */
const FRENTES = {}, CONTEUDOS = {};
function registrarFrente(d) { if (FRENTES[d.id]) throw new Error('Frente registrada duas vezes: ' + d.id); FRENTES[d.id] = d; }
function registrarConteudo(d) { if (CONTEUDOS[d.id]) throw new Error('Conteúdo registrado duas vezes: ' + d.id); CONTEUDOS[d.id] = d; }
