'use strict';
// Free/paid first-chapter copy check against the SAME computed chart.
// Never log paid prose, dates, names or extracted text.
const free=require('./report-reading-sample');
const norm=x=>String(x||'').normalize('NFKC').toLowerCase()
 .replace(/[^가-힣a-z0-9]/g,'');
const meaningful=s=>String(s||'').split(/[.!?。！？\n]+/)
 .map(v=>v.trim()).filter(v=>norm(v).length>=30&&
  !/(?:실제 (?:개인|성격|행동|능력|소득|수입|사건)|판정한 결과|예측할 수 없|보장하지 않|확인한 결과는 아니|확정할 수 없|단정할 수 없)/.test(v));
function grams(s){const t=norm(s),out=new Set();for(let i=0;i<=t.length-5;i++)out.add(t.slice(i,i+5));return out;}
function similarity(freeCopy,paid){
 const A=grams(freeCopy),B=grams(paid);
 if(A.size<70||B.size<65)return 0;
 let shared=0;for(const g of A)if(B.has(g))shared++;
 return shared/A.size;
}
function inspect(sections,packet){
 const core=(sections||[]).find(s=>s?.id==='saju_core');
 if(!core)return [];
 if(packet?.status!=='ready')throw Error('PAID_FREE_COPY_VERIFIED_PACKET_REQUIRED');
 const sample=free.build(packet);
 if(sample.status!=='calculated-example'||sample.modelCalls!==0||
   sample.completedPremiumParagraphs!==0)
  throw Error('PAID_FREE_COPY_UNVERIFIED_PREVIEW');
 const cards=sample.cards.filter(x=>['birth-month','month-visible-link'].includes(x.id));
 const errors=[];
 for(let i=0;i<(core.body||[]).length;i++){
  const paid=String(core.body[i]||''),compact=norm(paid);
  if(compact.length<55)continue;
  const topic=core.bodyTopics?.[i]||String(i);
  for(const card of cards){
   const sentences=meaningful(card.text),material=sentences.join(' ');
   const copied=sentences.some(sentence=>{
    const t=norm(sentence);return t.length>=55&&compact.includes(t);
   });
   if(copied||similarity(material,paid)>=0.84)
    errors.push('copied-free-reader-meaning:saju_core:'+topic+':'+card.id);
  }
 }
 return [...new Set(errors)];
}
module.exports={inspect,similarity};
