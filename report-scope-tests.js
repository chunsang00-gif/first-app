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

// Exact calculations stay internal; visible copy is plain Korean.
const quality=require('./report-quality-node');
const sample={sections:quality.IDS.map(id=>({id,title:'분석',keyJudgment:'개인별 해석',evidence:['월간 상관은 계산된 십성입니다.'],body:['각 항목의 해석을 담습니다.']})),finalJudgment:{body:['종합합니다.'],closingQuestion:'계산 결과를 바탕으로 여러 선택을 이해합니다.'}};
const paidPacket={status:'ready',facts:packet.facts};
sample.sections[8].body=['2027년의 계산 결과를 평소의 풀이와 비교합니다.'];
let judged=quality.validate(sample,paidPacket);
assert(!judged.errors.some(x=>x.startsWith('reader jargon:')),'internal evidence must retain exact terminology');
sample.sections[0].body=['월간 상관(생각을 표현하는 성질)을 풀이합니다.'];
assert(quality.validate(sample,paidPacket).errors.includes('reader jargon: 상관'),'parentheses must not excuse visible jargon');
sample.sections[0].body=['직접 해 보고 고르는 상황과 다른 사람의 설명을 듣고 고르는 상황을 나눠 설명합니다.'];
assert(!quality.validate(sample,paidPacket).errors.some(x=>x.startsWith('reader jargon:')));
console.log('PASS plain reader copy with exact internal facts preserved');

// One specific uncertainty is acceptable; the same broad caveat in many domains is not.
const repeated=structuredClone(sample);
for(let i=0;i<5;i++)repeated.sections[i].body=['이 자료만으로 실제 행동을 알 수 없습니다.'];
assert(quality.validate(repeated,paidPacket).errors.some(x=>x.includes('repeated generic limitations')));
const restrained=structuredClone(sample);
restrained.sections[3].body=['이 자료만으로 실제 소득을 알 수 없습니다.'];
assert(!quality.validate(restrained,paidPacket).errors.some(x=>x.includes('repeated generic limitations')));
console.log('PASS chapter-spanning caveat repetition is blocked without banning isolated uncertainty');


// The original paid-report sample uses grouped positions and named hidden stems.
// 午 contains 丁/편관 and 己/편인; 亥 contains 壬/상관 and 甲/정재.
const hiddenPacket={facts:{tenGods:{
 year:{stemTenGod:'겁재',hiddenStems:[{stem:'丁',tenGod:'편관'},{stem:'己',tenGod:'편인'}]},
 month:{stemTenGod:'상관',hiddenStems:[{stem:'丁',tenGod:'편관'},{stem:'己',tenGod:'편인'}]},
 day:{stemTenGod:'일간',hiddenStems:[{stem:'壬',tenGod:'상관'},{stem:'甲',tenGod:'정재'}]},
 hour:{stemTenGod:'정재',hiddenStems:[{stem:'丁',tenGod:'편관'},{stem:'己',tenGod:'편인'}]}
}}};
const hiddenCheck=text=>verifyEvidenceAgainstFacts({sections:[{id:'saju_core',evidence:[text]}]},hiddenPacket).errors;
assert.equal(hiddenCheck('월지·연지·시지인 오의 지장간에는 정화 편관이 있습니다.').length,0);
assert.equal(hiddenCheck('연지·월지·시지의 지장간에 있는 편인입니다.').length,0);
assert.equal(hiddenCheck('일지 지장간의 갑목 정재를 해석합니다.').length,0);
assert(hiddenCheck('월지·연지·시지의 지장간에는 갑목 정재가 있습니다.').some(x=>x.includes('지장간')));
assert(hiddenCheck('일지 지장간의 정화 편관을 해석합니다.').some(x=>x.includes('지장간')));
assert(hiddenCheck('월지의 지장간에는 정화 정관이 있습니다.').some(x=>x.includes('지장간')));
assert(hiddenCheck('월지와 일지의 지장간에는 정화 편관이 있습니다.').some(x=>x.includes('일지')));
const unknownHour={facts:{tenGods:{year:hiddenPacket.facts.tenGods.year,month:hiddenPacket.facts.tenGods.month,day:hiddenPacket.facts.tenGods.day}}};
const unknownCheck=text=>verifyEvidenceAgainstFacts({sections:[{id:'saju_core',evidence:[text]}]},unknownHour).errors;
assert(unknownCheck('시간 편관으로 해석됩니다.').some(x=>x.includes('uncalculated hour-pillar')));
assert(unknownCheck('시지 지장간의 편관을 해석합니다.').some(x=>x.includes('uncalculated hour-branch')));
assert.equal(unknownCheck('일지 지장간의 정재를 해석합니다.').length,0);
console.log('PASS multi-position hidden-stem pair grounding and unknown-hour rejection');
