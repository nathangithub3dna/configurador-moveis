function vaoSobFachada(m, no) {
  return !!m.fachada && (m.fachada.escopo !== 'selecionados' || !!no.fecharEmConjunto);
}
// Reutiliza a geometria da árvore sem criar peças nem alterar seus contadores.
function regiaoDaFachada(ctx) {
  if (ctx.m.fachada.escopo !== 'selecionados') return ctx.regiao0;
  const grupos = [], leitura = { ...ctx, E:[], cont:{...ctx.cont}, colunas:[], juntasFundo:[], regioes:[], add:()=>{} };
  leitura.vao = (no,g) => { leitura.cont.vao++; if (no.fecharEmConjunto) grupos.push(g); };
  leitura.percorrer = (...a) => percorrerArvore(leitura,...a);
  leitura.percorrer(ctx.m.raiz,ctx.regiao0,0);
  if (!grupos.length) { ctx.E.push('Marque os vãos que devem compartilhar as portas.'); return null; }
  const min = k => Math.min(...grupos.map(g=>g[k])), max = k => Math.max(...grupos.map(g=>g[k]));
  const g = {ix0:min('ix0'),ix1:max('ix1'),iy0:min('iy0'),iy1:max('iy1'),fx0:min('fx0'),fx1:max('fx1'),fy0:min('fy0'),fy1:max('fy1')};
  const area = grupos.reduce((s,r)=>s+(r.fx1-r.fx0)*(r.fy1-r.fy0),0);
  if (Math.abs(area-(g.fx1-g.fx0)*(g.fy1-g.fy0)) > 1) { ctx.E.push('Os vãos marcados precisam formar um retângulo completo, sem espaços faltando.'); return null; }
  g.b = Object.fromEntries([['esq','fx0'],['dir','fx1'],['baixo','fy0'],['cima','fy1']].map(([lado,k])=>[lado,Math.abs(g[k]-ctx.regiao0[k])<0.01 ? ctx.regiao0.b[lado] : 'interna']));
  return g;
}
// FECHAMENTO INDEPENDENTE — frente do módulo inteiro, separada da árvore interna.
// Só frentes com apoio nas bordas externas declaram fachada:true no registro.
function gerarFachada(ctx) {
  const no=ctx.m.fachada; if (!no) return;
  const fr=no.frente, registro=FRENTES[fr?.tipo];
  if (!registro?.fachada) { ctx.E.push('Escolha um fechamento válido para o móvel inteiro.'); return; }
  const g=regiaoDaFachada(ctx); if (!g) return;
  const original=ctx.m;
  try {
    if (PUXADORES[no.puxador]) ctx.m={...original,puxadorPorta:{...PUXADORES[no.puxador],altura:original.puxadorPorta?.altura ?? 1050}};
    if (['porta','2portas','portas'].includes(fr.tipo) && ctx.m.puxadorPorta?.modelo !== 'perfil' && Number.isFinite(no.alturaPuxador) && no.alturaPuxador > 0) ctx.m={...ctx.m,puxadorPorta:{...ctx.m.puxadorPorta,altura:no.alturaPuxador}};
    const inicio=ctx.pecas.length;
    registro.gerar(ctx,g,fr,0);
    ctx.portasFachada=ctx.pecas.slice(inicio).filter(p=>p.cat==='frente' && p.mov?.tipo==='porta');
  } finally {ctx.m=original;}
}
function ladoSobFachada(ctx,g) {
  const portas=(ctx.portasFachada || []);
  const esq=portas.some(p=>p.mov.lado==='esq' && p.mov.pivX>=g.ix0-ctx.t-1 && p.mov.pivX<=g.ix1+1);
  const dir=portas.some(p=>p.mov.lado==='dir' && p.mov.pivX<=g.ix1+ctx.t+1 && p.mov.pivX>=g.ix0-1);
  return esq && dir ? 'ambos' : esq ? 'esq' : dir ? 'dir' : 'nenhum';
}
