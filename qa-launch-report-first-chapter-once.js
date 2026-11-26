'use strict';

const assert = require('node:assert/strict');
const { inspect } = require('./qa-whole-report-continuation');
const { run, testAuthorization } = require('./qa-launch-whole-chart-first-chapter-once');

const originalGate = {
 workflow: '.github/workflows/launch-report-first-chapter-once.yml',
 marker: 'qa-approvals/launch-report-first-chapter-once.json',
 kind: 'paid-report-first-chapter-explicit-one-call-v1',
 generationOptions: { paidWholeNatalContext: true }
};

const revisedGate = {
 ...originalGate,
 workflow: '.github/workflows/launch-report-revised-first-chapter-once.yml',
 marker: 'qa-approvals/launch-report-revised-first-chapter-once.json',
 kind: 'paid-report-revised-first-chapter-explicit-one-call-v1'
};

async function preflight(gate, bytes, sha) {
 const result = await inspect();
 const first = result.body[0];
 const expected = {
  model: 'gpt-6-luna',
  bytes: first.requestBytes,
  requestSha256: first.requestSha256,
  outputLimit: first.outputCeiling,
  modelNetworkCalls: result.modelNetworkCalls
 };
 assert.deepEqual(expected, {
  model: 'gpt-6-luna',
  bytes,
  requestSha256: sha,
  outputLimit: 18000,
  modelNetworkCalls: 0
 });
 assert.equal(result.verifiedFirstBatchAdvanced, true);
 assert.equal(result.rejectedFirstBatchStopped, true);
 assert.equal(result.resumedFirstBatchWithoutAnotherCall, true);
 await testAuthorization(expected, gate);
 return expected;
}

if (require.main === module) {
 const args = process.argv.slice(2);
 const revised = args.includes('--revised');
 const offline = args.includes('--preflight');
 assert(args.every(arg => arg === '--revised' || arg === '--preflight'));
 const gate = revised ? revisedGate : originalGate;
 const prepare = revised
  ? () => preflight(gate, 25001, 'c9bb5d4b2c5f00ba17af339fd15f4abec3fb2e30e7b2a46008a328e8b0e2cf14')
  : () => preflight(gate, 23964, '7cf5bc9bf9b8bd83eaef36d8bb6b778c5cc12b8580bb37647b43fc55ad675bd9');
 const execute = offline
  ? async () => console.log(JSON.stringify(await prepare()))
  : () => run(prepare, gate);
 execute().catch(error => {
  console.error(offline ? error.stack : 'REPORT_FIRST_CHAPTER_EXECUTION_STOPPED');
  process.exitCode = 1;
 });
}
