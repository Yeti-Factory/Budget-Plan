import assert from 'node:assert/strict';
import {createAppServer} from './server.mjs';
let forwarded;
const server=createAppServer({fetch:async(request,env)=>{forwarded={url:request.url,origin:request.headers.get('origin'),auth:request.headers.get('authorization'),env};return new Response('served');}},{APP_URL:'https://plv.example.test',APP_USER:'test',APP_PASSWORD:'test-password',OPENAI_API_KEY:'fake-test-key'});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const url='http://127.0.0.1:'+server.address().port;
try{
 assert.equal((await fetch(url+'/healthz')).status,200);
 assert.equal((await fetch(url+'/')).status,401);
 const response=await fetch(url+'/api/status',{headers:{authorization:'Basic '+Buffer.from('test:test-password').toString('base64'),origin:'https://plv.example.test','x-forwarded-host':'evil.test'}});
 assert.equal(response.status,200);assert.equal(forwarded.url,'https://plv.example.test/api/status');assert.equal(forwarded.origin,'https://plv.example.test');assert.equal(forwarded.auth,null);assert.equal(forwarded.env.OPENAI_API_KEY,'fake-test-key');
 console.log('Serveur production : authentification, healthcheck et origine HTTPS vérifiés.');
}finally{await new Promise(resolve=>server.close(resolve));}
