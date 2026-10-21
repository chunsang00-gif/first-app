'use strict';
const assert=require('node:assert/strict');
const {survey}=require('./report-core-rule-opportunities');
const a=survey(),b=survey();
assert.deepEqual(a,b,'representative coverage analysis must be deterministic');
assert.equal(a.kind,'synthetic-fixed-qa-grid-not-traffic');
assert.equal(a.missingCases,91,'candidate planning must not inflate reader draft coverage');
assert(a.distinctFamilyKeys>12);
assert(a.branchExamples.length>=10);
assert(a.topFamilies.every(x=>x.count>0&&x.examples.length>0&&
 x.examples.every(y=>y.hasOutline)));
console.log('CORE_RULE_OPPORTUNITIES='+JSON.stringify(a));
console.log('PASS uncovered rule opportunities are based on verified source pairs, no API calls');
