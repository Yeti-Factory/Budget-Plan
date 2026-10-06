import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {timingSafeEqual} from 'node:crypto';
import {pathToFileURL} from 'node:url';

export function createAppServer(worker,env){
 const origin=new URL(env.APP_URL).origin;
 const username=env.APP_USER,password=env.APP_PASSWORD;
 if(!username||!password)throw new Error('APP_USER et APP_PASSWORD sont requis pour protéger l’application.');
 const expected=Buffer.from('Basic '+Buffer.from(username+':'+password).toString('base64'));
 return http.createServer(async(req,res)=>{
  if(req.url==='/healthz'&&req.method==='GET'){res.writeHead(200,{'content-type':'text/plain','cache-control':'no-store'});res.end('ok');return;}
  const actual=Buffer.from(req.headers.authorization||'');
  if(actual.length!==expected.length||!timingSafeEqual(actual,expected)){res.writeHead(401,{'www-authenticate':'Basic realm="Yeti Factory", charset="UTF-8"','cache-control':'no-store'});res.end('Authentification requise.');return;}
  try{
   const chunks=[];let size=0;
   for await(const chunk of req){size+=chunk.length;if(size>4500000){res.writeHead(413,{'cache-control':'no-store'});res.end('Requête trop volumineuse.');return;}chunks.push(chunk);}
   const body=Buffer.concat(chunks);
   const headers={...req.headers};delete headers.authorization;
   const request=new Request(origin+req.url,{method:req.method,headers,...(body.length?{body,duplex:'half'}:{})});
   const response=await worker.fetch(request,{OPENAI_API_KEY:env.OPENAI_API_KEY,OPENAI_MODEL:env.OPENAI_MODEL});
   res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
  }catch{res.writeHead(500,{'cache-control':'no-store'});res.end('Erreur du serveur.');}
 });
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const source=await readFile(new URL('../dist/server/index.js',import.meta.url),'utf8');
 const {default:worker}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
 const server=createAppServer(worker,process.env);
 server.requestTimeout=120000;server.headersTimeout=15000;
 server.listen(Number(process.env.PORT||3000),'0.0.0.0',()=>console.log('Yeti Factory démarré.'));
 for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>server.close(()=>process.exit(0)));
}
