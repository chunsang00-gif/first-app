/* Regression checks: people and chart values must come from their own report. */
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const facts=require('./report-facts-node'),characters=require('./character-assets');
const events=[];
const context={window:{CHARACTER_ASSETS:characters,addEventListener(){}},document:{body:{classList:{add(){}}},getElementById(){return null}},requestAnimationFrame(){},console};
vm.createContext(context);vm.runInContext(fs.readFileSync('report-renderer.js','utf8'),context);
const ids=['saju_core','mbti_contradiction','decision','money','career','relationship','stress','integrated_judgment','year_2027','year_2027_money','year_2027_career','year_2027_relationship'];
function report(input){const p=facts.build(input);assert.equal(p.status,'ready');return {meta:{name:input.name,mbti:input.mbti,characterGender:input.gender,chart:p.chart,profileBalance:p.profileBalance},sections:ids.map(id=>({id,keyJudgment:input.name+'님의 직접 확인과 결정 기준',body:['화면 데이터 연결 확인용 본문입니다.'],evidence:['검증용 근거']})),finalJudgment:{body:['검증용 종합 문장'],closingQuestion:'꼼꼼하게 확인하느라 결정을 늦출 때는, 오늘 확인할 내용을 먼저 정하는 것이 도움이 됩니다.'}}}
function render(r){const target={innerHTML:'',closest(){return {classList:{add(){}}}},querySelectorAll(){return []},querySelector(){return null}};context.window.REPORT_RENDERER.render(r,target);return target.innerHTML}
const a=report({calendar:'solar',birthDate:'1990-06-15',birthTime:'12:00',birthplace:'서울',gender:'male',mbti:'ESTJ',name:'검증 남성'});
const b=report({calendar:'solar',birthDate:'1999-12-24',birthTime:'07:30',birthplace:'대구',gender:'female',mbti:'INFP',name:'검증 여성'});
const first=render(a),second=render(b);
assert(first.includes('id="saveReportForReview"'),'completed report must offer raw export without paid generation');
assert(!first.includes('detail-verdict'),'chapter titles must not be followed by repeated verdict summaries');
assert(!first.includes('이 해석의 근거'));assert(!first.includes('사주 계산값 확인'));
assert(first.includes('MBTI를 정해진 규칙으로 표시한'));assert(!first.includes('MBTI을'));
assert(first.includes('검증 남성'));assert(second.includes('검증 여성'));assert(!second.includes('검증 남성'));
assert.notEqual(characters.select(a).zodiac,characters.select(b).zodiac);
assert(first.includes('portrait-male-'));assert(second.includes('portrait-female-'));
assert.notDeepEqual(a.meta.profileBalance.axes,b.meta.profileBalance.axes);
for(const r of [a,b]){const html=render(r),values=Object.values(r.meta.profileBalance.axes);assert(html.includes('data-values="'+values.join(',')+'"'));for(const value of values)assert(html.includes('width:'+value+'%'));assert.equal((html.match(/class="balance-row axis-/g)||[]).length,5);assert.equal((html.match(/data-report-id=/g)||[]).length,12)}
const modified=structuredClone(a);modified.meta.profileBalance.axes.relationship=35;
assert.notEqual(first.match(/class="radar-data"[^>]+/)[0],render(modified).match(/class="radar-data"[^>]+/)[0]);
const unknown=structuredClone(b);unknown.meta.mbti='모름';const unknownHtml=render(unknown);assert(!unknownHtml.includes('mbti-badge'));assert(unknownHtml.includes('사주 성향 지도'));assert(!unknownHtml.includes('사주 × MBTI 성향 지도'));
const unsafe=structuredClone(a);unsafe.meta.name='<script>alert(1)</script>';assert(!render(unsafe).includes('<script>alert(1)</script>'));
const partial=structuredClone(a);delete partial.meta.profileBalance.axes.emotion;assert(!render(partial).includes('radar-svg'));
const extreme=structuredClone(a);extreme.meta.profileBalance.axes.relationship=150;assert(render(extreme).includes('data-values="100,'));assert(!render(extreme).includes('width:150%'));
for(const branch of Object.keys(characters.zodiac))for(const gender of ['male','female']){const r=structuredClone(a);r.meta.chart.year='甲'+branch;r.meta.characterGender=gender;assert(characters.hero(r).includes('zodiac-'+characters.zodiac[branch]+'.webp'));assert(characters.hero(r).includes('portrait-'+gender+'-'))}
console.log('PASS independent report identity, zodiac/gender selection, synchronized chart values/geometry, unknown MBTI, escaping, missing/clamped axes, 24 character combinations');
// New structured editorial data must reach the page without repeating legacy tags.
const edited=structuredClone(a);edited.cover={headline:'확인한 답을 실행으로 옮기는 사람',description:'빠른 선택에 직접 확인을 더합니다.',keywords:['실행력','직접확인','분명한표현']};
edited.sections.forEach((s,i)=>{s.title='분야 '+i+' 핵심 제목';s.body=['계산 근거에서 읽은 내용','강점의 구체적인 장면','주의할 상황과 바꿔볼 행동'];s.bodyLabels=['판단의 이유','강점의 장면','다음 선택'];s.mood=['cautious','encouraging','confident','reflective'][i%4]});
edited.finalJudgment={headline:'확인하는 힘을 실행에 쓰세요',body:['근거에 따른 최종 해석'],strengths:['실행 순서를 정하는 선택'],watchouts:['다른 의견을 늦게 듣는 선택'],routines:[{trigger:'결정 직전',action:'반대 의견 한 가지를 먼저 확인해보세요',reason:'빠른 선택에서 빠지는 정보를 줄이는 데 도움이 됩니다'}],closingQuestion:'꼼꼼하게 확인하느라 결정을 늦출 때는, 오늘 확인할 내용을 먼저 정하는 것이 도움이 됩니다.'};
const editedHTML=render(edited);assert(editedHTML.includes(edited.cover.headline));assert(editedHTML.includes('#직접확인'));assert(!editedHTML.includes('hero-tags'));assert(editedHTML.indexOf('keyword-strip')<editedHTML.indexOf('cover-summary-title'));assert(editedHTML.includes('id="shareReport"'));assert(editedHTML.includes('id="saveReportImage"'));assert(editedHTML.includes('portrait-male-cautious.webp'));assert(editedHTML.includes('portrait-male-encouraging.webp'));assert.equal((editedHTML.match(/class="detail-symbol"/g)||[]).length,7);assert.equal((editedHTML.match(/class="copy-block"/g)||[]).length,36);assert(editedHTML.includes('반대 의견 한 가지를 먼저 확인해보세요'));
const malicious=structuredClone(edited);malicious.cover.headline='<img onerror=alert(1)>';malicious.sections[0].bodyLabels[0]='<script>bad</script>';assert(!render(malicious).includes('<script>bad</script>'));assert(!render(malicious).includes('<img onerror=alert(1)>'));
for(const gender of ['male','female'])for(const mood of ['encouraging','cautious'])assert(fs.existsSync('assets/result/portrait-'+gender+'-'+mood+'.webp'));
console.log('PASS personalized cover, keyword order, no repeated tags, share controls, reduced portraits, mood selection, labeled paragraphs, actionable final summary, escaping');

assert(editedHTML.includes('id="shareFullReport"'));assert(editedHTML.includes('id="saveFullReport"'));assert(editedHTML.indexOf('id="shareFullReport"')>editedHTML.indexOf('class="section final-card"'));console.log('PASS full-report sharing appears after final summary');
const curated=structuredClone(edited);curated.cover.highlights=[{sectionId:'relationship',title:'관계에서 선별한 핵심',description:'본문 관계 해석에서 뽑은 설명'},{sectionId:'money',title:'재물에서 선별한 핵심',description:'본문 재물 해석에서 뽑은 설명'},{sectionId:'career',title:'직업에서 선별한 핵심',description:'본문 직업 해석에서 뽑은 설명'}];const curatedHtml=render(curated);for(const item of curated.cover.highlights){assert(curatedHtml.includes(item.title));assert(curatedHtml.includes(item.description));assert(curatedHtml.includes('data-target="detail-'+item.sectionId+'"'))}console.log('PASS cover uses whole-report curated highlights with matching navigation');




// The report cover counts only actual, present topic paragraphs, not a
// 12-chapter/35-topic marketing target or nullable provider fields.
const receipt=structuredClone(edited);
for(const sec of receipt.sections){
 sec.bodyTopics=[Object.keys(require('./report-outline').topics[sec.id])[0]];
 sec.body=['완성된 첫 번째 문단'];
 sec.bodyLabels=['첫 번째 소제목'];
}
const exact=render(receipt);
assert(exact.includes('실제로 작성된 분석: 12개 장 · 12개 세부 풀이'));
const fewer=structuredClone(receipt);
fewer.sections.splice(9,3);
const fewerHtml=render(fewer);
assert(fewerHtml.includes('실제로 작성된 분석: 9개 장 · 9개 세부 풀이'));
assert(!fewerHtml.includes('35개 세부 풀이'));
assert(!render(edited).includes('report-delivered-scope'),
 'legacy records without source-owned topic IDs must not display a misleading zero');
console.log('PASS reader sees actual completed chapter/topic count, not undefined/target volume');
 // The actual paid report may omit annual or relationship chapters. Every
 // customer-visible navigation destination must be a delivered section.
 const narrow=structuredClone(fewer);
 narrow.sections=narrow.sections.filter(s=>!['relationship','year_2027'].includes(s.id));
 const narrowHtml=render(narrow);
 const toc=narrowHtml.match(/<nav class="report-contents"[\\s\\S]*?<\\/nav>/)?.[0];
 assert(toc,'customer report must show a chapter index');
 assert.equal((toc.match(/<li>/g)||[]).length,narrow.sections.length,
  'index must contain delivered chapters, not all 12 canonical slots');
 for(const section of narrow.sections){
  assert(toc.includes('href="#detail-'+section.id+'"'),
   'chapter index must point to actually rendered content: '+section.id);
  assert(narrowHtml.includes('id="detail-'+section.id+'"'));
 }
 assert(!toc.includes('href="#detail-relationship"'));
 assert(!toc.includes('href="#detail-year_2027"'));
 assert(!narrowHtml.includes('data-target="detail-relationship"'));
 assert(!narrowHtml.includes('data-target="detail-year_2027"'));
 assert(narrowHtml.includes('실제로 작성된 분석: 7개 장 · 7개 세부 풀이'));
 assert(narrowHtml.includes('실제로 작성된 7개 장의 해석을 확인합니다'));
 // For multiple real paragraph labels, let readers jump directly to their
 // section's two/three topics (not only when five are present).
 const labeled=render(edited);
 assert.equal((labeled.match(/<nav class="topic-nav"/g)||[]).length,12);
 assert(labeled.includes('href="#topic-saju_core-0"'));
 assert(labeled.includes('id="topic-saju_core-0"'));
 const noLabels=structuredClone(edited);
 noLabels.sections[0].bodyLabels=['이름 하나뿐'];
 const noLabelsHtml=render(noLabels);
 assert(!noLabelsHtml.includes('href="#topic-saju_core-0"'),
  'mismatched labels may not create a broken in-chapter index');
 assert.equal((noLabelsHtml.match(/<nav class="topic-nav"/g)||[]).length,11);
 console.log('PASS delivered-only chapter navigation, no omitted links, exact paragraph shortcuts and mismatched-label refusal');

