import assert from 'node:assert/strict';
import { randomBytes,createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { Client,StreamableHTTPClientTransport } from '@modelcontextprotocol/client';
const base=process.argv[2];if(!/^https:\/\/[a-z0-9-]+\.trycloudflare\.com$/.test(base||''))throw Error('URL HTTPS di prova non valido.');
const checks=[];const check=async(name,fn)=>{await fn();checks.push({name,passed:true});};
async function post(path,data,cookie,extraHeaders={}){return fetch(base+path,{method:'POST',redirect:'manual',headers:{'Content-Type':'application/json',...(cookie?{Cookie:cookie,Origin:base}:{}),...extraHeaders},body:JSON.stringify(data)});}
const resource=base+'/mcp',callback='https://chatgpt.com/connector_platform_oauth_redirect';
await check('Public HTTPS health',async()=>assert.equal((await (await fetch(base+'/health')).json()).ok,true));
await check('Anonymous MCP denied with discovery challenge',async()=>{const r=await fetch(resource);assert.equal(r.status,401);assert.ok(r.headers.get('www-authenticate').includes(base));});
await check('Reject arbitrary OAuth redirect',async()=>assert.equal((await post('/oauth/register',{redirect_uris:['https://evil.invalid/callback'],token_endpoint_auth_method:'none'})).status,400));
const registration=await post('/oauth/register',{redirect_uris:[callback],token_endpoint_auth_method:'none'});assert.equal(registration.status,201);const {client_id}=await registration.json();checks.push({name:'ChatGPT stable callback registration',passed:true});
async function grant(scope){const verifier=randomBytes(32).toString('base64url'),state=randomBytes(24).toString('base64url');const params=new URLSearchParams({client_id,redirect_uri:callback,response_type:'code',code_challenge_method:'S256',code_challenge:createHash('sha256').update(verifier).digest('base64url'),resource,scope,state});const consent=await fetch(base+'/oauth/authorize?'+params);assert.equal(consent.status,200);const cookie=consent.headers.get('set-cookie').split(';')[0];assert.ok(consent.headers.get('set-cookie').includes('Secure'));const html=await consent.text(),csrf=/name="csrf" value="([^"]+)"/.exec(html)[1];const approved=await post('/oauth/approve',{user:'alice',csrf},cookie,{'X-Demo-Fetch':'1'});assert.equal(approved.status,200);const redirect=new URL((await approved.json()).redirect);assert.equal(redirect.origin,'https://chatgpt.com');assert.equal(redirect.searchParams.get('state'),state);assert.equal(redirect.searchParams.get('iss'),base);
const p={grant_type:'authorization_code',client_id,redirect_uri:callback,code:redirect.searchParams.get('code'),code_verifier:verifier,resource};const response=await post('/oauth/token',p);assert.equal(response.status,200);const token=await response.json();assert.equal(token.scope,scope);return {cookie,token:token.access_token};}
const grant1=await grant('appointments:read appointments:write');checks.push({name:'Public OAuth PKCE flow, issuer and Secure cookie',passed:true});
const client=new Client({name:'portale-https-verification',version:'0.2.0'});await client.connect(new StreamableHTTPClientTransport(new URL(resource),{requestInit:{headers:{Authorization:'Bearer '+grant1.token}}}));
try{
 await check('Public MCP transport and UI metadata',async()=>assert.ok((await client.listTools()).tools.find(t=>t.name==='demo_availability')._meta.ui.resourceUri));
 const p=(await client.callTool({name:'demo_prepare_booking',arguments:{slot:'slot-2'}})).structuredContent;
 await check('Agent cannot confirm its own write',async()=>assert.equal((await client.callTool({name:'demo_commit_booking',arguments:{intent:p.intent}})).isError,true));
 await check('Browser owns pending request',async()=>assert.equal((await fetch(base+'/api/pending?intent='+encodeURIComponent(p.intent),{headers:{Cookie:grant1.cookie}})).status,200));
 const s=await (await fetch(base+'/api/session',{headers:{Cookie:grant1.cookie}})).json();
 await check('Browser confirmation returns synthetic receipt',async()=>{const r=await post('/api/confirm',{intent:p.intent,csrf:s.csrf},grant1.cookie);assert.equal(r.status,200);const booking=(await r.json()).booking;assert.ok(booking.id.startsWith('DEMO-'));assert.equal((await post('/api/cancel',{id:booking.id,csrf:s.csrf},grant1.cookie)).status,200);});
 await check('Legacy MCP is returned as JSON for the tunnel',async()=>{const r=await fetch(resource,{method:'POST',headers:{Authorization:'Bearer '+grant1.token,'Content-Type':'application/json',Accept:'application/json, text/event-stream','MCP-Protocol-Version':'2025-06-18'},body:JSON.stringify({jsonrpc:'2.0',id:55,method:'tools/list',params:{}})});assert.equal(r.status,200);assert.ok(r.headers.get('content-type').includes('application/json'));assert.ok((await r.json()).result.tools.length>0);});
}finally{await client.close();}
const grant2=await grant('appointments:read');const readClient=new Client({name:'scope-check',version:'0.2.0'});await readClient.connect(new StreamableHTTPClientTransport(new URL(resource),{requestInit:{headers:{Authorization:'Bearer '+grant2.token}}}));
try{
 await check('Same display name has isolated public session',async()=>assert.equal((await readClient.callTool({name:'demo_my_bookings',arguments:{}})).structuredContent.bookings.length,0));
 await check('Read-only token cannot prepare a write',async()=>assert.equal((await readClient.callTool({name:'demo_prepare_booking',arguments:{slot:'slot-3'}})).isError,true));
 await check('Revoked token denied over public HTTPS',async()=>{assert.equal((await post('/oauth/revoke',{client_id,token:grant2.token})).status,200);assert.equal((await fetch(resource,{headers:{Authorization:'Bearer '+grant2.token}})).status,401);});
}finally{await readClient.close();}
const result={verified_at:new Date().toISOString(),endpoint:resource,checks,limits:['ChatGPT account linking not performed','Temporary tunnel; local Mac required','Synthetic identities and transactions only']};writeFileSync(new URL('../verification/https.json',import.meta.url),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
