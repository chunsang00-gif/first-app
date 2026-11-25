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
 if(!decision||packet.targetYear?.year!==2027)
  return null;
 const first=firstChapter.build(packet);
 const countercondition=first?.paragraphs.find(paragraph=>paragraph.kind==='exact-day-hour-classical-text')?.conditionalRelationAudit;
 const natal=graph.build(packet);
 const rows=new Map(bindings.build(packet).map(row=>[row.id,row]));
 const natalClashes=natal.natalRelations.filter(row=>row.type==='충'&&
  row.positions.includes('month')).map(row=>row.positions.find(p=>p!=='month'));
 const annualMonthClash=packet.facts.targetYearBranchRelations.pairs.some(
  row=>row.type==='충'&&row.between==='month');
 if(decision.birthTime==='20:20'){
  const annualRelations=packet.facts.targetYearBranchRelations.pairs;
  const relationTypes=position=>annualRelations.filter(row=>row.between===position)
   .map(row=>row.type).sort().join('/');
  if(first?.competingClassicalClause?.matches.map(match=>match.position).join('/')!=='month'||
     rows.get('natal.hour.stem')?.tenGod!=='상관'||
     rows.get('natal.hour.hidden.丁')?.stem!==rows.get('annual.stem')?.stem||
     natalClashes.join('/')!=='day'||!annualMonthClash||
     packet.chart.hour[1]!==packet.chart.year[1]||
     relationTypes('hour')!=='파/형'||relationTypes('hour')!==relationTypes('year'))
   throw Error('WHOLE_CHART_LATE_HOUR_EVIDENCE_DRIFT');
  return compose(packet,rows,first,[
   {id:'saju_core',title:'태어난 달과 시간의 뜻이 갈라집니다',
    text:'태어난 달은 낯선 내용을 자기 방식으로 이해하는 쪽입니다. 저녁에 태어난 시간의 겉글자는 기존 방식에 의문을 제기하고 달리 표현하는 쪽으로 읽습니다. 태어난 달과 날은 맞서고, 달과 시간에는 그 맞섬이 없습니다.',
    refs:['natal.month.stem','natal.hour.stem','facts.natalBranchRelations']},
   {id:'career',title:'같은 제약 풀이를 가져올 수 없습니다',
    text:'태어난 시간의 겉글자는 새 방식을 표현하는 뜻이고, 안쪽에는 결과를 만들어 내는 뜻이 남아 있습니다. 오후 사례에서 시간의 이해를 뜻하는 글자가 결과를 누르는 관계는 이 시간에 그대로 적용되지 않습니다. 그 제약을 줄이는 고전 조건은 태어난 달에서 계속 확인됩니다.',
    refs:['natal.day.stem','natal.month.stem','natal.month.hidden.己',
     'natal.hour.stem','natal.hour.hidden.丁']},
   {id:'year_2027',title:'2027년은 태어난 시간과도 별도 관계를 맺습니다',
    text:'태어난 시간 안쪽의 결과물 관련 글자가 2027년에는 겉에 놓입니다. 2027년은 태어난 달과 맞섭니다. 태어난 해와 시간의 아랫글자는 서로 같아, 2027년을 대조하면 두 자리에서 같은 관계가 반복됩니다. 이 반복을 두 번의 사건으로 세지 않습니다.',
    refs:['annual.stem','natal.hour.hidden.丁','facts.targetYearBranchRelations']}
  ],'태어난 달의 이해와 시간의 표현을 함께 읽습니다. 두 역할의 우선순위를 정할 근거는 아직 확인되지 않았습니다.');
 }
 if(!first||rows.get('natal.year.stem')?.tenGod!=='정인'||
    rows.get('natal.month.stem')?.tenGod!=='편인'||
    rows.get('natal.hour.stem')?.tenGod!=='편인'||
    rows.get('natal.hour.hidden.丁')?.tenGod!=='식신'||
    rows.get('natal.hour.hidden.己')?.tenGod!=='편재'||
    rows.get('annual.stem')?.stem!==rows.get('natal.hour.hidden.丁')?.stem||
    natalClashes.length!==2||!natalClashes.includes('day')||
    !natalClashes.includes('hour')||!annualMonthClash||
    countercondition?.volumeSix?.matches.map(match=>match.position).join('/')!=='month/hour'||
    countercondition.counteractionEffectProved!==false||
    decision.relativeInterpretiveDominanceDecided===true)
  throw Error('WHOLE_CHART_REPORT_EVIDENCE_DRIFT');

 const sections=[
  {id:'saju_core',title:'기존 설명과 자기 판단이 함께 있는 사주',
   text:'태어난 해는 이미 알려진 설명을 참고하는 쪽으로 읽습니다. 겨울에 태어난 달과 시간에는 낯선 내용을 자기 방식으로 이해하는 뜻이 같은 글자로 반복됩니다. 날과 시간의 아랫글자도 서로 같아, 달과 맞서는 관계가 두 자리에서 같은 형태로 나타납니다. 따라서 기존 설명을 받아들이는 뜻과, 그것을 자기 기준으로 다시 따져 보는 뜻을 함께 읽습니다.',
   refs:['natal.year.stem','natal.month.stem','natal.day.stem',
    'natal.hour.stem','facts.natalBranchRelations','facts.seasonalEvidence']},
  {id:'career',title:'배운 것을 끝내는 데 걸리는 조건',
   text:'태어난 시간에는 이해를 더하려는 뜻이 결과를 내는 뜻을 제약하는 관계가 있습니다. 고전에서는 그 제약을 줄이는 별도 조건도 봅니다. 이 사주에서는 태어난 달과 시간의 안쪽에 그 조건에 해당하는 글자가 있습니다. 따라서 결과가 막힌다고 단정할 수 없습니다. 두 작용 가운데 어느 쪽이 우세한지는 이 자료로 정하지 못합니다.',
   refs:['natal.day.stem','natal.month.stem','natal.month.hidden.己',
    'natal.hour.stem','natal.hour.hidden.丁','natal.hour.hidden.己']},
  {id:'year_2027',title:'2027년에는 안쪽에 있던 표현의 뜻이 겉에 드러납니다',
   text:'태어난 시간 안쪽의 결과물 관련 글자가 2027년의 겉에 나타납니다. 또 2027년은 태어난 달과 맞서는데, 태어난 날과 시간에도 이미 같은 맞섬이 있습니다. 새로 읽을 부분은 결과를 표현하는 뜻이 해의 겉에 놓였다는 점입니다. 기존 맞섬을 2027년에 새로 생기는 사건으로 세지 않습니다.',
   refs:['annual.stem','natal.hour.hidden.丁','facts.targetYearBranchRelations',
    'facts.natalBranchRelations']}
 ];
 const finalJudgment='이 사주에서 결과를 읽을 때는 제약과 그것을 줄이는 조건을 함께 봅니다. 2027년에 결과와 관련된 글자가 겉에 나타나지만, 그 위치만으로 성과를 판단하지 않습니다.';
 return compose(packet,rows,first,sections,finalJudgment);
}

function compose(packet,rows,first,sections,finalJudgment){
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
 const packet=facts.build(INPUT,2027);
 const report=build(packet);
 if(!report)throw Error('WHOLE_CHART_EXAMPLE_MISSING');
 for(const input of [
  {...INPUT,birthTime:'',unknownBirthTime:true},
  {...INPUT,birthDate:'1982-11-25'}
 ]){
  if(build(facts.build(input,2027))!==null)
   throw Error('WHOLE_CHART_EXAMPLE_APPLIED_TO_DIFFERENT_CHART');
 }
 const differentHour=facts.build({...INPUT,birthTime:'20:20'},2027);
 const contrast=build(differentHour);
 if(!contrast||contrast.sections.some((chapter,i)=>chapter.text===report.sections[i].text))
  throw Error('WHOLE_CHART_REVIEW_DID_NOT_CHANGE_WITH_CALCULATED_HOUR');
 const changedYear=structuredClone(packet);
 changedYear.facts.targetYearBranchRelations.pairs=[];
 if(build(changedYear)!==null)
  throw Error('WHOLE_CHART_REVIEW_ACCEPTED_TAMPERED_ANNUAL_RELATION');
 return {report,contrast};
}

function print(report){
 console.log('# '+report.title+'\n\n편집 검수용 원고 · 판매 미승인');
 for(const chapter of report.sections)
  console.log('\n## '+chapter.title+'\n\n'+chapter.text);
 console.log('\n## 총평\n\n'+report.finalJudgment);
 console.log('\n입력한 MBTI '+report.selfReportedMbti);
}

if(require.main===module){
 const {report,contrast}=verify();
 print(process.argv.includes('--evening')?contrast:report);
}

module.exports={build,verify};
