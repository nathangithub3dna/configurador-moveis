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
 await page.evaluate(()=>window.__configurador.estado.portas=true);
 // espera a animação chegar ao fim (até 15 s): em máquina sem placa de vídeo os quadros demoram mais que um tempo fixo
 await page.waitForFunction(ps=>ps.every(p=>{const n=window.__configurador.nosAtual().get(p.id);return p.m.tipo==='correr'?Math.abs(n.mover.position.z-p.m.curso*p.m.sentido)<1:Math.abs(n.mover.rotation.z)>0.5;}),closed,{timeout:15000}).catch(()=>{});
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
 // item 29: altura em cima/embaixo, sem puxador (fecho toque) e "usar em todos os vãos"
 const yPux = ()=>page.evaluate(()=>{const b=window.__configurador.estado.res.pecas.find(p=>p.id==='porta-1-puxador')?.box;return b?(b[2]+b[3])/2:null;});
 await page.selectOption('#form [data-vao="puxadorAltura"]','cima'); const yCima=await yPux();
 await page.selectOption('#form [data-vao="puxadorAltura"]','baixo'); const yBaixo=await yPux();
 assert.ok(yCima>yBaixo,'puxador em cima precisa ficar acima do embaixo');
 await page.selectOption('#form [data-vao="puxadorAltura"]','');
 await page.selectOption('#form [data-vao="puxador"]','toque');
 const tq = await page.evaluate(()=>{const r=window.__configurador.estado.res,pcs=r.pecas,pt=pcs.find(p=>p.id==='porta-1');return {pux:!!pcs.find(p=>p.id==='porta-1-puxador'),fecho:pcs.find(p=>p.id==='porta-1-fecho-toque')?.ref,furos:(pt?.des?.furos||[]).filter(f=>f.tipo==='puxador').length,outro:!!pcs.find(p=>p.id==='porta-2-puxador'),aviso:(r.avisos||r.A||[]).some(a=>/fecho toque/.test(a)),altVisivel:!!document.querySelector('#form [data-vao="puxadorAltura"]')?.closest('label')?.offsetParent};});
 assert.equal(tq.pux,false);assert.equal(tq.fecho,'fecho-toque');assert.equal(tq.furos,0);assert.equal(tq.outro,true);assert.equal(tq.altVisivel,false);
 for (const [fr,id] of [['gaveta','gaveta-1-fecho-toque'],['basculante','porta-basculante-1-fecho-toque']]) {
  await page.click(`#form [data-acao="frente"][data-valor="${fr}"]`);
  const r = await page.evaluate(id=>{const pcs=window.__configurador.estado.res.pecas;return {fecho:!!pcs.find(p=>p.id===id),ids:pcs.filter(p=>/fecho|puxador/.test(p.id)).map(p=>p.id)};},id);
  assert.ok(r.fecho,fr+' sem fecho toque: '+r.ids.join(','));
 }
 await page.click('#form [data-acao="puxador-todos"]');
 const todos = await page.evaluate(()=>{const c=window.__configurador,m=c.estado.projeto.parametros;return c.ED.espacos(m.raiz).filter(e=>!e.divisao).map(e=>e.no.puxador);});
 assert.ok(todos.length>1&&todos.every(x=>x==='toque'),'todos os vãos com fecho toque: '+todos);
 await page.selectOption('#form [data-vao="puxador"]','');
 await page.click('#form [data-acao="puxador-todos"]');
 assert.ok(await page.evaluate(()=>{const c=window.__configurador,m=c.estado.projeto.parametros;return c.ED.espacos(m.raiz).filter(e=>!e.divisao).every(e=>e.no.puxador===undefined);}));
 console.log('Altura do puxador, fecho toque e usar em todos os vãos OK: aviso '+(tq.aviso?'presente':'AUSENTE'));

 // item 70: cubo de navegação — canto gira a câmera; casa volta; Orto liga o mesmo botão Ortogonal; some no esquema
 if (await page.locator('#b3D').isVisible()) await page.click('#b3D');
 const dirCam = ()=>page.evaluate(()=>{const {camera,controles}=window.__configurador.cam();return camera.position.clone().sub(controles.target).normalize().toArray();});
 const clicarZona = async dir=>{const zs=page.locator(`.cubo-zona[data-dir="${dir}"]`);for(let i=0;i<await zs.count();i++){const b=await zs.nth(i).boundingBox();if(!b)continue;const x=b.x+b.width/2,y=b.y+b.height/2;if(await page.evaluate(([x,y,d])=>document.elementFromPoint(x,y)?.dataset?.dir===d,[x,y,dir])){await page.mouse.click(x,y);return true;}}return false;};
 const perto = (alvo)=>page.waitForFunction(a=>{const {camera,controles}=window.__configurador.cam();const d=camera.position.clone().sub(controles.target).normalize();const n=Math.hypot(...a);return Math.abs(d.x-a[0]/n)+Math.abs(d.y-a[1]/n)+Math.abs(d.z-a[2]/n)<0.03;},alvo,{timeout:15000});
 assert.equal(await page.locator('.cubo-zona').count(),54);
 assert.ok(await clicarZona('0,0,1'),'face Frente do cubo não clicável'); await perto([0,0,1]);
 assert.ok(await clicarZona('1,1,1'),'canto do cubo não clicável'); await perto([1,1,1]);
 assert.equal(await page.inputValue('#selVista'),'livre');
 await page.click('#cuboCasa'); await perto([0.85,0.6,1.2]);
 await page.click('#cuboOrto');
 assert.deepEqual(await page.evaluate(()=>[window.__configurador.estado.orto,document.querySelector('#bOrto').getAttribute('aria-pressed')]),[true,'true']);
 await page.click('#cuboOrto');
 console.log('Cubo de navegação OK: face, canto, casa e Orto');

 await page.close();return 0;
}};
