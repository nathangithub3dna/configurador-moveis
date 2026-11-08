// Embute as partes extras do three.js (controle da câmera, rótulos, exportar GLB, juntar formas) dentro do
// próprio programa, sem "importmap". Motivo: o app do Claude no celular (Android, Chrome 111) põe scripts
// próprios antes da página e então REJEITA o importmap; sem ele, nada acha o 'three' e o programa não abre
// (confirmado pelo diagnóstico de carregamento em 08/11/2026).
// Só a biblioteca principal vem de fora, por endereço completo (ela não importa nada).
// Cada parte vira um bloco que pega do THREE o que usa e devolve o que exporta.
const fs = require('fs'), path = require('path');
const raiz = path.join(__dirname, '..'), jsm = path.join(raiz, 'node_modules', 'three', 'examples', 'jsm');
const URL_THREE = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
const PARTES = [   // em ordem: quem é usado por outro vem antes
  { arq: 'utils/TextureUtils.js', nome: '__TextureUtils' },
  { arq: 'controls/OrbitControls.js', nome: '__OrbitControls' },
  { arq: 'renderers/CSS2DRenderer.js', nome: '__CSS2DRenderer' },
  { arq: 'exporters/GLTFExporter.js', nome: '__GLTFExporter' },
  { arq: 'utils/BufferGeometryUtils.js', nome: '__BufferGeometryUtils' },
];
const lista = txt => txt.split(',').map(x => x.trim()).filter(Boolean).map(x => { const [a, b] = x.split(/\s+as\s+/); return [a.trim(), (b || a).trim()]; });

function bloco({ arq, nome }) {
  let c = fs.readFileSync(path.join(jsm, arq), 'utf8');
  const exporta = [];
  c = c.replace(/import\s*\{([^}]*)\}\s*from\s*'three'\s*;?/g, (_, nomes) => `const { ${lista(nomes).map(([a, b]) => a === b ? a : `${a}: ${b}`).join(', ')} } = THREE;`);
  c = c.replace(/import\s*\{([^}]*)\}\s*from\s*'([^']+)'\s*;?/g, (_, nomes, rel) => {
    const alvo = path.posix.normalize(path.posix.join(path.posix.dirname(arq), rel)), dono = PARTES.find(p => p.arq === alvo);
    if (!dono) throw new Error(`three-embutido: ${arq} usa ${alvo}, que não está na lista PARTES`);
    return `const { ${lista(nomes).map(([a, b]) => a === b ? a : `${a}: ${b}`).join(', ')} } = ${dono.nome};`;
  });
  if (/^\s*import\s/m.test(c)) throw new Error(`three-embutido: sobrou um import em ${arq}`);
  c = c.replace(/^export\s*\{([^}]*)\}\s*;?/gm, (_, nomes) => { lista(nomes).forEach(([a, b]) => exporta.push(b === a ? a : `${b}: ${a}`)); return ''; });
  c = c.replace(/^export\s+(function|class|const|let)\s+([\w$]+)/gm, (_, tipo, n) => { exporta.push(n); return `${tipo} ${n}`; });
  if (/^\s*export\s/m.test(c)) throw new Error(`three-embutido: sobrou um export em ${arq}`);
  return `// --- three/examples/jsm/${arq} (embutido) ---\nconst ${nome} = (() => {\n${c}\nreturn { ${[...new Set(exporta)].join(', ')} };\n})();`;
}

// texto que entra no lugar de /*@three*/ dentro do <script type="module">
function threeEmbutido() {
  return [`import * as THREE from '${URL_THREE}';`, ...PARTES.map(bloco),
    'const { OrbitControls } = __OrbitControls, { CSS2DRenderer, CSS2DObject } = __CSS2DRenderer, { GLTFExporter } = __GLTFExporter, { mergeGeometries } = __BufferGeometryUtils;'].join('\n');
}
module.exports = { threeEmbutido, URL_THREE };
