"use strict";
// One policy for visible copy. Calculation evidence and chart symbols stay intact.
const instruction='독자에게 보이는 제목·소제목·핵심 판단·본문·표지·총평에는 한자와 명리 전문용어를 쓰지 않는다. 원국·일간·월지·상관·겁재 같은 이름에 괄호 설명을 붙여 남기는 대신 그 뜻을 평소 쓰는 말로 풀어 쓴다. 정확한 계산 위치·글자·십성과 해석의 연결은 내부 evidence에 보존한다. 처음 등장할 때부터 쉬운 뜻으로 설명하되 이유·상황·행동을 삭제해 요약하지 않는다. 계산표의 기호는 이 본문 규칙과 구분한다.';
// Do not reject everyday homographs such as 시간, 상관없다, 정관 수술.
const unambiguous=/(?<![가-힣])(?:원국|일간|월간(?=의|에|은|이|\s*(?:겁재|비견|편관|정관))|월지|일지(?=의|에|는|\s*지장간)|시지|지장간|십성|겁재|식신|편재|정재|편관|편인|정인|신강|신약|용신|통근(?=\s*(?:\(|（|은|이란|의|을))|월령|세운|대운|경금|갑목|을목|병화|정화|무토|기토|신금|임수|계수)/g;
const ambiguous=/(?:^|[\s(（·,])(상관|비견|정관)(?=$|[\s()（）·,]|은|는|이란|이라|입니다|으로|의|에|을|를|이\s|가\s|처럼)/g;
function errors(fields){
 const result=new Set();
 for(const field of fields){const text=String(field||'').normalize('NFKC');
  for(const m of text.matchAll(unambiguous))result.add('reader jargon: '+m[0]);
  for(const m of text.matchAll(ambiguous)){if(m[1]==='정관'&&/^정관\s*(?:수술|절제)/.test(text.slice(m.index).trim()))continue;if(m[1]==='상관'&&/^상관(?:이|은)?\s*(?:없|있)/.test(text.slice(m.index).trim()))continue;result.add('reader jargon: '+m[1]);}
 }
 return [...result];
}
function visibleFields(r){return [r.cover?.headline,r.cover?.description,...(r.cover?.keywords||[]),...(r.cover?.highlights||[]).flatMap(h=>[h.title,h.description]),...(r.sections||[]).flatMap(s=>[s.title,s.keyJudgment,...(s.bodyLabels||[]),...(s.body||[])]),r.finalJudgment?.headline,...(r.finalJudgment?.body||[]),...(r.finalJudgment?.strengths||[]),...(r.finalJudgment?.watchouts||[]),...(r.finalJudgment?.routines||[]).flatMap(x=>[x.trigger,x.action,x.reason]),r.finalJudgment?.closingQuestion];}
module.exports={instruction,errors,visibleFields};
