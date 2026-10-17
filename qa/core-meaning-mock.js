'use strict';
// Test fixture ONLY. Produces meaningful references to computed categories,
// never a customer-ready report or semantic quality certificate.
const core=require('../report-core-thesis');
const phrase={
 비견:'스스로 맡을 역할을 정하는',겁재:'공동으로 쓰는 자원과 자기 몫을 나누는',
 식신:'생각을 차근차근 결과물로 만드는',상관:'익숙한 방식과 다른 방법을 제안하는',
 정재:'반복되는 비용을 꾸준히 관리하는',편재:'필요한 자원을 여러 곳에서 찾아 마련하는',
 정관:'규칙과 맡은 역할을 먼저 확인하는',편관:'갑작스러운 요구에서 책임 범위를 살피는',
 정인:'배운 내용과 주변의 조언을 함께 참고하는',편인:'낯선 정보를 자기 방식으로 이해하는'
};
function fromKinds(kinds){
 if(!Array.isArray(kinds)||kinds.length!==2||kinds.some(k=>!phrase[k]))
  throw Error('Incomplete offline interpretation fixture');
 const [first,second]=kinds.map(k=>phrase[k]);
 return '새로운 일을 준비할 때 '+first+' 관점과 '+second+' 관점을 서로 연결해서 살펴보는 가상의 해석입니다. '+
  '예를 들어 새로운 업무를 시작할 때 무엇을 먼저 준비할지 살핀 뒤, 필요한 조건을 모두 갖추었는지 확인하는 경우를 생각할 수 있습니다. '+
  '한쪽 의미만 적용하면 다른 쪽에서 중요한 조건을 놓칠 수 있다는 설명이며 실제 성격이나 경험을 관찰한 것은 아닙니다.';
}
function body(prompt){
 const thesis=core.forPrompt(prompt);
 if(!thesis)throw Error('Missing computed offline month interpretation');
 return fromKinds(thesis.categories);
}
module.exports={body,fromKinds};
