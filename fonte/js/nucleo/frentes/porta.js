// FRENTE: porta — uma porta de giro; lado automático: dobradiça longe da parede e longe da dobradiça da vizinha da esquerda
// devolve o lado da dobradiça (as gavetas internas usam para o puxador não bater)
registrarFrente({ id:'porta', gerar(ctx, g, fr) {
  const { m, c, folga, eixos, mesmoEixo, porta } = ctx;
  const x0 = g.fx0 + folga(g.b.esq), x1 = g.fx1 - folga(g.b.dir);
  // lado automático: dobradiça longe da parede (a porta abre sem bater nela)
  // e longe da dobradiça da porta vizinha da esquerda, se ela abre na mesma divisória
  const vizDir = eixos.some(e => e.lado === 'dir' && mesmoEixo(e, { pivX:g.fx0, y0:g.fy0, y1:g.fy1 }));
  const lado = fr.lado && fr.lado !== 'auto' ? fr.lado : ((g.b.esq === 'externa' && c.paredeEsq) || vizDir ? 'dir' : 'esq');
  porta(g, lado, x0, x1, lado === 'esq' ? g.fx0 : g.fx1, m.puxadorPorta, fr.perfil);
  return lado;
} });

registrarEscolha({ grupo:'frente', id:'porta', rotulo:'Porta', ordem:10, icone:'<rect x="4" y="3" width="26" height="34"/><line x1="25" y1="16" x2="25" y2="24" stroke-width="2.5"/>',
  aplicar(no) { no.frente = { tipo:'porta', lado: 'auto' }; } });
