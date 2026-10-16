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
 const collision=(root.dayMasterRootCases||[]).filter(x=>x.natal?.hasDirectClash).map(x=>({
   sourceId:x.rootId,location:x.rootPosition,natalClash:true
  }));
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
    '원국 안에서 뿌리 위치에 충이 함께 계산된 곳: '+
     collision.map(x=>LOCATION[x.location]+'지 ('+x.sourceId+')').join(', ')+
     '. 충이 뿌리를 없앴다는 뜻이 아니다.':
    '확인된 일간 뿌리 위치에 직접 충이 계산되지 않았다. 다른 영향이나 실제 생활의 안정성을 보장하지 않는다.',
   question:collision.length?
    '출생 사주 안에서 어떤 뿌리에 충이 걸리는지 위치를 확인한다. 충 하나로 지장간의 소멸이나 뿌리의 강도 하락을 예측하지 않는다.':
    '직접 확인된 뿌리 충이 없다고 해서 모든 오행 변화나 일의 안정성을 보장하지 않는다.'}
 ];
 return {
  version:'chart-evidence-contrast-v1',
  chartSignature:[packet.chart.year,packet.chart.month,packet.chart.day,packet.chart.hour||'hour-unknown'].join('/'),
  monthAndDay:seasonContext,
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
const TOPIC_READER_QUESTIONS={
 temperament:{
  contrastQuestion:'태어난 달의 계절적 배경과 바깥에 드러난 글자가 주는 도움의 방향은 왜 별개인가?',
  reasoningTask:'계절 전환기라는 계산과 겉글자의 오행 관계를 각각 확인하고, 겉에 드러난 물의 도움을 전통적으로 배움·이해·지원의 상징으로 분류하는 이유를 설명한다. 월의 숨은 글자가 가리키는 자원 활용·압박의 상징은 겉글자의 실제 반대 성격이 아님을 구분한다. 계절 우세가 미정이라는 이유로 이미 확인된 겉글자 관계까지 미정이라고 쓰지 않는다.',
  hypotheticalQuestion:'새로운 일을 앞두고 정보를 살피는 가상의 상황이라면, 배움·지원의 상징은 무엇을 비교하는 실마리이고 무엇을 증명하지 못하는가? 실제 독자의 학습 능력·선택을 추정하지 않는다.',
  interpretivePayoff:'이 문단을 읽은 사람은 계절 배경, 겉글자의 지원 관계, 숨은 글자의 별도 의미를 구별할 수 있어야 한다.'
 },
 strength:{
  contrastQuestion:'태어난 날·시간에 실제 뿌리가 있는 것과 그 자리들에 충이 겹친다는 사실을 왜 동시에 인정해야 하는가?',
  reasoningTask:'같은 글자의 뿌리가 있는 정확한 자리와 없는 자리를 구별하고, 원국 충은 그 자리에 계산되는 관계이지 확인된 뿌리를 지우는 명령이 아님을 설명한다. 여러 뿌리의 존재를 강도 점수로 바꾸지 말고, 같은 출처를 두 번 요약하지 않는다.',
  hypotheticalQuestion:'사주에 충이 있으면 뿌리가 없어졌다고 생각하는 가상의 질문에, 관찰된 뿌리 위치·겹치는 충·판단 보류 사유를 순서대로 답한다. 독자의 고집·관계·직장 사건을 만들어 내지 않는다.',
  interpretivePayoff:'이 문단을 읽은 사람은 뿌리가 확인된 위치와 충이 함께 계산된 위치, 충만으로 뿌리 소멸을 판단하지 못하는 이유를 이해해야 한다.'
 }
};
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
  return {kind,sourceRefs,calculatedExplanation:item.calculatedExplanation,question:item.question};
 });
 return {scope:topic,points,readerReasoning:TOPIC_READER_QUESTIONS[topic],
  policy:'두 계산 차이의 연결 이유와 전통적 해석 범위를 설명한 뒤, readerReasoning.hypotheticalQuestion에 가정형으로 답한다. 가정은 실제 개인 경험이 아니다. 한계 설명은 문단 끝에 한 번만 두며, 다른 문단의 한계를 재차 늘어놓거나 여러 기운의 균형처럼 결론 내리지 않는다. 고객용 본문에는 내부 참조 ID 및 한자를 옮기지 않는다.'};
}
module.exports={build,forTopic,TOPIC_POINTS};
