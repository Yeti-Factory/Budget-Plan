import http from 'node:http';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../dist/server/index.js',import.meta.url),'utf8');
const {default:worker}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const env={};
try {
 const text=await readFile(new URL('../.env.local',import.meta.url),'utf8');
 for(const name of ['OPENAI_API_KEY','OPENAI_MODEL']) {
  const match=text.match(new RegExp('^\\s*'+name+'\\s*=\\s*(.*?)\\s*$','m'));
  if(match) env[name]=match[1].replace(/^['"]|['"]$/g,'');
 }
} catch {}
const server=http.createServer(async(req,res)=>{try{const chunks=[];for await(const chunk of req)chunks.push(chunk);const body=Buffer.concat(chunks);const request=new Request('http://localhost:4173'+req.url,{method:req.method,headers:req.headers,...(body.length?{body,duplex:'half'}:{})});const response=await worker.fetch(request,env);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));}catch{res.writeHead(500);res.end('Erreur de prévisualisation.');}});
server.listen(4173,'127.0.0.1',()=>console.log('Local: http://localhost:4173/'));
