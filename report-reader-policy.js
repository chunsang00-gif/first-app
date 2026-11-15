"use strict";
// One policy for visible copy. Calculation evidence and chart symbols stay intact.
const instruction='독자에게 보이는 제목·소제목·핵심 판단·본문·표지·총평에는 한자와 명리 전문용어를 쓰지 않는다. 원국·일간·월지·상관·겁재 같은 이름에 괄호 설명을 붙여 남기는 대신 그 뜻을 평소 쓰는 말로 풀어 쓴다. 정확한 계산 위치·글자·십성과 해석의 연결은 내부 evidence에 보존한다. 처음 등장할 때부터 쉬운 뜻으로 설명하되 이유·상황·행동을 삭제해 요약하지 않는다. 계산표의 기호는 이 본문 규칙과 구분한다.';
// Do not reject everyday homographs such as 시간, 상관없다, 정관 수술.
const unambiguous=/(?<![가-힣])(?:원국|명식|오행|일간|월간(?=의|에|은|이|\s*(?:겁재|비견|편관|정관))|월지|일지(?=의|에|는|와|을|를|가|도|에서|까지|부터|\s*지장간)|시지|지장간|십성|겁재|식신|편재|정재|편관|편인|정인|신강|신약|용신|통근(?=\s*(?:\(|（|은|이란|의|을))|월령|세운(?=$|[.,!?·()（）]|은|는|의|과|을|에|이(?:\s|다)|\s*(?:천간|지지|십성|분석|풀이|운세))|대운|경금|갑목|을목|병화|정화|무토|기토|신금|임수|계수)/g;
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
const readerField='독자가 그대로 읽는 문장이다. 한자·원국·일간·월지·십성·비견·겁재·식신·상관·편재·정재·편관·정관·편인·정인·세운·대운 같은 전문용어를 쓰지 않는다. 괄호 설명을 붙여 남기지 말고 뜻과 이유를 일상 한국어로 충분히 설명한다. 내부 근거를 복사하지 않는다.';
const evidenceField='내부 검증 자료다. 실제 계산 위치·글자·십성과 해석의 연결을 정확히 기록한다. 독자용 문장이 아니므로 원래 명칭을 보존한다. 실제 행동을 관찰했다는 증거로 바꾸지 않는다.';
const systemInstruction=instruction+' 계산 자료와 작성 계획에 있는 전문용어는 내부 분석을 위한 것이며 독자용 문장에 복사하라는 지시가 아니다. 제목·판단·문단은 구체적으로 어떤 상황에서 무엇을 선택하는지 설명한다. 같은 응답 안의 장끼리도 같은 이유와 결론을 반복하지 않는다. 글자의 반복만으로 성격의 강도·능력·실제 행동을 관찰했다고 주장하지 않는다. 사주만 환경 영향을 읽을 수 있고 MBTI는 읽을 수 없다는 차이를 만들지 않는다. 출력 전에 모든 독자용 필드를 검토해 위반 문장을 뜻과 이유가 살아 있는 쉬운 문장으로 고친 뒤 최종 JSON만 반환한다.';
// Annotate free-text schema leaves without changing values, enums or structure.
function describe(schema,description){
 const result=structuredClone(schema);
 function visit(node,key){
  if(!node||typeof node!=='object')return;
  if(node.type==='string'&&!node.enum&&!['sectionId','afterClosingText'].includes(key))node.description=[node.description,description].filter(Boolean).join(' ');
  for(const [k,v] of Object.entries(node.properties||{}))visit(v,k);
  if(node.items)visit(node.items,key);
  for(const v of node.anyOf||[])visit(v,key);
 }
 visit(result,'');return result;
}

// Enforce private-evidence vs public-copy separation after a single model call.
// Only explicit terminology is expanded; ambiguous claims still fail QA.
// Keep the original provider JSON archived, and never rewrite any evidence.
const readerExpansions=[
 [/월지의 계절적 위치/g,'태어난 달이 속한 시기'],
 [/일지와 시지/g,'태어난 날과 시간을 나타내는 자리'],
 [/(?<![가-힣])월지/g,'태어난 달을 나타내는 자리'],
 [/(?<![가-힣])일지(?=의|에|는|와|을|를|가|도|에서|까지|부터|\s|[.,!?·()])/g,'태어난 날을 나타내는 자리'],
 [/(?<![가-힣])시지/g,'태어난 시간을 나타내는 자리'],
 [/명식은/g,'사주는'],[/명식이/g,'사주가'],[/명식을/g,'사주를'],[/명식과/g,'사주와'],[/명식으로/g,'사주로'],
 [/(?<![가-힣])명식/g,'사주'],
 // Long mechanical enumeration was damaging headings and grammatical meaning.
 [/같은\s+오행/g,'같은 기운'],
 [/오행\s*뿌리/g,'기운의 뿌리'],
 [/오행의\s*관계/g,'기운 사이의 관계'],
 [/(?<![가-힣])오행/g,'기운'],
 [/(?<![가-힣])원국/g,'태어날 때의 사주 구성'],
 [/일간은/g,'태어난 날의 윗글자는'],[/일간이/g,'태어난 날의 윗글자가'],[/일간을/g,'태어난 날의 윗글자를'],[/일간과/g,'태어난 날의 윗글자와'],
 [/(?<![가-힣])일간/g,'태어난 날의 윗글자']
];
function plainText(text){
 if(typeof text!=='string')return text;
 return readerExpansions.reduce((s,[pattern,replacement])=>s.replace(pattern,replacement),text);
}
function normalizeVisible(report){
 if(!report||typeof report!=='object')return report;
 const result=structuredClone(report);
 for(const chapter of result.sections||[]){
  for(const key of ['title','keyJudgment'])chapter[key]=plainText(chapter[key]);
  for(const key of ['body','bodyLabels'])if(Array.isArray(chapter[key]))chapter[key]=chapter[key].map(plainText);
 }
 if(result.cover){
  for(const key of ['headline','description'])result.cover[key]=plainText(result.cover[key]);
  if(Array.isArray(result.cover.keywords))result.cover.keywords=result.cover.keywords.map(plainText);
  for(const card of result.cover.highlights||[])for(const key of ['title','description'])card[key]=plainText(card[key]);
 }
 if(result.finalJudgment){
  for(const key of ['headline','closingQuestion'])result.finalJudgment[key]=plainText(result.finalJudgment[key]);
  for(const key of ['body','strengths','watchouts'])if(Array.isArray(result.finalJudgment[key]))result.finalJudgment[key]=result.finalJudgment[key].map(plainText);
  for(const item of result.finalJudgment.routines||[])for(const key of ['trigger','action','reason'])item[key]=plainText(item[key]);
 }
 return result;
}

module.exports={instruction,errors,visibleFields,readerField,evidenceField,systemInstruction,describe,normalizeVisible,plainText};
