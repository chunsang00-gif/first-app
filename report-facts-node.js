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


// Use the installed calendar library's ten-god table; these are relationships, not ability scores.
const {LunarUtil}=require('lunar-javascript');
const godNames={'比肩':'비견','劫财':'겁재','食神':'식신','伤官':'상관','偏财':'편재','正财':'정재','七杀':'편관','正官':'정관','偏印':'편인','正印':'정인'};
const glossary={비견:'나와 같은 오행·음양의 관계. 전통적으로 자기주장과 동료 관계를 살피는 항목',겁재:'나와 같은 오행에 음양이 다른 관계. 전통적으로 경쟁과 나눔을 살피는 항목',식신:'내가 생하는 오행에 음양이 같은 관계. 전통적으로 표현과 생산 활동을 살피는 항목',상관:'내가 생하는 오행에 음양이 다른 관계. 전통적으로 표현과 기존 규칙에 대한 반응을 살피는 항목',편재:'내가 극하는 오행에 음양이 같은 관계. 전통적으로 자원 활용과 대외 활동을 살피는 항목',정재:'내가 극하는 오행에 음양이 다른 관계. 전통적으로 재물 관리와 지속적인 수고를 살피는 항목',편관:'나를 극하는 오행에 음양이 같은 관계. 전통적으로 압박과 대응을 살피는 항목',정관:'나를 극하는 오행에 음양이 다른 관계. 전통적으로 규칙과 역할을 살피는 항목',편인:'나를 생하는 오행에 음양이 같은 관계. 전통적으로 독자적인 이해와 배움을 살피는 항목',정인:'나를 생하는 오행에 음양이 다른 관계. 전통적으로 배움과 보호를 살피는 항목'};
function tenGod(day,stem){return godNames[LunarUtil.SHI_SHEN[day+stem]]||null}
function interpretationFacts(chart,annual){
 const day=chart.day[0],entries=Object.entries(chart).filter(([,p])=>p),natalClashes=[];
 for(let i=0;i<entries.length;i++)for(let j=i+1;j<entries.length;j++){const [a,p]=entries[i],[b,q]=entries[j];if(branch(p)!==branch(q)&&clashes.some(pair=>pair.includes(branch(p))&&pair.includes(branch(q))))natalClashes.push({type:'충',positions:[a,b],branches:branch(p)+branch(q),note:'서로 마주 보는 지지 관계. 갈등이나 사건 발생을 확정하지 않음'})}
 return {dayMaster:day,monthBranch:branch(chart.month),tenGods:Object.fromEntries(entries.map(([position,p])=>[position,{stem:p[0],stemTenGod:position==='day'?'일간':tenGod(day,p[0]),hiddenStems:(hidden[branch(p)]||[]).map(stem=>({stem,tenGod:tenGod(day,stem)}))}])),natalClashes,annualTenGods:{stem:annual[0],stemTenGod:tenGod(day,annual[0]),hiddenStems:(hidden[branch(annual)]||[]).map(stem=>({stem,tenGod:tenGod(day,stem)}))},tenGodGlossary:glossary,limits:['십성은 일간과 각 천간의 관계를 분류한 값이며 관찰된 성격이나 능력이 아님','지장간 목록은 출현 여부이며 가중치·월령을 반영한 강약 판정이 아님','신강·신약·용신은 이 계산에서 판정하지 않음','targetYearRelations가 빈 배열이면 검사한 연간 지지 충이 없다는 뜻이며 모든 연간 관계가 없다는 뜻은 아님']};
}

function branch(p){return p?.slice(-1)}
function build(input,targetYear=2027){const c=pipeline.calculate(input,targetYear);if(!pipeline.canAnalyze(c))return {status:'blocked',calculation:c};const chart=c.chart,yearBranch=branch(c.targetYear.pillar),relations=[];for(const [k,p] of Object.entries(chart)){if(!p)continue;const b=branch(p);if(b!==yearBranch&&clashes.some(x=>x.includes(b)&&x.includes(yearBranch)))relations.push({type:'충',between:k,branches:b+yearBranch})}return {status:'ready',schemaVersion:'analysis-facts-v1.3',calculationRuleset:c.ruleset,calculationInput:{calendar:input.calendar,birthDate:input.birthDate,birthTime:input.birthTime,birthplace:input.birthplace,unknownBirthTime:Boolean(input.unknownBirthTime),leapMonth:Boolean(input.leapMonth),gender:input.gender,mbti:input.mbti||'모름',name:input.name||''},person:{gender:input.gender,mbti:input.mbti||'모름',name:input.name||''},chart,profileBalance:balance(chart,input.mbti),targetYear:c.targetYear,facts:{...interpretationFacts(chart,c.targetYear.pillar),hiddenStems:Object.fromEntries(Object.entries(chart).filter(([,p])=>p).map(([k,p])=>[k,hidden[branch(p)]||[]])),targetYearRelations:relations},fortune:c.fortune,constraints:{factsOnly:true,noPersonalHistoryInference:true,noDeterministicPrediction:true,nameAnalysisEnabled:false,forbiddenNameMethods:['name-analysis','stroke-numerology','phonetic-five-elements','resource-five-elements','name-causes-destiny']}}}
module.exports={build};