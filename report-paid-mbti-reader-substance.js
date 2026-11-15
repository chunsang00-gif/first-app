'use strict';
// Reader-facing quality gate for the FOUR independent user-entered MBTI
// preference paragraphs, not a personality diagnosis or Saju inference.
// Validate only the selected topic body; unknown type / omitted slots abstain.
const DIMENSIONS=Object.freeze({
 energy:{focus:/혼자|상호작용|대화|교류|주고받|외부|내향|외향|사람|생각을 정리/,
  code:{I:/혼자|스스로|내부|속으로|내향|자기 생각/,
        E:/대화|교류|주고받|외부|외향|사람들과|함께 이야기|상호작용/}},
 information:{focus:/정보|자료|구체|사실|연결|가능성|경험|해석|알아보|살펴보/,
  code:{S:/구체|사실|경험|확인|자료|증거|실제 사례/,
        N:/연결|가능성|해석|의미|아이디어|패턴|관계|새로운 방향/}},
 judgment:{focus:/판단|결정|선택|원칙|가치|논리|기준|영향|중요한/,
  code:{T:/논리|원칙|일관|기준|근거|규칙|이유|판단의 타당성/,
        F:/가치|사람|관계|마음|영향|배려|감정|중요하게 여/}},
 planning:{focus:/일정|계획|마감|미리|확정|조정|변경|수정|여지|열어|결정|정리/,
  code:{J:/미리|계획|마감|확정|일찍|정해|정리|완료|시한/,
        P:/여지|열어|변경|조정|수정|유연|상황에 맞|선택지를 남|가능성을 남/}}
});
const index=Object.freeze({energy:0,information:1,judgment:2,planning:3});
const chars=value=>String(value||'').normalize('NFKC').toLowerCase()
 .replace(/[^가-힣a-z0-9]/g,'');
const grams=value=>{
 const str=chars(value),out=new Set();
 for(let i=0;i+4<=str.length;i++)out.add(str.slice(i,i+4));
 return out;
};
function similarity(a,b){
 const A=grams(a),B=grams(b);
 if(A.size<20||B.size<20)return 0;
 let shared=0;
 for(const word of A)if(B.has(word))shared++;
 return shared/Math.min(A.size,B.size);
}
function inspect(section,type){
 if(!section||typeof section!=='object'||!/^[EI][SN][TF][JP]$/.test(type||''))
  return [];
 const errors=[],observed=[];
 for(let i=0;i<(section.bodyTopics||[]).length;i++){
  const topic=section.bodyTopics[i],spec=DIMENSIONS[topic];
  if(!spec)continue;
  const content=String(section.body?.[i]||'').trim();
  if(!content)continue; // optional null is not a licensed invented paragraph
  const selected=type[index[topic]],specific=spec.code[selected];
  if(!specific)throw Error('PAID_MBTI_READER_SOURCE_CODE_DRIFT:'+topic);
  if(content.length<75)
   errors.push('mbti_contradiction: '+topic+' standalone explanation too thin');
  if(!spec.focus.test(content)||!specific.test(content))
   errors.push('mbti_contradiction: '+topic+' selected preference meaning missing');
  for(const previous of observed){
   if(similarity(content,previous.content)>=0.82)
    errors.push('mbti_contradiction: repeated independent preference content: '+
     previous.topic+' / '+topic);
  }
  observed.push({topic,content});
 }
 return [...new Set(errors)];
}
module.exports={inspect,similarity};
