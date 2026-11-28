'use strict';
// High-confidence checks on whether the buyer's voluntary concern was
// actually addressed AFTER the existing paid synthesis call. This does not
// claim semantic validity, select a life outcome, rewrite content, grant
// traditional-method approval or generate additional text.
const domain=require('./report-paid-reader-question-domain');
const {GROUPS}=require('./report-paid-reader-question-application');
const CONDITIONAL=/(?:때|경우|라면|다면|하면|하려면|우선|전에는|이후에|반면|비교|구별|차이|조건|기준|여부|따라|대신)/;
const DISCLAIMER=/(?:참고용|보장하지|알 수 없|단정할 수 없|확정할 수 없|확인할 수 없|예측할 수 없)/;
function inspectWorkAndLearningCriteria(report,question){
 if(!/(?:기존|현재)\s*일을?\s*(?:유지|이어|계속)/.test(question)||
    !/(?:새로운|새)\s*기술을?\s*배우|(?:새로운|새)\s*기술을?\s*배울/.test(question)||
    !report.sections.some(s=>s?.id==='career'&&s.bodyTopics?.includes('workstyle')))
  return [];
 const final=report.finalJudgment||{};
 const fields=[...(Array.isArray(final.body)?final.body:[]),final.closingQuestion];
 const misassigned=/(?:기존|현재)\s*일을?\s*(?:유지할지|계속할지|이어갈지)는?\s*(?:바로\s*)?(?:새로운|새)\s*기술을?\s*배우는\s*데[^.!?。！？\n]{0,30}(?:비용|수강료)[^.!?。！？\n]{0,40}(?:기준|조건)(?:입니다|이다)/;
 return fields.some(s=>typeof s==='string'&&misassigned.test(s))?
  ['paid-final-existing-work-criterion-substituted-with-training-cost']:[];
}
function inspect(report,packet){
 const empty=()=>({errors:[],warnings:[],humanReviewRequired:true,
  semanticApproval:'not-assessed',applicable:false});
 const question=packet?.person?.readerDecision;
 if(typeof question!=='string'||!question.trim()||!report?.sections)return empty();
 const normalized=question.trim();
 const misplaced=inspectWorkAndLearningCriteria(report,normalized);
 const decision=report.sections.find(s=>s?.id==='decision');
 if(!Array.isArray(decision?.body)||!decision.body.some(x=>typeof x==='string'&&x.trim()))
  return misplaced.length?{...empty(),errors:misplaced,applicable:true}:empty();
 const topic=domain.chosenDomain(normalized);
 if(!topic||!GROUPS[topic])return empty();
 const body=Array.isArray(report.finalJudgment?.body)?
  report.finalJudgment.body.filter(x=>typeof x==='string').join(' '):'';
 const closing=typeof report.finalJudgment?.closingQuestion==='string'?
  report.finalJudgment.closingQuestion:'';
 const finalText=[body,closing].join(' ').trim();
 if(!finalText)return empty(); // missing final body is checked by report quality
 const authored=finalText.replace(normalized,'').trim();
 const matched=GROUPS[topic].filter(x=>x.q.test(normalized));
 if(!matched.length)return empty();
 const present=matched.filter(x=>x.p.test(authored));
 const errors=[...misplaced],warnings=[];
 // If a real delivered related paragraph ALREADY contrasted both options,
 // do not silently lose half of the customer's dilemma in the synthesis.
 // This only verifies conservative written coverage, NOT semantic validity.
 const related=report?.meta?.readerDecision===normalized?
  domain.locateDelivered(report)?.related:null;
 const fullContrastExpected=Boolean(related&&matched.length>=2);
 if(authored.length<48)
  errors.push('paid-final-buyer-question-echo-without-independent-conclusion');
 else if(present.length===0)
  errors.push('paid-final-buyer-question-not-applied-to-delivered-summary');
 else {
  if(fullContrastExpected&&
     !domain.addressesDeliveredQuestion(normalized,topic,authored))
   errors.push('paid-final-delivered-two-choice-contrast-not-explained');
  else if(matched.length>=2&&present.length<2)
   warnings.push('paid-final-buyer-choice-both-aspects-need-human-review');
  if(!CONDITIONAL.test(authored))
   warnings.push('paid-final-buyer-choice-condition-needs-human-review');
 }
 if(errors.length===0&&DISCLAIMER.test(authored)&&authored.length<115)
  warnings.push('paid-final-buyer-choice-possible-disclaimer-instead-of-answer');
 return {errors,warnings,humanReviewRequired:true,
  semanticApproval:'not-assessed',applicable:true};
}

function composeWorkAndLearningSummary(report,packet,summary){
 if(!summary||typeof summary!=='object')return summary;
 const question=packet?.person?.readerDecision;
 if(typeof question!=='string'||report?.meta?.readerDecision!==question||
    !/(?:기존|현재)\s*일을?\s*(?:유지|이어|계속)/.test(question)||
    !/(?:새로운|새)\s*기술을?\s*배(?:우|울)/.test(question))
  return summary;
 const work=report.sections.find(s=>s.id==='career'&&s.bodyTopics?.includes('workstyle'));
 const core=report.sections.find(s=>s.id==='saju_core'&&s.bodyTopics?.includes('strength'));
 if(!work||!core)return summary;
 const usedPaths=require('./report-source-ledger').usedPaths;
 const source=new Map(require('./report-fact-bindings').build(packet).map(row=>[row.id,row.tenGod]));
 const study=usedPaths(core,'strength');
 if(source.get('natal.month.stem')!=='정인'||!study.includes('natal.month.stem')||
    !study.some(ref=>ref.startsWith('natal.month.hidden.')&&source.get(ref)==='정재'))
  return summary;
 const workRoles=new Set(usedPaths(work,'workstyle').map(ref=>source.get(ref)));
 const visible=workRoles.has('정인'), independent=workRoles.has('편인');
 if(visible===independent||!workRoles.has('상관'))return summary;
 const current=visible?
  '기존 일을 이어간다면 바꾼 절차가 기존 지침이 막던 실수를 여전히 막는지 봅니다.':
  '기존 일을 이어간다면 바꾼 방법으로 만든 결과를 이전 결과와 비교할 수 있는지 봅니다.';
 const learning='새 기술을 배운다면 설명을 들을 곳이 있는지, 혼자 해볼 단계까지 드는 비용을 감당할 수 있는지 봅니다.';
 return {...summary,
  headline:'기존 일을 이어갈 때와 새 기술을 배울 때',
  body:[current+' '+learning,'본문에서 읽은 전통적 뜻을 두 선택에 대입한 풀이이며 실제 성과는 알 수 없습니다.'],
  closingQuestion:'두 선택을 비교할 근거가 아직 없다면 결정을 내리기에는 이릅니다.',
  strengths:[],watchouts:[],routines:[]
 };
}
module.exports={inspect,composeWorkAndLearningSummary};
