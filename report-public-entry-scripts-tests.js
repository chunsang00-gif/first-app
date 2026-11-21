'use strict';
// Verify that EVERY browser script the real entry page loads is served
// by the actual HTTP server. An older explicit allowlist silently returned
// 404 for birth-day-options, free-calculation-state and two other scripts;
// page-level tests alone could miss that production breaking error.
// Offline localhost only; no AI provider, merchant, real order or deployment.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {resolvePublic}=require('./public-files');
const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
const scripts=[...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map(x=>x[1]);
const previewCss='report-work-skill-decision-workbook.css';
assert(html.includes('<link rel="stylesheet" href="'+previewCss+'">'),
 'the real step-one preview must ship its mobile stylesheet');
assert.equal(resolvePublic(__dirname,'/'+previewCss),
 path.join(__dirname,previewCss),'safe stylesheet should be publicly allowed');
assert(fs.existsSync(path.join(__dirname,previewCss)));
assert(scripts.length>=15);
assert.equal(new Set(scripts).size,scripts.length);
for(const item of scripts){
 assert(/^[a-z][a-z0-9-]*\.js$/.test(item),'no path-based or remote scripts');
 assert.equal(resolvePublic(__dirname,'/'+item),path.join(__dirname,item),
  'browser entry script is missing from the public server allowlist: '+item);
 assert(fs.existsSync(path.join(__dirname,item)),
  'script path must refer to real source bytes: '+item);
}
for(const denied of ['/server.js','/report-generation-request.js',
 '/report-buyer-decision-context-application.js','/qa-terra-first-chapter-one-shot.js',
 '/report-work-skill-decision-workbook-ui-tests.js',
 '/qa-work-skill-decision-workbook-ui-tests.js',
 '/qa-workbook-mobile-offline-trial-tests.js',
 '/workbook-mobile-offline-trial.html',
 '/.env','/../server.js','/%2e%2e/server.js','/node_modules/foo.js']){
 assert.equal(resolvePublic(__dirname,denied),null,
  'fix must NOT expose code, credentials or private QA: '+denied);
}
const nativeFetch=global.fetch;
const server=http.createServer(require('./server').handler);
(async()=>{
 try{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port;
  const home=await nativeFetch(base+'/');
  assert.equal(home.status,200);
  assert.match(home.headers.get('content-type'),/^text\/html/);
  const previewSheet=await nativeFetch(base+'/'+previewCss);
  assert.equal(previewSheet.status,200);
  assert.match(previewSheet.headers.get('content-type'),/^text\/css/);
  assert((await previewSheet.text()).includes('.workbook-fields'));
  for(const item of scripts){
   const res=await nativeFetch(base+'/'+item);
   assert.equal(res.status,200,'real server could not serve '+item);
   assert.match(res.headers.get('content-type'),/^text\/javascript/,
    'javascript MIME must be correct for '+item);
   assert.equal(res.headers.get('x-content-type-options'),'nosniff');
   assert((await res.text()).length>30);
  }
  for(const denied of ['/server.js','/report-generation-request.js','/qa-terra-first-chapter-one-shot.js']){
   const response=await nativeFetch(base+denied);
   assert.equal(response.status,404,'private source must stay inaccessible: '+denied);
  }
  console.log('PASS real HTTP serves all '+scripts.length+
   ' app entry scripts including free-state/day-select/work-skill, private server and QA sources denied; 0 external API/payment calls');
 }finally{await new Promise(resolve=>server.close(resolve))}
})().catch(e=>{console.error(e);process.exitCode=1});
