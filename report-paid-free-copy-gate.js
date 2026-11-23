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
function minimumValueProblems(core,packet){
 if(!core||packet?.status!=='ready')return [];
 const errors=[];
 // The real 2026-11-18 paid Terra chapter consisted of ONE strength paragraph
 // citing only the two month positions that the FREE preview already explains.
 // Copy similarity could not flag it because its wording differed. This is
 // a commercial minimum-value HOLD, not a claim that other paragraphs sell.
 // A buyer's self-reported concern is NOT a new calculated source;
 // it cannot excuse a paid core consisting solely of free month meanings.
 // Independently evidenced additional paragraphs remain human-review only.
 const topics=core.bodyTopics||[];
 const evidence=Array.isArray(core.evidence)?core.evidence.join(' '):'';
 const natalRefs=[...new Set([...evidence.matchAll(
  /natal\.(?:year|month|day|hour)\.(?:stem|hidden\.[甲乙丙丁戊己庚辛壬癸])/g
 )].map(match=>match[0]))];
 const monthOnly=natalRefs.length>=2&&
  natalRefs.includes('natal.month.stem')&&
  natalRefs.some(id=>id.startsWith('natal.month.hidden.'))&&
  natalRefs.every(id=>id.startsWith('natal.month.'))&&
  !/(?:facts\.(?:seasonalEvidence|qiEvidence)|person\.mbti)/.test(evidence);
 if(topics.length===1&&topics[0]==='strength'&&monthOnly)
  errors.push('paid-core-no-independent-reader-value:saju_core:strength');
 return errors;
}
// Every completed paid chapter has a potential resale problem: the customer
// already received the whole FREE reading, not only its birth-month card.
// Reject a free paragraph merely moved to "money", "career" or "2027".
// Wording similarity is a conservative automated minimum, not proof that
// every dissimilar paragraph adds individual premium value.
function inspect(sections,packet){
 const actual=(sections||[]).filter(s=>s?.id&&(
  Array.isArray(s.body)||Array.isArray(s.topicConclusions)));
 if(!actual.length)return [];
 if(packet?.status!=='ready')throw Error('PAID_FREE_COPY_VERIFIED_PACKET_REQUIRED');
 const sample=free.build(packet);
 if(sample.status!=='calculated-example'||sample.modelCalls!==0||
   sample.completedPremiumParagraphs!==0)
  throw Error('PAID_FREE_COPY_UNVERIFIED_PREVIEW');
 // The free annual card and every birth-year/hour/month card are already
 // included in a customer's free report. This is never core-only scope.
 const freeCards=sample.cards.filter(c=>new Set([
  'birth-month','month-visible-link','year-hour','annual-2027']).has(c.id));
 // Work78: what was FREE to the buyer stays FREE regardless of which
 // PAID section copies it. Previously a saju_core copy of the free money
 // example was NOT rejected because only money/career sections were scanned.
 // Resolve EXACT customer-visible domain previews with the same chapter plan
 // as the pre-purchase page, not a made-up set of currently delivered ids.
 const previews=require('./report-product-coverage')
  .alreadyPublicDomainReadings(packet);
 for(const preview of previews)freeCards.push(preview);
 const errors=[];
 for(const section of actual){
  const body=Array.isArray(section.body)?section.body:section.topicConclusions;
  for(let i=0;i<body.length;i++){
   const paid=String(body[i]||''),compact=norm(paid);
   if(compact.length<55)continue;
   const topic=section.bodyTopics?.[i]||String(i);
   for(const card of freeCards){
    const sentences=meaningful(card.text),material=sentences.join(' ');
    // A short FREE annual card may split into several short sentences.
    // The old "meaningful" filter ignored each one and let a FULL verbatim
    // copy through. Check the exact published card before sentence screening.
    const completeFree=norm(card.text);
    const copiedFull=completeFree.length>=55&&compact.includes(completeFree);
    const copied=sentences.some(sentence=>{
     const t=norm(sentence);return t.length>=55&&compact.includes(t);
    });
    if(copiedFull||copied||similarity(material,paid)>=0.84)
     errors.push('copied-free-reader-meaning:'+section.id+':'+topic+':'+card.id);
   }
  }
 }
 return [...new Set(errors)];
}
module.exports={inspect,similarity,minimumValueProblems};
