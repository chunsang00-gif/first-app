'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const quality=require('./report-quality-node'),outline=require('./report-outline');
const fixture=()=>({sections:quality.IDS.map((id,i)=>({id,title:'제목'+i,keyJudgment:'판정'+i,evidence:['계산한 사주 항목의 설명입니다.'],body:['문단'+i]})),finalJudgment:{body:['마지막 설명'],closingQuestion:'꼼꼼하게 확인하느라 결정을 늦출 때는, 오늘 확인할 내용을 먼저 정하는 것이 도움이 됩니다.',afterClosingText:''}});
for(const phrase of require('./report-editorial').awkwardPhrases){const r=fixture();r.sections[0].body=[phrase];assert(quality.validate(r).errors.includes('unnatural Korean: '+phrase));}
const injectors=[
 (r,t)=>r.sections[0].title=t,(r,t)=>r.sections[0].keyJudgment=t,
 (r,t)=>r.sections[0].bodyLabels=[t],(r,t)=>r.sections[0].evidence=[t],
 (r,t)=>r.cover={headline:t},(r,t)=>r.cover={description:t},
 (r,t)=>r.cover={keywords:[t]},(r,t)=>r.cover={highlights:[{title:t,description:t}]},
 (r,t)=>r.finalJudgment.headline=t,(r,t)=>r.finalJudgment.body=[t],
 (r,t)=>r.finalJudgment.strengths=[t],(r,t)=>r.finalJudgment.watchouts=[t],
 (r,t)=>r.finalJudgment.routines=[{trigger:t,action:t,reason:t}],
 (r,t)=>r.finalJudgment.closingQuestion=t
];
for(const set of injectors){const r=fixture();set(r,'핵심  성향');if(r.cover)r.cover={headline:'제목',description:'설명',keywords:['하나','둘','셋'],...r.cover};assert(quality.validate(r).errors.includes('unnatural Korean: 핵심 성향'));}
const editorial=require('./report-editorial');
assert(editorial.wordingErrors(['우선할\n방향']).length);
assert(editorial.wordingErrors(['핵심\u200B성향']).length);
assert.deepEqual(editorial.wordingErrors(['정인(배움과 보호를 뜻하는 십성)을 함께 살펴봅니다.','부탁을 거절하지 못해 자신의 일을 끝내지 못합니다.']),[]);
// Concise reports must still contain every planned topic in its exact order.
const concise=fixture();
concise.meta={versions:{schema:'concise-v1'}};
for(const section of concise.sections){
 const keys=Object.keys(outline.topics[section.id]);
 section.bodyTopics=keys;
 section.body=keys.map((_,i)=>'서로 다른 설명 '+i);
 section.bodyLabels=keys.map((_,i)=>'문단 '+i);
}
assert(!quality.validate(concise).errors.some(e=>e.includes('required topics')||e.includes('topic explanations incomplete')));
const incomplete=structuredClone(concise);
incomplete.sections[0].bodyTopics.pop();
assert(quality.validate(incomplete).errors.includes('saju_core: required topics missing or reordered'));
const shorter=structuredClone(concise);
shorter.sections[0].body.pop();
assert(quality.validate(shorter).errors.includes('saju_core: topic explanations incomplete'));
const repeated=fixture();repeated.sections[0].body=Array.from({length:4},(_,i)=>'사주에서는 서로 다른 설명 '+i);assert(quality.validate(repeated).errors.some(e=>e.includes('repeated interpretation boilerplate')));
const genericEvidence=fixture();
assert(quality.validate(genericEvidence).warnings.includes('saju_core: evidence is generic placeholder'));
const specificEvidence=fixture();specificEvidence.sections[0].evidence=['월지의 정인 관계가 전통적으로 배움과 보호를 뜻하는 항목입니다.'];
assert(!quality.validate(specificEvidence).warnings.some(x=>x.startsWith('saju_core: evidence')));
const calculatedFacts={facts:{tenGods:{year:{stemTenGod:'정관'},month:{stemTenGod:'정재'},day:{stemTenGod:'일간'},hour:{stemTenGod:'편인'}}}};
const badGod=fixture();badGod.sections[0].evidence=['월간의 편재는 사업에서 돈을 버는 방식으로 설명합니다.'];
assert(quality.validate(badGod,calculatedFacts).errors.includes('saju_core: 월간 편재 conflicts with calculated 정재'));
const goodGod=fixture();goodGod.sections[0].evidence=['월간의 정재는 전통적으로 재물 관리에 관련된 십성입니다.'];
assert(!quality.validate(goodGod,calculatedFacts).errors.some(e=>e.includes('conflicts with calculated')));
const unstatedGod=fixture();unstatedGod.sections[0].evidence=['사주에서 편재를 어떻게 이해할 수 있는지 설명합니다.'];
assert(!quality.validate(unstatedGod,calculatedFacts).errors.some(e=>e.includes('conflicts with calculated')));
const yearFacts={facts:{tenGods:{},annualTenGods:{stemTenGod:'정재'},targetYearRelations:[{type:'충',between:'month',branches:'午子'}]}};
const wrongYear=fixture();wrongYear.sections[8].evidence=['2027년 세운은 편재이므로 소비가 늘어납니다.'];
assert(quality.validate(wrongYear,yearFacts).errors.includes('year_2027: 2027 편재 conflicts with calculated 정재'));
const correctYear=fixture();correctYear.sections[8].evidence=['2027년 세운은 정재로 나타납니다.'];
assert(!quality.validate(correctYear,yearFacts).errors.some(x=>x.includes('2027')&&x.includes('conflicts with calculated')));
const unsupportedClash=fixture();unsupportedClash.sections[8].evidence=['2027년 일지와 충돌하는 관계가 있습니다.'];
assert(quality.validate(unsupportedClash,yearFacts).errors.includes('year_2027: unsupported 2027 clash with 일지'));
const supportedClash=fixture();supportedClash.sections[8].evidence=['2027년 월지와 충돌하는 관계가 있습니다.'];
assert(!quality.validate(supportedClash,yearFacts).errors.some(x=>x.includes('unsupported 2027 clash')));
const uncalculatedFacts={facts:{tenGods:{},limits:['신강·신약·용신은 이 계산에서 판정하지 않음']}};
const unsupportedStrength=fixture();unsupportedStrength.sections[8].body=['2027년에는 신강으로 판정되므로 독립하기 좋습니다.'];
assert(quality.validate(unsupportedStrength,uncalculatedFacts).errors.includes('year_2027: unsupported strength or favorable-element classification'));
const unsupportedYongshin=fixture();unsupportedYongshin.sections[8].evidence=['2027년 용신은 목이라서 운이 좋아집니다.'];
assert(quality.validate(unsupportedYongshin,uncalculatedFacts).errors.includes('year_2027: unsupported strength or favorable-element classification'));
const limitedEvidence=fixture();limitedEvidence.sections[8].body=['이 계산만으로 신강인지 신약인지 판단하지 않습니다.'];
assert(!quality.validate(limitedEvidence,uncalculatedFacts).errors.some(x=>x.includes('unsupported strength')));
const decadeOnly={fortune:{status:'complete',forward:true,start:{year:3,month:0,day:0,hour:0}},facts:{tenGods:{}}};
const inventedDecade=fixture();inventedDecade.sections[8].evidence=['2027년 대운은 편재이므로 사업으로 돈을 벌게 됩니다.'];
assert(quality.validate(inventedDecade,decadeOnly).errors.includes('year_2027: unsupported decade-fortune pillar or ten-god claim'));
const acceptableDecade=fixture();acceptableDecade.sections[8].evidence=['대운의 십성은 현재 계산에서 제공되지 않아 단정할 수 없습니다.'];
assert(!quality.validate(acceptableDecade,decadeOnly).errors.some(x=>x.includes('unsupported decade-fortune')));
const contradiction=fixture();contradiction.sections[3].title='불필요한 지출은 하지 않습니다';contradiction.sections[3].body=['마음에 드는 물건에는 예산보다 많은 돈을 쓸 수 있습니다.'];assert(quality.validate(contradiction).errors.includes('money: categorical money headline conflicts with spending exception'));
const conditional=fixture();conditional.sections[3].title='평소에는 돈을 아끼지만 좋아하는 물건에는 지출합니다';conditional.sections[3].body=['마음에 드는 물건에는 예산보다 많은 돈을 쓸 수 있습니다.'];assert(!quality.validate(conditional).errors.some(x=>x.includes('categorical money headline')));
const natural=fixture();natural.sections[0].body=['충분히 알아본 뒤 시작하려다 실행이 늦어집니다.'];assert(!quality.validate(natural).errors.some(e=>/unnatural Korean|interpretation boilerplate|abstract headline/.test(e)));
for(const ending of ['어떤 선택을 하시겠습니까?','이제 어떻게 할까요','무엇이 중요합니까？']){const r=fixture();r.finalJudgment.closingQuestion=ending;assert(quality.validate(r).errors.includes('final conclusion must not ask a question'));}
assert(!quality.validate(fixture()).errors.some(e=>e.includes('conclusion')));
const client={window:{addEventListener(){},CHARACTER_ASSETS:{badge(){return ""},hero(){return ""},detail(){return ""}}},document:{body:{classList:{add(){}}},getElementById(){return null}},requestAnimationFrame(){},console};
vm.runInNewContext(fs.readFileSync(require.resolve('./report-validator'),'utf8'),client);
assert(!client.window.REPORT_VALIDATOR.validate(fixture()).errors.some(e=>e.includes('conclusion')));
const browserConcise=structuredClone(concise);assert(!client.window.REPORT_VALIDATOR.validate(browserConcise).errors.some(e=>e.includes('concise topics incomplete')));browserConcise.sections[0].body.pop();assert(client.window.REPORT_VALIDATOR.validate(browserConcise).errors.includes('saju_core: concise topics incomplete'));
vm.runInNewContext(fs.readFileSync(require.resolve('./report-renderer'),'utf8'),client);
const target={innerHTML:'',closest(){return {classList:{add(){}}}},querySelectorAll(){return []},querySelector(){return null}};
client.window.REPORT_RENDERER.render({...fixture(),meta:{}},target);
assert(target.innerHTML.includes('종합 총평'));assert(target.innerHTML.includes('가장 중요한 결론'));
assert(target.innerHTML.indexOf('가장 중요한 결론')<target.innerHTML.indexOf(fixture().finalJudgment.closingQuestion));
// Exercise the actual pipeline without an API key, network, or calculation dependency.
const sandbox={module:{exports:{}},require:n=>n==='./report-facts-node'?{build:()=>({status:'ready',person:{mbti:'ISFP'}})}:require(n)};
vm.runInNewContext(fs.readFileSync(require.resolve('./report-server-contract'),'utf8'),sandbox);
(async()=>{
 let calls=0;const seen=[];
 await sandbox.module.exports.generate({mbti:'ISFP'},async p=>{
  calls++;seen.push(p.stage);
  assert(p.rules.plainSentenceRule);assert(p.rules.decisiveSentenceRule.includes('더 잘 맞습니다'));assert(p.rules.actionableMoneyRule.includes('가계부'));assert(p.rules.idiomaticWritingRule.includes('불필요한 지출은 하지 않습니다'));assert(p.rules.everydayWordChoiceRule.includes('결과를 확인하는 일이 잘 맞습니다'));assert(p.rules.coherenceRule.includes('모순이다'));assert(p.rules.expressionPolicyRule.includes('심장도 내준다'));assert(p.rules.depthAndEvidenceRule.includes('12개 장과 35개 항목'));assert(p.rules.depthAndEvidenceRule.includes('일간·월지·십성의 위치'));assert(p.rules.depthAndEvidenceRule.includes('실제 원국의 근거 없이'));assert(p.rules.expressionPolicyRule.includes('특정 문장을 고정하거나'));assert(!p.rules.decisiveSentenceRule.includes('눈에 보이는 성과'));assert(p.rules.decisiveSentenceRule.includes('그 결과를 눈으로 확인'));assert(p.rules.coherenceRule.includes('평소에는 지출을 아끼지만'));assert(p.rules.everydayWordChoiceRule.includes('성과는 평가·매출·실적·업적을 뜻할 때만 사용'));assert(p.rules.idiomaticWritingRule.includes('간이고 쓸개고'));assert(p.rules.naturalKoreanRule.includes('경험을 지어내는 연결어'));assert(p.rules.concreteReviewRule);assert(p.rules.candidRule.includes('단점은 예쁜 말로 바꾸지 않는다'));assert(p.rules.weaknessActionRule.includes('단점마다 조언을 붙이지 않는다'));assert(p.rules.avoidPhrases.includes('핵심 성향'));assert(!p.rules.tone.includes('사주에서는 ~로 읽습니다로 구분'));
  if(p.stage==='synthesis'){assert(p.rules.finalEditingTask.includes('routines는 빈 배열'));assert(p.rules.coverNaturalnessRule.includes('반복 비용이라는 말을 자동으로 넣지 않는다'));assert(p.rules.naturalKoreanRule.includes('한 가지 뜻은 한 번만'));assert(p.rules.finalRule.includes('교훈이나 감동 문구를 억지로 붙이지 않는다'));assert(p.rules.finalRule.includes('앞의 12개 장을 다시 요약하지 않는다'));assert.equal(p.completedReport.sections.reduce((n,s)=>n+s.body.length,0),35);return {cover:null,finalJudgment:{body:['마지막 설명'],closingQuestion:'꼼꼼하게 확인하느라 결정을 늦출 때는, 오늘 확인할 내용을 먼저 정하는 것이 도움이 됩니다.',afterClosingText:''}};}
  assert(p.rules.mbtiDepthRule);assert.equal(p.priorSections.length,(calls-1)*2);
  if(calls>1)assert(p.priorSections.every(s=>s.topicConclusions.length===s.bodyLabels.length));
  return {sections:p.requestedSections.map(id=>({id,title:'제목',keyJudgment:'핵심',evidence:['계산한 사주 항목의 설명입니다.'],bodyTopics:Object.keys(outline.topics[id]),bodyLabels:Object.values(outline.topics[id]),body:Object.keys(outline.topics[id]).map((_,i)=>'첫 번째 결론 '+i+'. 이어지는 설명입니다.')}))};
 });
 assert.equal(calls,7);assert.equal(seen.filter(s=>s==='body').length,6);assert.equal(seen[6],'synthesis');
 console.log('PASS editorial phrases, repetitive templates, natural phrasing, active body/summary rules, topic memory, 35 topics and seven calls; no paid API');
})().catch(e=>{console.error(e);process.exitCode=1});
