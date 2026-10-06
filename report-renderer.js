/* Structured paid-report renderer v1.0 */
const REPORT_RENDERER=(()=>{
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function paragraph(x){return `<p>${esc(x)}</p>`}
function section(s,i){const body=Array.isArray(s.body)?s.body:[s.body];return `<section class="section" data-report-id="${esc(s.id)}"><div class="num">${String(i+1).padStart(2,'0')}</div><h2>${esc(s.title)}</h2>${body.filter(Boolean).map(paragraph).join('')}<div class="verdict"><b>핵심 판정</b><p>${esc(s.keyJudgment)}</p></div></section>`}
function render(report,target){const gate=window.REPORT_VALIDATOR?.validate(report)||{pass:false,errors:['validator unavailable']};if(!gate.pass){target.innerHTML=`<section class="section"><h2>리포트를 표시할 수 없습니다.</h2><p>${esc(gate.errors.join(' / '))}</p></section>`;return gate}target.innerHTML=report.sections.map(section).join('')+`<section class="section"><div class="num">FINAL</div><h2>최종 판정</h2>${(report.finalJudgment.body||[]).map(paragraph).join('')}<p class="quote">${esc(report.finalJudgment.closingQuestion)}</p></section>`;return gate}
return {render};})();window.REPORT_RENDERER=REPORT_RENDERER;