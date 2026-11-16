// AJUSTE POR PEÇA — nomes dos eixos e papéis que não mudam de medida. Carregado antes de abrir o projeto salvo:
// o editor do módulo lista os ajustes já na abertura (com o arquivo depois, o celular travava ao abrir — v65).
const EIXOS_TELA = {
  x: { rot:'Largura',      fixos:[['ini','fica a esquerda'], ['fim','fica a direita'], ['centro','cresce dos dois lados']] },
  y: { rot:'Altura',       fixos:[['ini','fica embaixo'],     ['fim','fica em cima'],    ['centro','cresce dos dois lados']] },
  z: { rot:'Profundidade', fixos:[['ini','fica atrás'],       ['fim','fica na frente'],  ['centro','cresce dos dois lados']] },
};
const PAPEIS_COM_FUROS_PROPRIOS = ['travessa-fixacao'];   // furos nascem com a peça: mudar a medida deixaria a furação errada
