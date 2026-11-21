'use strict';
// Independent offline PRODUCT-VALUE audit of the current paid HOUR candidate.
// A different SOURCE POSITION is not a new natal symbolic CATEGORY when the
// same hidden STEM is already recorded at YEAR, MONTH or DAY. No traditional
// positional-priority rule is established here. This does not infer behavior.
const facts=require('./report-fact-bindings');
const hour=require('./report-paid-core-hour-extension');
function inspect(packet){
 const rows=facts.build(packet);
 const byId=Object.fromEntries(rows.map(x=>[x.id,x]));
 const candidate=hour.build(packet,byId);
 if(!candidate)return Object.freeze({
  kind:'paid-hour-all-natal-role-recurrence-audit-v1',
  status:'no-hour-candidate',eligibleForNewPaidRoleClaim:false,
  salesApproved:false,modelCalls:0
 });
 const selected=byId[candidate.sourceRefs[1]];
 if(!selected||!selected.id.startsWith('natal.hour.hidden.')||
    selected.tenGod!==candidate.hourHiddenRole)
  throw Error('HOUR_ALL_NATAL_SELECTED_SOURCE_MISMATCH');
 const sameRoleElsewhere=rows.filter(x=>
  x.id.startsWith('natal.')&&
  x.id!==selected.id&&
  x.id!=='natal.day.stem'&&
  x.tenGod===selected.tenGod);
 const exactStemElsewhere=sameRoleElsewhere.filter(x=>x.stem===selected.stem);
 const byPosition=Object.freeze(exactStemElsewhere.map(x=>Object.freeze({
  sourceId:x.id,position:x.position,layer:x.layer,
  stem:x.stem,tenGod:x.tenGod
 })));
 const disjoint=exactStemElsewhere.length===0;
 return Object.freeze({
  kind:'paid-hour-all-natal-role-recurrence-audit-v1',
  status:disjoint?'not-exactly-repeated-across-other-natal-positions':
   'same-exact-hour-symbol-already-in-other-natal-position',
  selectedRef:selected.id,role:selected.tenGod,stem:selected.stem,
  selectedReaderDomain:candidate.readerDomain,
  sameRoleOtherNatalRefs:Object.freeze(sameRoleElsewhere.map(x=>x.id)),
  sameExactStemOtherNatalPositions:byPosition,
  wholeNatalCategoryIsNew:disjoint,
  locationSpecificClassicalPriorityProved:false,
  separatePaidValueEstablished:false,
  selectedOnlyFromReadersDomain:true,
  // Not a monetary gate. Never turn a candidate into a commercial approval.
  eligibleForNewPaidRoleClaim:disjoint,
  salesApproved:false,modelCalls:0
 });
}
module.exports={inspect};
