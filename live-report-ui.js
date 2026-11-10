/* Live report UI v1.3 */
(()=>{const $=s=>document.querySelector(s);let lastAnalysis=null,timer=null;function value(id){return document.getElementById(id)?.value||''}function choice(name){return document.querySelector(`[data-choice="${name}"] .chip.on`)?.dataset.v||''}function input(){const gender=choice('gender'),calendar=choice('calendar');const y=value('birthYear'),m=value('birthMonth'),d=value('birthDay');const birthDate=y&&m&&d?`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`:value('birth');return {gender:gender==='female'||gender==='여성'?'female':'male',calendar:calendar==='lunar'||calendar==='음력'?'lunar':'solar',birthDate,birthTime:value('time'),birthplace:value('city'),unknownBirthTime:Boolean($('#unknownTime')?.checked),leapMonth:Boolean($('#leapMonth')?.checked),name:value('name').trim(),mbti:value('mbti')||'모름',...(value('readerDecision').trim()?{readerDecision:value('readerDecision').trim()}:{})}}async function message(res,fallback){let detail='';try{const x=await res.json();detail=x?.errors?.join(' / ')||x?.error||x?.status||''}catch{}return detail?`${fallback} (${detail})`:fallback}function esc(s){return String(s??'').replace(/[<>&]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]))}function openResult(){document.querySelectorAll('.screen').forEach(x=>x.classList.toggle('active',x.dataset.step==='3'));$('#actions')?.classList.add('hidden');const bar=$('#bar');if(bar)bar.style.width='100%'}
function showReview(out){const body=$('#reportBody');openResult();const issues=out.qa?.issues||[];const items=issues.length?issues.map(x=>`<li><strong>${esc(x.path)}</strong><p>${esc(x.text)}</p></li>`).join(''):(out.qa?.errors||[]).map(x=>`<li>${esc(x)}</li>`).join('');body.innerHTML=`<section class="section analysis-error">${window.CHARACTER_ASSETS.state('error')}<h2>풀이에서 수정할 문장이 발견됐습니다.</h2><p>원문은 이 탭에 임시 보관합니다. 탭을 닫기 전에 아래 파일을 저장해 주세요. 저장에는 추가 생성 비용이 들지 않습니다.</p><details><summary>검사에 걸린 문구 확인</summary><ul>${items}</ul></details><button class="btn primary" id="saveReviewDraft">검토용 원문과 오류 저장</button><p class="meta">검사를 통과한 최종 결과가 아닙니다. 파일에는 입력 정보와 풀이가 포함됩니다.</p></section>`;$('#saveReviewDraft')?.addEventListener('click',()=>{const blob=new Blob([JSON.stringify({status:'needs_review',report:out.report,qa:out.qa,headingRepairs:out.headingRepairs||[]},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='saju-report-review.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});}
function loading(sec=0,mode='scope'){
 sec=window.REPORT_API?.elapsedSeconds?.(sec)??sec;
 const average=window.REPORT_API?.timingText?.()||'평균 소요시간을 확인하고 있습니다.';
 openResult();
 const body=$('#reportBody'),activeJob=mode==='paid'||Boolean(sessionStorage.getItem('reportJobId'));
 const progress=activeJob?window.REPORT_API?.progress:null;
 const stages={body:'세부 풀이 작성 중',edit:'내용 중복·문장 교정 중',synthesis:'메인 핵심·최종 정리 선별 중'};
 const stage=activeJob?(stages[progress?.stage]||'기존 보고서 작업 상태 확인 중'):'무료 사주 계산 및 제공 범위 확인 중';
 const notice=activeJob?(progress?.total>0?`전체 ${progress.total}개 장 중 ${Math.max(0,progress.completed||0)}개 완료.`:progress?.stage==='synthesis'?'완성된 본문을 바탕으로 핵심 내용을 정리합니다.':'저장된 보고서의 실제 진행 상태를 확인하고 있습니다.'):'출생정보를 계산해 분석 가능한 장과 항목을 확인합니다. 이 단계에서는 결제하거나 유료 보고서를 생성하지 않습니다.';
 if(body.querySelector('.analysis-loading')){
  body.querySelector('h2').textContent=stage;
  body.querySelector('.analysis-notice').textContent=notice;
  body.querySelector('.analysis-average').textContent=average;
  body.querySelector('.status strong').textContent=sec+'초';
  return;
 }
 body.innerHTML=`<section class="section analysis-loading">${window.CHARACTER_ASSETS.state('loading')}<div class="num">ANALYSIS</div><h2>${esc(stage)}</h2><p class="analysis-notice">${esc(notice)}</p><p class="analysis-average">${esc(average)}</p><p class="meta">${activeJob?'이전 보고서 작업의 완료 여부를 확인하고 있습니다. 서버 재시작 또는 만료 시 작업이 사라질 수 있습니다.':'조회가 실패하면 입력 화면에서 확인 후 재시도할 수 있습니다.'}</p><div class="status">경과 시간 <strong>${sec}초</strong></div></section>`;
}
function renderFallback(report){const body=$('#reportBody');const sections=Array.isArray(report?.sections)?report.sections:[];body.innerHTML=sections.map(s=>`<section class="section"><h2>${esc(s.title||'분석 결과')}</h2>${(Array.isArray(s.body)?s.body:[]).map(p=>`<p>${esc(p)}</p>`).join('')}</section>`).join('')+(report?.finalJudgment?`<section class="section"><h2>최종 정리</h2>${(report.finalJudgment.body||[]).map(p=>`<p>${esc(p)}</p>`).join('')}<p class="quote">${esc(report.finalJudgment.closingQuestion||'')}</p></section>`:'')}async function generate(analysisInput,purchase=null){if(sessionStorage.getItem('reportJobId'))return resume();window.REPORT_API.progress=null;let sec=0;loading(sec,'paid');clearInterval(timer);timer=setInterval(()=>loading(++sec,'paid'),1000);try{const out=await REPORT_API.generate({analysisInput,purchase});clearInterval(timer);if(out.status==='rejected'){showReview(out);return}if(out.status!=='ready')throw Error(out?.errors?.join(' / ')||out?.message||'분석 결과를 만드는 중 문제가 생겼습니다. 다시 시도해 주세요.');window.REPORT_RENDERER?.render ? window.REPORT_RENDERER.render(out.report,$('#reportBody')) : renderFallback(out.report)}catch(e){clearInterval(timer);$('#reportBody').innerHTML=`<section class="section analysis-error">${window.CHARACTER_ASSETS.state('error')}<h2>분석을 완료하지 못했습니다.</h2><p>${esc(e.message||e)}</p>${purchase?'':`<button class="btn primary" id="retryReport" style="width:100%;margin-top:12px">입력 정보 그대로 다시 생성</button>`}</section>`;if(!purchase)$('#retryReport')?.addEventListener('click',()=>generate(lastAnalysis))}}function backToInput(){
 const navigate=window.REPORT_STEP_NAVIGATION?.returnToInput;
 if(typeof navigate==='function'){navigate();return}
 // Older host pages without the step controller retain the visual fallback.
 document.querySelectorAll('.screen').forEach(x=>x.classList.toggle('active',x.dataset.step==='1'));
 $('#actions')?.classList.remove('hidden');
 if($('#bar'))$('#bar').style.width='33.333%';
}
function showScopeError(e){
 openResult();
 const body=$('#reportBody');
 body.innerHTML=`<section class="section analysis-error">${window.CHARACTER_ASSETS.state('error')}<h2>제공 가능 범위를 확인하지 못했습니다.</h2><p>${esc(e?.message||String(e))}</p><button class="btn primary" type="button" id="returnFromCoverageError">입력 화면으로 돌아가기</button></section>`;
 $('#returnFromCoverageError')?.addEventListener('click',backToInput);
}
async function showCoverage(validatedInput){
 const out=await window.REPORT_API.coverage(validatedInput);
 if(out?.status!=='ready')throw Error(out?.errors?.join(' / ')||'제공 가능 범위를 확인하지 못했습니다.');
 clearInterval(timer);openResult();
 const body=$('#reportBody'),estimate=out.estimate,catalog=out.catalog;
 if(!Array.isArray(estimate?.chapters)||!catalog||!Number.isInteger(catalog.chapterDefinitions)||!Number.isInteger(catalog.topicDefinitions))throw Error('제공 범위 데이터가 완전하지 않습니다.');
 if(estimate.chapters.some(chapter=>!Array.isArray(chapter.eligibleTopics)||
    chapter.eligibleTopics.length!==chapter.eligibleTopicUpperBound||
    chapter.eligibleTopics.some(topic=>typeof topic.title!=='string'||!topic.title.trim()))||
    estimate.chapters.reduce((n,chapter)=>n+chapter.eligibleTopics.length,0)!==estimate.evidenceEligibleTopicUpperBound)
  throw Error('작성 가능 항목 목록과 계산된 제공 범위가 일치하지 않습니다.');
 const selected=estimate.chapters.filter(x=>x.includedInPlan);
 const omitted=estimate.chapters.filter(x=>!x.includedInPlan);
 const detailsAvailable=Number.isInteger(catalog.historicalDefinitionShortfall);
 if(detailsAvailable&&(
    catalog.historicalDefinitionShortfall!==
      Math.max(0,catalog.originallyPlannedTopics-catalog.topicDefinitions)||
    selected.some(x=>!Array.isArray(x.excludedTopics)||
      x.eligibleTopicUpperBound+x.excludedTopics.length!==x.definedTopicSlots||
      x.excludedTopics.some(t=>!t.title||!t.reason))||
    omitted.some(x=>!Array.isArray(x.excludedTopics)||x.excludedTopics.length>0)||
    estimate.excludedDefinedTopicsWithinPlannedChapters!==
      selected.reduce((n,x)=>n+x.excludedTopics.length,0)||
    estimate.topicsUnavailableBecauseChaptersOmitted!==
      omitted.reduce((n,x)=>n+x.definedTopicSlots,0)||
    catalog.topicDefinitions!==estimate.evidenceEligibleTopicUpperBound+
      estimate.excludedDefinedTopicsWithinPlannedChapters+
      estimate.topicsUnavailableBecauseChaptersOmitted||
    estimate.topicUpperBoundGapToTarget!==catalog.historicalDefinitionShortfall+
      estimate.excludedDefinedTopicsWithinPlannedChapters+
      estimate.topicsUnavailableBecauseChaptersOmitted))
  throw Error('작성 가능한 항목과 제외한 항목의 합계가 실제 상품 정의와 다릅니다.');
 const excludedQuestions=selected.flatMap(chapter=>
  (Array.isArray(chapter.excludedTopics)?chapter.excludedTopics:[])
   .map(topic=>({...topic,chapterName:chapter.name})));
 const breakdownHtml=detailsAvailable?
  '<p class="meta">현재 정의된 '+catalog.topicDefinitions+'개 질문 중 '+
   estimate.evidenceEligibleTopicUpperBound+'개가 작성 후보이며, '+
   estimate.excludedDefinedTopicsWithinPlannedChapters+'개는 선택된 장에서 제외하고 '+
   estimate.topicsUnavailableBecauseChaptersOmitted+
   '개는 장 자체가 제외됐습니다. 기존 목표 '+
   catalog.originallyPlannedTopics+'개 중 아직 정의되지 않은 질문도 '+
   catalog.historicalDefinitionShortfall+'개 있습니다.</p>':'';
 const excludedHtml=excludedQuestions.length?
   '<h3>선택된 장에서 작성하지 않는 질문</h3><ul>'+
    excludedQuestions.map(x=>'<li><strong>'+esc(x.chapterName)+
      ' · '+esc(x.title)+'</strong>: '+esc(x.reason)+'</li>').join('')+'</ul>':
   '<p class="meta">선택된 장에는 근거 부족으로 제외된 질문이 없습니다.</p>';
 const proposal=out.productProposal;
 if(proposal?.kind!=='chart-specific-evidence-scoped-product-proposal-v1'||
    proposal.status!=='draft-not-for-sale'||proposal.paymentEnabled!==false||
    proposal.humanEditorialApproved!==false||proposal.fixed12ChaptersPromised!==false||
    proposal.fixed35TopicsPromised!==false||
    !Array.isArray(proposal.mainChapterIds)||
    !Array.isArray(proposal.conditional2027ChapterIds)||
    proposal.plannedChapterCount!==estimate.plannedChapters||
    proposal.topicCandidateUpperBound!==estimate.evidenceEligibleTopicUpperBound||
    proposal.mainChapterCount!==proposal.mainChapterIds.length||
    proposal.conditionalChapterCount!==proposal.conditional2027ChapterIds.length||
    JSON.stringify([...proposal.mainChapterIds,...proposal.conditional2027ChapterIds].sort())!==
     JSON.stringify(selected.map(x=>x.id).sort()))
   throw Error('맞춤형 상품 초안과 실제 계산 근거가 일치하지 않습니다.');
 const primary=selected.filter(x=>proposal.mainChapterIds.includes(x.id));
 const conditional=selected.filter(x=>proposal.conditional2027ChapterIds.includes(x.id));
 const sample=out.readingSample;
 if(sample?.kind!=='free-calculated-meaning-preview-v1'||
    sample?.status!=='calculated-example'||sample?.modelCalls!==0||
    sample?.completedPremiumParagraphs!==0||sample?.humanEditorialApproved!==false||
    !Array.isArray(sample.cards)||sample.cards.length<2||sample.cards.length>4||
    new Set(sample.cards.map(c=>c.id)).size!==sample.cards.length||
    sample.cards.some(c=>typeof c.title!=='string'||!c.title.trim()||
      typeof c.text!=='string'||c.text.length<30)||
    typeof sample.note!=='string'||!sample.note.trim())
   throw Error('무료 해석 예시가 검증된 계산 결과와 일치하지 않습니다.');
 // Older cached calculation results and UI fixtures have no optional
 // domain mini-reading field. Never mistake absence for a corrupt report.
 const interpreted=out.interpretivePreviews??[];
 if(!Array.isArray(interpreted)||interpreted.length>2||
    new Set(interpreted.map(x=>x.id)).size!==interpreted.length||
    interpreted.some(x=>!['money.earning','career.workstyle'].includes(x.id)||
      typeof x.title!=='string'||!x.title.trim()||
      typeof x.text!=='string'||x.text.length<130))
   throw Error('독자용 분야별 예시가 계산된 원본 근거와 일치하지 않습니다.');
 body.innerHTML=`<section class="section report-reading-sample">
 <h2>실제 출생정보에서 확인한 해석 근거</h2>
 <p>같은 글을 모든 사람에게 보여 주는 예시가 아니라, 입력한 출생정보로 계산된 위치와 분류를 바탕으로 읽습니다.</p>
 ${sample.cards.map(item=>`<article class="reading-preview-card"><h3>${esc(item.title)}</h3><p>${esc(item.text)}</p></article>`).join('')}
 <p class="meta">${esc(sample.note)}</p>
 </section>
 ${interpreted.length?`<section class="section report-reading-sample">
 <h2>금전·직업 분야별 풀이 맛보기</h2>
 <p>출생정보에서 실제로 확인된 서로 다른 전통 분류를 비교해, 돈을 얻는 활동과 일을 배우고 완성하는 활동을 각각 풀었습니다.</p>
 ${interpreted.map(item=>`<article class="reading-preview-card"><h3>${esc(item.title)}</h3><p>${esc(item.text)}</p></article>`).join('')}
 <p class="meta">결제 없이 계산한 참고용 풀이입니다. 실제 삶의 경험을 확인한 결과나 AI 유료 보고서의 완성·판매 승인 기록이 아닙니다.</p>
 </section>`:''}
 <section class="section report-coverage">
 <h2>맞춤형 심화 풀이 구성안</h2>
 <p><strong>기본 해석 ${proposal.mainChapterCount}개 장 + 2027년 추가 분야 ${proposal.conditionalChapterCount}개 장</strong>을 계산 근거에 따라 선택했습니다.</p>
 <p>전체 <strong>${proposal.plannedChapterCount}개 장 · 최대 ${proposal.topicCandidateUpperBound}개 세부 항목</strong>이 작성 후보입니다.</p>
 <p>이는 출생정보로 계산한 <strong>작성 가능 상한</strong>입니다. 실제 완성된 문단 수나 제공 보장은 아닙니다.</p>
 ${breakdownHtml}
 <p class="meta">장마다 펼쳐 볼 수 있는 세부 질문은 실제 계산에서 작성 후보로 선택된 항목만 보여 줍니다. 이것만으로 개인별 풀이가 완성됐다는 뜻은 아닙니다.</p>
 <h3>기본 해석 구성</h3>
 <ul>${primary.map(x=>`<li><strong>${esc(x.name)} · 최대 ${x.eligibleTopicUpperBound}개 항목</strong><details><summary>작성 후보 질문 보기</summary><ul>${x.eligibleTopics.map(t=>`<li>${esc(t.title)}</li>`).join('')}</ul></details></li>`).join('')}</ul>
 ${conditional.length?`<h3>별도 계산 근거가 있는 2027년 추가 분야</h3><ul>${conditional.map(x=>`<li><strong>${esc(x.name)} · 최대 ${x.eligibleTopicUpperBound}개 항목</strong><details><summary>작성 후보 질문 보기</summary><ul>${x.eligibleTopics.map(t=>`<li>${esc(t.title)}</li>`).join('')}</ul></details></li>`).join('')}</ul>`:'<p class="meta">별도로 추가할 수 있는 2027년 금전·직업·관계 풀이가 확인되지 않았습니다.</p>'}
 ${omitted.length?`<h3>제외된 장</h3><ul>${omitted.map(x=>`<li>${esc(x.name)}: ${esc(x.omittedReason)}</li>`).join('')}</ul>`:''}
 ${excludedHtml}
 <p class="meta">이 구성은 구매 상품의 확정 약속이 아닌 검토 초안입니다. 기존 12장·${catalog.originallyPlannedTopics}항목 고정 목표는 달성하지 못했습니다. 선택된 항목도 중복이나 근거 부족으로 실제 작성 시 생략될 수 있으며, 판매 가격과 정식 제공량은 결정되지 않았습니다.</p>
 <p id="coverageSalesNotice"><strong>현재 유료 구매와 정식 보고서 생성은 준비 중입니다.</strong> 결제나 유료 AI 생성 요청은 진행하지 않습니다.</p>
 <button class="btn primary" type="button" id="coverageBackToInput">입력 화면으로 돌아가기</button>
 </section>`;
 $('#coverageBackToInput')?.addEventListener('click',backToInput);
 await window.REPORT_CHECKOUT_UI?.mount?.({
  container:body,analysisInput:{status:'ready',calculationInput:validatedInput},
  proposal:out.productProposal
 });
}
async function run(){const body=$('#reportBody');if(!body)return;loading(0);try{const c=await fetch('/api/calculate',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(input())});if(!c.ok)throw Error(await message(c,'사주 계산을 완료하지 못했습니다.'));lastAnalysis=await c.json();if(lastAnalysis.status!=='ready')throw Error('검증된 계산값이 준비되지 않았습니다.');await showCoverage(lastAnalysis.calculationInput)}catch(e){clearInterval(timer);showScopeError(e)}}async function resume(){const body=$('#reportBody');if(!body)return false;const id=sessionStorage.getItem('reportJobId');if(!id&&!sessionStorage.getItem('reportQualityDraft')&&!sessionStorage.getItem('reportCompleted'))return false;let sec=0;loading(sec,'paid');clearInterval(timer);timer=setInterval(()=>loading(++sec,'paid'),1000);const out=await REPORT_API.resume();clearInterval(timer);if(out?.status==='rejected'){showReview(out);return true}if(out?.status==='ready'){openResult();window.REPORT_RENDERER?.render?window.REPORT_RENDERER.render(out.report,body):renderFallback(out.report);return true}if(out?.status==='missing'){body.innerHTML=`<section class="section analysis-error">${window.CHARACTER_ASSETS.state('error')}<h2>이전 분석 작업이 만료됐습니다.</h2><p>입력 화면에서 정보를 확인한 뒤 다시 분석해주세요.</p><button class="btn primary" id="returnToInput" style="width:100%">입력 화면으로 돌아가기</button></section>`;$('#returnToInput').addEventListener('click',backToInput);return true}body.innerHTML=`<section class="section analysis-error">${window.CHARACTER_ASSETS.state('error')}<h2>분석을 완료하지 못했습니다.</h2><p>${esc(out?.message||'분석 결과를 만드는 중 문제가 생겼습니다. 다시 시도해 주세요.')}</p></section>`;return true}
function updateGuides(){document.querySelectorAll('[data-character-guide]').forEach(el=>{el.innerHTML=window.CHARACTER_ASSETS.guide(input(),el.dataset.characterGuide==='confirm')})}
async function generatePurchased(analysisInput,purchase){
 if(!purchase||!purchase.orderId||!purchase.ownerToken)
  throw Error('PAYMENT_ORDER_OWNER_DENIED');
 openResult();
 return generate(analysisInput,purchase);
}
window.LIVE_REPORT_UI={input,run,resume,generatePurchased,openResult};document.addEventListener('click',e=>{if(e.target.closest('[data-choice="gender"]'))updateGuides()});document.addEventListener('DOMContentLoaded',updateGuides);document.addEventListener('DOMContentLoaded',()=>{
 Promise.resolve(window.REPORT_CHECKOUT_UI?.restore?.()).then(restored=>{
  if(!restored)return resume();
 }).catch(()=>{});
});})();

