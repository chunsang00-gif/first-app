'use strict';
// Actual paid-response boundary for younger readers. Birth year and target
// year are validated inputs, NOT evidence of school, family, job or income.
const rule='출생연도 기준 대상 연도의 어린 독자 또는 성인 경계 독자입니다. 실제 학교 재학·회사 근무·연봉·투자 경험·결혼·대출·양육을 확인한 것처럼 쓰지 않습니다. 직업·금전·관계·연도별 전통 분류를 성인 생활을 이미 겪은 사실로 쓰지 말고 출생 계산에서 확인된 뜻과 적용할 수 있는 가정의 조건만 쉽게 설명합니다. 독자가 실제 어떤 학교·직장·가족 환경에 있는지는 제공되지 않았습니다. 성인 직장·혼인 사례로 설명을 채우지 않습니다. 새로운 해석 근거가 없으면 일반적인 조언이나 성장·성공 이야기를 만들지 않습니다.';
function forPrompt(prompt){
 if(!['body','synthesis'].includes(prompt?.stage))return null;
 const packet=prompt.facts,date=packet?.calculationInput?.birthDate;
 const year=packet?.targetYear?.year;
 if(packet?.status!=='ready'||typeof date!=='string'||!Number.isInteger(year))return null;
 const match=/^([12]\d{3})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.exec(date);
 if(!match)return null;
 const birthYear=Number(match[1]),ageByCalendarYear=year-birthYear;
 if(ageByCalendarYear<0)throw Error('PAID_READER_BIRTH_YEAR_AFTER_TARGET');
 // Conservative edge for a reader who could still be 18 before a birthday.
 if(ageByCalendarYear>19)return null;
 return Object.freeze({kind:'young-reader-language-boundary-v1',
  birthYear,interpretiveYear:year,yearDifference:ageByCalendarYear,
  birthplaceNotLifestyleEvidence:true,noNewPaidChapter:true,
  noExtraModelCall:true,expertApproved:false,rule});
}
const hypothetical=/(?:만약|가령|가정|예를\s*들|한다면|있다면|라면|경우(?:에는|라면)?)/;
const limits=/(?:아니|않|없|미상|단정|예측|가정|확인할\s*수\s*없|보장|모르|판단할\s*수\s*없)/;
const invented=[
 /(?:당신은|당신이|본인은|본인이|이\s*사람은|독자는).{0,35}(?:현재|이미|평소).{0,25}(?:회사|직장)(?:에|에서).{0,22}(?:다니|근무|일하|출근)/,
 /(?:당신은|당신이|본인은|본인이|이\s*사람은|독자는).{0,40}(?:결혼(?:했|해)|배우자와\s*(?:살|생활)|자녀를\s*(?:키우|양육)|대출을\s*(?:갚|상환))/,
 /(?:당신은|본인은|독자는).{0,30}(?:연봉을\s*(?:받|협상)|주택담보대출을\s*(?:받|상환))/
];
function inspect(text,prompt){
 if(!forPrompt(prompt)||typeof text!=='string')return [];
 const sentences=text.split(/[.!?。！？\n]+/).map(x=>x.trim()).filter(Boolean);
 return sentences.some(s=>invented.some(re=>re.test(s))&&
  !hypothetical.test(s)&&!limits.test(s))?
  ['PAID_READER_INVENTED_ADULT_HISTORY']:[];
}
module.exports={forPrompt,inspect};
