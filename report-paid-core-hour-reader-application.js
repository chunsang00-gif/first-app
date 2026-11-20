'use strict';
// A real paid hour claim needs exact HOUR citations AND a distinct reader
// application. Mechanical boundary only; not human editorial approval.
function inspect(p,monthText,proof){
 if(!proof)return [];
 if(!p||!Array.isArray(p.basis?.refs)||typeof p.text!=='string')
  return ['missing-hour-paragraph'];
 const errors=[];
 if(!Array.isArray(proof.sourceRefs)||proof.sourceRefs.length!==2||
    p.basis.refs.length!==2||
    new Set(p.basis.refs).size!==2||
    !proof.sourceRefs.every(ref=>p.basis.refs.includes(ref)))
  errors.push('missing-hour-pair-citations');
 const sentences=p.text.split(/[.!?。！？\n]+/).map(s=>s.trim()).filter(s=>s.length>=23);
 const hour=/(?:태어난\s*시간|출생\s*시간|출생시각|시간의\s*(?:숨은|안쪽|속)\s*글자)/;
 // The actual source binds ONE hidden-hour role. Even a paragraph with
 // correct citations and generic role vocabulary must not NAME a different
 // traditional category as the calculated hour reading. Keep plain Korean
 // without any label valid; only reject an explicit contradictory label.
 const roleNames=/(?:^|[^가-힣])(비견|겁재|식신|상관|편재|정재|편관|정관|편인|정인)(?=$|[^가-힣]|(?:은|는|이|가|을|를|에|의|로|으로|와|과|이고|이며|입니다|이라고|라는)(?=[^가-힣]|$))/g;
 const namedHourRoles=sentences.filter(s=>hour.test(s))
  .flatMap(s=>[...s.matchAll(roleNames)].map(m=>m[1]));
 if(namedHourRoles.some(role=>role!==proof.hourHiddenRole))
  errors.push('hour-source-explicit-category-conflicts-with-calculation');
 const rules={
  skill:{
   concern:/(?:배우|배운|배울|익히|익힌|익힐|학습|공부|기술|교육|연습|방법)/,
   roles:{
    식신:/(?:결과물|완성|만들|제작|산출|생산|보여\s*주|표현|결과로\s*나타내|눈에\s*보이는\s*결과)/,
    상관:/(?:규칙|방식|방법|표현|다르게|바꾸|변경|고치|재구성)/
   }
  },
  money:{
   concern:/(?:돈|비용|지출|수입|수익|자금|저축|매번|반복|마련|재원|재산|월급|연봉|투자)/,
   roles:{
    정재:/(?:정해진|일정한|반복|정기|정해\s*놓은|비용|관리|유지)/,
    편재:/(?:여러\s*경로|새로운\s*경로|외부|마련|확보|조달|다양한\s*수단)/
   }
  },
  pressure:{
   concern:/(?:요구|압박|부담|절차|책임|규칙|업무|급한|긴장|스트레스|마감)/,
   roles:{
    정관:/(?:규칙|정해진|승인|절차|책임|역할|기준)/,
    편관:/(?:예상하지\s*못한|돌발|갑작|새로운\s*요구|긴급|경계|책임\s*범위)/
   }
  }
 };
 const scoped=rules[proof.readerDomain||'skill'];
 const concern=scoped?.concern,output=scoped?.roles[proof.hourHiddenRole];
 if(!output||!sentences.some(s=>hour.test(s)&&output.test(s)))
  errors.push('missing-hour-specific-meaning');
 if(!concern||!output||!sentences.some(s=>concern.test(s)&&output.test(s)&&
   /(?:때|경우|상황|과정|한다면|하려면|구별|비교|다르|반면|대신|조건)/.test(s)))
  errors.push('missing-conditional-study-application');
 const norm=s=>String(s||'').normalize('NFKC').replace(/[\s.,!?。！？]+/g,'');
 if(norm(p.text)===norm(monthText)||!sentences.some(s=>
    !norm(monthText).includes(norm(s))))
  errors.push('repeated-month-paragraph');
 return errors;
}
module.exports={inspect};
