'use strict';
// Offline method-review intake for one date with TWO verified birth hours.
// Recording an answer cannot authenticate an expert or approve a paid report.
const crypto=require('node:crypto');
const handoff=require('./report-core-paid-classical-decision-handoff');
const IDS=['choose-school','resolve-month','resolve-other-positions',
 'review-counterexample','review-reader-value'];
const fingerprint=x=>crypto.createHash('sha256')
 .update(JSON.stringify(x)).digest('hex');
function compare(first,other){
 for(const packet of [first,other]){
  if(packet?.status!=='ready'||!packet?.chart?.hour||
     !packet?.calculationInput||packet.calculationInput.unknownBirthTime||
     !Number.isInteger(packet.targetYear?.year))
   throw Error('EXPERT_REVIEW_REQUIRES_VERIFIED_KNOWN_BIRTH_HOUR');
 }
 const a=first.calculationInput,b=other.calculationInput;
 if(['calendar','birthDate','leapMonth','gender'].some(k=>a[k]!==b[k])||
    first.targetYear.year!==other.targetYear.year||
    ['year','month','day'].some(k=>first.chart[k]!==other.chart[k])||
    first.chart.hour===other.chart.hour||
    a.birthTime===b.birthTime)
  throw Error('EXPERT_REVIEW_NOT_SAME_DATE_TWO_DIFFERENT_HOURS');
 const one=handoff.build(first),two=handoff.build(other);
 for(const h of [one,two]){
  if(h.methodApproved!==false||h.customerReady!==false||
     h.readyForPaidModelProbe!==false||
     h.releaseVerdict!=='not-approved'||h.providerCalls!==0||
     h.expertDecisions?.length!==IDS.length||
     h.expertDecisions.some((q,i)=>q.id!==IDS[i]||
      q.status!=='pending'||q.decision!==null))
   throw Error('EXPERT_REVIEW_METHOD_ALREADY_UNSAFE_OR_APPROVED');
 }
 function scope(h,packet){
  const q=h.expertDecisions.find(x=>x.id==='choose-school');
  return {hourPillar:packet.chart.hour,
   matchedPublishedDayHourRules:q.independentlyMatchedClassicalTexts.map(x=>({
    id:x.id,url:x.url,
    notPersonalLifePrediction:true
   })),
   monthPriority:h.methodApplicabilityDecision.unresolved.monthMethodPriority,
   methodApproved:false};
 }
 const start=scope(one,first),alternate=scope(two,other);
 const binding=fingerprint({
  calendar:a.calendar,birthDate:a.birthDate,leapMonth:a.leapMonth,
  targetYear:first.targetYear.year,
  year:first.chart.year,month:first.chart.month,day:first.chart.day,
  firstHour:first.chart.hour,otherHour:other.chart.hour
 });
 return Object.freeze({
  kind:'qa-expert-hour-counterfactual-review-intake-v1',
  chartBinding:binding,
  scope:'one birth date; alternate verified birth hours; classical text applicability only',
  first:start,changedHour:alternate,
  publishedRuleMatchesDiffer:JSON.stringify(start.matchedPublishedDayHourRules)!==
   JSON.stringify(alternate.matchedPublishedDayHourRules),
  questions:one.expertDecisions.map((x,i)=>({
   id:x.id,question:x.question,
   firstUnresolvedConditions:x.relevantConditions.map(c=>c.id),
   alternateUnresolvedConditions:two.expertDecisions[i].relevantConditions.map(c=>c.id),
   neededFields:['conclusion','citationUrl','applicationRule','counterexample']
  })),
  methodSelectionApproved:false,
  authorizesPaidWriter:false,authorizesSale:false,
  releaseVerdict:'not-approved',providerCalls:0
 });
}
const substantive=s=>typeof s==='string'&&s.trim().length>=40&&
 s.length<=2200&&!/[\u0000-\u001f\u007f<>]/.test(s);
function screen(intake,submission){
 if(intake?.kind!=='qa-expert-hour-counterfactual-review-intake-v1'||
    intake.authorizesSale!==false||intake.releaseVerdict!=='not-approved'||
    intake.questions?.length!==IDS.length||
    intake.questions.some((x,i)=>x.id!==IDS[i]))
  throw Error('EXPERT_REVIEW_UNTRUSTED_HANDOFF');
 const errors=[];
 const seenAnswerSignatures=new Set();
 const canonicalText=value=>typeof value==='string'?value.replace(/\s+/gu,' ').trim():'';
 if(submission?.kind!=='qa-proposed-method-decisions-v1'||
    submission.chartBinding!==intake.chartBinding||
    submission.authorizesSale!==false||
    submission.authorizesPaidWriter!==false||
    submission.reusableForOtherBirthCharts!==false)
  errors.push('incorrect-chart-or-missing-no-release-acknowledgement');
 if(submission?.comparedHourPillars?.[0]!==intake.first.hourPillar||
    submission?.comparedHourPillars?.[1]!==intake.changedHour.hourPillar)
  errors.push('hour-specific-counterexample-ignored');
 if(!Array.isArray(submission?.answers)||
    submission.answers.length!==IDS.length||
    submission.answers.some((x,i)=>x?.id!==IDS[i]))
  errors.push('all-five-method-questions-required-in-original-order');
 else for(const answer of submission.answers){
  if(!substantive(answer.conclusion)||!substantive(answer.applicationRule)||
     !substantive(answer.counterexample))
   errors.push('missing-conclusion-rule-or-counterexample:'+answer.id);
  // A copied answer is not even a complete intake, regardless of length.
  // This is only a structural duplicate check: it never approves a method.
  const sections=['conclusion','applicationRule','counterexample']
   .map(k=>canonicalText(answer[k]));
  if(new Set(sections).size!==sections.length)
   errors.push('recycled-field-content:'+answer.id);
  const signature=JSON.stringify(sections);
  if(seenAnswerSignatures.has(signature))
   errors.push('recycled-answer-across-questions:'+answer.id);
  seenAnswerSignatures.add(signature);
  let validUrl=false;
  try{
   const u=new URL(answer.citationUrl);
   validUrl=u.protocol==='https:'&&u.hostname.includes('.')&&
    !u.username&&!u.password;
  }catch{}
  if(!validUrl)errors.push('missing-https-citation:'+answer.id);
  const prose=[answer.conclusion,answer.applicationRule,
   answer.counterexample].filter(s=>typeof s==='string').join(' ');
  if(/(?:반드시\s*성공|무조건\s*대박|확실히\s*부자|틀림없이\s*승진)/.test(prose))
   errors.push('unsupported-life-outcome-promise:'+answer.id);
 }
 return Object.freeze({
  kind:'qa-expert-proposal-format-screen-v1',
  chartBinding:intake.chartBinding,
  status:errors.length?'incomplete-or-contradictory':
   'format-complete-independent-expert-review-required',
  errors:[...new Set(errors)],
  authorshipAuthenticated:false,
  citedSourcesIndependentlyVerified:false,
  traditionalMethodProfessionallyAdopted:false,
  personalReaderValueEstablished:false,
  canGeneratePaidReport:false,canSell:false,
  providerCallsAuthorized:false,releaseVerdict:'not-approved'
 });
}
module.exports={compare,screen};
if(require.main===module){
 const facts=require('./report-facts-node');
 const sample=t=>facts.build({calendar:'lunar',birthDate:'1982-11-24',
  leapMonth:false,birthTime:t,gender:'male',mbti:'ISFP'},2027);
 process.stdout.write(JSON.stringify(
  compare(sample('14:20'),sample('20:20')),null,2)+'\n');
}
