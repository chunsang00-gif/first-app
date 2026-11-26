'use strict';

const assert = require('node:assert/strict');
const { inspect } = require('./qa-whole-report-continuation');
const { run, testAuthorization } = require('./qa-launch-whole-chart-first-chapter-once');

const gate = {
 workflow: '.github/workflows/launch-report-first-chapter-once.yml',
 marker: 'qa-approvals/launch-report-first-chapter-once.json',
 kind: 'paid-report-first-chapter-explicit-one-call-v1',
 generationOptions: { paidWholeNatalContext: true }
};

async function preflight() {
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
  bytes: 23964,
  requestSha256: '7cf5bc9bf9b8bd83eaef36d8bb6b778c5cc12b8580bb37647b43fc55ad675bd9',
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
 const offline = process.argv[2] === '--preflight';
 const execute = offline
  ? async () => console.log(JSON.stringify(await preflight()))
  : () => run(preflight, gate);
 execute().catch(error => {
  console.error(offline ? error.stack : 'REPORT_FIRST_CHAPTER_EXECUTION_STOPPED');
  process.exitCode = 1;
 });
}
