'use strict';
// QA-only check of EXPLICIT, active-voice factual descriptions of visible
// natal stem directions. It rejects a false elemental relation but deliberately
// does NOT infer an observed character, suitable job or realized strength.
// This limited recognizer never certifies the artistic quality of a manuscript.
const relations=require('./report-core-paid-natal-visible-relation-bridge');
const POS={해:'year',달:'month',시간:'hour'};
const PAIR=/태어난\s*(해|달|시간)의\s*(?:겉)?글자(?:가|는|은)\s*태어난\s*(해|달|시간)의\s*(?:겉)?글자(?:를|을|와|과)\s*(돕|도와|생하|제약(?:하|합|해)|극(?:하|합|해)|같은\s*오행)/g;
function inspect(readerText,packet,source){
 const graph=relations.build(packet,source);
 const map=new Map();
 for(const p of graph.pairs){
  const a=p.from.split('.')[1],b=p.to.split('.')[1],d=p.elementalDirection;
  map.set(a+'|'+b,d);
  map.set(b+'|'+a,{
   'left-generates-right':'right-generates-left',
   'right-generates-left':'left-generates-right',
   'left-controls-right':'right-controls-left',
   'right-controls-left':'left-controls-right',
   'same-element':'same-element'
  }[d]);
 }
 const errors=[];
 for(const sentence of String(readerText||'').split(/[.!?。！？\n]+/)){
  for(const match of sentence.matchAll(PAIR)){
   const left=POS[match[1]],right=POS[match[2]];
   if(left===right)continue;
   const tail=sentence.slice(match.index+match[0].length).trim();
   // Negated or explicitly unverified hypotheses are NOT affirmative claims.
   if(/^(?:지\s*(?:않|못)|는\s*것(?:은|이)\s*아니)/.test(tail)||
      /(?:단정할\s*수\s*없|판단할\s*수\s*없|확인할\s*수\s*없|뜻은\s*아니)/.test(tail))
    continue;
   const kind=/^(?:돕|도와|생하)/.test(match[3])?
    'left-generates-right':
    /^(?:제약(?:하|합|해)|극(?:하|합|해))/.test(match[3])?
     'left-controls-right':'same-element';
   const expected=map.get(left+'|'+right);
   if(expected&&expected!==kind)
    errors.push('QA_DEPTH_FALSE_NATAL_ELEMENT_DIRECTION:'+left+'-'+right);
  }
 }
 return [...new Set(errors)];
}
module.exports={inspect};
