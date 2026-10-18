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
// Five-element interactions of the TWO verified month positions, not
// a verdict about realized 制化, seasonal governance, personality or fate.
const MONTH_ELEMENT_PAIR={
 'same-element':{kind:'same-element',explanation:'출생월의 겉글자와 본기가 같은 오행에 속한다. 같은 십성이라는 뜻은 아니다.'},
 resource:{kind:'visible-generates-hidden',explanation:'출생월 겉글자의 오행이 본기 오행을 생하는 일반적인 오행 관계다.'},
 output:{kind:'hidden-generates-visible',explanation:'출생월 본기의 오행이 겉글자의 오행을 생하는 일반적인 오행 관계다.'},
 'control-on-day':{kind:'hidden-controls-visible',explanation:'출생월 본기의 오행이 겉글자의 오행을 극하는 일반적인 오행 관계다.'},
 'day-controls':{kind:'visible-controls-hidden',explanation:'출생월 겉글자의 오행이 본기 오행을 극하는 일반적인 오행 관계다.'}
};
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
 // Use the SAME independently calculated month positions that the premium
 // refs cite. This is a general Five Element link, not confirmed 财克印,
 // a resolved hidden-stem governing day, or a prediction of inner conflict.
 const seasonMath=require('./report-seasonal-evidence');
 const visibleElement=seasonMath.ELEMENTS[monthGod.stem];
 const hiddenElement=seasonMath.ELEMENTS[mainStem];
 if(!visibleElement||!hiddenElement)return null;
 const elementRelation=seasonMath.relation(hiddenElement,visibleElement);
 const monthPair=MONTH_ELEMENT_PAIR[elementRelation];
 if(!monthPair)return null;
 const monthElementLink={...monthPair,visibleSourceId:'natal.month.stem',
  hiddenSourceId:'natal.month.hidden.'+mainStem,
  visibleElement,hiddenElement,
  inference:'element-relation-only',governingHiddenStem:'unresolved',
  realizedInteraction:'not-assessed',characterTrait:'not-measured'};
 const monthTenGodContext={
  monthStem:{sourceId:'natal.month.stem',stem:monthGod.stem,
   tenGod:monthGod.stemTenGod,meaning:facts.tenGodGlossary[monthGod.stemTenGod]||null},
  monthMainHidden:{sourceId:'natal.month.hidden.'+mainStem,stem:mainStem,
   tenGod:mainHidden.tenGod,meaning:facts.tenGodGlossary[mainHidden.tenGod]||null},
  sameClassification:monthGod.stemTenGod===mainHidden.tenGod,
  elementLink:monthElementLink,
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
 strength:['month-ten-god-pair']
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
// Specific editorial situations for ACTUAL calculated ten-god labels.
// These are unanswered questions in one imagined scene, NOT user behaviors,
// traits, favorable-element verdicts, or an MBTI-to-ten-god correspondence.
const TEN_GOD_DECISION={
 '비견':'함께할 사람과 자신이 맡을 일을 어떻게 나눌지',
 '겁재':'공동으로 쓰는 자원과 서로 맡을 몫을 어떻게 정할지',
 '식신':'만들 결과물을 어떤 순서로 준비하고 보여줄지',
 '상관':'기존 방식에 다른 아이디어를 어떻게 제안할지',
 '정재':'반복해서 드는 비용을 어떻게 감당할지',
 '편재':'필요한 돈과 재료를 어디서 마련하고 어떻게 쓸지',
 '정관':'정해진 규칙과 맡을 역할을 어떻게 이해할지',
 '편관':'갑작스러운 요구가 생기면 책임 범위를 어떻게 정할지',
 '정인':'새로운 일을 누구에게 배우고 어떤 도움을 받을지',
 '편인':'처음 접하는 정보를 자기 방식으로 어떻게 이해할지'
};
// Conventional reading lenses, NOT measured traits. Each entry is tied to
// the real ten-god ID, rather than a generic life-advice paragraph.
const TEN_GOD_READING={
 '비견':'스스로 맡을 몫과 다른 사람과 나눌 몫을 구별하는 태도',
 '겁재':'같이 쓰는 자원과 경쟁하는 상황에서 자기 몫을 의식하는 태도',
 '식신':'생각을 실제 결과물로 차근차근 만들어 표현하는 태도',
 '상관':'정해진 방식에 다른 표현이나 방법을 제안하는 태도',
 '정재':'꾸준히 관리해야 할 돈과 일의 지속성을 따지는 태도',
 '편재':'여러 곳의 자원을 살피고 필요한 곳에 활용하는 태도',
 '정관':'정해진 규칙과 맡은 역할을 기준으로 판단하는 태도',
 '편관':'갑작스러운 요구나 압박 아래 책임 범위를 살피는 태도',
 '정인':'이미 알려진 지식과 주변의 도움을 받아 이해하는 태도',
 '편인':'새로운 정보를 자기 방식으로 해석하고 이해하는 태도'
};
function monthlyTraditionalReading(month){
 const first=month?.monthStem,second=month?.monthMainHidden;
 const a=TEN_GOD_READING[first?.tenGod],b=TEN_GOD_READING[second?.tenGod];
 if(!a||!b||!first?.sourceId||!second?.sourceId)throw Error('Missing verified month interpretation lens');
 const same=month.sameClassification;
 return {
  status:'conditional-traditional-reading-not-observed-personality',
  first:{sourceId:first.sourceId,tenGod:first.tenGod,reading:a},
  second:{sourceId:second.sourceId,tenGod:second.tenGod,reading:b},
  tentativeThesis:same?
   '태어난 달의 두 위치에서 '+a+'라는 관점이 함께 확인되는 사주로 전통적으로 읽습니다.':
   '태어난 달의 겉에 나타난 글자에서는 '+a+'를, 그 달의 중심 숨은 글자에서는 '+b+'를 각각 살피는 사주로 전통적으로 읽습니다.',
  editorialDuty:'첫 문장에 이 사주에서 읽을 수 있는 전통적 기질의 해석을 평범한 말로 제시한다. 그다음 이 두 위치와 뜻이 왜 그 해석을 뒷받침하는지 짚고, 하나의 가상 상황에서 유리해지는 조건과 고려하지 않으면 불리해지는 조건을 설명한다. 무엇을 확인하라는 보편적 조언만 써서 끝내지 않는다.',
  evidenceLimit:'위 tentativeThesis는 실제 고객 행동을 입증한 것이 아니라 전통적 해석 가설의 문장 예시다. 본문에는 부정문·면책 문구를 반복하지 말고 필요할 때만 한계를 짧게 밝힌다. 같은 분류 두 개를 성향이 두 배 강하다고 주장하거나 서로 다른 분류 두 개를 내적 갈등으로 확정하지 않는다. 실제로 그렇게 생각하거나 행동했다는 관찰·심리검사·미래 예언이 아니다.'
 };
}
// The principal month hidden-stem category selects the *type* of imagined
// situation; the visible month category contributes its independently
// calculated decision question. Previously all 100 possible pairs were
// forced into "preparing a new job", making paid prose repetitive.
const TEN_GOD_SCENE={
 비견:'함께하는 활동에서 맡을 일을 나눌',
 겁재:'공동 물품이나 예산의 몫을 정할',
 식신:'구상한 결과물을 실제로 만들',
 상관:'기존 방식 대신 다른 아이디어를 제안할',
 정재:'한 달의 반복 지출을 계획할',
 편재:'필요한 물건과 재료를 여러 곳에서 마련할',
 정관:'정해진 절차에 따라 역할을 맡을',
 편관:'예상치 못한 부탁의 책임 범위를 정할',
 정인:'누군가의 설명을 듣고 새로운 내용을 배울',
 편인:'낯선 자료를 읽고 뜻을 정리할'
};
function monthHypothetical(visibleKind,mainKind,sameClassification){
 const first=TEN_GOD_DECISION[visibleKind],second=TEN_GOD_DECISION[mainKind];
 const scene=TEN_GOD_SCENE[mainKind];
 if(!first||!second||!scene)throw Error('Missing verified month ten-god everyday question');
 // These are hypothetical, not the person's real work, spending, behavior,
 // ability or biography. All labels and source IDs stay internal.
 const startingPoint='가상의 상황: '+scene+' 때 ';
 return sameClassification?
  startingPoint+first+'를 결정해야 한다고 가정한다. 같은 분류가 두 계산 위치에 있음을 풀이하되 그 사람이 실제로 그렇게 행동하거나 두 배로 강하다고 말하지 않는다.':
  startingPoint+first+'와 '+second+'를 함께 고민한다고 가정한다. 이 두 선택 조건을 실제 확인된 출생 위치의 전통적 의미에 연결하되 내부 질문을 그대로 문답 형식으로 옮기거나 실제 경험·내적 갈등으로 단정하지 않는다.';
}
function readerQuestions(contrast,topic){
 const points=contrast.contrastPoints||[];
 const month=points.find(p=>p.kind==='month-vs-day')?.evidence;
 const visible=points.find(p=>p.kind==='visible-support-vs-counter')?.evidence;
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
  const selectedMeaning=meanings[0]||null;
  // A chart can have the visible 'resource' relation AND a monthly 印星
  // (正印/偏印). In that case an identical 'learning' scene in BOTH
  // paragraphs generated two different-looking copies of one conclusion.
  // Do not fabricate another trait to fill the first slot: give visible qi
  // the distinct question of available SUPPORT conditions, and leave the
  // month-ten-god information/learning decision to the paired second slot.
  const monthLearning=['정인','편인'].includes(monthTenGod?.monthStem?.tenGod);
  const separatedResourceQuestion=relationTypes.includes('resource')&&monthLearning;
  const dynamicExample=relationTypes.includes('resource')?
   separatedResourceQuestion?
    '가상의 상황: 도움이나 자료를 제공받을 수 있다고 가정하고 어떤 지원이 가능한지, 어떤 조건에서 도움을 받을 수 있는지를 겉글자에 실제로 확인된 전통적 도움 관계로 풀이한다. 여기서는 정보를 자기 방식으로 이해하는 과정이나 돈과 재료의 마련 방법을 다루지 않는다.':
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
   interpretivePayoff:'독자는 출생월의 계절 조건을 실제 성격의 증거로 혼동하지 않고, 겉글자에서 확인된 '+(selectedMeaning||'오행 관계')+'의 전통적인 질문을 생활 속 가정에 적용하는 이유와 선택 기준을 이해한다.',
   readerValuePlan:{
    primaryTraditionalQuestion:separatedResourceQuestion?
     '겉글자의 전통적 도움 관계가 질문하는 외부 지원의 조건과 범위':
     selectedMeaning||'계산된 겉글자 관계의 전통적인 뜻',
    ...(separatedResourceQuestion?{
     distinctFromMonthPair:'첫 문단에서는 외부에서 제공받는 도움의 조건만 해석한다. 두 번째 문단의 편인·정인에서 정보 이해·배움의 방법을 풀이하므로 같은 학습 결론을 두 번 쓰지 않는다. 지원이 있었다는 실제 과거를 꾸미지 않는다.'
    }:{}),
    customerSequence:'핵심 해석 한 문장 → 그 근거가 출생 계절·겉글자 어느 쪽인지 밝힘 → 가상의 선택 상황 하나에서 뜻을 풀어 설명',
    advantageQuestion:'계절과 겉글자의 계산에서 핵심 풀이와 겹치지 않는 별도 의미가 확인될 때, 가상 선택의 어떤 조건에서 해석이 유리해지는가? 별도 의미가 없으면 선택 문단은 생략한다.',
    riskQuestion:'같은 가상 선택에서 실제로 확인된 계절·겉글자 관계의 적용 조건을 놓치면 무엇이 불리해지는가? 실제 실패 경험이나 성격 결함을 지어내지 않는다.',
    prohibitedShortcut:'계절 전환만으로 적응력·유연성을, 겉글자 관계의 개수만으로 능력·성격 균형을 만들어내지 않는다.'
   }
  };
 }
 if(topic==='strength'){
  if(!monthTenGod?.monthStem?.tenGod||!monthTenGod?.monthMainHidden?.tenGod)
   throw Error('Missing verified month ten-god meanings for reader brief');
  const visibleKind=monthTenGod.monthStem.tenGod;
  const mainKind=monthTenGod.monthMainHidden.tenGod;
  const visibleMeaning=monthTenGod.monthStem.meaning;
  const mainMeaning=monthTenGod.monthMainHidden.meaning;
  if(!visibleMeaning||!mainMeaning)
   throw Error('Missing position-bound traditional ten-god meaning');
  const comparison=monthTenGod.sameClassification?
   '태어난 달의 두 출처에서 같은 십성 분류를 확인했다. 반대 성향을 만들지 않는다. ':
   '태어난 달의 겉글자와 중심 숨은 글자에서 서로 다른 십성 분류를 확인했다. 서로 다른 위치의 뜻을 구별한다. ';
  const elementLink=monthTenGod.elementLink;
  if(!elementLink||elementLink.visibleSourceId!==monthTenGod.monthStem.sourceId||
     elementLink.hiddenSourceId!==monthTenGod.monthMainHidden.sourceId)
   throw Error('Unverified positional month element relation');
  const readerContext='태어난 달 겉글자의 '+visibleKind+'('+visibleMeaning+')와 중심 숨은 글자의 '+mainKind+'('+mainMeaning+')를 실제 출생 위치별로 구분해 읽는다. '+comparison+
   elementLink.explanation+' 이는 두 글자의 오행 관계일 뿐 실제 갈등이나 강약 판단이 아니다. ';
  const sourceAudit='실제 출생월 겉글자 '+monthTenGod.monthStem.sourceId+'와 본기 '+monthTenGod.monthMainHidden.sourceId+'의 십성 분류 및 전통적 뜻을 각각 확인한다. 별도 뿌리·충 자료만으로 두 십성을 대신하지 않는다.';
  // Pass only the two source-bound reading lenses, not duplicated provisional prose.
  const {status,first,second}=monthlyTraditionalReading(monthTenGod);
  const traditionalReading={status,first,second};
  const firstEverydayQuestion=TEN_GOD_DECISION[visibleKind];
  const secondEverydayQuestion=TEN_GOD_DECISION[mainKind];
  if(!firstEverydayQuestion||!secondEverydayQuestion)
   throw Error('Missing actual monthly categories for reader comparison');

  return {
   contrastQuestion:'태어난 달의 겉글자와 중심 숨은 글자의 전통적 의미를 근거 있는 하나의 기질 해석으로 어떻게 연결하는가?',
   reasoningTask:readerContext+
    '두 분류의 전통적인 의미와 실제 출생 위치의 차이를 구체적으로 설명한다. 이 문단에는 뿌리·충 자료를 추가 인용하지 않는다. 재산·학습 능력·사건·마음속 균형·성격 양면성을 만들어 내지 않는다.',
   hypotheticalQuestion:monthHypothetical(visibleKind,mainKind,monthTenGod.sameClassification),
   interpretivePayoff:monthTenGod.sameClassification?
    '독자는 같은 전통 분류가 두 출생 위치에 있다는 의미를 이해하되, 성격이나 능력이 두 배 강하다는 주장과 구별한다.':
    '독자는 태어난 달의 두 위치가 설명하는 서로 다른 전통적 의미를 함께 고려할 때의 유리한 조건과 주의할 조건을 이해하며, 이를 실제 성격의 충돌로 단정하지 않는다.',
   readerValuePlan:{
    traditionalReading,
    first:{sourceId:monthTenGod.monthStem.sourceId,tenGod:visibleKind,question:firstEverydayQuestion},
    second:{sourceId:monthTenGod.monthMainHidden.sourceId,tenGod:mainKind,question:secondEverydayQuestion},
    customerSequence:monthTenGod.sameClassification?
     '고정 핵심 판단을 한 가지 조건부 기질 해석으로 먼저 풀기 → 같은 전통 뜻을 지닌 두 출처가 그 풀이를 뒷받침하는 이유를 짧게 설명 → 가상 상황에서 유리한 점과 주의점을 구별':
     '고정 핵심 판단을 한 가지 조건부 기질 해석으로 먼저 풀기 → 두 출생 위치의 서로 다른 전통 뜻을 그 판단의 근거로 연결 → 가상 선택 한 번으로 유리한 점과 놓치기 쉬운 점을 설명',
    advantageQuestion:monthTenGod.sameClassification?
     '같은 뜻을 지닌 실제 두 출처를 근거로 고정된 핵심 판단을 풀이할 때, 가상 선택에서 어떤 조건이 유리하게 작용하는가? 의미가 두 배로 강하다고 주장하지 않는다.':
     '실제 두 출처의 다른 전통 뜻을 고정된 한 가지 기질 해석에 연결할 때, 가상 선택에서 어떤 조건이 유리하게 작용하는가? 두 질문 목록으로 나누지 않는다.',
    riskQuestion:monthTenGod.sameClassification?
     '같은 전통 관점에만 기대는 가상의 선택에서 무엇을 놓치기 쉬운가? 실제 그 사람이 그런 선택을 했다고 단정하지 않는다.':
     '가상 선택에서 실제 두 근거 중 한쪽의 의미만 고려하면 무엇을 놓치는가? 내면 갈등이나 실제 습관을 꾸며 쓰지 않는다.',
    prohibitedShortcut:'전통적 질문의 장단점을 그 사람의 실제 능력·소득·내면 갈등·정해진 행동 습관으로 바꾸지 않는다. 출생월의 본기가 실제로 사령했다고 쓰지 않는다.'
   },
   sourceAudit
  };
 }
 throw Error('Unsupported Saju reader topic: '+topic);
}
// A shared CITE does not license a repeated customer-facing conclusion.
// Machine-readable claim IDs keep the two paid paragraphs' interpretive
// responsibilities distinct, without fabricating another source or trait.
function firstChapterClaimOwnership(contrast,topic){
 const month=contrast.monthTenGodContext;
 const visible=contrast.contrastPoints.find(x=>x.kind==='visible-support-vs-counter')?.evidence;
 const combined=(visible?.support||[]).concat(visible?.counter||[]);
 const overlaps=combined.some(x=>x.relation==='resource')&&
  ['편인','정인'].includes(month?.monthStem?.tenGod);
 const firstKind=month?.monthStem?.tenGod,secondKind=month?.monthMainHidden?.tenGod;
 const firstReading=TEN_GOD_READING[firstKind],secondReading=TEN_GOD_READING[secondKind];
 if(!firstReading||!secondReading)
  throw Error('No verified per-chart month meaning available for core claim ownership');
 const same=firstKind===secondKind;
 if(topic==='temperament')return {
  version:'core-reader-claim-ownership-v1',
  claimIds:['seasonal-context','visible-five-element-relationship'],
  sharedFactId:'natal.month.stem',
  overlappingMonthLearning:overlaps,
  readerConclusion:overlaps?
   '계절과 겉에 확인된 도움 관계를 바탕으로 외부에서 지원을 받을 수 있는 조건과 범위만 해석한다. 실제 지원을 받았다고 단정하지 않는다.':
   '계절과 겉으로 드러난 오행 관계가 전통적으로 설명하는 조건만 해석한다. 실제 성격이나 능력을 확정하지 않는다.',
  reservedForOtherParagraph:'태어난 달의 겉글자에서 확인된 '+firstReading+
   (same?'가 두 출처에 함께 있는 뜻':'와 중심 숨은 글자에서 확인된 '+secondReading)+
   '은 필수 핵심 문단의 해석이다. 계절 설명에 복사하거나 실제 행동으로 단정하지 않는다.',
  visibleHeadline:overlaps?'도움이 가능한 조건과 범위':'계절과 겉글자에서 읽는 기질의 조건'
 };
 if(topic==='strength')return {
  version:'core-reader-claim-ownership-v1',
  claimIds:['month-stem-ten-god-reading','principal-hidden-stem-ten-god-reading','month-pair-element-relation'],
  sharedFactId:'natal.month.stem',
  overlappingMonthLearning:overlaps,
  readerConclusion:(same?
   '태어난 달의 두 계산 위치에서 확인된 '+firstReading+'를 출처별로 구분해 풀이한다. 같은 뜻이 두 곳에 있다고 성격이나 능력이 두 배 강하다고 단정하지 않는다.':
   '태어난 달 겉글자의 '+firstReading+'와 중심 숨은 글자의 '+secondReading+
    '를 한 가지 조건부 기질 풀이로 연결한다.')+
   (overlaps?' 첫 문단의 외부 지원 조건을 다시 설명하지 않는다.':''),
  reservedForOtherParagraph:'계절과 겉글자의 오행 관계는 실제 확인된 경우에만 선택적 첫 문단에서 보충한다. 없는 지원이나 압박 조건을 만들어 반복하지 않는다.',
  visibleHeadline:same?'두 위치의 같은 전통 분류':'태어난 달 두 위치의 다른 전통 의미'
 };
 throw Error('Unsupported first-chapter claim ownership: '+topic);
}
function forTopic(contrast,topic,allowedIds){
 if(!TOPIC_POINTS[topic]||!contrast||!Array.isArray(contrast.contrastPoints))
  throw Error('Unknown or missing grounded core paragraph plan: '+topic);
 const allowed=new Set(allowedIds);
 const points=TOPIC_POINTS[topic].map(kind=>{
  const m=contrast.monthTenGodContext;
  const item=kind==='month-ten-god-pair'&&m?.monthStem?.sourceId&&m?.monthMainHidden?.sourceId?{
   kind,refs:[m.monthStem.sourceId,m.monthMainHidden.sourceId],
   calculatedExplanation:'출생월 겉글자 '+m.monthStem.sourceId+'의 '+m.monthStem.tenGod+'('+m.monthStem.meaning+')와 중심 숨은 글자 '+m.monthMainHidden.sourceId+'의 '+m.monthMainHidden.tenGod+'('+m.monthMainHidden.meaning+')를 계산된 위치별로 비교한다. '+m.elementLink.explanation+' 실제 성격·재산·갈등·강약 또는 숨은 글자의 실제 사령을 계산한 결과는 아니다.',
   question:'서로 다른 출생월 위치 두 곳의 실제 십성과 일반 오행 관계를 확인한다. 본기의 실제 사령·재극인 성립·성격 충돌을 자동 결론 내리지 않는다.'
  }:contrast.contrastPoints.find(p=>p.kind===kind);
  if(!item)throw Error('Missing calculated comparison: '+kind);
  const sourceRefs=item.refs.filter(ref=>allowed.has(ref));
  // Do not introduce a new rejection gate for intentionally incomplete
  // test prompts; canonical evidence validation remains authoritative.
  return {kind,sourceRefs,calculatedExplanation:item.calculatedExplanation,sourceAuditCheck:item.question};
 });
 const {sourceAudit,...readerReasoning}=readerQuestions(contrast,topic);
 return {scope:topic,
  ...(topic==='strength'?{tenGodFocus:contrast.monthTenGodContext}:{}),
  claimOwnership:firstChapterClaimOwnership(contrast,topic),
  points,readerReasoning,
  ...(sourceAudit?{sourceAudit}:{}),
  readerQuestion:topic==='temperament'?
   '기본 기질의 핵심 풀이에서 독립적으로 더할 출생 계절·겉글자 조건이 있는가? 없다면 이 선택 문단은 작성하지 않는다.':
   '태어난 달의 겉글자와 중심 숨은 글자의 실제 전통적 의미로 무엇을 기질의 중심에 읽고, 어떤 조건에서 유리하거나 불리한가?',
  internalEvidenceRole:topic==='temperament'?
   '계절과 겉글자 관계의 계산 근거로만 전통적 기본 기질을 해석':
   '태어난 달의 겉글자와 중심 숨은 글자의 십성 분류가 기본 해석 근거다. 뿌리·충은 추가 보조 검증 근거일 뿐 성격 강도로 확정하지 않음',
  policy:topic==='temperament'?
   '월의 계절·전환 조건과 실제 겉글자의 관계를 readerQuestion에 연결한다. 숨은 십성이나 뿌리·충을 이 문단의 필수 주제로 추가하지 않는다. 내부 계산표를 독자용 글에 옮기지 않고 전통적 질문과 의미를 쉬운 상황으로 풀이한다. 검증 한계는 basis.limit에 기록하고 개인의 능력과 행동을 단정하지 않는다.':
   '먼저 tenGodFocus.monthStem과 tenGodFocus.monthMainHidden의 실제 십성 분류와 전통적 의미, 두 출처의 elementLink에 확인된 오행 관계를 readerQuestion에 연결한다. 월간과 월지 본기는 다른 출처이며 같더라도 거짓 갈등을 만들지 않는다. sourceAudit와 points는 내부 출처·계산 검증용이며 독자에게 뿌리·충 근거를 이 문단의 해석에 추가하지 않는다. 실제 확인된 명리 상징이 허용하는 기질 해석과 그 조건을 쉬운 가상 상황으로 풀고, 실제 성격·능력·사건은 지어내지 않는다. 한계는 basis.limit에 기록한다. 제목과 문단 라벨에 뿌리·충·통근·월지 등 기술 용어를 내세우지 않으며 내부 참조 ID와 한자는 독자에게 복사하지 않는다.'};
}
module.exports={build,forTopic,firstChapterClaimOwnership,TOPIC_POINTS,monthHypothetical,TEN_GOD_SCENE};
