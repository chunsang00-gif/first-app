/* Structured paid-report renderer v1.2 */
const REPORT_RENDERER=(()=>{
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const list=x=>Array.isArray(x)?x:(x?[x]:[]);
const paragraph=x=>`<p>${esc(x)}</p>`;
const branchInfo={子:['쥐띠','🐭','자','쥐'],丑:['소띠','🐮','축','소'],寅:['호랑이띠','🐯','인','호랑이'],卯:['토끼띠','🐰','묘','토끼'],辰:['용띠','🐲','진','용'],巳:['뱀띠','🐍','사','뱀'],午:['말띠','🐴','오','말'],未:['양띠','🐑','미','양'],申:['원숭이띠','🐒','신','원숭이'],酉:['닭띠','🐓','유','닭'],戌:['개띠','🐕','술','개'],亥:['돼지띠','🐖','해','돼지']};
const stemInfo={甲:['갑','큰 나무'],乙:['을','풀과 덩굴'],丙:['병','큰 불'],丁:['정','작은 불'],戊:['무','큰 흙'],己:['기','부드러운 흙'],庚:['경','단단한 쇠'],辛:['신','정제된 쇠'],壬:['임','큰 물'],癸:['계','작은 물']};
function zodiacFor(report){const p=String(report?.meta?.chart?.year||'');return branchInfo[p.slice(-1)]||['띠 정보 없음','✨','','']}
function hanjaMeaning(ch){if(stemInfo[ch])return `${ch}(${stemInfo[ch][0]}: ${stemInfo[ch][1]})`;if(branchInfo[ch])return `${ch}(${branchInfo[ch][2]}: ${branchInfo[ch][3]}를 상징하는 지지)`;return ch}
function pillarLabel(p){return [...String(p||'')].map(hanjaMeaning).join(' · ')}
function sajuTable(report){const ch=report?.meta?.chart||{};const rows=[['연주',ch.year],['월주',ch.month],['일주',ch.day],['시주',ch.hour]];return `<div class="saju-table-wrap"><table class="saju-table"><thead><tr><th>구분</th><th>사주</th><th>한자 뜻</th></tr></thead><tbody>${rows.filter(([,v])=>v).map(([k,v])=>`<tr><th>${k}</th><td>${esc(v)}</td><td>${esc(pillarLabel(v))}</td></tr>`).join('')}${!ch.hour?'<tr><th>시주</th><td>시간 모름</td><td>출생시간을 입력하지 않아 계산하지 않음</td></tr>':''}</tbody></table></div>`}
const themes={saju_core:['나의 기본값','✦','tone-saju'],mbti_contradiction:['의외의 반전','↯','tone-mbti'],decision:['결정하는 방식','◇','tone-decision'],money:['돈을 대하는 방식','₩','tone-money'],career:['일할 때의 나','↗','tone-career'],relationship:['사람 사이의 나','♡','tone-relation'],stress:['흔들릴 때의 나','~','tone-stress'],integrated_judgment:['사주 × MBTI','◎','tone-integrated'],year_2027:['2027 한눈에 보기','27','tone-year'],year_2027_money:['2027 돈','₩','tone-money'],year_2027_career:['2027 일','↗','tone-career'],year_2027_relationship:['2027 관계','♡','tone-relation']};
function section(s,i,report){const t=themes[s.id]||['DEEP DIVE','•',''];const table=s.id==='saju_core'?sajuTable(report):'';return `<section class="section detail-section ${t[2]}" id="detail-${esc(s.id)}" data-report-id="${esc(s.id)}"><header class="detail-head"><div><div class="num">${String(i+1).padStart(2,'0')} · ${esc(t[0])}</div><h2>${esc(s.title)}</h2></div><div class="detail-symbol" aria-hidden="true">${esc(t[1])}</div></header>${table}<div class="detail-copy">${list(s.body).filter(Boolean).map(paragraph).join('')}</div><div class="verdict"><b>핵심 판정</b><p>${esc(s.keyJudgment)}</p></div><button class="back-summary" type="button">↑ 요약으로 돌아가기</button></section>`}
function render(report,target){
 const gate=window.REPORT_VALIDATOR?.validate(report)||{pass:false,errors:['validator unavailable']};
 if(!gate.pass){target.innerHTML=`<section class="section"><h2>리포트를 표시할 수 없습니다.</h2><p>${esc(gate.errors.join(' / '))}</p></section>`;return gate}
 const input=window.LIVE_REPORT_UI?.input?.()||{};
 const [animal,emoji]=zodiacFor(report);
 const name=report?.meta?.name||input.name||'당신';
 const mbti=report?.meta?.mbti||input.mbti||'모름';
 const first=report.sections?.[0];
 const summaryIds=['saju_core','mbti_contradiction','money','career','relationship','year_2027'];
 const summarySections=summaryIds.map(id=>(report.sections||[]).find(s=>s.id===id)).filter(Boolean);
 const tags=summarySections.map(x=>x.keyJudgment).filter(Boolean).map(x=>String(x).replace(/[.!?].*$/,'').slice(0,18));
 target.innerHTML=`<section class="result-hero"><div class="hero-copy"><div class="eyebrow">SAJU × MBTI PERSONAL REPORT</div><h1>${esc(name)}</h1><div class="hero-badges"><span>${esc(mbti)}</span><span>${emoji} ${esc(animal)}</span></div><p class="hero-line">${esc(first?.keyJudgment||'당신의 사주와 MBTI를 함께 읽었습니다.')}</p><div class="tag-row">${tags.slice(0,4).map(t=>`<span>#${esc(t)}</span>`).join('')}</div></div><div class="zodiac-mark" aria-label="${esc(animal)}">${emoji}</div></section>`+
 `<section class="quick-card"><div class="num">AT A GLANCE</div><h2>한눈에 보는 나</h2><div class="quick-grid">${summarySections.map(s=>`<button class="quick-link" type="button" data-target="detail-${esc(s.id)}"><strong>${esc(s.title)}</strong><p>${esc(s.keyJudgment)}</p><span>자세히 보기 →</span></button>`).join('')}</div></section>`+
 `<div class="full-report-action"><button class="btn primary" id="viewFullReport" type="button">전체 내용 보기</button></div>`+report.sections.map((s,i)=>section(s,i,report)).join('')+
 `<section class="section final-card"><div class="num">FINAL</div><h2>마지막으로, 당신에게 묻습니다</h2>${list(report.finalJudgment?.body).map(paragraph).join('')}<p class="quote">${esc(report.finalJudgment.closingQuestion)}</p></section>`;
 target.querySelectorAll('.quick-link').forEach(btn=>btn.addEventListener('click',()=>document.getElementById(btn.dataset.target)?.scrollIntoView({behavior:'smooth',block:'start'}))); target.querySelectorAll('.back-summary').forEach(btn=>btn.addEventListener('click',()=>target.querySelector('.quick-card')?.scrollIntoView({behavior:'smooth',block:'start'})));
 target.querySelector('#viewFullReport')?.addEventListener('click',()=>target.querySelector('.detail-section')?.scrollIntoView({behavior:'smooth',block:'start'}));
 return gate
}
return {render};})();window.REPORT_RENDERER=REPORT_RENDERER;