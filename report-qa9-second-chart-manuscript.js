'use strict';
// QA9 independent handwritten research prose for exactly one SECOND chart.
// Read-only specimen. No provider calls or changes to the model-facing schema.
const fs=require('node:fs');
const path=require('node:path');
const writer=require('./report-generation-request');
const sourceOwned=require('./report-qa3-multichart-source-owned-editorial');
const guard=require('./report-qa8-multichart-transfer-guard');
const reader=require('./report-reader-policy');
const FIXTURE=Object.freeze({calendar:'solar',birthDate:'1994-01-15',
 birthTime:'14:20',gender:'male',mbti:'ISFP'});
const EXPECTED_SCENE='archive-label-review-vs-delivery';
const SOURCE_FILE='qa/qa9-second-chart-editorial-20261029.md';
const headings=[
 '## 독자용 첫 문단','## 독자용 두 번째 문단',
 '## 독자용 세 번째 문단','## 연구 및 검증 경계'
];
function make(prompt){
 if(process.env.NODE_ENV!=='test'||process.env.RENDER==='true'||
   process.env.PAID_CORE_DEPTH_V2!=='offline-preview')
  throw Error('QA9_SECOND_CHART_OFFLINE_ONLY');
 const input=prompt?.facts?.calculationInput;
 if(!input||Object.entries(FIXTURE).some(([k,v])=>input[k]!==v)||
   prompt.paidCoreDepthV2!==true||
   JSON.stringify(prompt.requestedSections)!=='["saju_core"]')
  return null;
 const payload=writer.compile(prompt);
 const topic=payload?.task?.chapters?.saju_core?.topics?.temperament;
 const c=topic?.serverOwnedWritingContract;
 const baseline=sourceOwned.build(prompt);
 if(!baseline||baseline.sceneId!==EXPECTED_SCENE||
    baseline.sourcePosition!=='natal.year.stem'||
    baseline.contractKind!=='server-owned-first-chapter-evidence-and-claim-contract-v1'||
    c?.outline?.example!=='지역 자료관에서 전시 안내문 20장을 만드는 가정'||
    topic?.paidCoreDepthV2?.readerContrast?.mainRole!=='편인'||
    topic?.paidCoreDepthV2?.readerContrast?.otherRole!=='식신'||
    topic?.paidCoreDepthV2?.readerContrast?.monthMainToExposedElementDirection!=='left-controls-right')
  throw Error('QA9_SECOND_CHART_INDEPENDENT_EVIDENCE_MISMATCH');
 const src=fs.readFileSync(path.join(__dirname,SOURCE_FILE),'utf8');
 const texts=headings.slice(0,3).map((heading,i)=>
  src.split(heading+'\n\n')[1]?.split('\n'+headings[i+1])[0]?.trim());
 if(texts.some(t=>!t||t.length<160))
  throw Error('QA9_SECOND_CHART_READER_PARAGRAPHS_MISSING');
 const candidate=structuredClone(baseline.candidate);
 candidate.label='확인할 근거와 완성할 결과물 사이의 차이';
 candidate.text=texts.join('\n\n');
 candidate.basis.interpretation='달의 검토 관련 분류와 태어난 해의 결과물 분류가 서로 다르며, 해의 겉글자가 달의 다른 숨은 글자와 정확히 일치합니다. 기본 분류가 추가 분류를 제약하는 방향만 확인했습니다.';
 candidate.basis.condition='지역 자료관 전시 안내문을 만드는 가정에서 출처 확인이 빠질 때와 제작 일정이 빠질 때의 서로 다른 결과를 비교합니다.';
 candidate.basis.limit='이 글은 계산된 전통 분류와 가상 사례를 비교한 것이며 실제 직업, 꼼꼼함, 표현력, 성과를 확인하지 않았습니다.';
 if(reader.errors([candidate.label,candidate.text]).length)
  throw Error('QA9_SECOND_CHART_READER_LANGUAGE');
 const specimen={...baseline,candidate,origin:'assistant-authored-independent-second-chart-offline',
  approvedForCustomer:false,providerCalls:0,releaseVerdict:'not-approved'};
 const checked=guard.inspect(prompt,specimen);
 if(checked.status!=='source-scoped-human-review'||checked.canSell!==false)
  throw Error('QA9_SECOND_CHART_SOURCE_GUARD_REJECTED');
 return {...specimen,kind:'qa9-second-chart-independent-manuscript-v1',
  previousQA7TextReused:false,historicalQA7ClaimApplied:false,
  humanIndependentMethodReviewed:false,modelGenerated:false,
  canSell:false};
}
module.exports={make,FIXTURE,SOURCE_FILE};
