import {validate, defaults} from '../public/model.js';
import {extractBrief} from './brief-handler.js';
import {analyseWithoutProducts} from './no-products.js';
import {assets} from './assets.js';
const headers = {'cache-control':'no-store','x-content-type-options':'nosniff','referrer-policy':'same-origin'};
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{...headers,'content-type':'application/json; charset=utf-8'}});
export default {
 async fetch(request,env) {
  const url=new URL(request.url);
  if(url.pathname==='/api/brief' && request.method==='POST')return extractBrief(request,env);
  if(url.pathname==='/api/status' && request.method==='GET') return json({ai:!!env.OPENAI_API_KEY});
  if(url.pathname==='/api/analyse' && request.method==='POST') {
   if(request.headers.get('origin')!==url.origin) return json({error:'Origine de la requête refusée.'},403);
   if(!env.OPENAI_API_KEY) return json({error:'L’IA n’est pas encore connectée. Aucun montant ne sera affiché avant une analyse réussie.'},503);
   if(!request.headers.get('content-type')?.includes('application/json')) return json({error:'Format attendu : JSON.'},415);
   try {
    const raw=await request.text();
    if(raw.length>180000) return json({error:'Le brief est trop long.'},413);
    const data=JSON.parse(raw);const errors=validate(data);
    if(errors.length) return json({error:errors.join(' ')},400);
    if(data.briefSource!==undefined&&(typeof data.briefSource!=='string'||data.briefSource.length>24000))return json({error:'Brief source invalide.'},400);
    if(data.briefSummary!==undefined&&(typeof data.briefSummary!=='string'||data.briefSummary.length>11000))return json({error:'Synthèse du brief invalide.'},400);
    if(data.briefDecisions!==undefined&&(!Array.isArray(data.briefDecisions)||data.briefDecisions.length>20||!data.briefDecisions.every(d=>d&&briefKeys.includes(d.key)&&typeof d.accepted==='boolean'&&typeof d.current==='string'&&d.current.length<=200&&typeof d.proposed==='string'&&d.proposed.length<=200)))return json({error:'Décisions de correction invalides.'},400);
    if(!validateAnswers(data.answers))return json({error:'Réponses invalides : maximum 30 réponses de 3 000 caractères.'},400);
    return await analyseWithoutProducts(data,env);
   } catch(e) {return json({error:e instanceof SyntaxError?'Données invalides.':'L’analyse a échoué ou a dépassé le délai. Réessayez.'},e instanceof SyntaxError?400:502);}
  }
  if(request.method!=='GET'&&request.method!=='HEAD') return json({error:'Méthode non autorisée.'},405);
  const item=assets[url.pathname==='/'?'/index.html':url.pathname];
  if(!item) return new Response('Page introuvable',{status:404,headers});
  const body=item.binary?Uint8Array.from(atob(item.body),c=>c.charCodeAt(0)):item.body;
  return new Response(request.method==='HEAD'?null:body,{headers:{...headers,'content-type':item.type,'content-security-policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'self' https://chatgpt.com https://*.chatgpt.com"}});
 }
};
