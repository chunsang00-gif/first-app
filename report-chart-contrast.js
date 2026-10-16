'use strict';
// Editor-specific evidence contrast for the EXISTING premium writer.
// No personality, luck, job success, wealth prediction or numeric qi score
// is inferred. These are exact calculated distinctions, not verified traits.
const provenance={
 season:'facts.seasonalEvidence',
 qi:'facts.qiEvidence',
 stem:'facts.stemConnections',
 roots:'facts.rootConditions'
};
const ELEMENT={wood:'나무',fire:'불',earth:'흙',metal:'쇠',water:'물'};
const SEASON={spring:'봄',summer:'여름',autumn:'가을',winter:'겨울'};
const LOCATION={year:'연',month:'월',day:'일',hour:'시'};
const LAYER={main:'본기',secondary:'중기',residual:'여기'};
const RELATION={
 'same-element':'일간과 같은 오행','resource':'일간을 생하는 오행',
 'output':'일간이 생하는 오행','day-controls':'일간이 극하는 오행',
 'control-on-day':'일간을 극하는 오행',
 'transitional-month-unresolved':'계절 우세를 단정할 수 없는 전환월'
};
function describeStems(rows){
 return rows.length?rows.map(x=>LOCATION[x.sourceId.split('.')[1]]+'간: '+(RELATION[x.relation]||x.relation)).join('; '):
  '해당 분류로 확인된 겉천간 없음';
}
function build(packet){
 const facts=packet?.facts||{};
 const season=facts.seasonalEvidence,qi=facts.qiEvidence;
 const link=facts.stemConnections,root=facts.rootConditions;
 if(!season||!qi||!link||!root||!packet?.chart)return null;
 const rootRows=link.dayMasterRooting?.sameElementRoots||[];
 const rootLocations=rootRows.map(x=>({
  sourceId:x.hiddenId,position:x.position,layer:x.layer,matchType:x.type
 }));
 // Visible stems are classified by actual five-element direction.
 // They are not observed personality characteristics or independent
 // measurements of qi strength.
 const visible=qi.entries.filter(x=>x.layer==='visible')
  .map(x=>({sourceId:x.id,relation:x.relation,category:x.category,direction:x.direction}));
 const support=visible.filter(x=>x.direction==='support');
 const counter=visible.filter(x=>x.direction!=='support');
 // Preserve BOTH endpoints of every computed natal clash, not just the
 // rooted endpoint. Otherwise the writer can falsely imply that two roots
 // clash with EACH OTHER when both actually clash with the month branch.
 const collision=(root.dayMasterRootCases||[]).flatMap(x=>
  (x.natal?.clashes||[]).filter(rel=>Array.isArray(rel.positions)&&
   rel.positions.length===2&&rel.positions.includes(x.rootPosition))
   .map(rel=>({
    sourceId:x.rootId,location:x.rootPosition,
    counterpart:rel.positions.find(position=>position!==x.rootPosition),
    positions:rel.positions.slice(),branches:rel.branches,natalClash:true
   }))
 );
 // Actual ten-god classifications of the month stem and its principal
 // hidden stem form the interpretive base; these are NOT life measurements.
 const monthGod=facts.tenGods?.month,command=facts.structuralEvidence?.monthCommand;
 const mainStem=command?.mainHiddenStem;
 const mainHidden=monthGod?.hiddenStems?.find(x=>x.stem===mainStem);
 if(!monthGod?.stemTenGod||!mainHidden?.tenGod||!facts.tenGodGlossary)return null;
 const monthTenGodContext={
  monthStem:{sourceId:'natal.month.stem',stem:monthGod.stem,
   tenGod:monthGod.stemTenGod,meaning:facts.tenGodGlossary[monthGod.stemTenGod]||null},
  monthMainHidden:{sourceId:'natal.month.hidden.'+mainStem,stem:mainStem,
   tenGod:mainHidden.tenGod,meaning:facts.tenGodGlossary[mainHidden.tenGod]||null},
  sameClassification:monthGod.stemTenGod===mainHidden.tenGod,
  method:'일간 기준 십성; 월간과 월지 본기는 서로 다른 출처',
  unmeasured:['personality','achievement','wealth','personality-balance','qi-strength']
 };
 const seasonContext={
  dayElement:season.dayElement,
  monthBranch:season.monthBranch,
  season:season.monthSeason,phase:season.monthPhase,
  dominantElement:season.coreSeasonElement,
  direction:season.seasonToDayRelation,
  transitionUnresolved:season.monthPhase==='transition'
 };
 const distinctions=[
  {kind:'month-vs-day',refs:[provenance.season,'natal.month.stem'],
   evidence:seasonContext,
   calculatedExplanation:'월지는 '+season.monthBranch+'이고 '+SEASON[season.monthSeason]+'의 '+
    (season.monthPhase==='transition'?'전환월':'중심 달')+'로 분류된다. 일간 오행은 '+
    ELEMENT[season.dayElement]+'이고 월지 계절과의 관계는 '+
    (RELATION[season.seasonToDayRelation]||season.seasonToDayRelation)+'이다.',
   question:'출생월이 핵심 계절인지 전환월인지, 일간과의 실제 오행 관계가 무엇인지 분명히 설명한다.'},
  {kind:'visible-support-vs-counter',refs:[provenance.qi,...visible.map(x=>x.sourceId)],
   evidence:{support,counter},
   calculatedExplanation:'겉천간의 같은 오행·생조 방향: '+describeStems(support)+
    '. 그 밖의 오행 방향: '+describeStems(counter)+'. 이 분류는 능력이나 강약의 판정이 아니다.',
   question:support.length&&counter.length?
    '겉천간에서 일간을 돕는 방향과 그렇지 않은 방향이 함께 나타난다. 두 방향의 계산 근거와 출생 위치를 대비하되 성격의 양면성으로 단정하지 않는다.':
    '확인된 겉천간의 오행 방향만 설명한다. 없는 반대 성격이나 강약의 균형을 꾸미지 않는다.'},
  {kind:'actual-day-master-roots',refs:[provenance.stem,provenance.roots,
   ...rootLocations.map(x=>x.sourceId)],
   evidence:{rootLocations,observedRootCount:rootLocations.length,hiddenHourUnresolved:link.hiddenHourMayChangeFindings},
   calculatedExplanation:rootLocations.length?
    '일간과 같은 오행의 지장간 출처: '+rootLocations.map(x=>LOCATION[x.position]+'지 '+LAYER[x.layer]+
     ' ('+x.sourceId+')').join(', ')+'. 이 수는 강약 점수가 아니다.':
    '확인된 출생 기둥의 지장간에서 같은 오행의 뿌리를 찾지 못했다. '+
     (link.hiddenHourMayChangeFindings?'시주는 미상이다.':'이 결과가 신약 확정은 아니다.'),
   question:rootLocations.length?
    '일간과 같은 오행이 실제로 존재하는 지장간 위치 및 투간과 같은 오행 통근의 차이를 밝힌다. 뿌리 개수를 강약 점수로 만들지 않는다.':
    '확인 가능한 시주 범위 안에서 일간의 동일 오행 뿌리가 발견되지 않았음을 설명한다. 신약 확정이나 인성의 부재로 확대하지 않는다.'},
  {kind:'root-relation-overlap',refs:[provenance.roots],
   evidence:{collisions:collision},
   calculatedExplanation:collision.length?
    '뿌리 자리에 직접 연결된 원국 충의 실제 두 끝점: '+
     collision.map(x=>LOCATION[x.counterpart]+'지 ↔ '+LOCATION[x.location]+
       '지 ('+x.branches+'; 뿌리 '+x.sourceId+')').join(', ')+
     '. 같은 상대 자리와 각각 연결되는 두 뿌리가 서로 충이라는 뜻은 아니다. 충만으로 뿌리가 소멸하지 않는다.':
    '확인된 일간 뿌리 위치에 직접 충이 계산되지 않았다. 다른 영향이나 실제 생활의 안정성을 보장하지 않는다.',
   question:collision.length?
    '어떤 자리와 어떤 뿌리 자리가 충 관계인지 양쪽 위치를 각각 말한다. 둘 이상의 뿌리가 같은 다른 자리와 충 관계라면 뿌리끼리 충돌한다고 쓰지 않는다. 충 하나로 숨은 글자가 사라졌다고 판단하지 않는다.':
    '직접 확인된 뿌리 충이 없다고 해서 모든 오행 변화나 일의 안정성을 보장하지 않는다.'}
 ];
 return {
  version:'chart-evidence-contrast-v1',
  chartSignature:[packet.chart.year,packet.chart.month,packet.chart.day,packet.chart.hour||'hour-unknown'].join('/'),
  monthAndDay:seasonContext,
  monthTenGodContext,
  contrastPoints:distinctions,
  factsOnly:true,
  cannotInfer:['verified-personality','observed-behavior','day-master-strength',
   'useful-god','income','promotion','relationship-event'],
  writerRule:'월의 계절·겉글자·숨은 글자·같은 오행의 뿌리와 충을 실제 출처별로 분리해 비교한다. 겉에 상반되는 오행 방향이 없으면 겉글자 사이의 갈등을 창작하지 않는다. 여러 근거를 나열할 때는 각 계산값이 어떤 전통적인 해석을 허용하고 무엇은 확정할 수 없는지 밝힌다. 실제로 관찰하지 않은 성격·능력·갈등을 확정하지 않는다. 여러 기운의 공존이나 상황에 따른 균형 같은 상투적인 결론을 피한다.'
 };
}
// Send exact, answerable source pairs to the TWO existing core paragraphs.
// Previously four independent comparisons were attached to the chapter as
// one undifferentiated table. The model then blended them into generic traits.
// This changes the input contract, NOT the calculated chart or QA threshold.
const TOPIC_POINTS={
 temperament:['month-vs-day','visible-support-vs-counter'],
 strength:['actual-day-master-roots','root-relation-overlap']
};
// Reader depth is separate from calculated chart facts. These are reasoning
// questions, never personality claims or predicted actions.
// Each question below is determined from the CURRENT person's computed facts.
// Never transplant example-specific water, hidden-stem, root or clash claims.
const VISIBLE_MEANING={
 'same-element':'같은 오행 관계(동료·나란함을 살피는 분류)',
 resource:'나를 돕는 관계(배움·보호를 살피는 분류)',
 output:'내가 낳는 관계(표현·생산을 살피는 분류)',
 'day-controls':'내가 다스리는 관계(재물·자원 운영을 살피는 분류)',
 'control-on-day':'나에게 작용하는 관계(규칙·역할·압박을 살피는 분류)'
};
function readerQuestions(contrast,topic){
 const points=contrast.contrastPoints||[];
 const month=points.find(p=>p.kind==='month-vs-day')?.evidence;
 const visible=points.find(p=>p.kind==='visible-support-vs-counter')?.evidence;
 const rooting=points.find(p=>p.kind==='actual-day-master-roots')?.evidence;
 const collisions=points.find(p=>p.kind==='root-relation-overlap')?.evidence;
 const monthTenGod=contrast.monthTenGodContext;
 if(topic==='temperament'){
  if(!month||!visible||!Array.isArray(visible.support)||!Array.isArray(visible.counter))
   throw Error('Missing calculated visible-qi evidence for core reader brief');
  const entries=[...visible.support,...visible.counter];
  const relationTypes=[...new Set(entries.map(x=>x.relation))];
  const meanings=relationTypes.map(r=>VISIBLE_MEANING[r]||'별도 관계('+r+')');
  const observed=entries.length?
   '겉에 실제로 확인된 관계는 '+meanings.join('·')+'다.':
   '겉글자의 별도 지원·압박 관계가 확인되지 않았다.';
  const dynamicExample=relationTypes.includes('resource')?
   '배움이나 지원이 필요한 가상 상황에서 계산된 배움·보호의 전통 상징이 어떤 뜻인지 실제 위치로 설명한다. 월의 계절 분류와 의미를 구분한다.':
   relationTypes.includes('control-on-day')?
   '역할과 규칙을 정하는 가상 상황에서 겉글자의 실제 규칙·역할 상징을 어떤 질문에 적용하는지 설명한다. 계절 분류와 구별한다.':
   relationTypes.includes('output')?
   '의견을 표현하는 가상 상황에서 겉글자의 실제 표현·생산 상징을 전통적으로 어떻게 읽는지 설명한다. 계절 분류와 구별한다.':
   '정보를 살피는 가상 상황에서 실제 확인된 겉글자 관계의 전통적 의미를 구체적으로 설명한다. 없는 반대 관계를 만들어내지 않는다.';
  const phase=month.phase==='transition'?'전환월':'중심 계절';
  return {
   contrastQuestion:'태어난 달의 '+phase+' 분류와 확인된 겉글자 관계는 함께 읽으면 전통적으로 무엇을 살피게 되는가?',
   reasoningTask:'출생월은 '+phase+'로 계산됐다. '+observed+
    ' 계절 배경과 겉글자 각각의 출생 위치를 분리해 확인하고, 확인된 오행 관계의 전통적인 의미와 출생 위치에 따라 달라지는 해석의 출발점을 구체적으로 설명한다. 겉에 없는 지원·압박의 반대 방향이나 월의 숨은 글자가 실제 성격을 만든다고 추가하지 않는다.',
   hypotheticalQuestion:dynamicExample,
   interpretivePayoff:'독자는 확인된 겉글자 관계 '+relationTypes.length+'종과 출생월의 계절 조건을 전통적으로 함께 읽는 이유를 이해한다.'
  };
 }
 if(topic==='strength'){
  if(!rooting||!collisions||!Array.isArray(rooting.rootLocations)||!Array.isArray(collisions.collisions))
   throw Error('Missing calculated roots and clashes for core reader brief');
  const count=rooting.rootLocations.length,overlap=collisions.collisions.length;
  const pairNames=collisions.collisions.map(x=>
   (LOCATION[x.counterpart]||x.counterpart)+'지와 '+
   (LOCATION[x.location]||x.location)+'지의 충');
  const explicitPairs=[...new Set(pairNames)].join(', ');
  const visiblePositions=[...new Set(rooting.rootLocations.map(x=>x.position))];
  const positions=visiblePositions.map(p=>LOCATION[p]||p).join('·');
  const unknownHour=rooting.hiddenHourUnresolved===true;
  const rootsText=count?
   '동일 오행 뿌리가 실제 확인된 자리 '+count+'곳('+positions+')의 숨은 글자를 각각 짚는다.':
   '확인 가능한 기둥에서는 동일 오행 뿌리가 발견되지 않았다. 없는 위치를 만들어내지 않는다.';
  const clashText=overlap?
   '뿌리와 직접 연결된 충 관계 '+overlap+'건은 각각 '+explicitPairs+'이다. 충을 받은 뿌리와 충의 상대 자리를 모두 밝힌다. 같은 상대 자리와 연결된 두 뿌리를 서로 충인 것처럼 설명하지 않는다.':
   '실제 뿌리 위치에 직접 충이 계산된 사례가 없다. 충이 있다고 지어내지 않는다.';
  const hourText=unknownHour?'태어난 시간이 없으므로 시간 자리에 관한 결론도 내리지 않는다.':'';
  // Keep exact root locations and natal clash endpoints as PRIVATE evidence.
  // Reader-facing questions concern the interpretation, not the calculation.
  const sourceAudit=rootsText+' '+clashText+' '+hourText+
   ' 실제 충의 양쪽 위치를 내부 basis.refs 및 evidence에서 확인한다. 이것은 성격·강약 점수가 아니다.';
  if(!monthTenGod?.monthStem?.tenGod||!monthTenGod?.monthMainHidden?.tenGod)
   throw Error('Missing verified month ten-god meanings for reader brief');
  const visibleKind=monthTenGod.monthStem.tenGod;
  const mainKind=monthTenGod.monthMainHidden.tenGod;
  const comparison=monthTenGod.sameClassification?
   '태어난 달의 두 출처에서 같은 십성 분류를 확인했다. 반대 성향을 만들지 않는다. ':
   '태어난 달의 겉글자와 중심 숨은 글자에서 서로 다른 십성 분류를 확인했다. 서로 다른 위치의 뜻을 구별한다. ';
  const readerContext='태어난 달 겉글자의 '+visibleKind+'와 중심 숨은 글자의 '+mainKind+'를 먼저 대조한다. '+comparison;

  return {
   contrastQuestion:'태어난 달의 겉글자와 중심 숨은 글자가 나타내는 전통적 질문을 어떻게 함께 읽는가?',
   reasoningTask:readerContext+
    '두 분류의 전통적인 의미와 실제 출생 위치의 차이를 구체적으로 설명한다. 뿌리나 충은 그 의미에 실제로 영향을 주는 보조 조건일 때만 다룬다. 재산·능력·사건·마음속 균형·성격 양면성을 만들어 내지 않는다.',
   hypotheticalQuestion:'가상의 상황: 실제 계산된 두 십성 분류가 배움·표현·규칙·자원 중 어떤 질문을 살피는지 출생 위치에 따라 다르게 설명한다. 독자가 그런 경험을 했다고 단정하지 않는다.',
   interpretivePayoff:'독자는 태어난 달의 두 출처가 전통적으로 무엇을 뜻하는지, 같은 분류와 서로 다른 분류를 각각 어떻게 구별하는지 이해한다.',
   sourceAudit
  };
 }
 throw Error('Unsupported Saju reader topic: '+topic);
}
function forTopic(contrast,topic,allowedIds){
 if(!TOPIC_POINTS[topic]||!contrast||!Array.isArray(contrast.contrastPoints))
  throw Error('Unknown or missing grounded core paragraph plan: '+topic);
 const allowed=new Set(allowedIds);
 const points=TOPIC_POINTS[topic].map(kind=>{
  const item=contrast.contrastPoints.find(p=>p.kind===kind);
  if(!item)throw Error('Missing calculated comparison: '+kind);
  const sourceRefs=item.refs.filter(ref=>allowed.has(ref));
  // Do not introduce a new rejection gate for intentionally incomplete
  // test prompts; canonical evidence validation remains authoritative.
  return {kind,sourceRefs,calculatedExplanation:item.calculatedExplanation,sourceAuditCheck:item.question};
 });
 const {sourceAudit,...readerReasoning}=readerQuestions(contrast,topic);
 return {scope:topic,
  ...(topic==='strength'?{tenGodFocus:contrast.monthTenGodContext}:{}),
  points,readerReasoning,
  ...(sourceAudit?{sourceAudit}:{}),
  readerQuestion:topic==='temperament'?
   '내 기본 기질을 전통적으로 어떻게 해석하며 어느 실제 근거에서 나오는가?':
   '기본 기질의 풀이를 뒷받침하거나 주의해서 읽게 하는 조건은 무엇인가?',
  internalEvidenceRole:topic==='temperament'?
   '계절과 겉글자 관계의 계산 근거로만 전통적 기본 기질을 해석':
   '태어난 달의 겉글자와 중심 숨은 글자의 십성 분류가 기본 해석 근거다. 뿌리·충은 추가 보조 검증 근거일 뿐 성격 강도로 확정하지 않음',
  policy:'먼저 tenGodFocus.monthStem과 tenGodFocus.monthMainHidden의 실제 십성 분류와 전통적 의미를 readerQuestion에 연결한다. 월간과 월지 본기는 다른 출처이며 같더라도 거짓 갈등을 만들지 않는다. sourceAudit와 points는 내부 출처·계산 검증용이며 독자에게 뿌리 개수·충 관계를 가르치는 용도로 복사하지 않는다. 실제 확인된 명리 상징이 허용하는 기질 해석과 그 조건을 쉬운 가상 상황으로 풀고, 실제 성격·능력·사건은 지어내지 않는다. 한계는 basis.limit에 기록한다. 제목과 문단 라벨에 뿌리·충·통근·월지 등 기술 용어를 내세우지 않으며 내부 참조 ID와 한자는 독자에게 복사하지 않는다.'};
}
module.exports={build,forTopic,TOPIC_POINTS};
