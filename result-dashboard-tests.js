/* Regression checks: people and chart values must come from their own report. */
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const facts=require('./report-facts-node'),characters=require('./character-assets');
const events=[];
const context={window:{CHARACTER_ASSETS:characters,addEventListener(){}},document:{body:{classList:{add(){}}},getElementById(){return null}},requestAnimationFrame(){},console};
vm.createContext(context);vm.runInContext(fs.readFileSync('report-renderer.js','utf8'),context);
const ids=['saju_core','mbti_contradiction','decision','money','career','relationship','stress','integrated_judgment','year_2027','year_2027_money','year_2027_career','year_2027_relationship'];
function report(input){const p=facts.build(input);assert.equal(p.status,'ready');return {meta:{name:input.name,mbti:input.mbti,characterGender:input.gender,chart:p.chart,profileBalance:p.profileBalance},sections:ids.map(id=>({id,keyJudgment:input.name+'님의 직접 확인과 결정 기준',body:['화면 데이터 연결 확인용 본문입니다.'],evidence:['검증용 근거']})),finalJudgment:{body:['검증용 종합 문장'],closingQuestion:'어떤 기준을 확인할까요?'}}}
function render(r){const target={innerHTML:'',closest(){return {classList:{add(){}}}},querySelectorAll(){return []},querySelector(){return null}};context.window.REPORT_RENDERER.render(r,target);return target.innerHTML}
const a=report({calendar:'solar',birthDate:'1990-06-15',birthTime:'12:00',birthplace:'서울',gender:'male',mbti:'ESTJ',name:'검증 남성'});
const b=report({calendar:'solar',birthDate:'1999-12-24',birthTime:'07:30',birthplace:'대구',gender:'female',mbti:'INFP',name:'검증 여성'});
const first=render(a),second=render(b);
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
