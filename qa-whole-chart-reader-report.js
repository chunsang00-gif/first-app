'use strict';
// One offline report benchmark. Ordinary paid generation uses a different
// contract and cannot sell this editorial example.
const facts=require('./report-facts-node');
const integrity=require('./report-calculation-integrity');
const graph=require('./report-core-evidence-graph');
const bindings=require('./report-fact-bindings');
const firstChapter=require('./report-core-paid-1982-integrated-first-chapter');
const method=require('./report-core-paid-1982-question-scoped-method-decision');
const readerPolicy=require('./report-reader-policy');

const INPUT=Object.freeze({calendar:'lunar',birthDate:'1982-11-24',
 leapMonth:false,birthTime:'14:20',gender:'male',mbti:'ISFP'});

function build(packet){
 if(packet?.status!=='ready'||!integrity.verify(packet).pass)return null;
 const decision=method.inspect(packet);
 if(!decision||decision.birthTime!=='14:20'||packet.targetYear?.year!==2027)
  return null;
 const first=firstChapter.build(packet);
 const natal=graph.build(packet);
 const rows=new Map(bindings.build(packet).map(row=>[row.id,row]));
 const natalClashes=natal.natalRelations.filter(row=>row.type==='충'&&
  row.positions.includes('month')).map(row=>row.positions.find(p=>p!=='month'));
 const annualMonthClash=packet.facts.targetYearBranchRelations.pairs.some(
  row=>row.type==='충'&&row.between==='month');
 if(!first||rows.get('natal.year.stem')?.tenGod!=='정인'||
    rows.get('natal.month.stem')?.tenGod!=='편인'||
    rows.get('natal.hour.stem')?.tenGod!=='편인'||
    rows.get('natal.hour.hidden.丁')?.tenGod!=='식신'||
    rows.get('natal.hour.hidden.己')?.tenGod!=='편재'||
    rows.get('annual.stem')?.stem!==rows.get('natal.hour.hidden.丁')?.stem||
    natalClashes.length!==2||!natalClashes.includes('day')||
    !natalClashes.includes('hour')||!annualMonthClash||
    !first.competingClassicalClause||
    decision.relativeInterpretiveDominanceDecided===true)
  throw Error('WHOLE_CHART_REPORT_EVIDENCE_DRIFT');

 const sections=[
  {id:'saju_core',title:'기존 설명과 자기 판단이 함께 있는 사주',
   text:'태어난 해는 이미 알려진 설명을 참고하는 쪽으로 읽습니다. 겨울에 태어난 달과 시간에는 낯선 내용을 자기 방식으로 이해하는 뜻이 같은 글자로 반복됩니다. 날과 시간의 아랫글자도 서로 같아, 달과 맞서는 관계가 두 자리에서 같은 형태로 나타납니다. 따라서 기존 설명을 받아들이는 뜻과, 그것을 자기 기준으로 다시 따져 보는 뜻을 함께 읽습니다.',
   refs:['natal.year.stem','natal.month.stem','natal.day.stem',
    'natal.hour.stem','facts.natalBranchRelations','facts.seasonalEvidence']},
  {id:'career',title:'배운 것을 끝내는 데 걸리는 조건',
   text:'태어난 시간에는 이해를 더하려는 뜻이 결과를 내는 뜻을 누르는 관계가 있습니다. 같은 자리 안쪽의 자원을 살피는 뜻은 그 제약을 누그러뜨릴 조건으로 읽힙니다. 필요한 수단이 갖춰지면 배운 내용을 결과로 옮길 여지가 있습니다. 반대로 이해를 더하는 데만 머물면 끝내야 할 일이 밀릴 수 있습니다. 이 사주에서 제약과 완화 중 어느 쪽이 더 강한지는 확정하지 않습니다.',
   refs:['natal.hour.stem','natal.hour.hidden.丁','natal.hour.hidden.己']},
  {id:'year_2027',title:'2027년에는 안쪽에 있던 표현의 뜻이 겉에 드러납니다',
   text:'태어난 시간 안쪽의 결과물 관련 글자가 2027년의 겉에 나타납니다. 또 2027년은 태어난 달과 맞서는데, 태어난 날과 시간에도 이미 같은 맞섬이 있습니다. 새로 읽을 부분은 결과를 표현하는 뜻이 해의 겉에 놓였다는 점입니다. 기존 맞섬을 2027년에 새로 생기는 사건으로 세지 않습니다.',
   refs:['annual.stem','natal.hour.hidden.丁','facts.targetYearBranchRelations',
    'facts.natalBranchRelations']}
 ];
 const finalJudgment='기존 자료를 참고하는 뜻과 자기 기준으로 다시 판단하는 뜻이 함께 있습니다. 다만 이해가 결과로 이어지려면 필요한 수단이 갖춰져야 한다는 조건이 붙습니다. 2027년 풀이에서도 이 조건을 빼고 성과를 단정할 수 없습니다.';
 if(sections.some(chapter=>chapter.refs.some(ref=>
    ref.startsWith('facts.')?!packet.facts[ref.slice(6)]:!rows.has(ref)))||
    readerPolicy.errors([...sections.flatMap(chapter=>[chapter.title,chapter.text]),
     finalJudgment]).length)
  throw Error('WHOLE_CHART_REPORT_READER_OR_SOURCE_DRIFT');

 return {
  title:'사주 보고서 · 태어난 때의 풀이와 2027년',
  sections,
  finalJudgment,
  selfReportedMbti:packet.person.mbti,
  classicalReview:{
   chart:first.chartFingerprint,sourceScope:first.sourceScope,
   competingCondition:first.competingClassicalClause,
   priorityApproved:false
  },
  modelCalls:0,saleApproved:false
 };
}

function verify(){
 const report=build(facts.build(INPUT,2027));
 if(!report)throw Error('WHOLE_CHART_EXAMPLE_MISSING');
 for(const input of [
  {...INPUT,birthTime:'20:20'},
  {...INPUT,birthTime:'',unknownBirthTime:true},
  {...INPUT,birthDate:'1982-11-25'}
 ]){
  if(build(facts.build(input,2027))!==null)
   throw Error('WHOLE_CHART_EXAMPLE_APPLIED_TO_DIFFERENT_CHART');
 }
 return report;
}

if(require.main===module){
 const report=verify();
 console.log('# '+report.title+'\n\n편집 검수용 원고 · 판매 미승인');
 for(const chapter of report.sections)
  console.log('\n## '+chapter.title+'\n\n'+chapter.text);
 console.log('\n## 총평\n\n'+report.finalJudgment);
 console.log('\n입력한 MBTI '+report.selfReportedMbti);
}

module.exports={build,verify};
