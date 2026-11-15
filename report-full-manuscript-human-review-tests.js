'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),
 path=require('node:path'),cp=require('node:child_process');
const work=require('./report-full-manuscript-human-review');
const part=id=>({id,title:'제목 '+id,keyJudgment:'계산 근거에 따른 판단 '+id,
 body:['첫 문단 내용 '+id,'둘째 문단 내용 '+id],
 bodyTopics:['first','second'],bodyLabels:['첫 항목','두 항목'],
 evidence:['natal.month.stem 계산 출처']});
const input={status:'ready',report:{meta:{name:'비공개 독자',mbti:'ISFP'},
 cover:{headline:'전체 보고서',description:'본문 설명'},
 sections:['saju_core','money','career','year_2027'].map(part),
 finalJudgment:{headline:'종합 결론',body:['실제 마무리 내용'],
 strengths:['강점'],watchouts:['주의점'],
 routines:[{trigger:'일을 할 때',action:'확인하기',reason:'이해를 위해'}],
 closingQuestion:'최종 판단입니다.'}}};
const v=work.inspect(input),html=work.render(v);
assert.equal(v.chapterCount,4);assert.equal(v.topicCount,8);
assert.equal(v.saleApproved,false);assert.equal(v.releaseVerdict,'not-approved');
assert.equal(v.providerProvenanceVerified,false);
assert.equal((html.match(/class="panel chapter"/g)||[]).length,4);
assert.equal((html.match(/class="topic"/g)||[]).length,8);
assert(html.includes('실제 작성된 4개 장 · 8개 세부 풀이'));
assert(html.includes('계산 근거 확인'));
assert(html.includes('실제 마무리 내용'));
assert(html.includes('개인 PC에 검수 기록 저장'));
assert(html.includes('http-equiv="Content-Security-Policy"'));
assert(html.includes("saleApproved:false"));
assert(!html.includes('https://'));
const x=structuredClone(input);
x.report.meta.name='<script>bad()</script>';
x.report.sections[0].body[0]='</section><script>evil()</script>';
x.report.sections[0].evidence[0]='"><img src=x onerror=alert(1)>';
const safe=work.render(work.inspect(x));
assert(safe.includes('&lt;script&gt;bad()&lt;/script&gt;'));
assert(!safe.includes('</section><script>evil()</script>'));
assert(!safe.includes('"><img src=x onerror=alert(1)>'));
const invalid=structuredClone(input);invalid.report.sections[0].bodyTopics=['one'];
assert.throws(()=>work.inspect(invalid),/FULL_HUMAN_REVIEW_INVALID_CHAPTER/);
const reverse=structuredClone(input);reverse.report.sections.reverse();
assert.throws(()=>work.inspect(reverse),/FULL_HUMAN_REVIEW_INVALID_CHAPTER_ORDER/);
assert.throws(()=>work.inspect({...input,status:'blocked'}),/FULL_HUMAN_REVIEW_REQUIRES_COMPLETED_EXPORT/);
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'full-human-review-'));
try{const src=path.join(tmp,'input.json'),dest=path.join(tmp,'private.html');
 fs.writeFileSync(src,JSON.stringify(input));
 const run=cp.spawnSync(process.execPath,['report-full-manuscript-human-review.js',src,dest],{encoding:'utf8'});
 assert.equal(run.status,0,run.stderr);
 assert.equal(fs.readFileSync(dest,'utf8'),html);
 assert.equal(fs.statSync(dest).mode&0o777,0o600);
 const rerun=cp.spawnSync(process.execPath,['report-full-manuscript-human-review.js',src,dest],{encoding:'utf8'});
 assert.notEqual(rerun.status,0,'do not overwrite private human annotations');
}finally{fs.rmSync(tmp,{recursive:true,force:true})}
console.log('PASS full paid manuscript local reviewer: exact delivered chapters, per-chapter ratings, source evidence, injection escape, private output and no auto-sale approval');
