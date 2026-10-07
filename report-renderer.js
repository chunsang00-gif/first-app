/* Structured paid-report renderer v1.2 */
const REPORT_RENDERER=(()=>{
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const list=x=>Array.isArray(x)?x:(x?[x]:[]);
const paragraph=x=>`<p>${esc(x)}</p>`;
const zodiac=[['원숭이띠','🐒'],['닭띠','🐓'],['개띠','🐕'],['돼지띠','🐖'],['쥐띠','🐭'],['소띠','🐮'],['호랑이띠','🐯'],['토끼띠','🐰'],['용띠','🐲'],['뱀띠','🐍'],['말띠','🐴'],['양띠','🐑']];
function zodiacFor(date){const y=Number(String(date||'').slice(0,4));return Number.isFinite(y)&&y?zodiac[((y-1980)%12+12)%12]:['띠 정보 없음','✨']}
function section(s,i){return `<section class="section detail-section" id="detail-${esc(s.id)}" data-report-id="${esc(s.id)}"><div class="num">${String(i+1).padStart(2,'0')}</div><h2>${esc(s.title)}</h2>${list(s.body).filter(Boolean).map(paragraph).join('')}<div class="verdict"><b>핵심 판정</b><p>${esc(s.keyJudgment)}</p></div></section>`}
function render(report,target){
 const gate=window.REPORT_VALIDATOR?.validate(report)||{pass:false,errors:['validator unavailable']};
 if(!gate.pass){target.innerHTML=`<section class="section"><h2>리포트를 표시할 수 없습니다.</h2><p>${esc(gate.errors.join(' / '))}</p></section>`;return gate}
 const input=window.LIVE_REPORT_UI?.input?.()||{};
 const [animal,emoji]=zodiacFor(input.birthDate);
 const name=report?.meta?.name||input.name||'당신';
 const mbti=report?.meta?.mbti||input.mbti||'모름';
 const first=report.sections?.[0];
 const tags=(report.sections||[]).slice(0,6).map(x=>x.keyJudgment).filter(Boolean).map(x=>String(x).replace(/[.!?].*$/,'').slice(0,18));
 target.innerHTML=`<section class="result-hero"><div class="hero-copy"><div class="eyebrow">SAJU × MBTI PERSONAL REPORT</div><h1>${esc(name)}</h1><div class="hero-badges"><span>${esc(mbti)}</span><span>${emoji} ${esc(animal)}</span></div><p class="hero-line">${esc(first?.keyJudgment||'당신의 사주와 MBTI를 함께 읽었습니다.')}</p><div class="tag-row">${tags.slice(0,4).map(t=>`<span>#${esc(t)}</span>`).join('')}</div></div><div class="zodiac-mark" aria-label="${esc(animal)}">${emoji}</div></section>`+
 `<section class="quick-card"><div class="num">AT A GLANCE</div><h2>한눈에 보는 나</h2><div class="quick-grid">${(report.sections||[]).slice(0,6).map(s=>`<button class="quick-link" type="button" data-target="detail-${esc(s.id)}"><strong>${esc(s.title)}</strong><p>${esc(s.keyJudgment)}</p><span>자세히 보기 →</span></button>`).join('')}</div></section>`+
 `<div class="full-report-action"><button class="btn primary" id="viewFullReport" type="button">전체 내용 보기</button></div>`+report.sections.map(section).join('')+
 `<section class="section final-card"><div class="num">FINAL</div><h2>마지막으로, 당신에게 묻습니다</h2>${list(report.finalJudgment?.body).map(paragraph).join('')}<p class="quote">${esc(report.finalJudgment.closingQuestion)}</p></section>`;
 target.querySelectorAll('.quick-link').forEach(btn=>btn.addEventListener('click',()=>document.getElementById(btn.dataset.target)?.scrollIntoView({behavior:'smooth',block:'start'})));
 target.querySelector('#viewFullReport')?.addEventListener('click',()=>target.querySelector('.detail-section')?.scrollIntoView({behavior:'smooth',block:'start'}));
 return gate
}
return {render};})();window.REPORT_RENDERER=REPORT_RENDERER;