'use strict';
// Actual paid annual MONEY/CAREER chapter: a chart-qualified new subtype
// compared with a natal subtype in the SAME verified classification family.
// The normal 2027 chapter can discuss annual symbolism on its own. These
// two domain chapters must ONLY add a distinct sourced comparison.
// Never turn a classification difference into a stronger outcome or event.
const CATEGORIES=Object.freeze({
 '정재':'자원을 지속적으로 관리하는 질문',
 '편재':'외부에서 자원을 활용하는 질문',
 '식신':'결과를 만들어 내고 표현하는 질문',
 '상관':'표현하고 기존 규칙에 반응하는 질문',
 '정관':'정해진 역할과 규칙을 지키는 질문',
 '편관':'압박과 외부 요구에 대응하는 질문',
 '정인':'기초를 배우고 보호를 받는 질문',
 '편인':'스스로 이해하는 방식을 찾는 질문'
});
const DOMAINS=Object.freeze({
 year_2027_money:'money',
 year_2027_career:'career'
});
function build({chapterId,topicId,topic,source}={}){
 if(topicId!=='change'||!topic||topic.mode==='state-limits')return null;
 const domain=DOMAINS[chapterId];
 if(!domain||topic.annualScope?.relevant!==true||
    topic.annualScope.guaranteesRealWorldOutcome!==false)return null;
 const facts=new Map((topic.citableFacts||[]).map(row=>[row.id,row]));
 // Preference order matches the deterministic calendar/ten-god core; do not
 // select a hidden-only yearly or identical-subtype comparison.
 const candidates=(topic.annualScope.comparisons||[]).filter(x=>
  x.annualId==='annual.stem'&&
  /^natal\.(year|month|day|hour)\.(stem|hidden\.[甲乙丙丁戊己庚辛壬癸])$/.test(x.natalId)&&
  ['subtype','subtype-and-visibility'].includes(x.contrast)&&
  x.annualGod!==x.natalGod&&
  x.annualLayer==='visible-stem'&&
  x.meaning&&CATEGORIES[x.annualGod]&&CATEGORIES[x.natalGod]&&
  facts.get(x.annualId)?.tenGod===x.annualGod&&
  facts.get(x.natalId)?.tenGod===x.natalGod&&
  source?.[x.annualId]?.tenGod===x.annualGod&&
  source?.[x.natalId]?.tenGod===x.natalGod);
 const selected=candidates[0];
 if(!selected)return null;
 const annual=facts.get(selected.annualId),natal=facts.get(selected.natalId);
 // Synthetic source-only oracles intentionally omit the glossary. They
 // may verify the original gate, but cannot author an additional premium
 // interpretive claim without BOTH complete position-bound meaning rows.
 if(!annual.position||!natal.position||!annual.traditionalMeaning||!natal.traditionalMeaning)
  return null;
 const domainQuestion=domain==='money'?
  '돈을 버는 사건을 예측하지 않고, 기존에 계산된 자원·결과 분류와 2027년 겉글자의 세부 뜻이 어떻게 다른지 설명한다.':
  '승진·이직을 예측하지 않고, 기존에 계산된 배움·역할 분류와 2027년 겉글자의 세부 뜻이 어떻게 다른지 설명한다.';
 return Object.freeze({
  kind:'source-owned-annual-domain-reading-v1',
  chapter:chapterId,topic:topicId,domain,sourceRefs:[selected.annualId,selected.natalId],
  annualSource:Object.freeze({id:annual.id,position:annual.position,layer:annual.layer,
   tenGod:annual.tenGod,traditionalMeaning:annual.traditionalMeaning}),
  natalSource:Object.freeze({id:natal.id,position:natal.position,layer:natal.layer,
   tenGod:natal.tenGod,traditionalMeaning:natal.traditionalMeaning}),
  readerQuestion:domainQuestion,
  actualDifference:'출생 당시의 '+CATEGORIES[natal.tenGod]+
   '과 2027년의 '+CATEGORIES[annual.tenGod]+
   '은 서로 다른 전통적 질문이다. 같은 분류군이지만 세부 종류가 다르다. ',
  noEventPrediction:true,relativeStrengthAssessed:false,
  impliesRealHistory:false,modelCalls:0
 });
}
module.exports={build};
