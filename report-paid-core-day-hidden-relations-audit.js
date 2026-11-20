'use strict';
// EDITORIAL RESEARCH ONLY. A role absent from the FREE synopsis may already
// be recorded in the birth MONTH, or coexist with other unranked day roles.
// A true table relation does NOT authorize a method priority, fortune, or sale.
// NEVER import this in the paid writer, checkout, purchase or sale gate.
const dayCandidate=require('./report-paid-core-day-hidden-editorial-candidate');
const facts=require('./report-fact-bindings');
const stems=require('./report-stem-connections');
const branches=require('./report-branch-relations');
const free=require('./report-reading-sample');
const ROLES=Object.freeze({skill:['식신','상관'],money:['정재','편재'],pressure:['정관','편관']});
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function inspect(packet){
 const candidate=dayCandidate.inspect(packet);
 const notCandidate=reason=>Object.freeze({
  kind:'offline-day-source-cross-pillar-value-review-v1',
  status:'no-scope',reason,paidWriterAuthorized:false,
  customerSaleApproved:false,providerCalls:0
 });
 if(candidate.status!=='candidate-for-human-editorial-research')
  return notCandidate(candidate.reason);
 const chart=packet.chart;
 const canonical=stems.build(chart);
 const natal=branches.natal(chart);
 if(!same(canonical.exposure,packet.facts?.stemConnections?.exposure)||
    !same(canonical.rooting,packet.facts?.stemConnections?.rooting)||
    !same(natal.pairs,packet.facts?.natalBranchRelations?.pairs)||
    !same(natal.groups,packet.facts?.natalBranchRelations?.groups))
  throw Error('DAY_CROSS_PILLAR_EVIDENCE_DIVERGED');
 const rows=facts.build(packet),selected=rows.find(x=>x.id===candidate.sourceRefs[1]);
 if(!selected||selected.stem!==candidate.exactStem||
    selected.tenGod!==candidate.candidateRole||selected.position!=='일지')
  throw Error('DAY_CROSS_PILLAR_SELECTED_SOURCE_DIVERGED');
 const sameStem=rows.filter(x=>x.id!==selected.id&&
  x.stem===selected.stem&&x.id!=='natal.day.stem'&&
  x.id.startsWith('natal.'));
 // The source may be new as a POSITION, but the symbolic classification is
 // not independent when the exact same character/role exists in the month.
 const monthRepeats=sameStem.filter(x=>x.id.startsWith('natal.month.hidden.')||
  x.id==='natal.month.stem');
 if(monthRepeats.some(x=>x.tenGod!==selected.tenGod))
  throw Error('DAY_CROSS_PILLAR_SAME_STEM_DIFFERENT_ROLE');
 const allDayHidden=rows.filter(x=>x.id.startsWith('natal.day.hidden.'));
 const relevantDayDomains=Object.fromEntries(Object.entries(ROLES).map(([name,roles])=>[
  name,allDayHidden.filter(x=>roles.includes(x.tenGod)&&
   !candidate.publicRoleNames.includes(x.tenGod)).map(x=>x.tenGod)
 ]));
 const exposures=canonical.exposure.find(x=>x.hiddenId===selected.id);
 if(!exposures||exposures.hiddenStem!==selected.stem||exposures.position!=='day')
  throw Error('DAY_CROSS_PILLAR_BAD_EXPOSURE_LEDGER');
 const dayPairs=natal.pairs.filter(x=>x.positions.includes('day'))
  .map(x=>({kind:x.type,positions:x.positions.slice(),branches:x.branches,
   fulfilledInLife:false,transformationVerified:false}));
 const freeReading=free.build(packet);
 if(freeReading.status!=='calculated-example'||freeReading.modelCalls!==0||
    freeReading.completedPremiumParagraphs!==0)
  throw Error('DAY_CROSS_PILLAR_UNVERIFIED_FREE_BASELINE');
 const output={
  kind:'offline-day-source-cross-pillar-value-review-v1',
  status:'source-relationships-verified-not-interpretation',
  selectedDomain:candidate.readerDomain,selectedHiddenRole:selected.tenGod,
  dayHiddenSourceId:selected.id,
  dayBranchSameAsMonth:chart.day[1]===chart.month[1],
  exactStemAlreadyExistsInMonth:monthRepeats.length>0,
  monthSourceIdsWithSameStem:Object.freeze(monthRepeats.map(x=>x.id)),
  otherNatalSourcesWithSameStem:Object.freeze(sameStem.map(x=>x.id)),
  dayHiddenRolesRelevantToQuestion:Object.freeze(relevantDayDomains[candidate.readerDomain]),
  otherPossibleBuyerDomains:Object.freeze(Object.entries(relevantDayDomains)
   .filter(([domain,roles])=>domain!==candidate.readerDomain&&roles.length)
   .map(([domain])=>domain)),
  // The same chart can support two different question-driven symbolic
  // stories: question matching is NOT a traditional rule of priority.
  selectedOnlyBecauseBuyerAskedThisDomain:true,
  exactStemVisibleAt:Object.freeze(exposures.exactVisibleMatches.map(x=>x.position)),
  natalDayBranchRelations:Object.freeze(dayPairs),
  monthAndDayIdenticalBranchWithoutExtraMethod:
   chart.day[1]===chart.month[1],
  freeCardIds:Object.freeze(freeReading.cards.map(x=>x.id)),
  dayRoleNotShownByFourHeadlineFreeCategories:true,
  actualNewInterpretiveMethodVerified:false,
  interpretationPriorityEstablished:false,
  evidenceOfActualPersonalChoice:false,
  customerValueBeyondFreeEstablished:false,
  paidWriterAuthorized:false,customerSaleApproved:false,providerCalls:0
 };
 return Object.freeze(output);
}
module.exports={inspect};
