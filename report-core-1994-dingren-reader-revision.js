'use strict';
// Human-edited research version of ONE actual chart-specific reader passage.
// This is a manuscript sample, not a provider output or an authorized
// response rewrite. No production use, free first-chapter schema untouched.
const facts=require('./report-facts-node');
const authored=require('./report-core-v2-authored-first-chapter');
const classical=require('./report-core-1994-dingren-classical-rule-audit');
const trial=require('./report-core-paid-adult-new-role-reader-trial');
const paragraphs=Object.freeze([
 '기본 풀이에서는 태어난 달을 바탕으로 새로운 내용을 배우는 문제와 규칙을 지키는 역할을 설명했습니다. 그런데 이 출생정보에서는 태어난 시간이 추가 질문을 만듭니다. 태어난 시간의 윗글자는 태어난 달 속에 숨은 자원 관리 관련 글자와 정확히 같습니다. 그렇다고 곧바로 돈 관리를 잘한다는 뜻은 아닙니다. 태어난 날의 기준 글자와 시간의 윗글자가 바로 옆에 놓여, 전통적으로 둘을 한 쌍으로 살피는 규칙도 해당하기 때문입니다. 시간에 표시된 자원 관련 뜻을 따로 떼어 성격으로 단정할 수 없는 이유입니다.',
 '그 두 글자를 다룬 고전들의 질문도 서로 다릅니다. 『삼명통회』는 한 쌍의 기운이 달라질 가능성을 설명할 때 출생월의 조건을 함께 제시합니다. 이 사례의 출생월은 그 문헌에 적힌 달의 범위에 들어갑니다. 하지만 해당 달에 태어났다는 사실만으로 기운이 실제로 바뀐 것은 아닙니다. 『자평진전』은 태어난 날의 기준 글자가 맺는 짝을 다른 글자가 아예 사라진 것으로 처리하지 않도록 구별합니다. 또한 이 기록에는 태어난 해의 글자가 시간의 글자를 돕는 방향과, 태어난 날의 글자가 시간의 글자를 제약하는 방향이 함께 계산됩니다. 이 중 무엇이 해석에서 우세한지까지 검증된 상태는 아닙니다.',
 '여기서 새로 알 수 있는 것은 좋은 재물운이라는 결론이 아니라, 출생시간에 따라 적용할 해석 규칙 자체가 달라진다는 점입니다. 같은 생일에 오후 8시 20분에 태어난 경우에는 시간의 윗글자가 바뀌므로 앞서 설명한 날과 시간의 짝을 더는 적용할 수 없습니다. 반면 달에서 확인한 기본 분류는 그대로입니다. 이처럼 무엇을 읽을 수 있는지와 무엇을 아직 결정할 수 없는지를 가르는 것이 이번 추가 해석의 의미입니다. 실제 소비 습관이나 금전 결과는 출생정보만으로 확인할 수 없습니다.'
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
