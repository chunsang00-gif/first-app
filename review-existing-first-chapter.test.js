'use strict';
// Synthetic fixture only; no private customer data or paid model calls.
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'saju-existing-qa-check-'));
const script=path.join(__dirname,'review-existing-first-chapter.js');
const fixture={
 batches:[{ids:['saju_core'],completedSections:1,sections:[{
  id:'saju_core',title:'기본 성향',keyJudgment:'선택 전 정보를 확인합니다.',
  bodyLabels:['첫 번째 주제','두 번째 주제'],
  body:['조건이 달라졌을 때 무엇을 먼저 확인할지 설명합니다.','상황에 맞는 다른 선택을 생각해 봅니다.'],
  evidence:['원국의 상관은 내부 증거 자료이므로 독자 문장으로 검사하면 안 됩니다.']
 }]}]
};
function check(data){
 const f=path.join(dir,'fixture.json');
 fs.writeFileSync(f,JSON.stringify(data));
 const result=spawnSync(process.execPath,[script,f],{encoding:'utf8'});
 return {status:result.status,stdout:result.stdout,stderr:result.stderr};
}
try{
 const first=check(fixture);
 assert.equal(first.status,0,first.stderr);
 const parsed=JSON.parse(first.stdout);
 assert.equal(parsed.detectedReaderTextFields,6);
 assert.equal(parsed.exactDuplicateParagraphs,0);
 assert.deepEqual(parsed.jargonMentions,{});
 assert.equal(parsed.additionalApiCalls,0);
 fixture.batches[0].sections[0].body[1]=fixture.batches[0].sections[0].body[0];
 const duplicate=JSON.parse(check(fixture).stdout);
 assert.equal(duplicate.exactDuplicateParagraphs,1);
 fixture.batches[0].sections[0].id='wrong_chapter';
 const bad=check(fixture);
 assert.notEqual(bad.status,0);
 assert.match(bad.stderr,/INVALID_FIRST_CHAPTER_SCOPE/);
 console.log('PASS synthetic first-chapter offline QA regression; no API calls');
}finally{fs.rmSync(dir,{recursive:true,force:true});}
