/* =====================================================================
   NÚCLEO — módulo + árvore de vãos + frentes → peças
   Um gerador só para qualquer móvel de caixa, usado pelo editor livre e
   pelos formulários. O contrato opcional preserva as regras dos formulários:
   dobradiças por altura, fundo inteiro e desenho mesmo com medidas inválidas.
   finalizar:false entrega as peças para suas listas, sem acabamento/volumes.
   Módulo: { largura, altura, profundidade, construcao, ambiente, raiz }
   Nó DIVIDIR: { tipo:'dividir', dir:'v'|'h', sep:'divisoria'|'nenhum', partes:[{ medida:'auto'|mm, no }] }
   Nó VÃO:     { tipo:'vao', frente:{ tipo:'porta'|'2portas'|'gaveta'|'nenhuma', lado }, conteudo:[...] }
   ===================================================================== */

function gerarModuloV3(m, contrato = {}) {
  const E = [], A = [], pecas = [];
  const c = resolverMetodo(m), amb = m.ambiente || {};
  const entre = c.lateral === 'entre';                                 // topo e base passantes, laterais entre eles
  const t = c.espMDF, tf = c.espFundo, L = m.largura, H0 = m.altura, P = m.profundidade;
  const HB = c.beiral || 0, H = H0 - HB;
  // TRANSPORTE: limite do projeto (padrão em regras); módulo montado vai inteiro, então as peças não têm limite próprio
  const montado = m.entrega === 'montado', limT = m.transporte?.menorLadoMax ?? R.transporteMenorLado ?? Infinity, Tpeca = montado ? Infinity : limT;
  const eE = (c.paredeEsq && c.enchimento) ? R.enchimento : 0, eD = (c.paredeDir && c.enchimento) ? R.enchimento : 0;
  const xa = eE, xb = L - eD, W = xb - xa, Wi = W - 2*t;
  const rod = c.apoio === 'rodape', RD = rod ? c.rodape.altura : 0;
  const yBase = rod ? RD : c.pes, yApoio = rod ? 0 : c.pes;
  const yLat0 = entre ? yBase + t : yApoio, yLat1 = entre ? H - t : H;
  // fundo sobreposto: caixa começa atrás do fundo; fundo em rasgo: caixa vai até a parede e o fundo entra recuado
  const rasgo = c.fundo.tipo === 'rasgo', zFundo = rasgo ? c.fundo.recuo : 0;
  const zfC = rasgo ? 0 : tf, zFr = P - t, DcC = zFr - zfC;           // peças da caixa
  const zf = rasgo ? zFundo + tf : tf, Dc = zFr - zf;                  // espaço útil (na frente do fundo)
  const add = o => {
    const pc = Object.assign({ lista:true, mov:null, obs:'', esp:t, mat:'mdf-ru-branco', fita:[0,0] }, o);
    if (o.a !== undefined) { let a=o.a, b=o.b, fa=(o.fita||[0,0])[0], fb=(o.fita||[0,0])[1]; if (b > a) { [a,b]=[b,a]; [fa,fb]=[fb,fa]; } pc.comp=a; pc.larg=b; pc.fita=[fa,fb]; }
    Object.assign(pc, papelDe(pc.id));
    if (contrato.finalizar === false) pc.vaoFormulario = cont.vao;
    pecas.push(pc); return pc;
  };
  const ferr = o => add(Object.assign({ cat:'ferragem', mat:'cromado', lista:false }, o));
  const cont = { porta:0, gaveta:0, vao:0, divV:0, divH:0, trav:0 };
  // o que as partes do módulo (caixa, árvore, frentes, conteúdos, fundo, furação…) enxergam; o resto entra depois da árvore
  const ctx = { contrato, m, c, amb, entre, t, tf, L, H0, P, HB, H, montado, limT, Tpeca, eE, eD, xa, xb, W, Wi, rod, RD, yBase, yApoio,
    yLat0, yLat1, rasgo, zFundo, zfC, zFr, DcC, zf, Dc, E, A, pecas, add, ferr, cont };

  ctx.regiao0 = regiaoInternaModulo(ctx);
  if (contrato.somenteVaos) return somenteGeometriaVaos(ctx);
  // CAIXA — nucleo/caixa.js
  ctx.fundoPendente = fazerCaixa(ctx);

  // ÁRVORE DE VÃOS
  const colunas = [], juntasFundo = [];                                            // vãos de 1º nível na horizontal (travessas de fixação)
  const ventilacao = [];
  const regiao0 = ctx.regiao0;
  const folga = tipo => tipo === 'externa' ? R.borda : R.entre/2;
  const dp = Dc - R.recuoPrat - R.folgaFundoPrat;

  const regioes = [];                                                   // vãos com posição (para a tela clicar)
  const percorrer = (...a) => percorrerArvore(ctx, ...a);   // em nucleo/arvore.js

  // eixos das portas já feitas: para a dobradiça automática não cair na mesma divisória da vizinha (as portas bateriam)
  const eixos = [];
  const mesmoEixo = (a, b) => Math.abs(a.pivX - b.pivX) < 40 && Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0) > 50;
  const porta = (...a) => fazerPorta(ctx, ...a);   // em nucleo/frentes/giro.js
  const prateleira = (...a) => fazerPrateleira(ctx, ...a);   // em nucleo/conteudos/prateleiras.js
  const vao = (...a) => vaoDaArvore(ctx, ...a);   // em nucleo/arvore.js
  const portasCorrer = (...a) => fazerPortasCorrer(ctx, ...a);   // em nucleo/frentes/correr.js
  const basculante = (...a) => fazerBasculante(ctx, ...a);   // em nucleo/frentes/basculante.js
  const gavetaExterna = (...a) => fazerGavetaExterna(ctx, ...a);   // em nucleo/frentes/gaveta.js
  const gavetasInternas = (...a) => fazerGavetasInternas(ctx, ...a);   // em nucleo/conteudos/gavetas-internas.js

  // o que as frentes e os conteúdos registrados enxergam do módulo
  Object.assign(ctx, { folga, eixos, mesmoEixo, regiao0, ventilacao, colunas, juntasFundo, regioes, dp, percorrer, vao,
    porta, prateleira, portasCorrer, basculante, gavetaExterna, gavetasInternas });
  gerarFachada(ctx);
  percorrer(m.raiz, regiao0, 0);

  fazerFundoSobreposto(ctx);        // nucleo/fundo.js

  fazerComplementos(ctx);           // nucleo/complementos.js: fixação, ventilação, pés, enchimento, tampo

  // AJUSTE POR PEÇA (passo 1c): desligar ou mudar a medida — antes da furação, para os furos saírem na peça real
  aplicarAjustesPecas(pecas, m.pecasAjuste, E, A);

  fazerFuracao(ctx);                // nucleo/ferragens/furacao-laterais.js

  if (contrato.finalizar === false) return { pecas, erros:E, avisos:A, vaos:regioes };

  avisarTransporte(ctx);            // nucleo/validacoes.js
  acabamentoPecas(pecas, m.materiais || {});
  const volumes = volumesDe(pecas, { montado, L, H:H0, P, A });
  // portas que se atravessariam ao abrir (ex.: dobradiça na mesma divisória, uma de cada lado): o lado fica como escolhido
  // e as duas abrem só até o ângulo em que ainda não se tocam (o "Abrir portas" do 3D abre todas juntas)
  limitarPortasQueBatem(pecas, A);
  return { pecas, erros:E, avisos:A, volumes, compras: comprasV3(pecas), vaos: regioes };
}
