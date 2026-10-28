'use strict';
// Human-edited research version of ONE actual chart-specific reader passage.
// This is a manuscript sample, not a provider output or an authorized
// response rewrite. No production use, free first-chapter schema untouched.
const facts=require('./report-facts-node');
const authored=require('./report-core-v2-authored-first-chapter');
const classical=require('./report-core-1994-dingren-classical-rule-audit');
const trial=require('./report-core-paid-adult-new-role-reader-trial');
const paragraphs=Object.freeze([
 '태어난 달의 글자만 보면 배움과 조언을 받아들이는 뜻, 규칙과 책임을 살피는 뜻이 중심입니다. 그러나 이 출생정보는 시간까지 읽었을 때 질문이 달라집니다. 태어난 달 안에 숨은 丁과 태어난 시간에 나타난 丁이 정확히 같습니다. 전통 분류에서 이 글자는 수입·비용처럼 쓰는 자원의 문제와 연결됩니다. 여기서 바로 “돈 관리를 잘하는 사람”이라고 결론을 내리면 안 됩니다. 태어난 날의 기준인 壬과 시간의 丁이 나란히 놓여, 두 글자를 하나의 짝으로 검토하는 규칙도 함께 적용되기 때문입니다.',
 '『삼명통회』는 丁과 壬이 다른 기운으로 바뀔 수 있는 조건을 논하면서 亥·卯·未에 해당하는 달을 거론합니다. 이 명식의 출생월은 未이므로 그 목록에는 들어갑니다. 하지만 월이 맞는다는 한 가지 사실이 두 글자가 실제로 木으로 변했다는 증거는 아닙니다. 『자평진전』도 태어난 날의 기준 글자가 맺는 합을 다른 글자의 소멸로 곧바로 계산하지 않도록 구별합니다. 더구나 이 명식에는 해의 甲이 시간의 丁을 돕는 방향과, 날의 壬이 丁을 제약하는 방향도 함께 표시됩니다. 어느 관계가 실제 풀이에서 우선하는지는 이 자료만으로 정해지지 않습니다.',
 '이것이 기존의 달 중심 풀이에 없는 핵심 차이입니다. 시간의 자원 관련 글자를 따로 해석할 수도 있지만, 날의 글자와 맺는 짝과 서로 다른 방향을 무시해서는 안 됩니다. 같은 날짜라도 출생시간을 오후 8시 20분으로 바꾼 경우에는 시간의 丁이 없어져 방금 설명한 날·시간의 짝을 더는 적용할 수 없습니다. 반면 태어난 달의 기본 분류는 그대로 남습니다. 따라서 “자원을 다루는 성향이 강하다”는 확답보다, 출생시간이 추가한 해석 후보와 그 후보의 한계를 구별하는 편이 이 기록에 충실합니다. 실제 금전 습관이나 유리한 운세는 이 계산만으로 판단할 수 없습니다.'
]);
const references=Object.freeze([
 'natal.month.stem','natal.month.hidden.己','natal.month.hidden.丁',
 'natal.day.stem','natal.hour.stem','natal.year.stem',
 'facts.stemConnections','facts.seasonalEvidence','facts.qiEvidence'
]);
function make(packet){
 if(process.env.NODE_ENV!=='test'||process.env.RENDER==='true'||
    process.env.PAID_CORE_DEPTH_V2!=='offline-preview')
  throw Error('QA_1994_DINGREN_READER_RESEARCH_ONLY');
 const checked=classical.inspect(packet);
 if(!checked)return null;
 const old=authored.make(packet);
 const compared=trial.build(packet);
 if(!old||old.releaseVerdict!=='not-approved'||
    !compared||compared.approvedForCustomer!==false||
    old.chartFingerprint!==checked.exactChart||
    checked.unresolved.transformationToWood!=='not-established'||
    checked.unresolved.schoolPriority!=='not-established'||
    checked.verified.monthBranch!=='未'||
    checked.verified.pair!=='丁壬'||
    checked.verified.alternateHasDingRenDayHourPair!==false||
    checked.sourceUnits.length!==2||
    !references.every(id=>old.sourceRefs.includes(id)))
  throw Error('QA_1994_DINGREN_READER_UNVERIFIED_FACTS');
 const text=paragraphs.join('\n\n');
 const candidate={
  label:'태어난 시간의 자원 분류를 바로 단정할 수 없는 이유',
  text,
  basis:{
   refs:references.slice(),
   interpretation:'출생월의 기본 분류와 별도로, 시간에 드러난 丁과 날의 壬의 인접한 짝 후보를 고전 두 문헌의 조건과 구별합니다. 조합표와 변화의 성립을 혼동하지 않습니다.',
   condition:'1994년 7월 15일 오후 2시 20분에서만 해당하는 丁壬 조합을 검토하고 오후 8시 20분 반례에서 해당 조합이 사라지는 범위를 확인합니다.',
   limit:'합의 실제 성립·木으로 변화·해석 규칙의 우선순위·금전 및 성격에 대한 주장은 확정하지 않습니다.'
  }
 };
 if(/(?:장비를 도입|재고 관리 업무|봉투.*포장|안내자료.*배포|첫 조건만 준비|반대로 추가 조건만)/.test(text)||
    /(?:반드시|무조건|성공합니다|부자가 됩니다)/.test(text)||
    !text.includes('『삼명통회』')||!text.includes('『자평진전』')||
    !text.includes('오후 8시 20분')||text.length<600)
  throw Error('QA_1994_DINGREN_READER_EDITORIAL_REPETITION');
 const oldOriginal=old.proposal.text;
 if(oldOriginal===text||!oldOriginal.includes('장비')||text.includes('장비'))
  throw Error('QA_1994_DINGREN_READER_NOT_REWRITTEN');
 const alt=facts.build({...classical.INPUT,birthTime:'20:20'},2027);
 if(classical.inspect(alt)!==null)
  throw Error('QA_1994_DINGREN_READER_CHANGED_TIME_STILL_ELIGIBLE');
 return {
  kind:'qa-1994-human-edited-classical-reader-rewrite-v1',
  origin:'human-edited-not-model-generated',
  exactChart:checked.exactChart,
  candidate,paragraphCount:paragraphs.length,
  evidenceRefs:references.slice(),
  ancientSources:checked.sourceUnits.map(s=>({title:s.title,unit:s.unit,url:s.url})),
  claimsAddedOverMonthCore:[
   'exact-month-hidden-to-hour-stem-match',
   'adjacent-day-hour-dingren-pair',
   'historical-month-condition-mentioned-but-not-proven-transformed',
   'birth-hour-counterexample-breaks-the-day-hour-pair'
  ],
  previousDraftRetained:true,
  oldGenericJobSceneRemoved:true,
  competingClassicalRulesUnresolved:true,
  methodProfessionallyApproved:false,
  paidReaderValueApproved:false,
  approvedForCustomer:false,
  approvedForPaidWriter:false,
  providerCalls:0,
  releaseVerdict:'not-approved'
 };
}
module.exports={make,paragraphs,references};
