import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {defaults,validate} from '../public/model.js';
assert.equal(validate(defaults).length,0);assert.equal(defaults.makerMargin,25);for(const key of ['price','vat','quantity','cycles','sellthrough'])assert.equal(defaults[key],null);
assert.ok(validate({...defaults,quantity:1.5}).length);
assert.ok(validate({...defaults,makerMargin:100}).length);
const source=await readFile(new URL('../dist/server/index.js',import.meta.url),'utf8');
const {default:worker}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const request=d=>new Request('https://test.local/api/analyse',{method:'POST',headers:{origin:'https://test.local','Content-Type':'application/json'},body:JSON.stringify(d)});
let response=await worker.fetch(new Request('https://test.local/'),{});const html=await response.text();
assert.equal(response.status,200);for(const tag of html.match(/<input\b[^>]*>/g)||[])if(/name="(price|vat|quantity|cycles|sellthrough)"/.test(tag))assert.doesNotMatch(tag,/\brequired\b/);assert.doesNotMatch(html,/name="(share|margin|uplift|allocation)"/);assert.match(html,/marge résiduelle souhaitée/);
assert.equal((await worker.fetch(request(defaults),{})).status,503);
assert.equal((await worker.fetch(new Request('https://test.local/api/analyse',{method:'POST',headers:{origin:'https://evil.local'},body:'{}'}),{OPENAI_API_KEY:'test'})).status,403);
assert.equal((await worker.fetch(request({...defaults,price:-1}),{OPENAI_API_KEY:'test'})).status,400);
const original=globalThis.fetch;let answer={low:80,target:100,high:120,justification:'Analyse simulée.',questions:[],pistes:'À confirmer.',argumentaire:'Estimation indicative.'};let calls=0;
globalThis.fetch=async(url,options)=>{calls++;const body=JSON.parse(options.body);if(body.tools){assert.equal(body.tool_choice,'required');assert.deepEqual(body.tools,[{type:'web_search'}]);assert.equal('brief' in JSON.parse(body.input),false);return new Response(JSON.stringify({output:[{type:'web_search_call',status:'completed',action:{sources:[{url:'https://example.com/plv',title:'Catalogue PLV'}]}},{content:[{type:'output_text',text:'Comparable public : contexte simulé.'}]}]}));}assert.equal(body.store,false);const input=JSON.parse(body.input).projet;for(const key of ['share','margin','uplift','allocation','makerMargin','production'])assert.equal(key in input,false);assert.equal(input.objective,defaults.objective);for(const key of ['price','vat','quantity','cycles','sellthrough'])assert.equal(key in input,false);assert.match(body.instructions,/ne calcule aucun ROI/);return new Response(JSON.stringify({output:[{content:[{type:'output_text',text:JSON.stringify(answer)}]}]}));};
try{
 response=await worker.fetch(request({...defaults,share:99,allocation:99}),{OPENAI_API_KEY:'test'});assert.equal(response.status,200);let data=await response.json();assert.equal(calls,2);assert.deepEqual(data.sources,[{url:'https://example.com/plv',title:'Catalogue PLV'}]);assert.equal(data.result.target,100);assert.equal(data.result.total,10000);assert.equal(data.result.production,75);assert.ok(data.result.scenarios.every(s=>s.roi===null));assert.equal(data.result.withoutProducts,false);assert.equal('incrementalProfit' in data.result,false);
 response=await worker.fetch(request({...defaults,makerMargin:20}),{OPENAI_API_KEY:'test'});data=await response.json();assert.equal(data.result.target,100);assert.equal(data.result.production,80);
 answer={...answer,low:80,target:100,high:120,questions:['Dimensions ?']};response=await worker.fetch(request(defaults),{OPENAI_API_KEY:'test'});let pending=await response.json();assert.equal(pending.result,null);assert.deepEqual(pending.sources,[]);assert.doesNotMatch(pending.text,/100[,.\s]*00|100,00|Prix de vente indicatif/);assert.deepEqual(pending.questions,['Dimensions ?']);
 answer={...answer,low:null,target:null,high:null};response=await worker.fetch(request(defaults),{OPENAI_API_KEY:'test'});assert.equal(response.status,200);assert.equal((await response.json()).result,null);
 answer={...answer,low:120,target:100,high:80,questions:[]};response=await worker.fetch(request(defaults),{OPENAI_API_KEY:'test'});assert.equal(response.status,502);
 const workingFetch=globalThis.fetch;globalThis.fetch=async(url,options)=>{const body=JSON.parse(options.body);if(body.tools)return new Response(JSON.stringify({output:[]}));return workingFetch(url,options);};response=await worker.fetch(request(defaults),{OPENAI_API_KEY:'test'});assert.equal(response.status,502);assert.equal('result' in await response.json(),false);
}finally{globalThis.fetch=original;}
console.log('Estimation commerciale : aucun chiffre économique caché, analyse IA obligatoire, marge résiduelle privée, série, absence de prix et fourchette invalide vérifiées.');
