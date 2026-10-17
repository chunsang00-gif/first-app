'use strict';
// The first chapter's single-sentence, source-grounded interpretive thesis
// is an OUTPUT CONTRACT, not a request for the model to improvise a summary.
// The provider may expand the prose, but may not silently add generic
// disclaimers or restate the chart dictionary as the main interpretation.
// All phrases are explicitly traditional readings, NOT observed personality.
// Crucially: no paid retry, no text replacement after receiving paid output.
const contrast=require('./report-chart-contrast');
const actions={
 비견:{first:'스스로 맡을 일을 정하고',last:'스스로 맡을 일을 정하려는',title:'스스로 맡는 일'},
 겁재:{first:'공동 자원과 자기 몫을 구분하고',last:'공동 자원과 자기 몫을 구분하려는',title:'함께 쓰는 자원과 자기 몫'},
 식신:{first:'생각을 차근차근 결과물로 만들고',last:'생각을 차근차근 결과물로 만들려는',title:'생각을 결과물로 만드는 방식'},
 상관:{first:'익숙한 방식에 다른 방법을 제안하고',last:'익숙한 방식에 다른 방법을 제안하려는',title:'익숙한 방법과 새로운 제안'},
 정재:{first:'반복되는 비용과 일을 꾸준히 관리하고',last:'반복되는 비용과 일을 꾸준히 관리하려는',title:'꾸준한 비용과 일의 관리'},
 편재:{first:'필요한 자원을 여러 곳에서 찾아 활용하고',last:'필요한 자원을 여러 곳에서 찾아 활용하려는',title:'필요한 자원을 찾아 활용하는 방식'},
 정관:{first:'규칙과 맡은 역할을 기준으로 판단하고',last:'규칙과 맡은 역할을 기준으로 판단하려는',title:'규칙과 맡은 역할의 기준'},
 편관:{first:'갑작스러운 요구에서 책임 범위를 살피고',last:'갑작스러운 요구에서 책임 범위를 살피려는',title:'갑작스러운 요구와 책임 범위'},
 정인:{first:'배운 내용과 주변 조언을 참고해 이해하고',last:'배운 내용과 주변 조언을 참고해 이해하려는',title:'배움과 주변의 조언'},
 편인:{first:'낯선 내용을 자기 방식으로 이해하고',last:'낯선 내용을 자기 방식으로 이해하려는',title:'낯선 정보를 이해하는 방식'}
};
const shortTitle={
 비견:'스스로 맡는 일',겁재:'자원과 자기 몫',
 식신:'생각의 결과물',상관:'새로운 제안',
 정재:'꾸준한 관리',편재:'필요한 자원 활용',
 정관:'규칙과 역할',편관:'요구와 책임',
 정인:'배움과 조언',편인:'낯선 정보 이해'
};
function forPrompt(prompt){
 if(prompt?.stage!=='body'||!prompt.requestedSections?.includes('saju_core'))return null;
 const calculated=contrast.build(prompt.facts)?.monthTenGodContext;
 if(!calculated?.monthStem?.tenGod||!calculated?.monthMainHidden?.tenGod)
  throw Error('NO_VERIFIED_MONTH_PAIR_FOR_CORE_THESIS');
 const first=calculated.monthStem,second=calculated.monthMainHidden;
 if(first.sourceId!=='natal.month.stem'||!second.sourceId?.startsWith('natal.month.hidden.'))
  throw Error('WRONG_MONTH_PROVENANCE_FOR_CORE_THESIS');
 const a=actions[first.tenGod],b=actions[second.tenGod];
 if(!a||!b)throw Error('UNKNOWN_MONTH_TEN_GOD_FOR_CORE_THESIS');
 const same=first.tenGod===second.tenGod;
 const title=same?a.title:shortTitle[first.tenGod]+' · '+shortTitle[second.tenGod];
 const keyJudgment='사주에서는 '+(same?a.last:a.first+' '+b.last)+' 기질로 풀이합니다.';
 if(!title||title.length>30||
    keyJudgment.split(/(?<=[.!?。！？])\\s+|\\n+/).filter(Boolean).length!==1||
    !keyJudgment.endsWith('풀이합니다.'))
  throw Error('INVALID_CORE_THESIS_CONTRACT');
 return {title,keyJudgment,sourceIds:[first.sourceId,second.sourceId],
  categories:[first.tenGod,second.tenGod],status:'traditional-reading-not-observed-trait'};
}
function assertDecoded(chapter,prompt){
 const expected=forPrompt(prompt);
 if(!expected)return;
 if(chapter?.title!==expected.title||chapter?.keyJudgment!==expected.keyJudgment)
  throw Error('AI report service violated grounded first-chapter title/judgment contract');
}
module.exports={forPrompt,assertDecoded};
