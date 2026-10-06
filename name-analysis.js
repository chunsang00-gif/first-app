/* Korean name analysis v0.1
 * Conservative V1: character meaning + before/after comparison only.
 * Stroke numerology / phonetic five-elements / resource five-elements remain blocked
 * until a single documented school and verified character dataset are selected.
 */
const HANJA={
 '朴':{reading:'박',meaning:'성씨 박'},
 '峻':{reading:'준',meaning:'높고 준엄함, 기준이 분명함'},
 '慜':{reading:'민',meaning:'총명하고 민첩하게 살핌'},
 '昶':{reading:'창',meaning:'밝고 길게 뻗음'},
 '祐':{reading:'우',meaning:'도움과 복을 보탬'}
};
function chars(s=''){return [...s.trim()]}
function analyze(name,hanja){const hs=chars(hanja);if(!name||!hs.length)return {status:'missing'};const unknown=hs.filter(c=>!HANJA[c]);if(unknown.length)return {status:'needs_verified_dictionary',unknown};return {status:'ready',name,hanja,characters:hs.map(c=>({char:c,...HANJA[c]})),meaningSummary:hs.map(c=>HANJA[c].meaning)}}
function compare({currentName,currentHanja,oldName,oldHanja,renameDate}){const current=analyze(currentName,currentHanja);if(current.status!=='ready')return {status:'blocked',current};if(!oldName&&!oldHanja)return {status:'ready',current,former:null,renameDate:renameDate||null,limits:['이름이 사주나 성격을 바꿨다고 단정하지 않음']};const former=analyze(oldName,oldHanja);if(former.status!=='ready')return {status:'blocked',current,former};return {status:'ready',current,former,renameDate:renameDate||null,comparison:{currentThemes:current.meaningSummary,formerThemes:former.meaningSummary},limits:['개명 전후 차이는 한자 의미의 상징적 비교로만 제시','개명 때문에 운명·성격·사건이 바뀌었다고 인과 추론하지 않음','획수 수리·발음오행·자원오행은 규칙/사전 검증 전 출력 금지']}}
module.exports={HANJA,analyze,compare};