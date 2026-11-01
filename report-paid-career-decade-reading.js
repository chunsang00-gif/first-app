'use strict';
// A separate career question: the real 10-year pillar in effect for the
// target year vs. a DIFFERENT natal subtype within the same career family.
// This compares two computed traditional labels. It does not predict an
// actual job change, promotion, independent business success, or personal
// aptitude. A natal role by itself never authorizes another paid paragraph.
const FAMILIES=Object.freeze({
 '정관':'role','편관':'role','정인':'learning','편인':'learning'
});
const MEANINGS=Object.freeze({
 '정관':'정해진 직무·역할의 기준',
 '편관':'예외 요구와 책임 범위',
 '정인':'배움과 지원의 전통적 질문',
 '편인':'낯선 과제를 이해할 때의 질문'
});
const POS=['year','month','day','hour'];
function candidate(packet){
 const d=packet?.fortune?.activeDecade,year=packet?.targetYear?.year;
 if(!d||!Number.isInteger(year)||!Number.isInteger(d.startYear)||
    !Number.isInteger(d.endYear)||d.startYear>year||d.endYear<year||
    typeof d.pillar!=='string'||d.pillar.length!==2||
    !FAMILIES[d.stemTenGod]||!packet?.chart||!packet?.facts?.tenGods)
  return null;
 const calendar=require('./report-seasonal-evidence');
 if(!calendar.ELEMENTS[d.pillar[0]])return null;
 const decadeGod=require('./report-ten-gods').tenGod;
 // The stored decade stems have to agree with the actual natal day stem.
 const dayStem=packet.chart.day?.[0];
 if(!calendar.ELEMENTS[dayStem])return null;
 if(typeof decadeGod==='function'&&decadeGod(dayStem,d.pillar[0])!==d.stemTenGod)
  throw Error('PAID_CAREER_DECADE_GOD_SOURCE_DRIFT');
 const candidates=[];
 for(const position of POS){
  const row=packet.facts.tenGods[position];
  if(!row)continue;
  if(row.stem&&row.stemTenGod&&FAMILIES[row.stemTenGod]===FAMILIES[d.stemTenGod]&&
     row.stemTenGod!==d.stemTenGod&&packet.chart[position]?.[0]===row.stem)
   candidates.push({id:'natal.'+position+'.stem',position,layer:'천간',stem:row.stem,tenGod:row.stemTenGod});
  for(const hidden of row.hiddenStems||[]){
   if(!hidden?.stem||!FAMILIES[hidden.tenGod]||
      FAMILIES[hidden.tenGod]!==FAMILIES[d.stemTenGod]||
      hidden.tenGod===d.stemTenGod||
      !calendar.HIDDEN[packet.chart[position]?.[1]]?.includes(hidden.stem))continue;
   candidates.push({id:'natal.'+position+'.hidden.'+hidden.stem,
    position,layer:'지장간',stem:hidden.stem,tenGod:hidden.tenGod});
  }
 }
 // Prefer an explicitly visible source over a hidden stem for a conservative
 // reader comparison, but never fabricate one if it is absent.
 const source=candidates.find(x=>x.layer==='천간')||candidates[0];
 if(!source)return null;
 return Object.freeze({
  kind:'actual-decade-versus-natal-career-subtype-v1',
  sourceRefs:Object.freeze(['fortune.activeDecade',source.id]),
  targetYear:year,
  decadePillar:d.pillar,decadeStartYear:d.startYear,decadeEndYear:d.endYear,
  decadeSubtype:d.stemTenGod,decadeStem:d.pillar[0],
  natalSubtype:source.tenGod,natalStem:source.stem,
  natalPosition:source.position,natalLayer:source.layer,
  family:FAMILIES[d.stemTenGod],
  computedCondition:'출생 당시 '+source.position+'의 '+source.layer+' '+source.tenGod+
   '은 '+MEANINGS[source.tenGod]+'을 묻는 전통적 분류다. '+
   String(d.startYear)+'~'+String(d.endYear)+'년 대운의 겉글자 '+d.stemTenGod+
   '은 '+MEANINGS[d.stemTenGod]+'을 묻는다. '+
   '동일한 직업 관련 분류군 안에서 종류가 달라지지만 '+
   '직업을 바꾸거나 승진한다는 사건은 이 계산만으로 알 수 없다.',
  readerQuestion:'태어날 때 확인된 '+MEANINGS[source.tenGod]+
   '과 현재 대운에서 확인된 '+MEANINGS[d.stemTenGod]+
   '은 어떤 다른 점을 묻는가? 이 관계가 실제 직업 변화라는 뜻은 아닌 이유는?',
  predictedJobChange:false,chosenUsefulGod:false,
  relativeStrengthAssessed:false,realizedEffect:false
 });
}
module.exports={candidate,FAMILIES};
