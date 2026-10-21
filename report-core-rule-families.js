'use strict';
// Same verified symbolic relation can recur in distinct calendar months.
// Never reuse a customer manuscript without an explicitly authored
// branch variant. Drafts remain NOT APPROVED for any paid report.
const seasonal=require('./report-seasonal-evidence');
const knowledge=require('./report-core-knowledge.json');
const REQUIRED=['monthBranch','title','keyJudgment','scene','explanation','advantage','downside'];
function expand(kb=knowledge){
 const out=[];
 for(const f of kb.familyRules||[])for(const v of f.variants||[])
  out.push({id:f.id+'-'+v.monthBranch,familyId:f.id,
   status:f.status,visible:f.visible,hidden:f.hidden,
   when:{monthBranch:v.monthBranch,...f.when},
   claim:f.claim,title:v.title,keyJudgment:v.keyJudgment,
   scene:v.scene,explanation:f.explanation+' '+v.explanation,
   advantage:v.advantage,downside:v.downside,caution:f.caution,
   evidenceRole:f.evidenceRole,evidenceLimits:f.evidenceLimits});
 return out;
}
function audit(kb=knowledge){
 let variantCount=0;
 const familyIds=new Set(),signatures=new Set();
 for(const f of kb.familyRules||[]){
  if(!f||!f.id||familyIds.has(f.id)||f.status!=='editorial-candidate'||
     !f.id.startsWith('family-')||
     !Array.isArray(f.variants)||f.variants.length<2||
     typeof f.explanation!=='string'||f.explanation.length<110||
     typeof f.claim!=='string'||f.claim.length<30||
     typeof f.caution!=='string'||f.caution.length<35||
     f.evidenceRole!=='month-visible-and-month-principal-hidden-only'||
     !f.evidenceLimits?.includes('no-observed-trait')||
     JSON.stringify(Object.keys(f.when||{}).sort())!==
      JSON.stringify(['monthPhase','monthElementRelation','seasonToDayRelation'].sort()))
   throw Error('CORE_FAMILY_INVALID_DEFINITION:'+f?.id);
  const local=new Set();
  for(const v of f.variants){
   const signature=[f.visible,f.hidden,v?.monthBranch,...Object.values(f.when)].join('|');
   if(!v||!seasonal.MONTH[v.monthBranch]||local.has(v.monthBranch)||
      signatures.has(signature)||
      seasonal.MONTH[v.monthBranch].status!==f.when.monthPhase||
      JSON.stringify(Object.keys(v).sort())!==JSON.stringify(REQUIRED.slice().sort())||
      REQUIRED.some(k=>typeof v[k]!=='string'||v[k].length<12)||
      v.explanation.length<100)
    throw Error('CORE_FAMILY_INVALID_VARIANT:'+f.id+'/'+v?.monthBranch);
   local.add(v.monthBranch);signatures.add(signature);variantCount++;
  }
  familyIds.add(f.id);
 }
 return {familyRules:familyIds.size,familyVariants:variantCount};
}
audit();
module.exports={expand,audit};
