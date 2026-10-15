'use strict';
// The provider boundary: legacy planning rules are NOT sent to the writer.
// One call still produces each batch; there is no rewrite or hidden retry.
const reader=require('./report-reader-policy');
const policy=[
 reader.instruction,
 '계산 사실과 해석을 구분한다. 글자 개수나 이름만으로 능력·평판·실제 경험을 만들지 않는다. 계산하지 않은 강약·용신·합충·월별 시기를 추정하지 않는다. 예시는 가정임을 드러내고 실제 사건이나 미래 결과를 보장하지 않는다.',
 '2027년 관계 장은 실제 계산한 targetYearBranchContext.annualContext.day만 사용한다. directPairs의 충·육합이 있을 때에만 같은 위치의 다른 형·해·파와 경쟁 관계를 설명하며 관계표의 존재, 합화 성립, 실제 연애·결혼·이별은 각각 구분한다. interpretationPriority가 unresolved라면 어떤 관계가 더 강한지 단정하지 않는다. '+2027년 금전·직업의 독립 해석은 annualScope.comparisons에 있는 연도·원국의 계산 분류 비교가 있을 때만 작성한다. 반드시 annualId와 natalId를 함께 refs에 기록하며 두 위치의 같은 전통 분류군을 대비한다. 같은 분류는 충이나 합 관계를 새로 계산한 뜻이 아니다. 수입·승진·평판·성과·이직 같은 실제 사건을 결론 내리지 않는다.',
 '본문 단계에서는 각 문단의 basis를 먼저 작성한다. refs의 실제 자료가 무엇을 말하는지 interpretation에, 적용 상황을 condition에, 그 자료로 말할 수 없는 점을 limit에 적는다. 이 자료가 독자의 성격을 입증한다고 쓰지 않는다. 그 후 label과 text에 필요한 이유와 상황을 자연스러운 한국어로 설명한다. basis의 전문용어를 독자용 글에 복사하지 않는다.',
 '질문에 맞는 별도 근거가 없거나 앞 문단의 결론만 반복하면 선택 항목은 null로 둔다. 필수 항목에서도 없는 성격을 만들지 말고 확인 가능한 범위만 설명한다. 같은 응답의 다른 장과 previousSections 모두 비교한다. task.reusedEvidence는 이전 장이 실제 인용한 계산 근거와 결론의 목록이다. 같은 path를 다시 사용할 때 이전 결론을 영역 명사만 바꿔 반복하지 말고 새로운 계산 관계가 없다면 선택 문단을 생략한다. 새로운 해석을 만들려고 분야 이름만 바꾸지 않는다.',
 'MBTI는 제공된 선호 설명만 사용한다. task.comparisonContract는 두 틀을 독립적으로 비교하는 계약이며 입력 MBTI와 계산 사주로 일치·충돌이 증명되었다는 뜻이 아니다. 동일한 가정 상황에 두 설명을 나란히 적용하되 실제 성격을 측정했다고 주장하거나 반전을 만들어내지 않는다. MBTI가 없으면 추정하지 않는다.',
 '제목과 핵심 판단은 본문 결론과 일치해야 한다. 본문은 이유·상황·행동을 충분히 설명하되 같은 뜻을 다시 요약하지 않는다. 추상 명사나 작성 과정 설명으로 대신하지 않는다. 장점·단점·조언을 기계적으로 채우지 않는다. 불리한 점도 해당 근거와 조건이 있을 때 분명하게 설명한다.',
 '총평 단계는 completedReport의 내용만 선별한다. 새 성격을 추가하지 않으며 같은 문단을 다시 쓰지 않는다. strengths·watchouts·routines는 중복되거나 불필요하면 빈 배열이다. 표지 highlights는 실제 장을 가리킨다. 해석의 한계는 총평 본문에서 한 번 알리고 closingQuestion은 질문이나 면책 안내가 아닌 본문에 근거한 평서형 결론으로 끝낸다.'
].join('\n');
function sources(prompt){
 const result=Object.fromEntries((prompt.factBindings||require('./report-fact-bindings').build(prompt.facts)).map(row=>[row.id,row]));
 const p=prompt.facts;
 // Export individual structural observations instead of one wide object
 // that could be cited for an unrelated personality claim.
 for(const path of ['facts.structuralEvidence.monthCommand','facts.structuralEvidence.dayMasterRoots','facts.structuralEvidence.visibleStems','facts.natalClashes','facts.annualTenGods','facts.targetYearRelations','facts.targetYearBranchContext.annualContext.day','fortune.activeDecade']){
  const value=path.split('.').reduce((v,k)=>v?.[k],p);
  if(value!=null)result[path]=value;
 }
 const mbti=prompt.analysisGuidance?.mbtiReference||require('./report-analysis-guidance').forRequest([],p?.person?.mbti).mbtiReference;
 if(mbti)result['person.mbti']=mbti;
 return result;
}
function compile(prompt){
 if(!['body','synthesis'].includes(prompt?.stage)||!prompt.facts?.facts)return null;
 const source=sources(prompt);
 const task=prompt.stage==='body'?{
  chapters:Object.fromEntries(prompt.requestedSections.map(id=>{
   const p=prompt.analysisGuidance.editorialBlueprint[id];
   return [id,{question:p.question,anchor:p.anchorTopic,
    comparisonEvidence: id==='mbti_contradiction'&&source['person.mbti']?
     'MBTI 비교 문단은 입력된 MBTI 선호(person.mbti)와 실제 원국 위치(natal.*)를 모두 인용한다. 같은 결론이어도 된다. 사주가 확인한 실제 행동인 것처럼 쓰지 않는다.':null,
    safety:{avoid:prompt.analysisGuidance.chapterTasks?.[id]?.avoid||'',evidenceBoundary:p.evidenceBoundary||''},
    topics:Object.fromEntries(Object.entries(p.topicTasks).map(([key,t])=>[key,{
     question:t.question,mode:t.mode,sourcePath:t.primaryEvidencePath,fallbackPaths:t.verifiedFallbackPaths,allowedSourceRefs:t.allowedSourceRefs||null,requiredSourceKinds:t.requiredSourceKinds||[],
     interpretationBoundary:t.interpretationBoundary||'',
     evidenceReuseBoundary:t.evidenceReuseBoundary?{rule:t.evidenceReuseBoundary.rule,priorOwners:t.evidenceReuseBoundary.priorOwners.map(x=>({chapter:x.chapter,topic:x.topic}))}:null,
     annualDomainLimit:t.annualDomainLimit||null
    }])),annualScope:p.annualDomainEvidence||null}];
  })),previousSections:prompt.priorSections||[],
  reusedEvidence:(prompt.rules?.reusedEvidenceWithPriorConclusions||[]).map(row=>({
   path:row.path,chapter:row.chapter,topic:row.topic,previousConclusion:row.previousConclusion
  })),
  mbti:prompt.analysisGuidance.mbtiReference||null,
  comparisonContract:prompt.analysisGuidance.comparisonContract||null
 }:{completedReport:prompt.completedReport};
 return {version:'evidence-first-v1',stage:prompt.stage,targetYear:prompt.facts.targetYear,source,task};
}
const object=properties=>({type:'object',additionalProperties:false,required:Object.keys(properties),properties});
function schema(prompt,transport){
 const payload=compile(prompt);
 if(!payload)return transport;
 if(prompt.stage==='synthesis'){
  // Cover cards cannot link to a chapter excluded from this paid report.
  const ids=(payload.task.completedReport?.sections||[]).map(s=>s.id);
  const highlights=transport?.properties?.cover?.properties?.highlights?.items?.properties?.sectionId;
  if(!highlights)return transport;
  if(ids.length<3)throw Error('Insufficient supported chapters for a three-card premium cover');
  const result=structuredClone(transport);
  result.properties.cover.properties.highlights.items.properties.sectionId.enum=ids;
  return result;
 }
 const result=structuredClone(transport),ids=Object.keys(payload.source);
 if(!ids.length)throw Error('No verified sources for body writing');
 for(const [chapterId,chapter] of Object.entries(result.properties.chapters.properties)){
  delete chapter.properties.evidence;
  chapter.required=chapter.required.filter(k=>k!=='evidence');
  for(const [topic,slot] of Object.entries(chapter.properties.paragraphs.properties)){
   const p=slot.anyOf?.find(x=>x.type==='object')||slot;
   if(p.type!=='object')continue;
   const task=payload.task.chapters[chapterId]?.topics[topic];
   if(!task)throw Error('Missing canonical topic plan: '+chapterId+':'+topic);
   const permitted=[...allowedRefs(payload,task,chapterId,topic)];
   if(task.mode!=='state-limits'&&!permitted.length)throw Error('Missing topic source mapping: '+chapterId+':'+topic);
   // A limitation-only paragraph must have no sources and no fabricated
   // interpretation. Strict schema cannot express maxItems=0 reliably, so
   // use null fields as an unambiguous evidence-free branch.
   const limited=task.mode==='state-limits';
   const basis=object(limited
    ?{refs:{type:'null'},interpretation:{type:'null'},condition:{type:'null'},limit:{type:'string'}}
    :{refs:{type:'array',items:{type:'string',enum:permitted}},interpretation:{type:'string'},condition:{type:'string'},limit:{type:'string'}});
   basis.description=limited
    ?'직접 근거가 없는 항목. refs·interpretation·condition은 반드시 null로 반환하고, limit에는 무엇을 판단할 수 없는지만 구체적으로 적는다. 독자에게 성격이나 사건을 만들어 설명하지 않는다.'
    :'내부 근거 기록. 이 질문과 관련된 계산 참조만 선택한다. 실제 자료의 의미와 해석의 연결, 적용 조건, 판단 한계를 구분한다. 독자용 본문이 아니다.';
   p.properties={basis,...p.properties};p.required=['basis',...p.required];
  }
 }
 return result;
}
// Source relevance is checked against the canonical per-topic plan, not merely source existence.
function allowedRefs(payload,task,chapterId,topic){
 if(Array.isArray(task?.allowedSourceRefs))return new Set(task.allowedSourceRefs.filter(id=>Object.hasOwn(payload.source,id)));
 const paths=task?.mode==='use-primary'?[task.sourcePath]:task?.mode==='use-verified-fallback'?task.fallbackPaths||[]:[];
 const ids=new Set();
 for(const path of paths){
  if(!path)continue;
  if(Object.hasOwn(payload.source,path))ids.add(path);

  // A month-command interpretation may cite the actual month position, too.
  if(path==='facts.structuralEvidence.monthCommand')for(const id of Object.keys(payload.source))if(id.startsWith('natal.month.'))ids.add(id);
  if(path==='facts.structuralEvidence.dayMasterRoots')for(const id of Object.keys(payload.source))if(id.startsWith('natal.day.'))ids.add(id);
  // Ten-god facts are exported as position-bound rows, not as facts.tenGods.*.
  const match=/^facts\.tenGods\.(year|month|day|hour)(?:\.(hiddenStems))?$/.exec(path);
  if(match)for(const id of Object.keys(payload.source)){
   if(match[2]?id.startsWith('natal.'+match[1]+'.hidden.'):id.startsWith('natal.'+match[1]+'.'))ids.add(id);
  }
  // The complete ten-god structure is represented by all position-bound rows.
  if(path==='facts.annualTenGods.hiddenStems'&&Object.hasOwn(payload.source,'facts.annualTenGods')&&Array.isArray(payload.source['facts.annualTenGods']?.hiddenStems)&&payload.source['facts.annualTenGods'].hiddenStems.length)ids.add('facts.annualTenGods');
  if(path==='facts.tenGods')for(const id of Object.keys(payload.source))if(id.startsWith('natal.'))ids.add(id);
 }
 // A comparison must cite both the submitted MBTI preferences and
 // at least one exact natal row. It cannot compare one theory to itself.
 if(chapterId==='mbti_contradiction'&&payload.source['person.mbti']&&task.mode!=='state-limits'){
  ids.add('person.mbti');
  for(const id of Object.keys(payload.source))if(id.startsWith('natal.month.'))ids.add(id);
 }
 return ids;
}
function restoreEvidence(value,prompt){
 const payload=compile(prompt);
 if(!payload||prompt.stage!=='body')return value;
 const result=structuredClone(value);
 for(const id of prompt.requestedSections){
  const chapter=result.chapters?.[id];
  if(!chapter?.paragraphs)throw Error('AI report service missing grounded chapter');
  chapter.evidence=[];
  for(const [topic,p] of Object.entries(chapter.paragraphs)){
   if(p===null)continue;
   const b=p.basis;
   const task=payload.task.chapters?.[id]?.topics?.[topic];
   const limited=task?.mode==='state-limits';
   if(!b||typeof b.limit!=='string'||!b.limit.trim()||
    (limited
     ?b.refs!==null||b.interpretation!==null||b.condition!==null
     :!Array.isArray(b.refs)||!b.refs.length||
      b.refs.some(ref=>!Object.hasOwn(payload.source,ref))||
      ['interpretation','condition'].some(k=>typeof b[k]!=='string'||!b[k].trim())))
    throw Error('AI report service missing verified paragraph basis');
   if(!task)throw Error('AI report service unexpected paragraph topic: '+id+':'+topic);
   if(task.mode==='state-limits'){
    // A chapter's mandatory limit paragraph may explain unavailable evidence,
    // but must never substitute unrelated references for missing direct evidence.
    if(topic!==prompt.analysisGuidance.editorialBlueprint[id].anchorTopic)throw Error('AI report service unsupported topic: '+id+':'+topic);
    if(!/근거|확인|판단|자료|한계|부족|없|미상|알 수/.test(b.limit))throw Error('AI report service missing explicit evidence limit: '+id+':'+topic);
   }else{
    const allowed=allowedRefs(payload,task,id,topic);
    if(payload.source['person.mbti']&&id==='mbti_contradiction'&&!(
     b.refs.includes('person.mbti')&&b.refs.some(ref=>ref.startsWith('natal.'))
    ))throw Error('AI report service missing dual MBTI/Saju evidence: '+id+':'+topic);
    if(!allowed.size||b.refs.some(ref=>!allowed.has(ref)))throw Error('AI report service unrelated paragraph basis: '+id+':'+topic);
    if(task.requiredSourceKinds?.includes('annual')){
     const pairs=payload.task.chapters[id]?.annualScope?.comparisons||[];
     if(!pairs.some(pair=>b.refs.includes(pair.annualId)&&b.refs.includes(pair.natalId)))
      throw Error('AI report service annual interpretation lacks an actual yearly-to-natal source pair: '+id+':'+topic);
    }
   }
   chapter.evidence.push(limited
    ?topic+': 직접 판단할 근거 없음 / 한계: '+b.limit
    :topic+': '+b.refs.map(ref=>{const s=payload.source[ref];return s.position?ref+' ('+s.position+' '+s.stem+' '+s.tenGod+')':ref;}).join('; ')+' / 해석: '+b.interpretation+' / 조건: '+b.condition+' / 한계: '+b.limit);
   delete p.basis;
  }
 }
 return result;
}
module.exports={policy,compile,schema,restoreEvidence,allowedRefs};
