'use strict';
const assert=require('node:assert/strict');
const {verifyEvidenceAgainstFacts}=require('./report-quality-node');
const packet={facts:{tenGods:{year:{stemTenGod:'겁재'},month:{stemTenGod:'상관'}},annualTenGods:{stemTenGod:'편관'}}};
const check=(id,text)=>verifyEvidenceAgainstFacts({sections:[{id,evidence:[text]}]},packet);
assert.equal(check('year_2027_career','연간 편관의 대응 부담과 구분하여 업무를 설명합니다.').errors.length,0);
assert(check('year_2027_career','연간 편관의 대응 부담과 구분하여 업무를 설명합니다.').warnings.length);
assert(check('year_2027_career','원국 연간 편관은 태어난 해의 항목입니다.').errors.length);
assert(check('year_2027_career','출생 연간 편관입니다.').errors.length);
assert.equal(check('year_2027_career','원국 연간 겁재를 확인합니다.').errors.length,0);
assert(check('saju_core','연간 편관으로 계산됩니다.').errors.length);
assert(check('year_2027_career','월간 정재를 확인합니다.').errors.length);
assert(check('year_2027_career','2027년 세운은 정재입니다.').errors.length);
assert.equal(check('year_2027_career','2027년 세운은 편관입니다.').errors.length,0);
console.log('PASS annual/natal ambiguity, explicit natal mismatch, annual mismatch');
const periodPacket={...packet,fortune:{activeDecade:{startYear:2027,endYear:2036,stemTenGod:'정관'},decades:[{startYear:2017,endYear:2026,stemTenGod:'편재'},{startYear:2027,endYear:2036,stemTenGod:'정관'}]}};
const dated=text=>verifyEvidenceAgainstFacts({sections:[{id:'year_2027_career',evidence:[text]}]},periodPacket).errors;
assert.equal(dated('현재 대운은 2027~2036년 丙戌이며 천간 丙은 정관이다. 이전 2017~2026년 乙酉 대운의 편재가 자원 활용을 살핀다.').length,0);
assert(dated('이전 2017~2026년 乙酉 대운의 정관을 살핀다.').length);
assert(dated('현재 대운의 편재를 살핀다.').length);
assert(dated('2027~2036년 丙戌 대운의 편재를 살핀다.').length);
assert(dated('2000~2009년 乙酉 대운의 편재를 살핀다.').length);
console.log('PASS dated previous period, wrong historical/current facts, unknown period');

// Reader-visible calculations are mandatory for a paid-ready result, even when hidden evidence exists.
const quality=require('./report-quality-node');
const sample={sections:quality.IDS.map(id=>({id,title:'분석',keyJudgment:'개인별 해석',evidence:['월간 상관은 계산된 십성입니다.'],body:['각 항목의 해석을 담습니다.']})),finalJudgment:{body:['종합합니다.'],closingQuestion:'계산 결과를 바탕으로 여러 선택을 이해합니다.'}};
const paidPacket={status:'ready',facts:packet.facts};
let judged=quality.validate(sample,paidPacket);
assert(judged.errors.some(x=>x.includes('reader-facing natal')));
assert(judged.errors.some(x=>x.includes('reader-facing fortune')));
sample.sections[0].body=['월간 상관(생각을 표현하고 기존 규칙에 반응하는 성질)이라는 계산 근거를 풀이합니다.'];
sample.sections[8].body=['2027년 세운은 계산된 원국과 대운을 함께 비교합니다.'];
judged=quality.validate(sample,paidPacket);
assert(!judged.errors.some(x=>x.includes('reader-facing natal')||x.includes('reader-facing fortune')));
console.log('PASS paid-report body visibly explains natal and 2027 calculations');

// One specific uncertainty is acceptable; the same broad caveat in many domains is not.
const repeated=structuredClone(sample);
for(let i=0;i<5;i++)repeated.sections[i].body=['이 자료만으로 실제 행동을 알 수 없습니다.'];
assert(quality.validate(repeated,paidPacket).errors.some(x=>x.includes('repeated generic limitations')));
const restrained=structuredClone(sample);
restrained.sections[3].body=['이 자료만으로 실제 소득을 알 수 없습니다.'];
assert(!quality.validate(restrained,paidPacket).errors.some(x=>x.includes('repeated generic limitations')));
console.log('PASS chapter-spanning caveat repetition is blocked without banning isolated uncertainty');
