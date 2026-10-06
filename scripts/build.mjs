import {mkdir,readFile,writeFile,readdir} from 'node:fs/promises';
const assets={};
for(const name of await readdir(new URL('../public/',import.meta.url))){
 const type=name.endsWith('.webmanifest')?'application/manifest+json':name.endsWith('.png')?'image/png':name.endsWith('.css')?'text/css; charset=utf-8':name.endsWith('.js')?'text/javascript; charset=utf-8':name.endsWith('.svg')?'image/svg+xml':'text/html; charset=utf-8';
 const binary=name.endsWith('.png');
 const data=await readFile(new URL('../public/'+name,import.meta.url));
 assets['/'+name]={body:data.toString(binary?'base64':'utf8'),type,binary};
}
const model=assets['/model.js'].body.replaceAll('export ','');
const questionRules=await readFile(new URL('../worker/questions.js',import.meta.url),'utf8');
const briefValidation=await readFile(new URL('../worker/brief-validation.js',import.meta.url),'utf8');
const briefHandler=await readFile(new URL('../worker/brief-handler.js',import.meta.url),'utf8');
const withoutHandler=await readFile(new URL('../worker/no-products.js',import.meta.url),'utf8');
const worker=(await readFile(new URL('../worker/index.js',import.meta.url),'utf8')).replace(/^import .*;\r?\n/gm,'');
await mkdir(new URL('../dist/server/',import.meta.url),{recursive:true});
await mkdir(new URL('../dist/.openai/',import.meta.url),{recursive:true});
await writeFile(new URL('../dist/server/index.js',import.meta.url),'const assets='+JSON.stringify(assets)+';\n'+model+'\n'+questionRules+'\n'+briefValidation+'\n'+briefHandler+'\n'+withoutHandler+'\n'+worker);
try {
 const hosting=await readFile(new URL('../.openai/hosting.json',import.meta.url));
 await writeFile(new URL('../dist/.openai/hosting.json',import.meta.url),hosting);
} catch(error) { if(error.code!=='ENOENT') throw error; }
console.log('Application construite.');
