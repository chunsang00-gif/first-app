/* Calculation -> AI fact packet v1.3. No prose prediction here. */
const pipeline=require('./production-pipeline-node');
const hidden={子:['癸'],丑:['己','癸','辛'],寅:['甲','丙','戊'],卯:['乙'],辰:['戊','乙','癸'],巳:['丙','戊','庚'],午:['丁','己'],未:['己','丁','乙'],申:['庚','壬','戊'],酉:['辛'],戌:['戊','辛','丁'],亥:['壬','甲']};
const clashes=[['子','午'],['丑','未'],['寅','申'],['卯','酉'],['辰','戌'],['巳','亥']];
const stemElement={甲:'wood',乙:'wood',丙:'fire',丁:'fire',戊:'earth',己:'earth',庚:'metal',辛:'metal',壬:'water',癸:'water'};
const branchElement={子:'water',丑:'earth',寅:'wood',卯:'wood',辰:'earth',巳:'fire',午:'fire',未:'earth',申:'metal',酉:'metal',戌:'earth',亥:'water'};
const clamp=n=>Math.max(35,Math.min(90,Math.round(n)));
function balance(chart,mbti){
 const counts={wood:0,fire:0,earth:0,metal:0,water:0};
 Object.values(chart||{}).filter(Boolean).forEach(p=>{const a=[...p];if(stemElement[a[0]])counts[stemElement[a[0]]]++;if(branchElement[a[1]])counts[branchElement[a[1]]]++});
 const known=/^[EI][NS][FT][JP]$/.test(mbti||''); const bump=(cond,n)=>known&&cond?n:0;
 return {
  mode:known?'saju-mbti':'saju-only',
  note:known?'내 결과 안에서 5가지 성향을 비교한 값':'사주 결과 안에서 5가지 성향을 비교한 값',
  scaleLabel:'높을수록 이 성향이 더 자주 드러남',
  axes:{
   relationship:clamp(48+counts.wood*6+counts.fire*5+bump(/[EF]/.test(mbti),8)),
   achievement:clamp(48+counts.metal*6+counts.fire*5+bump(/[TJ]/.test(mbti),7)),
   emotion:clamp(46+counts.water*7+counts.wood*4+bump(/[FN]/.test(mbti),7)),
   planning:clamp(48+counts.earth*7+counts.metal*4+bump(/[SJ]/.test(mbti),7)),
   independence:clamp(46+counts.water*5+counts.metal*5+bump(/[IP]/.test(mbti),7))
  }
 };
}

function branch(p){return p?.slice(-1)}
function build(input,targetYear=2027){const c=pipeline.calculate(input,targetYear);if(!pipeline.canAnalyze(c))return {status:'blocked',calculation:c};const chart=c.chart,yearBranch=branch(c.targetYear.pillar),relations=[];for(const [k,p] of Object.entries(chart)){if(!p)continue;const b=branch(p);if(clashes.some(x=>x.includes(b)&&x.includes(yearBranch)))relations.push({type:'충',between:k,branches:b+yearBranch})}return {status:'ready',schemaVersion:'analysis-facts-v1.3',calculationRuleset:c.ruleset,calculationInput:{calendar:input.calendar,birthDate:input.birthDate,birthTime:input.birthTime,birthplace:input.birthplace,unknownBirthTime:Boolean(input.unknownBirthTime),leapMonth:Boolean(input.leapMonth),gender:input.gender,mbti:input.mbti||'모름',name:input.name||''},person:{gender:input.gender,mbti:input.mbti||'모름',name:input.name||''},chart,profileBalance:balance(chart,input.mbti),targetYear:c.targetYear,facts:{hiddenStems:Object.fromEntries(Object.entries(chart).filter(([,p])=>p).map(([k,p])=>[k,hidden[branch(p)]||[]])),targetYearRelations:relations},fortune:c.fortune,constraints:{factsOnly:true,noPersonalHistoryInference:true,noDeterministicPrediction:true,nameAnalysisEnabled:false,forbiddenNameMethods:['name-analysis','stroke-numerology','phonetic-five-elements','resource-five-elements','name-causes-destiny']}}}
module.exports={build};