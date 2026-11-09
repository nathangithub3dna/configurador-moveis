/* =====================================================================
   2. TIPOS DE MÓVEL — cada tipo tem campos, valores padrão e um gerador.
   Para um novo tipo (aéreo, armário, nicho), acrescente uma entrada aqui.
   ===================================================================== */
const TIPOS = {
  gabinete: {
    nomePadrao: 'Gabinete do banheiro',
    nome: 'Gabinete com portas e gavetas',
    padrao: { largura:800, altura:800, profundidade:450, pes:0, espMDF:18, espFundo:6,
      tampoLarg:800, tampoProf:450, tampoEsp:20, portas:2, gavetas:1, alturasGavetas:'200', puxadorProj:25,
      prateleiras:1, recorteLarg:300, recorteProf:150, paredeEsq:true, paredeDir:false, enchimento:true, esgoto:525 },
    grupos: [
      { titulo:'Medidas gerais', campos:[
        { id:'largura', rot:'Largura total', unid:'mm', ajuda:'Inclui o enchimento do lado da parede.' },
        { id:'altura', rot:'Altura (sem o tampo)', unid:'mm' },
        { id:'profundidade', rot:'Profundidade total', unid:'mm', ajuda:'Da parede até a frente das portas.' },
        { id:'pes', rot:'Altura dos pés', unid:'mm', ajuda:'0 = base apoiada no chão.' } ]},
      { titulo:'Chapas', campos:[
        { id:'espMDF', rot:'Espessura do MDF', unid:'mm' },
        { id:'espFundo', rot:'Espessura do fundo', unid:'mm' } ]},
      { titulo:'Tampo', campos:[
        { id:'tampoLarg', rot:'Largura do tampo', unid:'mm' },
        { id:'tampoProf', rot:'Profundidade do tampo', unid:'mm' },
        { id:'tampoEsp', rot:'Espessura do tampo', unid:'mm' } ]},
      { titulo:'Frentes', campos:[
        { id:'portas', rot:'Portas', tipo:'sel', opcoes:[[0,'Sem portas (nicho)'],[1,'1 porta'],[2,'2 portas']] },
        { id:'gavetas', rot:'Gavetas', unid:'un' },
        { id:'alturasGavetas', rot:'Altura das gavetas', tipo:'txt', unid:'mm', ajuda:'De baixo para cima, separadas por vírgula. Ex.: 150, 200.' },
        { id:'puxadorProj', rot:'Saliência do puxador', unid:'mm' } ]},
      { titulo:'Interno', campos:[
        { id:'prateleiras', rot:'Prateleiras', unid:'un' },
        { id:'recorteLarg', rot:'Recorte do sifão: largura', unid:'mm' },
        { id:'recorteProf', rot:'Recorte do sifão: fundo', unid:'mm' } ]},
      { titulo:'Parede e instalação', campos:[
        { id:'paredeEsq', rot:'Parede à esquerda', tipo:'sim' },
        { id:'paredeDir', rot:'Parede à direita', tipo:'sim' },
        { id:'enchimento', rot:'Enchimento de 25 mm no lado da parede', tipo:'sim' },
        { id:'esgoto', rot:'Altura do esgoto (centro)', unid:'mm', ajuda:'Faixa de ±75 mm. Prateleira que cruzar ganha recorte.' } ]},
    ],
    gerar: gerarGabinete,
  },
  armario: {
    nomePadrao: 'Armário da área de serviço',
    nome: 'Armário com vãos (prateleiras, gavetas, vassouras, botijão)',
    padrao: { largura:1800, altura:2100, profundidade:400, rodape:100, recuoRodape:40, espMDF:18, espFundo:6,
      vaos:'vassoura, prateleiras, prateleiras, gavetas+botijao', prateleiras:5, alturaPratVassoura:1750, alturaNivelSapateira:250, niveisSapateira:0,
      gavetas:4, alturaGaveta:190, alturaBotijao:600, pratAcimaGavetas:1, puxadorPorta:2, puxadorGaveta:4, alturaPuxador:1050,
      alturaBeiral:80, paredeEsq:false, paredeDir:false },
    grupos: [
      { titulo:'Medidas gerais', campos:[
        { id:'largura', rot:'Largura total', unid:'mm' },
        { id:'altura', rot:'Altura total', unid:'mm', ajuda:'Do chão até o alto do beiral.' },
        { id:'alturaBeiral', rot:'Altura do beiral em cima', unid:'mm', ajuda:'Borda em volta do topo para apoiar coisas em cima. 0 = sem beiral.' },
        { id:'profundidade', rot:'Profundidade total', unid:'mm', ajuda:'Da parede até a frente das portas.' },
        { id:'rodape', rot:'Altura do rodapé', unid:'mm' },
        { id:'recuoRodape', rot:'Recuo do rodapé', unid:'mm' } ]},
      { titulo:'Chapas', campos:[
        { id:'espMDF', rot:'Espessura do MDF', unid:'mm' },
        { id:'espFundo', rot:'Espessura do fundo', unid:'mm' } ]},
      { titulo:'Vãos (da esquerda para a direita)', campos:[
        { id:'vaos', rot:'Conteúdo dos vãos', tipo:'txt', ajuda:'Separe por vírgula: prateleiras, vassoura, vassoura+sapateira, gavetas, gavetas+botijao, vazio. Cada vão tem uma porta.' },
        { id:'prateleiras', rot:'Prateleiras por vão', unid:'un' },
        { id:'alturaPratVassoura', rot:'Prateleira do vão de vassouras (topo)', unid:'mm', ajuda:'Com vassoura+sapateira a prateleira desce sozinha ao mínimo (1200 mm livres embaixo).' },
        { id:'alturaNivelSapateira', rot:'Altura mínima de cada nível da sapateira', unid:'mm', ajuda:'Em vassoura+sapateira: cabem quantos níveis der acima das vassouras, todos iguais.' },
        { id:'niveisSapateira', rot:'Níveis da sapateira', unid:'un', ajuda:'0 = quantos couberem. 1 = só a prateleira das vassouras, livre até o teto do vão.' } ]},
      { titulo:'Gavetas e botijão', campos:[
        { id:'gavetas', rot:'Gavetas internas', unid:'un' },
        { id:'alturaGaveta', rot:'Altura de cada gaveta', unid:'mm' },
        { id:'alturaBotijao', rot:'Altura livre do botijão', unid:'mm', ajuda:'P13 tem cerca de Ø360 × 480 mm; deixe folga para o regulador.' },
        { id:'pratAcimaGavetas', rot:'Prateleiras acima das gavetas', unid:'un' } ]},
      { titulo:'Portas e parede', campos:[
        { id:'puxadorPorta', rot:'Puxador das portas', tipo:'sel', opcoes:opcoesPuxador },
        { id:'puxadorGaveta', rot:'Puxador das gavetas internas', tipo:'sel', opcoes:opcoesPuxador, ajuda:'A gaveta fica 45 mm atrás da porta: o puxador precisa sair no máximo 37 mm.' },
        { id:'alturaPuxador', rot:'Altura do puxador da porta (centro)', unid:'mm' },
        { id:'paredeEsq', rot:'Parede à esquerda', tipo:'sim' },
        { id:'paredeDir', rot:'Parede à direita', tipo:'sim' } ]},
    ],
    gerar: gerarArmario,
  },
};

/* Abertura da porta: gira a porta e testa se ela ou o puxador
   entram na parede ou no enchimento. Coordenadas a partir da parede. */
function limiteAbertura({ temParede, eW, u0, u1, uPx, proj, t, P }) {
  if (!temParede) return { ang: R.angMaxDobradica, motivo: '' };
  const pts = [[u0,-t,'a porta'],[u0,0,'a porta'],[u1,-t,'a porta'],[u1,0,'a porta'],[uPx,proj,'o puxador']];
  for (let a = 0; a <= R.angMaxDobradica; a += 0.5) {
    const r = a*Math.PI/180;
    for (const [u,v,quem] of pts) {
      const x = eW + u*Math.cos(r) - v*Math.sin(r);
      const z = P + u*Math.sin(r) + v*Math.cos(r);
      if (x < -0.01 || (x < eW - 0.01 && z < P - 0.01)) return { ang: Math.max(0, a - 0.5), motivo: quem + ' bate na parede' };
    }
  }
  return { ang: R.angMaxDobradica, motivo: '' };
}

