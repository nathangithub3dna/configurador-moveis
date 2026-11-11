// CONVERSORES: parâmetros dos tipos antigos → módulo do núcleo novo
const PUXADOR_BARRA_GENERICO = proj => ({ ref:null, modelo:null, furacao:128, comp:R.puxadorComp, larg:12, proj, cor:undefined, altura:'topo-120' });
function moduloDeGabinete(p, alturasValidadas = null) {
  const n = k => Number(p[k]);
  const nG = Math.max(0, Math.round(n('gavetas'))), nS = Math.max(0, Math.round(n('prateleiras'))), nP = Number(p.portas);
  const lst = String(p.alturasGavetas).split(/[;,\s]+/).filter(Boolean).map(s => Number(s.replace(',','.')));
  const alts = alturasValidadas ?? (nG ? (lst.length === 1 ? Array(nG).fill(lst[0]) : lst) : []);
  const somaG = alts.reduce((s,v) => s+v, 0), temSup = (n('altura') - n('pes')) - somaG > 0.5;
  const frentePortas = nP === 2 ? { tipo:'2portas' } : nP === 1 ? { tipo:'porta', lado:(p.paredeEsq && !p.paredeDir) ? 'dir' : 'esq' } : { tipo:'nenhuma' };
  const vaoPortas = { tipo:'vao', frente:frentePortas, conteudo: nS ? [{ tipo:'prateleiras', n:nS, min:100 }] : [] };
  const pilha = { tipo:'dividir', dir:'h', sep:'nenhum', partes: alts.map(h => ({ medida:h, no:{ tipo:'vao', frente:{ tipo:'gaveta' }, conteudo:[] } })) };
  const raiz = nG && temSup ? { tipo:'dividir', dir:'h', sep:'divisoria', partes:[{ medida:somaG, no:pilha }, { medida:'auto', no:vaoPortas }] } : nG ? pilha : vaoPortas;
  const pux = PUXADOR_BARRA_GENERICO(n('puxadorProj'));
  return {
    largura:n('largura'), altura:n('altura'), profundidade:n('profundidade'),
    metodo:'gabinete-atual', metodoAjustes:{ pes:n('pes') },
    construcao:{ espMDF:n('espMDF'), espFundo:n('espFundo'), beiral:0,
      paredeEsq:!!p.paredeEsq, paredeDir:!!p.paredeDir, enchimento:!!p.enchimento, tampo:{ larg:n('tampoLarg'), prof:n('tampoProf'), esp:n('tampoEsp') } },
    ambiente:{ esgoto:{ altura:n('esgoto'), recorteLarg:n('recorteLarg'), recorteProf:n('recorteProf') } },
    puxadorPorta:pux, puxadorGaveta:pux, raiz,
  };
}
function moduloDeArmario(p) {
  const n = k => Number(p[k]);
  const vaos = String(p.vaos).split(',').map(x => x.trim().toLowerCase().replace(/\s+/g,'')).filter(Boolean).map(x => x === 'botijao+gavetas' ? 'gavetas+botijao' : x);
  const PxP = { ...PUXADORES[n('puxadorPorta')], altura:n('alturaPuxador') }, PxG = PUXADORES[n('puxadorGaveta')];
  const gav = { tipo:'gavetas-internas', n:Math.max(0, Math.round(n('gavetas'))), altura:n('alturaGaveta'), recuo:45, puxador:PxG };
  const acima = { tipo:'prateleiras-acima', n:Math.max(0, Math.round(n('pratAcimaGavetas'))), minLivre:250 };
  const conteudoDe = v => v === 'prateleiras' ? [{ tipo:'prateleiras', n:Math.max(0, Math.round(n('prateleiras'))), min:150 }]
    : v === 'vassoura' ? [{ tipo:'vassoura', alturaPrat:n('alturaPratVassoura') }]
    : v === 'vassoura+sapateira' ? [{ tipo:'vassoura', alturaPrat:n('alturaPratVassoura'), sapateira:{ nivel:Number(p.alturaNivelSapateira) || 220, max:Number(p.niveisSapateira) || 0 } }]
    : v === 'gavetas' ? (gav.n ? [gav, acima] : [])
    : v === 'gavetas+botijao' ? [{ tipo:'botijao', altura:n('alturaBotijao') }, ...(gav.n ? [gav, acima] : [])] : [];
  const folhas = vaos.map((v, i) => ({ tipo:'vao', frente:{ tipo:'porta', lado: i < Math.ceil(vaos.length / 2) ? 'esq' : 'dir' }, conteudo:conteudoDe(v) }));
  const raiz = folhas.length > 1 ? { tipo:'dividir', dir:'v', sep:'divisoria', partes:folhas.map(no => ({ medida:'auto', no })) } : folhas[0];
  return {
    largura:n('largura'), altura:n('altura'), profundidade:n('profundidade'),
    metodo:'armario-atual', metodoAjustes:{ rodape:{ altura:n('rodape'), recuo:n('recuoRodape') } },
    construcao:{ espMDF:n('espMDF'), espFundo:n('espFundo'), beiral:n('alturaBeiral'),
      paredeEsq:!!p.paredeEsq, paredeDir:!!p.paredeDir, enchimento:false },
    ambiente:{}, puxadorPorta:PxP, puxadorGaveta:PxG, raiz,
  };
}
const CONVERSORES_V3 = { gabinete:moduloDeGabinete, armario:moduloDeArmario };
