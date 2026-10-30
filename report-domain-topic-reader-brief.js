'use strict';
// Actual, source-scoped editorial assignment for every active domain paragraph.
// No future event, real-life trait, or extra natal fact is derived here.
// Unlike a generic "avoid repetition" instruction, these are different
// questions and different hypothetical contrasts for each PAID topic.
const usedPaths=require('./report-source-ledger').usedPaths;
const EDITORIAL=Object.freeze({
 money:Object.freeze({
  earning:['수입 활동에 연결되는 전통 분류가 무엇이고 어떤 활동의 대가인지','직접 무언가를 만들어 대가를 받는 가상 선택과 이미 있는 자원을 활용하는 가상 선택','지출 습관이나 실제 소득을 설명하지 않는다'],
  spending:['자원을 보유하는 상징과 지출을 선택하는 해석은 어떻게 구별되는가','필요한 물건을 지금 사는 가상 선택과 뒤에 쓸 자원을 남기는 가상 선택','돈을 잘 번다, 아낀다는 성격 판정을 되풀이하지 않는다']
 }),
 career:Object.freeze({
  workstyle:['일을 수행하거나 표현·학습하는 상징 중 실제 확인된 것은 무엇인가','새로운 과업의 결과를 보여 주는 단계와 작업 방법을 배우는 단계를 구별하는 가상 상황','실제 업무 속도와 능력을 재단하지 않는다'],
  teamwork:['동료와 같은 일을 맡는 상황에서 역할·규칙과 관련된 전통 분류가 말하는 범위는 무엇인가','역할을 나눠 맡는 가상 상황과 서로의 책임을 조정하는 가상 상황','학습 속도 또는 결과물의 성과를 협업 능력으로 바꿔 말하지 않는다'],
  growth:['배움과 익힘을 상징하는 계산 자료가 어느 출생 위치에 실제 있는가','처음 배우는 작업의 순서를 익히는 가상 상황과 익힌 것을 다시 점검하는 가상 상황','높은 학습 능력이나 승진 가능성을 추정하지 않는다']
 }),
 relationship:Object.freeze({
  closeness:['출생 날의 실제 숨은 글자 분류가 친밀감이라는 질문에 설명할 수 있는 범위는 어디까지인가','처음 서로를 알아가는 가상 대화와 오래 아는 사람에게 기대를 설명하는 가상 대화','실제 연애·결혼 경험이나 상대의 마음을 꾸며내지 않는다'],
  expression:['표현과 관련된 실제 계산 분류는 어떤 상황에서 설명의 출발점이 되는가','마음을 표현하는 가상 상황과 서운한 이유를 설명하는 가상 상황','소득을 만드는 식상의 풀이를 애정 능력의 증거로 바꾸지 않는다']
 }),
 stress:Object.freeze({
  trigger:['규칙·요구·압박과 관련된 전통 분류의 해석 가능 범위는 무엇인가','예상하지 못한 마감 요청을 받는 가상 상황과 평소 역할을 수행하는 가상 상황','실제 스트레스 강도·불안·건강 증상을 추정하지 않는다'],
  response:['배움·보호 관련 전통 분류를 회복이라는 질문에 적용할 수 있는 범위는 무엇인가','낯선 설명을 다시 듣는 가상 상황과 이미 이해한 절차를 반복하는 가상 상황','실제 회복력이나 상담·치료 필요성을 추정하지 않는다']
 })
});
const GROUPS=Object.freeze({
 '정재':'재성','편재':'재성','식신':'식상','상관':'식상',
 '정관':'관성','편관':'관성','정인':'인성','편인':'인성',
 '비견':'비겁','겁재':'비겁'
});
// An editor may suggest a HYPOTHETICAL scene only when that traditional
// ten-god GROUP is actually present in the cited rows for this topic.
// Do not ask the model to illustrate a missing category as personal behavior.
const CATEGORY_SCENES=Object.freeze({
 money:Object.freeze({
  earning:Object.freeze({
   재성:['가상의 물품 거래에서 받을 대가와 투입 자원을 비교한다','같은 거래에서 관리해야 할 비용과 조건을 다시 확인한다'],
   식상:['가상의 주문에서 직접 제작할 결과물과 약속한 범위를 정한다','같은 주문에서 제작 과정과 납품 약속 사이의 기준을 비교한다']
  }),
  spending:Object.freeze({
   재성:['가상의 구매에서 지금 사용할 자원과 남겨 둘 자원을 구분한다','같은 구매에서 보유하는 선택과 사용하는 선택의 조건을 비교한다']
  })
 }),
 career:Object.freeze({
  workstyle:Object.freeze({
   식상:['가상의 업무에서 결과물을 만들고 전달하는 단계에 초점을 둔다','같은 업무에서 바뀐 전달 조건에 맞춰 결과물 설명을 구분한다'],
   인성:['가상의 업무에서 새 방법을 배우고 적용하는 단계에 초점을 둔다','같은 업무에서 배운 절차와 적용 전 확인할 조건을 구분한다']
  }),
  teamwork:Object.freeze({
   비겁:['가상의 공동 작업에서 참여자의 역할을 나누는 질문을 다룬다','같은 공동 작업에서 맡은 역할이 겹칠 때 조정할 조건을 비교한다'],
   관성:['가상의 조직 업무에서 규칙과 승인 책임을 구분한다','같은 조직 업무에서 규칙을 지키는 것과 승인을 맡는 조건을 비교한다']
  }),
  growth:Object.freeze({
   인성:['가상의 교육에서 설명을 이해하고 다시 확인하는 과정을 살핀다','같은 교육에서 익힌 내용을 새 상황에 적용하기 전 조건을 구분한다']
  })
 }),
 relationship:Object.freeze({
  closeness:Object.freeze({
   비겁:['가상의 친밀한 관계에서 함께 맡는 역할을 설명하는 대화를 가정한다','같은 관계에서 상대와 각자의 몫을 다시 합의하는 대화를 가정한다'],
   식상:['가상의 친밀한 관계에서 마음을 전하는 대화를 가정한다','같은 관계에서 전달한 뜻을 서로 확인하는 대화를 가정한다'],
   재성:['가상의 친밀한 관계에서 공동 자원을 다루는 조건을 이야기한다','같은 관계에서 각자의 자원 사용 조건을 확인하는 대화를 가정한다'],
   관성:['가상의 친밀한 관계에서 약속과 책임을 협의하는 대화를 가정한다','같은 관계에서 약속의 범위가 달라질 때 조정을 이야기한다'],
   인성:['가상의 친밀한 관계에서 서로 필요한 도움을 이야기한다','같은 관계에서 지원을 받는 조건과 경계를 확인하는 대화를 가정한다']
  }),
  expression:Object.freeze({
   식상:['가상의 대화에서 자신의 뜻을 표현하는 방식을 설명한다','같은 대화에서 표현한 뜻과 상대가 이해한 뜻을 비교한다']
  })
 }),
 stress:Object.freeze({
  trigger:Object.freeze({
   관성:['가상의 일정에서 외부 규칙과 맡은 책임을 확인하는 상황을 놓는다','같은 일정에서 예상하지 못한 요구가 생겼을 때 범위를 다시 확인한다']
  }),
  response:Object.freeze({
   인성:['가상의 어려운 과제에서 설명과 도움을 구하는 상황을 놓는다','같은 과제에서 익힌 방법을 다시 점검하는 상황과 비교한다']
  })
 })
});
// Age is only a writing-context boundary, NEVER an observed trait,
// a gender/MBTI inference or a change to the natal chart. Conservative at
// the 18th-birthday calendar boundary (lunar dates may cross civil years).
function readerAgeBand(packet){
 const birth=packet?.calculationInput?.birthDate;
 const year=packet?.targetYear?.year;
 if(!/^\d{4}-\d{2}-\d{2}$/.test(birth||'')||
    !Number.isInteger(year))return 'unknown';
 const diff=year-Number(birth.slice(0,4));
 if(diff<0||diff>125)return 'unknown';
 return diff<=18||(diff===19&&packet.calculationInput.calendar==='lunar')?
  'minor':'adult';
}
const MINOR_QUESTIONS=Object.freeze({
 money:{earning:'정해진 재료와 시간 안에서 무엇을 만들어 나눌지 판단할 때 어떤 상징이 근거가 되는가. 미래 소득을 예언하지 않는다',
  spending:'용돈이나 준비물처럼 한정된 자원을 남겨 둘지 사용할지 구별하는 질문이다. 실제 소비 습관을 단정하지 않는다'},
 career:{workstyle:'가상의 학습이나 만들기 활동에서 익히는 단계와 표현하는 단계는 어떻게 다른가. 실제 직업 적성이나 채용 결과는 예언하지 않는다',
  teamwork:'친구들과 하는 가상 공동 활동에서 역할을 나누는 일과 규칙을 지키는 일을 어떻게 구별하는가',
  growth:'새로운 학습 방법을 이해하고 연습하는 상황에서 계산된 전통 분류의 뜻은 무엇인가. 성적이나 재능을 단정하지 않는다'},
 relationship:{closeness:'가족이나 친구와 가까워지는 상황에서 함께할 몫과 약속을 구별하는 질문이다. 연애나 결혼을 예언하지 않는다',
  expression:'친구에게 마음을 표현하거나 상대의 말을 이해하는 두 가상 대화의 질문을 구별한다'},
 stress:{trigger:'가상의 과제나 모임에서 시간과 약속이 달라졌을 때 규칙의 뜻을 설명한다. 실제 건강이나 불안을 예언하지 않는다',
  response:'어려운 학습 내용을 다시 설명받는 가상의 상황에서 도움과 배움을 구별한다. 회복력이나 건강을 판단하지 않는다'}
});
const MINOR_SCENES=Object.freeze({
 money:{
  earning:{재성:['가상의 학급 나눔 행사에 쓸 재료의 수와 쓰임을 정한다','그 활동에서 남은 재료를 다른 날에 쓸지 살펴본다'],
   식상:['가상의 만들기 시간에 완성할 작품과 준비 시간을 구분한다','그 활동에서 완성한 것을 다른 사람에게 설명하는 순서를 정한다']},
  spending:{재성:['가상의 준비물 목록에서 필요한 것과 이미 있는 것을 구별한다','같은 목록에서 지금 쓸 준비물과 나중에 남길 것을 구별한다']}
 },
 career:{
  workstyle:{식상:['가상의 만들기 수업에서 완성한 것을 설명하는 단계를 살핀다','같은 수업에서 다른 설명 방법을 비교한다'],
   인성:['가상의 새 놀이 규칙을 배운 뒤 적용하는 상황을 살핀다','같은 놀이에서 규칙을 다시 물어보는 조건을 비교한다']},
  teamwork:{비겁:['가상의 모둠 활동에서 친구들과 각자의 역할을 나눈다','같은 모둠에서 역할이 겹칠 때 다시 합의하는 상황을 본다'],
   관성:['가상의 모둠 활동에서 정해진 규칙을 읽는다','같은 활동에서 약속이 바뀌었을 때 함께 확인하는 상황을 본다']},
  growth:{인성:['가상의 공부 시간에 처음 배운 내용을 다시 설명한다','같은 공부에서 새로운 문제에 적용할 때 도움을 받는 상황을 비교한다']}
 },
 relationship:{
  closeness:{비겁:['가상의 친구 놀이에서 각자의 역할을 말한다','같은 놀이에서 친구가 하고 싶은 역할을 다시 묻는다'],
   식상:['가상의 친구 대화에서 자기 마음을 표현한다','같은 대화에서 친구의 대답을 다시 확인한다'],
   재성:['가상의 가족 활동에서 함께 쓸 물건을 나눈다','같은 활동에서 서로 필요한 물건을 묻는다'],
   관성:['가상의 친구 약속에서 정한 시간을 확인한다','같은 약속이 바뀌었을 때 서로 동의하는지 묻는다'],
   인성:['가상의 가족 대화에서 도움을 요청한다','같은 대화에서 어떤 도움이 필요한지 다시 설명한다']},
  expression:{식상:['가상의 친구 대화에서 기쁜 마음을 말한다','같은 대화에서 친구가 이해했는지 다시 묻는다']}
 },
 stress:{
  trigger:{관성:['가상의 모둠 과제에서 정해진 약속을 확인한다','같은 과제의 시간이 바뀌면 무엇을 다시 정해야 하는지 살핀다']},
  response:{인성:['가상의 어려운 수업에서 설명을 다시 듣는다','같은 수업에서 도움받은 뒤 자신이 이해한 것을 확인한다']}
 }
});
function groundedScene(chapterId,topicId,groups,ageBand='unknown'){
 const available=(ageBand==='minor'?MINOR_SCENES:CATEGORY_SCENES)[chapterId]?.[topicId]||{};
 const supported=groups.filter(g=>available[g]);
 if(!supported.length)return {
  text:'이 항목에 맞는 계산 분류가 확인되지 않아 가상 생활 장면으로 설명을 보충하지 않는다.',
  included:[],unavailable:groups,categorySupported:false,
  contrastMode:'no-grounded-category'
 };
 const first=supported[0],next=supported[1];
 // Past copies asked EVERY reader to compare two scenes, even where only
 // one source category was verified. That padded the report with the same
 // conditional A/B template. Only two genuinely different cited groups
 // can justify a group-to-group comparison.
 const text=next?
  '실제로 확인된 '+first+' 분류에 해당하는 설명용 상황: '+available[first][0]+
  '. 별도로 확인된 '+next+' 분류에 해당하는 다른 상황: '+available[next][0]+
  '. 두 상황의 비교는 각각의 출처 의미가 다를 때만 사용한다. 반드시 두 장면을 모두 쓰거나 유불리·실제 결과를 만들어서는 안 된다.':
  '실제로 확인된 '+first+' 분류에 해당하는 설명용 가상 상황: '+available[first][0]+
  '. 다른 독립 분류를 확인하지 않았으므로 조건 A/조건 B를 억지로 대비하거나 두 번째 일반 조언을 별도 심화 풀이로 판매하지 않는다.';
 return {
  text,
  included:supported.slice(0,2),
  unavailable:groups.filter(g=>!supported.slice(0,2).includes(g)),
  categorySupported:true,
  contrastMode:next?'two-verified-categories':'single-grounded-category'
 };
}
// The two roles within ONE traditional group can answer different reader
// questions. Use only original source rows with their canonical glossary.
// Do not mistake the existence of a hidden stem for its strength/priority.
function exactRoleLens(rows,illustratedGroups){
 const eligible=rows.filter(row=>row?.id?.startsWith('natal.')&&
  GROUPS[row.tenGod]&&row.position&&row.layer&&row.stem&&
  typeof row.traditionalMeaning==='string'&&row.traditionalMeaning.trim());
 // The two examples in groundedScene describe different categories when
 // possible. The previously selected "first two distinct ten-gods" could
 // accidentally pick two wealth entries and OMIT the actual output symbol
 // used by the reader's example. Select by confirmed scene categories,
 // not by first source row or presumed favorable traditional priority.
 const chosenRows=[];
 const preferred=(illustratedGroups||[]).filter((g,i,a)=>a.indexOf(g)===i);
 for(const group of preferred){
  const found=eligible.find(row=>GROUPS[row.tenGod]===group&&
   !chosenRows.some(x=>x.id===row.id));
  if(found)chosenRows.push(found);
  if(chosenRows.length===2)break;
 }
 // A one-category explanation may distinguish its two genuinely different
 // ten-gods; never count multiple placements of the SAME god as two roles.
 if(chosenRows.length===1&&preferred.length===1){
  const another=eligible.find(row=>GROUPS[row.tenGod]===preferred[0]&&
   row.tenGod!==chosenRows[0].tenGod);
  if(another)chosenRows.push(another);
 }
 // If a canonical glossary is unavailable, do NOT fill the remaining
 // category with an unrelated source or invent its meaning.
 const chosen=chosenRows.map(row=>Object.freeze({
  sourceId:row.id,sourcePosition:row.position,
  sourceLayer:row.layer,observedStem:row.stem,tenGod:row.tenGod,
  group:GROUPS[row.tenGod],traditionalMeaning:row.traditionalMeaning,
  observedLifeExperience:false,traditionalPrioritySelected:false
 }));
 const two=chosen.length===2;
 const sameGroup=two&&chosen[0].group===chosen[1].group;
 const text=!chosen.length?
  '정확한 출생 글자의 전통적 뜻을 확인할 수 없어 구체적인 인물 해석을 보충하지 않는다.':
  chosen.map((x,i)=>'출처 '+(i+1)+' '+x.sourceId+
   ' ('+x.sourcePosition+' '+x.sourceLayer+' '+x.observedStem+
   '): '+x.traditionalMeaning).join(' / ')+
   (two?
    sameGroup?' 같은 분류군 안의 서로 다른 세부 관계로 가상 질문을 구별한다.':
    ' 실제 확인된 두 분류군의 다른 뜻을 가상 상황에서 비교하되 전통적 우선순위나 실제 작용은 정하지 않는다.':
    ' 이 출처 하나만으로 존재하지 않는 두 번째 분류를 만들어 풀이하지 않는다.')+
   ' 계산 분류는 실제 성격·수입·직업·관계 이력이나 강약을 관찰한 증거가 아니다.';
 return Object.freeze({kind:'exact-natal-ten-god-source-lens-v1',
  sourceRoles:chosen,hasTwoDifferentRoles:two,
  sameTraditionalGroupDifferentRoles:sameGroup,
  illustratedGroupRolesAligned:chosen.every(x=>preferred.includes(x.group)),
  contrastedGroups:[...new Set(chosen.map(x=>x.group))],
  selectionMethod:'match-verified-scene-categories-no-traditional-priority',
  independentLifeProof:false,priorityAssessed:false,
  internalWritingContrast:text});
}
// A paragraph that is assigned a concrete traditional category may not
// pass its paid basis check using only generic facts or an unrelated category.
// This checks cited provider output, not mere availability in the prompt.
// No life traits, priority, or two-source comparison is inferred.
function citedRoleCoverage(brief,refs,source){
 const assigned=brief?.sourceGroups||[];
 if(!assigned.length)return {required:false,pass:true,citedGroups:[]};
 const citedGroups=[...new Set((refs||[]).map(id=>
  GROUPS[source?.[id]?.tenGod]).filter(Boolean))];
 return {required:true,pass:assigned.some(g=>citedGroups.includes(g)),
  citedGroups};
}
function build({chapterId,topicId,topic,priorSections,readerAgeBand:ageBand='unknown'}={}){
 const spec=EDITORIAL[chapterId]?.[topicId];
 if(!spec||!topic||topic.mode==='state-limits')return null;
 const rows=topic.citableFacts||[];
 const cited=rows.map(x=>x.id);
 if(!cited.length||new Set(cited).size!==cited.length)
  throw Error('DOMAIN_READER_BRIEF_MISSING_EXACT_SOURCE:'+chapterId+':'+topicId);
 // A prior paragraph owns evidence only if its RESTORED reference list
 // actually cited that source, not because its chapter was eligible.
 const previouslyUsed=new Set((priorSections||[]).flatMap(s=>
  (s.bodyTopics||[]).flatMap(id=>usedPaths(s,id))));
 const usedPreviously=cited.filter(id=>previouslyUsed.has(id));
 const groups=[...new Set(rows.map(x=>GROUPS[x.tenGod]).filter(Boolean))];
 const distinctPositions=[...new Set(rows.map(x=>x.position).filter(Boolean))];
 const separateSymbolGroups=groups.length>=2;
 const scene=groundedScene(chapterId,topicId,groups,ageBand);
 const roleLens=exactRoleLens(rows,scene.included);
 return Object.freeze({
  kind:'per-topic-source-grounded-reader-question-v1',
  readerQuestion:(ageBand==='minor'?MINOR_QUESTIONS[chapterId]?.[topicId]:null)||spec[0],
  readerAgeWritingBand:ageBand,hypotheticalContrast:scene.text,
  contrastMode:scene.contrastMode,
  exactRoleLens:roleLens,
  sourceCategoryBoundScene:scene.categorySupported,
  illustratedSourceGroups:scene.included,
  unillustratedSourceGroups:scene.unavailable,
  differentFromOtherTopics:spec[2],
  sourceRefs:cited,sourceGroups:groups,
  previouslyCitedRefs:usedPreviously,
  distinctPositionCount:distinctPositions.length,
  independentCategoriesPresent:separateSymbolGroups,
  sourceComparison:separateSymbolGroups?
   '서로 다른 전통 분류의 의미는 출처마다 구분한다. 설명용 가상 장면은 실제 출처가 있는 분류에만 허용하고 나머지 분류를 만들어내지 않는다. 분류 사이의 실제 작용·강약은 계산하지 않았다.':
   '전통 분류가 같거나 한 종류뿐이면 없는 다른 종류를 만들어 비교하거나 별도 성격·강도·길흉을 발명하지 않는다.',
  previousSourceConstraint:usedPreviously.length?
   '이미 앞 장에서 인용한 계산 위치가 있다. 그 결론을 분야 이름만 바꾸어 반복하지 않고, 이 질문의 새 근거/차이를 설명할 수 없는 선택 문단은 null로 둔다.':
   '앞 장의 출처 재사용은 확인되지 않았다. 새로운 실제 행동을 관찰했다고 가정하지 않는다.',
  observedCustomerBehavior:false,realWorldOutcomeEstablished:false,
  citationScopeIndependentOfChapterHeading:true
 });
}
module.exports={build,EDITORIAL,readerAgeBand,citedRoleCoverage};
