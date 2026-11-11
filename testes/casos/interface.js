// Regressões do cabeçalho, animações da parede B e escolha de puxador por vão.
const assert=require('node:assert/strict');
module.exports={id:'interface',descricao:'Cabeçalho móvel, animações e puxador por vão',async executar({ctx,raiz,pagina,nm}){
 const page=await ctx.newPage();
 page.on('pageerror', e=>console.error('ERRO NA INTERFACE: '+e.message));
 await page.addInitScript(()=>{localStorage.clear();});
    await page.route('**/*', route => {
      const u = route.request().url();
      if (u.startsWith('http://teste/')) return route.fulfill({ body: pagina, contentType: 'text/html' });
      const m = u.match(/three@0\.160\.0\/(.*)$/);
      if (m) return route.fulfill({ path: nm('three/' + m[1]), contentType: 'application/javascript' });
      if (u.includes('jspdf')) return route.fulfill({ path: nm('jspdf/dist/jspdf.umd.min.js'), contentType: 'application/javascript' });
      if (u.includes('jszip')) return route.fulfill({ path: nm('jszip/dist/jszip.min.js'), contentType: 'application/javascript' });
      if (u.includes('qrcode-generator')) return route.fulfill({ path: nm('qrcode-generator/qrcode.js'), contentType: 'application/javascript' });
      if (u.includes('svg2pdf')) return route.fulfill({ path: nm('svg2pdf.js/dist/svg2pdf.umd.min.js'), contentType: 'application/javascript' });
      return route.abort();
    });
 await page.goto('http://teste/', {waitUntil:'commit'});
 await page.waitForFunction(()=>window.__configurador?.estado?.res);
 for(const width of [320,375,768]){await page.setViewportSize({width,height:812});const fora=await page.locator('.topo').evaluate(e=>[...e.querySelectorAll('button,input,select,.marca,.status')].filter(x=>x.checkVisibility()).filter(x=>x.getBoundingClientRect().right>innerWidth||x.getBoundingClientRect().left<0).map(x=>x.id||x.className));assert.deepEqual(fora,[],`Topo em ${width}px`);}
 await page.setViewportSize({width:1400,height:900});
 for(const tipo of ['correr','basculante','basculante-baixo']){
 const closed=await page.evaluate(tipo=>{const c=window.__configurador,e=c.estado;const m=structuredClone(c.TIPOS.modulo.padrao);m.raiz={tipo:'vao',frente:{tipo},conteudo:[]};m.largura=900;m.altura=700;m.profundidade=500;e.projeto={tipo:'ambiente',nome:'Teste',parametros:structuredClone(c.TIPOS.ambiente.padrao)};e.projeto.parametros.modulos=[{nome:'Teste B',linha:'aereo',parede:1,x:900,y:1300,modulo:m}];e.portas=false;c.atualizar();return e.res.pecas.filter(p=>p.cat==='frente').map(p=>({id:p.id,m:p.mov}));},tipo);
 assert.ok(closed.length);assert.ok(closed.every(p=>p.m?.eixo==='z'));
 await page.evaluate(()=>window.__configurador.estado.portas=true);await page.waitForTimeout(1200);
 const moved=await page.evaluate(ids=>ids.map(id=>{const n=window.__configurador.nosAtual().get(id);return {z:n.mover.position.z,r:n.mover.rotation.z};}),closed.map(p=>p.id));
 moved.forEach((n,i)=>{const m=closed[i].m;if(tipo==='correr') assert.ok(Math.abs(n.z-m.curso*m.sentido)<1);else assert.ok(Math.sign(n.r)===(m.sentido==='baixo'?-1:1));});
 console.log('Movimento parede B OK: '+tipo);
 }
 console.log('Topo em 320, 375 e 768 px OK');
 await page.selectOption('#tipoMovel','modulo');
 await page.waitForTimeout(300);
 await page.click('#form [data-acao="selecionar"][data-cam=".0"]');
 await page.selectOption('#form [data-vao="puxador"]','1');
 const pux = await page.evaluate(()=>{const c=window.__configurador,m=c.estado.projeto.parametros,pcs=c.estado.res.pecas;return {escolha:c.ED.no(m.raiz,'.0').puxador,primeiro:pcs.find(p=>p.id==='porta-1-puxador')?.ref,segundo:pcs.find(p=>p.id==='porta-2-puxador')?.ref,padrao:m.puxadorPorta.ref};});
 assert.equal(pux.escolha,'1');assert.notEqual(pux.primeiro,pux.padrao);assert.equal(pux.segundo,pux.padrao);
 await page.selectOption('#form [data-vao="puxador"]','');
 assert.equal(await page.evaluate(()=>window.__configurador.ED.no(window.__configurador.estado.projeto.parametros.raiz,'.0').puxador),undefined);
 console.log('Puxador por vão e retorno ao padrão OK');

 await page.close();return 0;
}};
