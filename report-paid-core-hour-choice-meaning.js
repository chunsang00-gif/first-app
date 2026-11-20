'use strict';
// The hour-hidden meaning cannot earn premium reader value merely by
// appearing once in a glossary-style introductory sentence. When the buyer
// clearly gave TWO alternatives, BOTH conditional explanations must apply
// the verified, source-owned role. This is a lexical minimum, not a human
// judgment of a Saju interpretation or a sale authorization.
const {alternatives}=require('./report-paid-core-choice-application');
const hourEvidence=require('./report-paid-core-hour-extension');
const bindings=require('./report-fact-bindings');
const ROLES=Object.freeze({
 skill:Object.freeze({
  식신:Object.freeze({
   meaning:/(?:결과물|완성|만들|제작|산출|생산|표현|눈에 보이는 결과|결과로 나타내|만들어 보여)/,
   writer:'각 선택을 해석하는 별도 문장마다 익힌 내용을 결과물로 남기거나 완성하는 전통적 질문을 직접 연결한다. 출생시간 의미를 도입부에만 설명하고 두 선택에는 일반 조언을 쓰면 실패다.'
  }),
  상관:Object.freeze({
   meaning:/(?:규칙|절차|방식|방법|표현|고치|개선|바꾸|변경|수정|다르게|재구성)/,
   writer:'각 선택에서 기존 규칙이나 표현 방식을 유지·바꾼다는 별도 전통적 질문을 직접 연결한다. 어떤 방법을 바꾸는지 없이 정보를 충분히 보라는 조언만 쓰면 실패다.'
  })
 }),
 money:Object.freeze({
  정재:Object.freeze({
   meaning:/(?:정기|반복|고정|매달|매월|예산|비용|지출|저축|금액|관리|자금)/,
   writer:'두 선택의 각 문장에서 정해진 돈이나 반복적으로 들어갈 자원을 별도 계산 조건으로 구체화한다. 돈은 신중해야 한다는 상식만 적지 않는다.'
  }),
  편재:Object.freeze({
   meaning:/(?:외부|경로|조달|확보|마련|자원|수단|여러 경로|다른 곳)/,
   writer:'두 선택의 각 문장에서 필요한 자원을 어떤 경로로 확보하거나 바꿀지 다른 조건으로 설명한다. 단순히 자금 계획이 필요하다는 말로 대신하지 않는다.'
  })
 }),
 pressure:Object.freeze({
  정관:Object.freeze({
   meaning:/(?:정해진|규칙|절차|승인|책임|역할|기준|담당|허가)/,
   writer:'두 선택의 각 문장에서 실제로 검토할 정해진 책임·규칙 또는 승인 기준을 연결한다. 규칙을 따라야 한다는 똑같은 조언을 반복하지 않는다.'
  }),
  편관:Object.freeze({
   meaning:/(?:긴급|예외|추가|갑작|돌발|요구|책임|대응|범위|예상하지 못)/,
   writer:'두 선택의 각 문장에서 갑자기 늘어난 요구나 예외를 어디까지 감당할지 조건을 나누어 설명한다. 무조건 조심하라는 경고로 끝내지 않는다.'
  })
 })
});
const checks=Object.freeze([
 /(?:검수|납기|담당|완료|기존 결과물|기존 방법|실제 비교|오류|수량|재검)/,
 /(?:연습|실습|과제|학습 결과|완성 조건|완성 기준|작은 결과물|시험 결과)/,
 /(?:기간|시간|일정|마감|언제|횟수|시점)/,
 /(?:비용|예산|금액|자원|도구|장비|필요한 돈|한도)/,
 /(?:승인|책임|절차|규칙|허가|기존 방식|변경 기준)/,
 /(?:외부|조달|경로|수단|확보|조정|예외|긴급 요청)/
]);
const CONDITION=/(?:경우|때|한다면|하면|하려면|라면|상황|선택하면)/;
// A domain match ("learning", "money", "pressure") is too broad to
// certify that the paid paragraph actually answered a ONE-CONCERN buyer.
// Priority is most specific first. Each item requires a concrete subject
// from the customer question to reappear INSIDE the conditional explanation,
// with the actual independent hour role and an actionable check. These are
// conservative mechanical checks, not proof of personal truth or paid value.
const SINGLE_FOCUS=Object.freeze({
 skill:Object.freeze([
  {ask:/지게차|포크리프트/,answer:/지게차|포크리프트/},
  {ask:/자격증|자격\s*취득|자격시험/,answer:/자격증|자격|시험/},
  {ask:/실습|연습/,answer:/실습|연습/},
  {ask:/기술/,answer:/기술/},
  {ask:/배우|익히|학습|공부|교육|훈련|수업/,answer:/배우|배운|익히|학습|공부|교육|훈련|수업/},
  {ask:/제작|만들|창작/,answer:/제작|만들|창작/}
 ]),
 money:Object.freeze([
  // The action sought is more important than the source of the money.
  // "Reduce spending from salary" must NOT pass by discussing salary alone.
  {ask:/대출|상환/,answer:/대출|상환/},
  {ask:/지출|소비/,answer:/지출|소비/},
  {ask:/저축|적금/,answer:/저축|적금/},
  {ask:/투자|주식|코인/,answer:/투자|주식|코인/},
  {ask:/월급|연봉|급여/,answer:/월급|연봉|급여/},
  {ask:/자금|금전|수입|소득|돈을|돈이|돈은/,answer:/자금|금전|수입|소득|돈/}
 ]),
 pressure:Object.freeze([
  {ask:/책임|담당/,answer:/책임|담당/},
  {ask:/마감|납기/,answer:/마감|납기/},
  {ask:/업무\s*압박|업무\s*요구/,answer:/업무|압박|요구/},
  {ask:/스트레스|긴장|과로|부담|압박/,answer:/스트레스|긴장|과로|부담|압박/},
  {ask:/요구/,answer:/요구/}
 ])
});
const SINGLE_CHECK=/(?:기준|범위|기간|횟수|마감|납기|비용|예산|한도|자원|도구|장비|승인|검수|검토|점검|완성|책임|담당|계획|경로|조건|비교|확인|절차)/;
const HOUR_MEANING_CONTEXT=/(?:태어난\s*시간|출생\s*시간|출생시각|시간의\s*(?:숨은|안쪽|속)\s*글자)/;
function taskFor(proof){
 if(!proof)return null;
 const scope=ROLES[proof.readerDomain]?.[proof.hourHiddenRole];
 if(!scope||proof.kind!=='buyer-choice-hour-symbolic-extension-v1'||
    proof.distinctFromFreeVisibleNatal!==true||
    !Array.isArray(proof.sourceRefs)||proof.sourceRefs.length!==2||
    !proof.sourceRefs.includes('natal.hour.stem')||
    !proof.sourceRefs.some(x=>x.startsWith('natal.hour.hidden.')))
  throw Error('PAID_HOUR_CHOICE_SCOPE_UNVERIFIED');
 return scope;
}
// In the original provider schema the two-choice direction was appended
// even when the customer had asked a SINGLE question. Match the actual
// input, without declaring an unparseable question a quality PASS.
function writerFor(proof,question){
 const scope=taskFor(proof);
 const role=require('./report-paid-core-hour-extension')
  .DOMAINS[proof.readerDomain]?.meanings?.[proof.hourHiddenRole];
 if(!role)throw Error('PAID_HOUR_SINGLE_READER_MEANING_UNVERIFIED');
 return alternatives(question)?scope.writer:
  '이 고객은 두 선택지를 직접 입력하지 않았다. '+ 
  '출생시간 안쪽 글자의 ‘'+role+'’라는 별도 질문을 고객이 실제로 적은 한 가지 고민에만 조건부로 적용한다. '+
  '대안이 없는 질문에 새로운 직장·기술·금전 선택지를 만들어 두 가지 경우처럼 비교하지 않는다. '+
  '고객의 실제 능력이나 결과를 예언하지 않고, 해당 고민에서 무엇을 확인할 수 있는지만 설명한다.';
}
function singleFocus(question,proof){
 const available=SINGLE_FOCUS[proof?.readerDomain]||[];
 return available.find(x=>x.ask.test(String(question||'')))||null;
}
function inspectSingleConcern(text,question,proof){
 const scope=taskFor(proof);
 if(typeof text!=='string'||!text.trim())
  return ['buyer-single-concern-paragraph-missing'];
 const focus=singleFocus(question,proof);
 if(!focus)return ['buyer-single-concern-focus-unverifiable'];
 // Quoting the user's exact text doesn't demonstrate an additional
 // interpretation. Remove it before measuring the actual paid explanation.
 const withoutEcho=text.split(String(question).trim()).join(' ');
 const sentences=withoutEcho.split(/[.!?。！？\n;,，；]+|\s+(?:반면|한편)\s+/)
  .map(v=>v.trim()).filter(v=>v.length>=25);
 // A role label at the beginning followed by generic advice to ANYONE
 // cannot make the subsequent advice a reader-specific, paid interpretation.
 const applied=sentences.some(x=>CONDITION.test(x)&&
  focus.answer.test(x)&&scope.meaning.test(x)&&SINGLE_CHECK.test(x));
 const errors=[];
 if(!applied)errors.push('buyer-single-concern-not-grounded-in-hour-role');
 // Require an honest connection to the HOUR position somewhere in the
 // paragraph: day/month prose is not enough, even if the role words appear.
 if(!sentences.some(x=>HOUR_MEANING_CONTEXT.test(x)&&scope.meaning.test(x)))
  errors.push('buyer-single-concern-hour-role-not-explained');
 return errors;
}
function inspectParagraph(text,question,proof){
 const choice=alternatives(question);
 if(!choice)return inspectSingleConcern(text,question,proof);
 const scope=taskFor(proof);
 if(!scope)return []; // only the actual verified additional birth-hour path
 if(typeof text!=='string'||!text.trim())
  return ['buyer-hour-choice-paragraph-missing'];
 // Splitting contrast pivots and commas respects fluent Korean two-clause
 // sentences. Do not count intro or a combined A/B slogan as application.
 const clauses=text.split(/[.!?。！？\n;,，；]+|\s+(?:반면|반대로|한편|이에\s*비해|그에\s*비해)\s+/)
  .map(s=>s.trim()).filter(s=>s.length>=24);
 const candidates=words=>clauses.map((value,index)=>({value,index}))
  .filter(x=>CONDITION.test(x.value)&&
   words.some(word=>word.length>=2&&x.value.includes(word)));
 const first=candidates(choice.first),second=candidates(choice.second);
 const anchored=xs=>xs.filter(x=>scope.meaning.test(x.value));
 const a=anchored(first),b=anchored(second);
 const errors=[];
 if(!a.length)errors.push('buyer-first-option-lacks-hour-role-meaning');
 if(!b.length)errors.push('buyer-second-option-lacks-hour-role-meaning');
 if(a.length&&b.length&&!a.some(x=>b.some(y=>x.index!==y.index)))
  errors.push('buyer-hour-role-not-applied-in-independent-clauses');
 if(a.length&&b.length){
  // Names of the two buyer alternatives are not a distinct confirmation
  // standard. Two clauses should ask about DIFFERENT tangible checks.
  const profiles=xs=>xs.map(x=>({index:x.index,marks:checks
   .map((re,i)=>re.test(x.value)?i:-1).filter(i=>i>=0)}));
  const A=profiles(a),B=profiles(b);
  if(!A.some(x=>B.some(y=>x.index!==y.index&&
      x.marks.length&&y.marks.length&&
      (x.marks.some(k=>!y.marks.includes(k))||
       y.marks.some(k=>!x.marks.includes(k))))))
   errors.push('buyer-hour-role-choices-have-no-distinct-checks');
 }
 return errors;
}
function inspect(sections,packet){
 const core=(sections||[]).find(x=>x?.id==='saju_core');
 if(!core||packet?.status!=='ready')return [];
 const question=packet.person?.readerDecision;
 if(typeof question!=='string'||!question.trim())return [];
 const source=Object.fromEntries(bindings.build(packet).map(row=>[row.id,row]));
 const proof=hourEvidence.build(packet,source);
 if(!proof)return [];
 const pos=core.bodyTopics?.indexOf('temperament')??-1;
 if(pos<0||!Array.isArray(core.body))
  return ['saju_core:buyer-hour-choice-paragraph-missing'];
 return inspectParagraph(core.body[pos],question,proof)
  .map(error=>'saju_core:'+error);
}
module.exports={taskFor,writerFor,singleFocus,inspectSingleConcern,inspectParagraph,inspect};
