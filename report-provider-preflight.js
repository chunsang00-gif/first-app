'use strict';
// Pre-billable-call contract check. Tests whether this exact writing plan can
// be expressed through the exact outgoing schema and permitted fact IDs.
// This does not certify any generated prose or guarantee model compliance.
const writer=require('./report-generation-request');
const conditions={
 seasonal:ids=>ids.has('facts.seasonalEvidence'),
 'qi-ledger':ids=>ids.has('facts.qiEvidence'),
 'stem-linkage':ids=>ids.has('facts.stemConnections'),
 'root-condition':ids=>ids.has('facts.rootConditions'),
 'month-ten-god':ids=>[...ids].some(x=>x==='natal.month.stem'||x.startsWith('natal.month.hidden.')),
 'natal-month-position':ids=>[...ids].some(x=>x.startsWith('natal.month.'))
};
const unique=x=>new Set(x).size===x.length;
function inspect(prompt,payload,schema){
 const errors=[];
 const note=(v)=>errors.push(v);
 if(!payload||!schema||!['body','synthesis'].includes(prompt?.stage))
  return ['preflight-invalid-stage-or-payload'];
 const chapters=schema.properties?.chapters;
 if(!chapters||chapters.type!=='object')return ['preflight-chapter-schema-missing'];
 if(prompt.stage==='synthesis'){
  const drafted=prompt.completedReport?.sections?.map(s=>s.id)||[];
  const covers=schema.properties?.cover?.properties?.highlights?.items?.properties?.sectionId?.enum;
  if(drafted.length<3||!unique(drafted)||JSON.stringify(drafted)!==JSON.stringify(covers))
   note('synthesis-cover-targets-do-not-match-completed-chapters');
  if(chapters.properties&&Object.keys(chapters.properties).length)
   note('synthesis-must-not-include-body-chapters');
  for(const key of ['strengths','watchouts','routines']){
   const field=schema.properties?.finalJudgment?.properties?.[key];
   if(!field||field.type!=='array')note('synthesis-field-missing:'+key);
   // A schema that insists on >=1 conflicts with the policy to omit filler.
   if(typeof field?.minItems==='number'&&field.minItems>0)
    note('synthesis-forces-unsupported-filler:'+key);
  }
  return errors;
 }
 const expected=prompt.requestedSections||[];
 const actual=Object.keys(payload.task?.chapters||{});
 if(!unique(expected)||JSON.stringify(expected)!==JSON.stringify(actual)||
  JSON.stringify(expected)!==JSON.stringify(Object.keys(chapters.properties||{})))
  note('body-chapter-scope-or-order-conflict');
 for(const id of expected){
  const plan=prompt.analysisGuidance?.editorialBlueprint?.[id];
  const task=payload.task?.chapters?.[id];
  const slots=chapters.properties?.[id]?.properties?.paragraphs?.properties;
  if(!plan||!task||!slots){note('body-chapter-plan-missing:'+id);continue}
  if(task.anchor!==plan.anchorTopic||!Object.hasOwn(slots,plan.anchorTopic))
   note('body-anchor-conflict:'+id);
  const expectedTopics=Object.keys(plan.topicTasks||{});
  if(JSON.stringify(expectedTopics)!==JSON.stringify(Object.keys(slots)))
   note('body-topic-plan-and-schema-conflict:'+id);
  for(const topic of expectedTopics){
   const directive=task.topics?.[topic];
   const slot=slots[topic];
   if(!directive||!slot){note('body-topic-missing:'+id+'/'+topic);continue}
   const active=directive.mode!=='state-limits';
   if(!active&&topic!==task.anchor){
    if(slot.type!=='null')note('unsupported-topic-not-null:'+id+'/'+topic);
    continue;
   }
   const leaf=slot.anyOf?.find(x=>x.type==='object')||slot;
   const basis=leaf.properties?.basis?.properties;
   if(!basis){note('topic-basis-contract-missing:'+id+'/'+topic);continue}
   if(!active){
    if(basis.refs?.type!=='null')note('unsupported-anchor-invents-evidence:'+id+'/'+topic);
    continue;
   }
   const refs=writer.allowedRefs(payload,directive,id,topic);
   const available=basis.refs?.items?.enum||[];
   if(!refs.size||JSON.stringify([...refs])!==JSON.stringify(available)||
      (directive.citableFacts||[]).some(x=>!refs.has(x.id)))
    note('topic-allowed-citations-drift:'+id+'/'+topic);
   const kinds=directive.requiredSourceKinds||[];
   for(const kind of kinds){
    if(kind==='annual'){
     const pairs=task.annualScope?.comparisons||[];
     if(!pairs.some(pair=>refs.has(pair.annualId)&&refs.has(pair.natalId)))
      note('no-possible-required-annual-pair:'+id+'/'+topic);
    }else if(kind==='natal'){
     if(![...refs].some(x=>x.startsWith('natal.')))
      note('no-possible-required-natal-source:'+id+'/'+topic);
    }else if(!conditions[kind]){
     note('unknown-required-source-kind:'+id+'/'+topic+'/'+kind);
    }else if(!conditions[kind](refs)){
     note('no-possible-required-source:'+id+'/'+topic+'/'+kind);
    }
   }
   if(['mbti_contradiction','integrated_judgment'].includes(id)&&
      payload.source?.['person.mbti']&&(!refs.has('person.mbti')||
      ![...refs].some(x=>x.startsWith('natal.'))))
    note('no-possible-two-framework-sources:'+id+'/'+topic);
   if(id==='saju_core'&&topic==='temperament'&&prompt.paidCoreDepthV2===true){
    const c=directive.paidCoreDepthV2?.readerContrast||
     directive.paidCoreDepthV2?.readerAlternative;
    if(c){
     let expectedGuide=null;
     try{
      expectedGuide=require('./report-core-v2-directional-writing-plan')
       .forContrast(c);
     }catch(e){note('core-v2-unsupported-directional-plan')}
     const guide=c.readerWritingPlan;
     const description=String(leaf.properties?.text?.description||'');
     const alternative=!!directive.paidCoreDepthV2?.readerAlternative;
     const sourceKey=alternative?'readerAlternative':'readerContrast';
     const forbiddenKey=alternative?'readerContrast':'readerAlternative';
     if(!description.includes(sourceKey+'.sourceRefs')||
        !description.includes(sourceKey+'.monthMainToExposedElementDirection')||
        description.includes(forbiddenKey+'.sourceRefs')||
        description.includes(forbiddenKey+'.monthMainToExposedElementDirection'))
      note('core-v2-source-key-mismatch');
     if(alternative&&!description.includes('달 속글자의 정확한 겉글자 노출이 없으며'))
      note('core-v2-false-exact-exposure-schema');
     if(!expectedGuide||
        JSON.stringify(guide)!==JSON.stringify(expectedGuide)||
        guide?.sourceRefs?.some(x=>!refs.has(x))||
        ![
         guide?.decisionQuestion,guide?.onlyOriginalCondition,
         guide?.onlyAdditionalCondition,guide?.situationSequence,
         guide?.distinctInterpretationRule
        ].every(t=>typeof t==='string'&&t.length>=10&&description.includes(t)))
      note('core-v2-directional-writing-plan-not-on-provider-wire');
    }else if(directive.paidCoreDepthV2?.readerWritingPlan){
     note('core-v2-unqualified-chart-invents-directional-plan');
    }
   }
   if(id==='saju_core'&&topic==='strength'){
     const focus=directive.evidenceFocus?.tenGodFocus;
     if(!focus?.monthStem?.sourceId||!refs.has(focus.monthStem.sourceId)||
        !focus?.monthMainHidden?.sourceId||!refs.has(focus.monthMainHidden.sourceId))
      note('core-month-ten-god-pair-not-citable');

    // Root and clash evidence is optional. Requiring it here would
    // contradict the canonical month-ten-god writing plan.
    const pair=directive.evidenceFocus?.points||[];
    const expected=[focus?.monthStem?.sourceId,focus?.monthMainHidden?.sourceId];
    if(pair.length!==1||pair[0]?.kind!=='month-ten-god-pair'||
       JSON.stringify(pair[0]?.sourceRefs)!==JSON.stringify(expected))
     note('core-month-ten-god-focus-contaminated:'+id+'/'+topic);
   }
  }
 }
 return errors;
}
function assert(prompt,payload,schema){
 const failures=inspect(prompt,payload,schema);
 if(failures.length){console.error('[Paid provider preflight]',{stage:prompt?.stage,errors:failures});
  throw Error('AI report service preflight writing/schema contracts disagree')}
 return schema;
}
module.exports={inspect,assert};
