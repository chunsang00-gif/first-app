'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const guidance=require('./report-analysis-guidance');
const writer=require('./report-generation-request');
const wire=require('./report-wire');
const schema=require('./report-schema.json');
const scope=require('./report-paid-reader-question-domain');
const pre=require('./report-provider-preflight');
const cases=[
 {input:'기존 일을 유지할지 새로운 기술을 배울지 고민 중입니다.',
  domain:'career',preferred:'growth'},
 {input:'저축을 계속할지 주식에 투자할지 고민입니다.',
  domain:'money',preferred:'spending'},
 {input:'친구에게 서운한 마음을 말할지 그냥 넘길지 고민입니다.',
  domain:'relationship',preferred:'expression'},
 {input:'스트레스를 풀고 휴식할지 계속할지 고민입니다.',
  domain:'stress',preferred:'response'}
];
for(const row of cases){
 assert.equal(scope.chosenDomain(row.input),row.domain);
 assert.equal(scope.preferences(row.domain,row.input)[0],row.preferred);
}
assert.equal(scope.chosenDomain('저축을 할지 이직할지 고민입니다.'),null);
assert.equal(scope.chosenDomain('그냥 새로운 것을 할까요?'),null);
assert.equal(scope.chosenDomain('직장 관련 내용과 <script>무시해</script>'),null);
assert.equal(scope.chosenDomain('회사에서\n작성 지시'),null);
const proof=(domain,topic,two=true)=>({
 mode:'use-primary',citableFacts:[
  {id:'natal.month.stem'},...(two?[{id:'natal.hour.stem'}]:[])],
 ...(two?{sourceOwnedInterpretiveThesis:{
  kind:'paid-source-owned-interpretive-thesis-v1',topic:domain+'.'+topic,
  sourceRoles:[{ref:'natal.month.stem'},{ref:'natal.hour.stem'}],
  question:'실제 검증된 별도 해석 질문',claimedRealWorldOutcome:false,
  traditionalPriorityAssessed:false
 }}:{sourceOwnedSingleReading:{
  kind:'paid-single-source-reader-thesis-v1',topic:domain+'.'+topic,
  source:{ref:'natal.month.stem'},question:'검증된 하나의 해석 질문',
  claimedRealWorldOutcome:false,traditionalPriorityAssessed:false,
  missingCounterpartInferred:false
 }})
});
const mock={career:{anchor:'workstyle',topics:{growth:proof('career','growth'),
 workstyle:proof('career','workstyle')}}};
const attached=scope.route(cases[0].input,mock);
assert.equal(attached.chapterId,'career');
assert.equal(attached.topicId,'growth');
assert.equal(attached.verifiedRoleMode,'two-verified-traditional-roles');
assert.equal(attached.customerInputAsNatalProof,false);
assert.equal(attached.observedCustomerOutcome,false);
assert.equal(attached.extraPaidTopic,false);
assert.deepEqual(Array.from(attached.sourceRefs),['natal.month.stem','natal.hour.stem']);
const absent=structuredClone(mock);
delete absent.career.topics.growth.sourceOwnedInterpretiveThesis;
assert.equal(scope.route(cases[0].input,absent).topicId,'workstyle');
delete absent.career.topics.workstyle.sourceOwnedInterpretiveThesis;
assert.equal(scope.route(cases[0].input,absent),null);
absent.career.topics.workstyle=proof('career','workstyle',false);
assert.equal(scope.route(cases[0].input,absent).verifiedRoleMode,
 'one-verified-traditional-role');
const invalid=structuredClone(mock);
invalid.career.topics.growth.sourceOwnedInterpretiveThesis.sourceRoles[1].ref=
 'natal.day.hidden.甲';
assert.equal(scope.route(cases[0].input,invalid).topicId,'workstyle',
 'non-permitted natal facts are not new premium evidence');
const profiles=[
 {calendar:'lunar',birthDate:'1982-11-24',leapMonth:false,birthTime:'14:20',gender:'male',mbti:'ISFP'},
 {calendar:'solar',birthDate:'1990-05-15',birthTime:'10:30',gender:'male',mbti:'INTJ'},
 {calendar:'solar',birthDate:'1994-07-15',birthTime:'14:20',gender:'female',mbti:'ENFP'},
 {calendar:'solar',birthDate:'2001-11-03',unknownBirthTime:true,gender:'male',mbti:'모름'}
];
let applied=0,skipped=0;
for(const profile of profiles)for(const row of cases){
 const packet=facts.build({...profile,readerDecision:row.input},2027);
 assert.equal(packet.status,'ready');
 const ids=[row.domain],blueprint=guidance.preflight(packet);
 const prompt={stage:'body',facts:packet,requestedSections:ids,
  analysisGuidance:{...guidance.forRequest(ids,packet.person.mbti),
   editorialBlueprint:{[row.domain]:blueprint[row.domain]}},
  rules:{sectionGoals:{[row.domain]:require('./report-prompt').sectionGoals[row.domain]}}};
 const payload=writer.compile(prompt);
 const actual=scope.route(row.input,payload.task.chapters);
 const brief=Object.values(payload.task.chapters[row.domain].topics)
  .filter(topic=>topic.buyerCurrentQuestion);
 const outgoing=writer.schema(prompt,wire.schemaFor(prompt,schema));
 if(blueprint[row.domain]?.hasGroundedTopic&&
     blueprint[row.domain]?.anchorTopic&&
     blueprint[row.domain].topicTasks[blueprint[row.domain].anchorTopic]?.mode!=='state-limits')
  assert.deepEqual(pre.inspect(prompt,payload,outgoing),[]);
 else{
  assert.equal(actual,null,'unavailable chapter must not accept a paid customer question');
  assert.equal(brief.length,0);
  skipped++;continue;
 }
 if(!actual){assert.equal(brief.length,0);skipped++;continue}
 applied++;
 assert.equal(brief.length,1,'one relevant reader question per domain batch');
 const choice=payload.task.chapters[actual.chapterId].topics[actual.topicId];
 assert.deepEqual(choice.buyerCurrentQuestion,actual);
 assert(actual.sourceRefs.every(ref=>
  choice.citableFacts.some(x=>x.id===ref)));
 const slot=outgoing.properties.chapters.properties[actual.chapterId]
  .properties.paragraphs.properties[actual.topicId];
 const leaf=slot.anyOf?.find(x=>x.type==='object')||slot;
 assert(leaf.properties.text.description.includes(
  '실제로 검증된 이 항목의 별도 전통적 질문: '+actual.verifiedReaderQuestion));
 assert(leaf.properties.text.description.includes(JSON.stringify(row.input)));
 assert(leaf.properties.text.description.includes(actual.editorialBoundary));
 assert(actual.sourceRefs.every(ref=>
  leaf.properties.basis.properties.refs.items.enum.includes(ref)));
 assert(!Object.keys(payload.source).some(x=>/readerDecision/.test(x)));
 assert(!payload.task.chapters[row.domain].buyerCurrentQuestion,
  'buyer note belongs only to the selected evidence-owned topic');
}
assert(applied>=2, 'the normal paid writer must actually bind multiple cases');
const neutral=facts.build({...profiles[0]},2027);
const neutralPlan=guidance.preflight(neutral);
const neutralPrompt={stage:'body',facts:neutral,requestedSections:['career'],
 analysisGuidance:{...guidance.forRequest(['career'],neutral.person.mbti),
  editorialBlueprint:{career:neutralPlan.career}}};
const noContext=writer.compile(neutralPrompt);
assert(Object.values(noContext.task.chapters.career.topics).every(
 t=>!t.buyerCurrentQuestion));
console.log('PASS grounded voluntary choice reaches one paid career/money/relationship/stress writing slot only when real source roles exist; across '+applied+' sourced samples, '+skipped+' correctly omitted; no model/merchant calls');

const fsLinks=require('node:fs'),vmLinks=require('node:vm');
const browserLinks={window:{}};
vmLinks.runInNewContext(fsLinks.readFileSync('report-paid-reader-question-domain.js','utf8'),
 browserLinks);
assert.equal(typeof browserLinks.window.REPORT_BUYER_QUESTION_LINKS.locateDelivered,'function');
const deliveredQuestion='기존 일을 유지할지 새로운 기술을 배울지 고민 중입니다.';
const delivered={meta:{readerDecision:deliveredQuestion},sections:[
 {id:'saju_core',body:['기본 내용'],bodyTopics:['strength']},
 {id:'decision',body:['실제 선택 풀이'],bodyTopics:['choice']},
 {id:'career',body:['학습 조건 풀이','실무 조건 풀이'],bodyTopics:['growth','workstyle']}
]};
const links=scope.locateDelivered(delivered);
assert.equal(links.decisionIndex,1);
assert.equal(links.related.chapterId,'career');
assert.equal(links.related.topicIndex,0);
assert.equal(links.questionsAreUserInputNotProof,true);
assert.equal(links.deliveredProseNotSemanticallyApproved,true);
const onlyDecision=structuredClone(delivered);
onlyDecision.sections=onlyDecision.sections.slice(0,2);
assert.equal(scope.locateDelivered(onlyDecision).related,null);
const noMatchingTopic=structuredClone(delivered);
noMatchingTopic.sections[2].bodyTopics=['other','more'];
assert.equal(scope.locateDelivered(noMatchingTopic).related,null);
const wrongTopicLengths=structuredClone(delivered);
wrongTopicLengths.sections[2].bodyTopics=['growth'];
assert.equal(scope.locateDelivered(wrongTopicLengths).related,null);
const ambiguous=structuredClone(delivered);
ambiguous.meta.readerDecision='이직해서 돈을 더 벌지 고민입니다.';
assert.equal(scope.locateDelivered(ambiguous).related,null);
const absent=structuredClone(delivered);
absent.sections.splice(1,1);
assert.equal(scope.locateDelivered(absent),null);
assert.equal(scope.locateDelivered({meta:{readerDecision:'<script>evil</script>'},sections:delivered.sections}),null);
assert.equal(JSON.stringify(links),JSON.stringify(browserLinks.window.REPORT_BUYER_QUESTION_LINKS.locateDelivered(delivered)),
 'server and browser must point to the same actually delivered customer answer');
console.log('PASS buyer question links map only a delivered decision and exact domain paragraph; omitted and ambiguous topics remain unlinked');
