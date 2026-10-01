import assert from 'node:assert/strict';
import { createHash, randomBytes } from 'node:crypto';
import { createDemo } from './server.mjs';
import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client';
import { writeFileSync } from 'node:fs';
const port=19880, demo=createDemo(port), base=demo.base, checks=[];
await new Promise((r,j)=>demo.server.once('error',j).listen(port,'127.0.0.1',r));
const check=(name,fn)=>Promise.resolve().then(fn).then(()=>checks.push(name));
async function login(user){
 const start=await fetch(base+'/login',{redirect:'manual'}),cookie=start.headers.get('set-cookie').split(';')[0],auth=start.headers.get('location');
 const consent=await fetch(auth,{headers:{Cookie:cookie}}),html=await consent.text(),csrf=/name="csrf" value="([^"]+)"/.exec(html)?.[1];assert.ok(csrf);
 const approved=await fetch(base+'/oauth/approve',{method:'POST',redirect:'manual',headers:{Cookie:cookie,Origin:base,'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({user,csrf})});assert.equal(approved.status,302);
 const callback=approved.headers.get('location');assert.equal((await fetch(callback,{headers:{Cookie:cookie},redirect:'manual'})).status,302);
 const session=await (await fetch(base+'/api/session',{headers:{Cookie:cookie}})).json();assert.equal(session.authenticated,true);return {cookie,csrf:session.csrf,callback};
}
async function post(s,path,data={}){const r=await fetch(base+path,{method:'POST',headers:{Cookie:s.cookie,Origin:base,'Content-Type':'application/json'},body:JSON.stringify({csrf:s.csrf,...data})});return {status:r.status,data:await r.json()};}
async function tool(s,name,args={}){return post(s,'/api/tool',{name,arguments:args});}
try{
 await check('MCP requires valid bearer token',async()=>assert.equal((await fetch(base+'/mcp')).status,401));
 await check('OAuth metadata advertises PKCE S256',async()=>assert.deepEqual((await (await fetch(base+'/.well-known/oauth-authorization-server')).json()).code_challenge_methods_supported,['S256']));
 const alice=await login('alice'),bob=await login('bob');checks.push('Alice and Bob complete authorization code + PKCE');
 await check('Callback state is single use',async()=>assert.equal((await fetch(alice.callback,{headers:{Cookie:alice.cookie}})).status,403));
 await check('Reject wrong CSRF',async()=>assert.equal((await post(alice,'/api/tool',{csrf:'bad',name:'demo_availability'})).status,403));
 await check('Reject cross-origin browser mutation',async()=>assert.equal((await fetch(base+'/api/tool',{method:'POST',headers:{Cookie:alice.cookie,Origin:'http://evil.invalid','Content-Type':'application/json'},body:'{}'})).status,403));
 await check('Interface calls real MCP transport',async()=>{const r=await tool(alice,'demo_availability');assert.equal(r.status,200,JSON.stringify(r.data));assert.equal(r.data.slots.length,3);});
 const prepared=await tool(alice,'demo_prepare_booking',{slot:'slot-1'});assert.equal(prepared.status,200,JSON.stringify(prepared.data));const intent=prepared.data.intent;
 await check('Preparing does not create a booking',async()=>assert.equal((await tool(alice,'demo_my_bookings')).data.bookings.length,0));
 await check('Agent cannot call human-confirmation endpoint as a tool',async()=>assert.equal((await tool(alice,'demo_commit_booking',{intent})).status,400));
 await check('Another user cannot confirm pending request',async()=>assert.equal((await post(bob,'/api/confirm',{intent})).status,403));
 let receipt;
 await check('Human confirmation creates a receipt',async()=>{const r=await post(alice,'/api/confirm',{intent});assert.equal(r.status,200,JSON.stringify(r.data));receipt=r.data.booking.id;});
 await check('Duplicate confirmation returns same receipt',async()=>assert.equal((await post(alice,'/api/confirm',{intent})).data.booking.id,receipt));
 await check('Receipts isolated by user',async()=>assert.equal((await tool(bob,'demo_my_bookings')).data.bookings.length,0));
 const other=await tool(bob,'demo_prepare_booking',{slot:'slot-1'});
 await check('Cannot double book occupied slot',async()=>assert.equal((await post(bob,'/api/confirm',{intent:other.data.intent})).status,400));
 await check('Another user cannot cancel receipt',async()=>assert.equal((await post(bob,'/api/cancel',{id:receipt})).status,404));
 await check('Cancellation releases the slot',async()=>{assert.equal((await post(alice,'/api/cancel',{id:receipt})).status,200);assert.equal((await tool(bob,'demo_availability')).data.slots[0].available,true);});
 await check('Audit is scoped, synthetic and excludes tokens',async()=>{const data=await (await fetch(base+'/api/audit',{headers:{Cookie:alice.cookie}})).json();assert.ok(data.events.length>0);assert.ok(data.events.every(e=>e.user==='alice'));assert.ok(data.events.every(e=>Object.keys(e).every(k=>['at','user','action','id'].includes(k))));});
 await check('Revocation invalidates the session',async()=>{assert.equal((await post(alice,'/oauth/revoke')).status,200);assert.equal((await tool(alice,'demo_availability')).status,401);});
 // Drive the advertised OAuth token endpoint with a separate synthetic session.
 const start=await fetch(base+'/login',{redirect:'manual'}),cookie=start.headers.get('set-cookie').split(';')[0],auth=new URL(start.headers.get('location'));
 const verifier=randomBytes(32).toString('base64url');auth.searchParams.set('code_challenge',createHash('sha256').update(verifier).digest('base64url'));
 const html=await (await fetch(auth,{headers:{Cookie:cookie}})).text(),csrf=/name="csrf" value="([^"]+)"/.exec(html)[1];
 const approval=await fetch(base+'/oauth/approve',{method:'POST',redirect:'manual',headers:{Cookie:cookie,Origin:base,'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({user:'bob',csrf})});
 const code=new URL(approval.headers.get('location')).searchParams.get('code');const params={grant_type:'authorization_code',client_id:'portale-local-demo',redirect_uri:base+'/oauth/callback',resource:base+'/mcp',code,code_verifier:verifier};
 let token;
 await check('OAuth token endpoint validates PKCE and audience',async()=>{const r=await fetch(base+'/oauth/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(params)});assert.equal(r.status,200);token=(await r.json()).access_token;});
 await check('Authorization code cannot be redeemed twice',async()=>assert.equal((await fetch(base+'/oauth/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(params)})).status,400));
 const client=new Client({name:'demo-check',version:'0.2.0'});
 try{await client.connect(new StreamableHTTPClientTransport(new URL(base+'/mcp'),{requestInit:{headers:{Authorization:'Bearer '+token}}}));
 await check('MCP advertises embedded UI metadata',async()=>{const tools=(await client.listTools()).tools;assert.equal(tools.find(t=>t.name==='demo_availability')._meta.ui.resourceUri,'ui://portale-italia/appointments.html');});
 await check('MCP delivers the widget HTML resource',async()=>{const resource=await client.readResource({uri:'ui://portale-italia/appointments.html'});assert.equal(resource.contents[0].mimeType,'text/html;profile=mcp-app');assert.ok(resource.contents[0].text.includes('ui/initialize'));});
 await check('Unconfirmed write rejected over direct MCP',async()=>{const p=await client.callTool({name:'demo_prepare_booking',arguments:{slot:'slot-2'}});assert.equal((await client.callTool({name:'demo_commit_booking',arguments:{intent:p.structuredContent.intent}})).isError,true);});
 }finally{await client.close();}
 const result={verified_at:new Date().toISOString(),checks:checks.map(name=>({name,passed:true})),limits:['ChatGPT host not connected','No real PA transactions','No production identity provider']};
 writeFileSync(new URL('../verification/demo.json',import.meta.url),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
}finally{await demo.close();}
