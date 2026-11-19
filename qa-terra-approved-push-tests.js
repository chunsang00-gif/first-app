'use strict';
// Static safety contracts plus fake run environment; never contacts a provider.
const assert=require('node:assert/strict'),fs=require('node:fs'),
 path=require('node:path');
const q=require('./qa-terra-reader-approved-push');
const manual=require('./qa-terra-reader-decision-one-shot');
const plan=require('./qa-next-first-chapter-offline-preflight');
const yaml=fs.readFileSync(path.join(__dirname,q.WORKFLOW),'utf8');
assert(yaml.includes('on:\n  push:\n'));
assert(yaml.includes('paths:\n      - '+q.MARKER));
assert(!/^\s+(?:schedule|workflow_dispatch|pull_request|workflow_run):/m.test(yaml),
 'the user-approved one-time path must never recur by other triggers');
assert(yaml.includes("fetch-depth: 2"));
assert(yaml.includes('q.approval()'));
assert(yaml.includes('await q.history()'));
assert(yaml.includes('await q.preflight()'));
assert(yaml.includes("if: always()"));
assert(!/uses:\s*[^\n]*(?:render|deploy)/i.test(yaml));
assert.equal(manual.FROZEN_REQUEST_SHA256,q.REQUEST_SHA);
const file=path.join(__dirname,q.MARKER);
if(!fs.existsSync(file)){
 assert.throws(()=>q.readMarker(),/approval-marker-absent/);
} else {
 const marker=q.readMarker();
 assert.equal(marker.requestSha256,q.REQUEST_SHA);
 assert.equal(marker.consentSource,'chat-explicit-approval-2026-11-19');
 assert.equal(marker.allowedChapters,1);
 assert.equal(marker.noRetries,true);
 const e={GITHUB_EVENT_NAME:'push',GITHUB_ACTIONS:'true',GITHUB_REPOSITORY:'bad'};
 assert.throws(()=>q.approval(e),/not-exact-approved-push-workflow-run/);
}
(async()=>{
 // The real approved single push has completed. New editorial instructions
 // differ from that exact paid SHA. The spent runner must now deny drift.
 await assert.rejects(()=>q.preflight(),/frozen-new-first-request-drift/);
 const current=await plan.inspect();
 assert.equal(current.exactProviderRequestSha256,q.REQUEST_SHA);
 assert.equal(current.realPaidProviderCalls,0);
 console.log('PASS explicit push user authorization requires unique marker, source parent, one run and immutable exact request; providerCalls=0');
})().catch(err=>{console.error(err);process.exitCode=1});
