'use strict';
// Free offline replay of the ACTUAL isolated QA natal-depth response wire.
// Produces a synthetic fixture for schema/decoder review, NOT model output,
// professional interpretation, or a customer-facing premium report.
// The frozen billable QA and normal paid prompt are intentionally unchanged.
const preview=require('./report-core-paid-natal-depth-preview');
const generation=require('./report-generation-request');
const thesis=require('./report-core-thesis');
const core=require('./report-core-knowledge-engine');
const lock=require('./report-core-paid-natal-depth-fact-lock');
const audit=require('./report-instruction-audit');
function build(packet){
 const prepared=preview.prepare(packet);
 if(!prepared) return null;
 const prompt={...prepared.prompt,qaOfflineEditorialResearchPreview:true};
 const payload=generation.compile(prompt);
 if(audit.inspectTransport(prompt,payload).length)
  throw Error('QA_ADULT_MOCK_TRANSPORT_NOT_GROUNDED');
 const research=payload.task.chapters.saju_core.topics.natal_depth
  ?.qaOfflineEditorialResearch?.fullFirstChapterResearch;
 if(!research)return null;
 if(research.releaseVerdict!=='not-approved'||
    research.sourceInApprovedPaidRequest!==false||
    research.customerPaidValueProven!==false||
    research.sourceRefs.some(id=>!Object.hasOwn(payload.source,id)))
  throw Error('QA_ADULT_MOCK_UNAPPROVED_OR_UNCITABLE');
 const manuscript=core.compile(packet);
 if(manuscript.status!=='draft-for-human-review')
  throw Error('QA_ADULT_MOCK_MISSING_MONTH_BASELINE');
 const monthText=manuscript.reader?.paragraphs?.strength?.text;
 if(typeof monthText!=='string'||!monthText.trim())
  throw Error('QA_ADULT_MOCK_MISSING_STRENGTH');
 const strengthRefs=payload.task.chapters.saju_core.topics.strength
  .citableFacts.map(x=>x.id);
 const monthHidden=strengthRefs.find(id=>id.startsWith('natal.month.hidden.'));
 if(!monthHidden||!strengthRefs.includes('natal.month.stem'))
  throw Error('QA_ADULT_MOCK_MONTH_CITATION_ERROR');
 const depthRefs=payload.task.chapters.saju_core.topics.natal_depth
  .citableFacts.map(x=>x.id);
 const refs=research.sourceRefs.slice();
 if(refs.length!==new Set(refs).size||refs.some(id=>!depthRefs.includes(id)))
  throw Error('QA_ADULT_MOCK_FORBIDDEN_DEPTH_CITATION');
 for(const id of ['natal.year.stem','natal.day.stem','natal.hour.stem',
  'facts.stemConnections'])if(!refs.includes(id))
  throw Error('QA_ADULT_MOCK_REQUIRED_SOURCE_MISSING:'+id);
 const locked=thesis.forPrompt(prompt);
 return {
  prompt,payload,
  response:{chapters:{saju_core:{
   title:locked.title,keyJudgment:locked.keyJudgment,mood:'reflective',
   paragraphs:{
    temperament:null,
    strength:{label:'달에서 확인되는 두 가지 선택 기준',text:monthText,
     basis:{refs:['natal.month.stem',monthHidden],
      interpretation:'월간과 달 안쪽 대표 글자의 검증된 전통 분류',
      condition:'같은 문제를 두 기준으로 살펴보는 가상 상황',
      limit:'실제 성격과 행동은 확인할 수 없습니다'}},
    natal_depth:{label:research.label,text:research.text,
     basis:{refs,interpretation:lock.fromPayload(payload).literal,
      condition:'기존 작업 방식을 바꾸는 가상의 상황에서만 설명',
      limit:'실제 업무 능력이나 미래 결과는 확인할 수 없습니다'}}
   }
  }},finalJudgment:null,cover:null},
  status:'synthetic-qa-response-only',
  billableProviderCalls:0,approvedForCustomer:false
 };
}
module.exports={build};
