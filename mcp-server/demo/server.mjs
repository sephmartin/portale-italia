import http from 'node:http';
import { randomBytes, createHash, timingSafeEqual } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createMcpHandler } from '@modelcontextprotocol/server';
import { toNodeHandler, localhostHostValidation, localhostOriginValidation } from '@modelcontextprotocol/node';
import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client';
import * as z from 'zod/v4';
import { createServer } from '../dist/server.js';

export function createDemo(port = 9880, publicUrl = undefined) {
 const localBase=`http://127.0.0.1:${port}`;
 const base=publicUrl?new URL(publicUrl).origin:localBase, resource=base+'/mcp', redirect=base+'/oauth/callback';
 if(publicUrl&&!/^https:\/\/[a-z0-9-]+\.trycloudflare\.com$/.test(base))throw Error('URL pubblico non consentito per questa demo.');
 const stableCallback='https://chatgpt.com/connector_platform_oauth_redirect';
 const clients=new Map([['portale-local-demo',{redirects:[redirect]}]]);
 const scopes='appointments:read appointments:write';
 const random=()=>randomBytes(32).toString('base64url');
 const hash=s=>createHash('sha256').update(s).digest('base64url');
 const equal=(a,b)=>typeof a==='string'&&typeof b==='string'&&a.length===b.length&&timingSafeEqual(Buffer.from(a),Buffer.from(b));
 const sessions=new Map(), codes=new Map(), tokens=new Map(), intents=new Map(), bookings=new Map(), events=[];
 const users={alice:'Alice · utente dimostrativo',bob:'Bob · utente dimostrativo'};
 const slots=['09:00','10:30','14:00'].map((time,i)=>({id:`slot-${i+1}`,label:`Sportello digitale · ${time}`,day:'Giornata dimostrativa'}));
 const log=(user,action,id)=>{events.push({at:new Date().toISOString(),user,action,...(id?{id}: {})}); if(events.length>500)events.shift();};
 function valid(map,key){const value=map.get(key);if(!value||value.expires<Date.now()){map.delete(key);return;}return value;}
 function tokenInfo(token){return valid(tokens,hash(token||''));}
 function session(req){const match=/\bpi_demo=([A-Za-z0-9_-]+)/.exec(req.headers.cookie||'');return match?valid(sessions,hash(match[1])):undefined;}
 function newSession(res){const key=random(),s={csrf:random(),expires:Date.now()+3600000};sessions.set(hash(key),s);res.setHeader('Set-Cookie',`pi_demo=${key}; HttpOnly; SameSite=Lax; Path=/; Max-Age=3600${publicUrl?'; Secure':''}`);return s;}
 function issue(params,user){const code=random();codes.set(hash(code),{...params,user,expires:Date.now()+120000});return code;}
 function redeem(p){const code=valid(codes,hash(p.code||''));if(!code)throw Error('Codice scaduto o già usato.');codes.delete(hash(p.code));if(p.grant_type!=='authorization_code'||p.client_id!==code.client_id||!clients.get(p.client_id)?.redirects.includes(p.redirect_uri)||code.redirect_uri!==p.redirect_uri||!equal(hash(p.code_verifier||''),code.code_challenge)||p.resource!==resource)throw Error('Richiesta OAuth non valida.');const access_token=random();tokens.set(hash(access_token),{user:code.user,expires:Date.now()+900000,clientId:p.client_id,resource,scopes:code.scope.split(' ')});return {access_token,token_type:'Bearer',expires_in:900,scope:code.scope};}
 const reply=data=>({structuredContent:data,content:[{type:'text',text:JSON.stringify(data)}]});
 const widget=readFileSync(new URL('./widget.html',import.meta.url),'utf8');
 function demoServer(user, grantedScopes=[]){
  const server=createServer();
  server.registerResource('appointment-widget','ui://portale-italia/appointments.html',{mimeType:'text/html;profile=mcp-app'},async()=>({contents:[{uri:'ui://portale-italia/appointments.html',mimeType:'text/html;profile=mcp-app',text:widget.replaceAll('__DEMO_BASE__',base),_meta:{ui:{csp:{connectDomains:[],resourceDomains:[]}}}}]}));
  const meta={ui:{resourceUri:'ui://portale-italia/appointments.html'},securitySchemes:[{type:'oauth2',scopes:['appointments:read']}]};
  const tool=(name,title,inputSchema,readonly,fn)=>server.registerTool(name,{title,description:title+' Solo dati sintetici; nessun servizio PA reale.',inputSchema,annotations:{readOnlyHint:readonly,destructiveHint:false,idempotentHint:name!=='demo_prepare_booking',openWorldHint:false},_meta:{...meta,securitySchemes:[{type:'oauth2',scopes:readonly?['appointments:read']:['appointments:read','appointments:write']}]}},async args=>{if(!user)return {isError:true,content:[{type:'text',text:'Accesso richiesto.'}]};try{if(!grantedScopes.includes(readonly?'appointments:read':'appointments:write'))throw Error('Permesso OAuth insufficiente.');return reply(fn(args));}catch(e){return {isError:true,content:[{type:'text',text:e.message}]};}});
  const own=()=>[...bookings.values()].filter(b=>b.user===user);
  tool('demo_availability','Mostra appuntamenti disponibili',z.object({}),true,()=>{log(user,'availability_viewed');return {demo:true,slots:slots.map(s=>({...s,available:![...bookings.values()].some(b=>b.slot===s.id&&b.status==='booked')})),bookings:own()};});
  tool('demo_prepare_booking','Prepara un appuntamento da confermare nella demo locale',z.object({slot:z.enum(['slot-1','slot-2','slot-3'])}),false,({slot})=>{const id=random();intents.set(id,{user,slot,action:'book',status:'pending',expires:Date.now()+300000});log(user,'booking_prepared',id);return {demo:true,intent:id,slot,confirmation_required:true,confirmation_url:base+'/?intent='+id,message:'Conferma nell’interfaccia della demo. La preparazione non prenota.'};});
  tool('demo_commit_booking','Leggi o completa una prenotazione già confermata dalla persona',z.object({intent:z.string().max(100)}),false,({intent})=>{const i=valid(intents,intent);if(!i||i.user!==user||i.action!=='book')throw Error('Richiesta non disponibile per questo utente.');if(i.receipt)return {demo:true,booking:bookings.get(i.receipt)};if(i.status!=='approved')throw Error('Serve prima la conferma della persona nell’interfaccia.');if([...bookings.values()].some(b=>b.slot===i.slot&&b.status==='booked'))throw Error('Orario già occupato. Scegli un’altra disponibilità.');const id='DEMO-'+randomBytes(4).toString('hex').toUpperCase();const b={id,user,slot:i.slot,label:slots.find(s=>s.id===i.slot).label,status:'booked',at:new Date().toISOString()};bookings.set(id,b);i.receipt=id;log(user,'booking_created',id);return {demo:true,booking:b};});
  tool('demo_my_bookings','Mostra le mie ricevute dimostrative',z.object({}),true,()=>({demo:true,bookings:own()}));
  return server;
 }
 const handler=createMcpHandler(ctx=>demoServer(ctx.authInfo?.extra?.user,ctx.authInfo?.scopes),{responseMode:'json'});
 const jsonHandler={fetch:async(request,options)=>{
  const response=await handler.fetch(request,options);
  if(!publicUrl||!response.headers.get('content-type')?.includes('text/event-stream'))return response;
  // Stateless legacy requests finish at the result; Quick Tunnel does not support SSE.
  const data=(await response.text()).split('\n').filter(line=>line.startsWith('data:')).map(line=>JSON.parse(line.slice(5).trim()));
  const result=data.findLast(message=>Object.hasOwn(message,'id'));
  const h=new Headers(response.headers);h.set('content-type','application/json');h.delete('content-length');
  return new Response(JSON.stringify(result),{status:response.status,headers:h});
 }};
 const mcp=toNodeHandler(jsonHandler,{maxRequestBodySize:64*1024});
 const host=localhostHostValidation(),origin=localhostOriginValidation();
 const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"};
 function send(res,status,data,type='application/json'){res.writeHead(status,{...headers,'Content-Type':type+'; charset=utf-8'});res.end(type==='application/json'?JSON.stringify(data):data);}
 function go(res,url){res.writeHead(302,{...headers,Location:url});res.end();}
 async function body(req){let text='';for await(const chunk of req){text+=chunk;if(Buffer.byteLength(text)>8192)throw Error('Richiesta troppo grande.');}return req.headers['content-type']?.startsWith('application/json')?JSON.parse(text||'{}'):Object.fromEntries(new URLSearchParams(text));}
 async function call(s,name,args={}){const client=new Client({name:'portale-local-ui',version:'0.2.0'});try{await client.connect(new StreamableHTTPClientTransport(new URL(localBase+'/mcp'),{requestInit:{headers:{Authorization:'Bearer '+s.accessToken}}}));const result=await client.callTool({name,arguments:args});if(result.isError)throw Error(result.content?.[0]?.text||'Operazione non completata.');return result.structuredContent;}finally{await client.close();}}
 const server=http.createServer(async(req,res)=>{try{
  if(publicUrl){
   if(req.headers.host!==new URL(base).host&&req.headers.host!==new URL(localBase).host)return send(res,403,{error:'Host non consentito.'});
   if(req.headers.origin&&req.headers.origin!==base)return send(res,403,{error:'Origine non consentita.'});
  }else if(!host(req,res)||!origin(req,res))return;
  const u=new URL(req.url,base), path=u.pathname;
  if(req.method==='POST'&&path!=='/oauth/token'&&path!=='/oauth/register'&&path!=='/oauth/revoke'&&path!=='/mcp'&&req.headers.origin!==base)return send(res,403,{error:'Origine non valida.'});
  if(path==='/health')return send(res,200,{ok:true,demo:true});
  if(path==='/.well-known/oauth-protected-resource'||path==='/.well-known/oauth-protected-resource/mcp')return send(res,200,{resource,authorization_servers:[base],scopes_supported:['appointments:read','appointments:write'],bearer_methods_supported:['header']});
  if(path==='/.well-known/oauth-authorization-server')return send(res,200,{issuer:base,authorization_response_iss_parameter_supported:true,...(publicUrl?{registration_endpoint:base+'/oauth/register'}:{}),authorization_endpoint:base+'/oauth/authorize',token_endpoint:base+'/oauth/token',revocation_endpoint:base+'/oauth/revoke',response_types_supported:['code'],grant_types_supported:['authorization_code'],code_challenge_methods_supported:['S256'],token_endpoint_auth_methods_supported:['none'],scopes_supported:['appointments:read','appointments:write']});
  if(path==='/mcp'){
   const token=/^Bearer (.+)$/.exec(req.headers.authorization||'')?.[1],info=tokenInfo(token);
   if(!info){res.setHeader('WWW-Authenticate',`Bearer resource_metadata="${base}/.well-known/oauth-protected-resource/mcp"`);return send(res,401,{error:'invalid_token'});}
   req.auth={token,clientId:info.clientId,scopes:info.scopes,expiresAt:Math.floor(info.expires/1000),resource:new URL(resource),extra:{user:info.user}};await mcp(req,res);return;
  }
  if(path==='/oauth/register'&&publicUrl&&req.method==='POST'){
   const p=await body(req);
   if(!Array.isArray(p.redirect_uris)||p.redirect_uris.length!==1||p.redirect_uris[0]!==stableCallback||p.token_endpoint_auth_method!=='none'||clients.size>=100)return send(res,400,{error:'invalid_client_metadata'});
   const client_id='chatgpt-demo-'+random();clients.set(client_id,{redirects:[stableCallback]});return send(res,201,{client_id,redirect_uris:[stableCallback],token_endpoint_auth_method:'none',grant_types:['authorization_code'],response_types:['code'],client_id_issued_at:Math.floor(Date.now()/1000)});
  }
  if(path==='/oauth/revoke'&&req.method==='POST'&&!session(req)){
   const p=await body(req),info=tokenInfo(p.token);
   if(info&&p.client_id===info.clientId)tokens.delete(hash(p.token));
   return send(res,200,{ok:true});
  }
  if(path==='/oauth/token'&&req.method==='POST'){try{return send(res,200,redeem(await body(req)));}catch{return send(res,400,{error:'invalid_grant'});}}
  let s=session(req);
  if(path==='/login'&&req.method==='GET'){
   if(s?.accessToken)tokens.delete(hash(s.accessToken));s=newSession(res);s.verifier=random();s.state=random();
   const p=new URLSearchParams({response_type:'code',client_id:'portale-local-demo',redirect_uri:redirect,state:s.state,code_challenge:hash(s.verifier),code_challenge_method:'S256',resource,scope:'appointments:read appointments:write'});return go(res,base+'/oauth/authorize?'+p);
  }
  if(path==='/oauth/authorize'&&req.method==='GET'){
   const p=Object.fromEntries(u.searchParams),client=clients.get(p.client_id);
   if(!client?.redirects.includes(p.redirect_uri)||p.response_type!=='code'||p.code_challenge_method!=='S256'||!/^[A-Za-z0-9_-]{43}$/.test(p.code_challenge||'')||p.resource!==resource||(!p.scope||p.scope.split(' ').some(scope=>!scopes.split(' ').includes(scope)))||!p.state||p.state.length>512)return send(res,400,{error:'Richiesta OAuth non valida.'});
   if(p.client_id==='portale-local-demo'){if(!s||!equal(p.state,s.state))return send(res,400,{error:'Stato OAuth non valido.'});}
   else{s=newSession(res);s.state=p.state;}
   s.authorization=p;
   return send(res,200,`<!doctype html><html lang="it"><meta name="viewport" content="width=device-width"><title>Autorizza la demo</title><script src="/authorize.js" defer></script><link rel="stylesheet" href="/style.css"><main class="consent"><p class="eyebrow">PORTALE ITALIA / ACCESSO DI PROVA</p><h1>Collega un’identità dimostrativa.</h1><p>OAuth con PKCE. Nessuna password, SPID o identità reale.</p><form method="post" action="/oauth/approve"><input type="hidden" name="csrf" value="${s.csrf}"><label>Utente <select name="user"><option value="alice">Alice · utente dimostrativo</option><option value="bob">Bob · utente dimostrativo</option></select></label><p>Permessi: leggere disponibilità e gestire i propri appuntamenti sintetici.</p><p>La demo registra identità fittizia, orario e azione in memoria, fino a 500 eventi. Tutto viene eliminato al riavvio. Nessun pixel email, indirizzo IP o token nel registro.</p><button>Autorizza la demo</button><a href="/">Torna senza autorizzare</a></form></main></html>`,'text/html');
  }
  if(path==='/oauth/approve'&&req.method==='POST'){const p=await body(req);if(!s?.authorization||!equal(p.csrf,s.csrf)||!users[p.user])return send(res,403,{error:'Autorizzazione non valida.'});const auth=s.authorization;delete s.authorization;
   const user=publicUrl?p.user+'-'+random():p.user;
   if(auth.client_id!=='portale-local-demo'){
    const browserToken=random();tokens.set(hash(browserToken),{user,expires:Date.now()+900000,resource,clientId:'portale-local-demo',scopes:scopes.split(' ')});s.user=user;s.accessToken=browserToken;s.csrf=random();log(user,'login_authorized');
   }
   const next=auth.redirect_uri+'?'+new URLSearchParams({code:issue(auth,user),state:auth.state,iss:base});
   if(req.headers['x-demo-fetch']==='1'&&auth.client_id!=='portale-local-demo')return send(res,200,{redirect:next});
   return go(res,next);}
  if(path==='/oauth/callback'&&req.method==='GET'){if(!s||!equal(u.searchParams.get('state'),s.state)||u.searchParams.get('iss')!==base)return send(res,403,{error:'Stato OAuth non valido.'});const result=redeem({grant_type:'authorization_code',client_id:'portale-local-demo',redirect_uri:redirect,code:u.searchParams.get('code'),code_verifier:s.verifier,resource});s.accessToken=result.access_token;s.user=tokenInfo(result.access_token).user;delete s.verifier;delete s.state;s.csrf=random();log(s.user,'login_authorized');return go(res,'/');}
  if(path==='/api/session'&&req.method==='GET')return send(res,200,{authenticated:!!(s&&tokenInfo(s.accessToken)),user:s?.user?users[s.user.split('-')[0]]:null,csrf:s?.csrf||null,demo:true});
  if(path.startsWith('/api/')||path==='/oauth/revoke'){
   if(!s?.user||!tokenInfo(s.accessToken))return send(res,401,{error:'Accedi di nuovo: la sessione è assente o scaduta.'});
   if(path==='/api/pending'&&req.method==='GET'){const i=valid(intents,u.searchParams.get('intent'));if(!i||i.user!==s.user)return send(res,404,{error:'Richiesta non disponibile per questa sessione.'});return send(res,200,{intent:u.searchParams.get('intent'),slot:slots.find(x=>x.id===i.slot),status:i.status});}
   if(path==='/api/audit'&&req.method==='GET')return send(res,200,{events:events.filter(e=>e.user===s.user),retention:'Memoria volatile, massimo 500 eventi complessivi; eliminati al riavvio.'});
   if(req.method!=='POST')return send(res,405,{error:'Metodo non consentito.'});const p=await body(req);if(!equal(p.csrf,s.csrf))return send(res,403,{error:'Conferma non valida. Ricarica la pagina.'});
   if(path==='/oauth/revoke'){tokens.delete(hash(s.accessToken));log(s.user,'session_revoked');delete s.accessToken;return send(res,200,{ok:true});}
   if(path==='/api/confirm'){const i=valid(intents,p.intent);if(!i||i.user!==s.user)return send(res,403,{error:'Richiesta non disponibile.'});i.status='approved';log(s.user,'booking_confirmed',p.intent);return send(res,200,await call(s,'demo_commit_booking',{intent:p.intent}));}
   if(path==='/api/cancel'){const b=bookings.get(p.id);if(!b||b.user!==s.user)return send(res,404,{error:'Prenotazione non disponibile.'});if(b.status!=='cancelled'){b.status='cancelled';log(s.user,'booking_cancelled',b.id);}return send(res,200,{demo:true,booking:b});}
   if(path==='/api/tool'){if(!['demo_availability','demo_prepare_booking','demo_my_bookings','ipa_search_entities','ipa_get_digital_office'].includes(p.name))return send(res,400,{error:'Azione non disponibile.'});return send(res,200,await call(s,p.name,p.arguments||{}));}
  }
  const files={'/':['index.html','text/html'],'/app.js':['app.js','text/javascript'],'/authorize.js':['authorize.js','text/javascript'],'/style.css':['style.css','text/css']};
  if(req.method==='GET'&&files[path]){const [file,type]=files[path];return send(res,200,readFileSync(new URL(file,import.meta.url),'utf8').replace('DEMO LOCALE · DATI FITTIZI',publicUrl?'DEMO SPERIMENTALE · DATI FITTIZI':'DEMO LOCALE · DATI FITTIZI'),type);}
  send(res,404,{error:'Pagina non disponibile.'});
 }catch(error){send(res,400,{error:error.message||'Operazione non completata.'});}});
 return {server,base,close:async()=>{await handler.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}};
}
if(process.argv[1]===new URL(import.meta.url).pathname){const port=Number(process.env.PORTALE_DEMO_PORT||9880);if(!Number.isInteger(port)||port<1024||port>65535)throw Error('Porta non valida.');const demo=createDemo(port,process.env.PORTALE_DEMO_PUBLIC_URL);demo.server.listen(port,'127.0.0.1',()=>console.error('Demo locale: '+demo.base));for(const signal of ['SIGINT','SIGTERM'])process.once(signal,async()=>{await demo.close();process.exit(0);});}
