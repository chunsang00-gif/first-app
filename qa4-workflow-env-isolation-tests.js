'use strict';
// Regression for actual QA4 40704124862: job-wide offline flags broke
// ordinary report-generation-request-tests BEFORE any provider request.
// No model/network calls. New consent cannot reuse the consumed dispatch.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const yaml=fs.readFileSync(path.join(__dirname,
 '.github/workflows/qa4-claimlinked-paid.yml'),'utf8');
const guard=require('./qa-core-v2-claimlinked-dispatch-guard');
const beforeSteps=yaml.split('    steps:')[0];
const jobEnv=beforeSteps.split('    env:')[1]||'';
const flags=['NODE_ENV','PAID_CORE_DEPTH_V2',
 'PAID_CORE_V2_CLASSICAL_WRITER','PAID_CORE_V2_CLAIM_LINKS'];
for(const name of flags){
 assert(!new RegExp('^\\s*'+name+':','m').test(jobEnv),
  'QA4-specific flag must NEVER be set globally for normal npm test: '+name);
}
const testStep=yaml.split(
 '      - name: Test existing code and new claim-linked request without API calls')[1]
 .split('      - name: Verify fresh one-time consent')[0];
assert(testStep.includes('run: npm test && npm run smoke'));
for(const name of flags)assert(!new RegExp('^\\s*'+name+':','m')
 .test(testStep),'free baseline must not inherit experimental flags '+name);
for(const stepName of [
 'Verify fresh one-time consent and frozen request before API',
 'One new user-authorized claim-linked response, NEVER RETRY'
]){
 const block=yaml.split('      - name: '+stepName)[1]
  .split('      - name:')[0];
 for(const name of flags)
  assert(new RegExp('^\\s*'+name+':','m').test(block),
   'exact QA4 flags must exist only in protected provider path: '+name);
}
assert(yaml.includes("inputs.paid_qa_confirmation == '"+
 guard.APPROVAL+"'"));
assert(yaml.includes(guard.REQUEST_HASH));
assert(yaml.includes('run: node run-paid-core-v2-qa4-claimlinked.js'));
assert(yaml.includes('node report-qa-secure-archive.js encrypt'));
assert.equal(guard.PREVIOUS_CONSUMED_RUN,40633333735);
console.log('QA4_WORKFLOW_FREE_TEST_ENV_ISOLATION='+JSON.stringify({
 historicalRealDispatchFailure:40704124862,
 baselineOrdinaryNpmTestNoExperimentalFlags:true,
 exactExperimentalFlagsOnlyForPreflightAndOneProviderAttempt:true,
 singleUseDispatchHistoryGuardPreserved:true,
 noReusedPriorConsent:true,realProviderCalls:0,
 customerReportProduced:false,releaseVerdict:'not-approved'
}));
