'use strict';
// A real paid hour claim needs exact HOUR citations AND a distinct reader
// application. Mechanical boundary only; not human editorial approval.
function inspect(p,monthText,proof){
 if(!proof)return [];
 if(!p||!Array.isArray(p.basis?.refs)||typeof p.text!=='string')
  return ['missing-hour-paragraph'];
 const errors=[];
 if(!Array.isArray(proof.sourceRefs)||proof.sourceRefs.length!==2||
    !proof.sourceRefs.every(ref=>p.basis.refs.includes(ref)))
  errors.push('missing-hour-pair-citations');
 const sentences=p.text.split(/[.!?。！？\n]+/).map(s=>s.trim()).filter(s=>s.length>=23);
 const hour=/(?:태어난\s*시간|출생\s*시간|출생시각|시간의\s*(?:숨은|안쪽|속)\s*글자)/;
 const study=/(?:배우|배운|배울|익히|익힌|익힐|학습|공부|기술|교육|연습|방법)/;
 const output=proof.hourHiddenRole==='식신'?
  /(?:결과물|완성|만들|제작|산출|생산|보여\s*주|표현)/:
  proof.hourHiddenRole==='상관'?
  /(?:규칙|방식|방법|표현|다르게|바꾸|변경|고치|재구성)/:null;
 if(!output||!sentences.some(s=>hour.test(s)&&output.test(s)))
  errors.push('missing-hour-specific-meaning');
 if(!output||!sentences.some(s=>study.test(s)&&output.test(s)&&
   /(?:때|경우|상황|과정|한다면|하려면|구별|비교|다르|반면|대신)/.test(s)))
  errors.push('missing-conditional-study-application');
 const norm=s=>String(s||'').normalize('NFKC').replace(/[\s.,!?。！？]+/g,'');
 if(norm(p.text)===norm(monthText)||!sentences.some(s=>
    !norm(monthText).includes(norm(s))))
  errors.push('repeated-month-paragraph');
 return errors;
}
module.exports={inspect};
