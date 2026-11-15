'use strict';
const a=require('node:assert/strict'),fs=require('node:fs');
const {capture}=require('./report-core-paid-full-prompt-capture');
const previous=require('./report-core-v2-authored-first-chapter');
const revision=require('./report-core-1994-dingren-reader-revision');
const audit=require('./report-qa3-classical-open-prose-audit');
const value=require('./report-qa6-reader-value-comparison');
(async()=>{
 const keys=['NODE_ENV','RENDER','PAID_CORE_DEPTH_V2','PAID_CORE_V2_CLASSICAL_WRITER','PAID_CORE_V2_CLAIM_LINKS','PAID_CORE_V2_REQUIRED_RESEARCH_SLOT'];
 const old=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
 try{
 process.env.NODE_ENV='test';delete process.env.RENDER;
 for(const k of keys.slice(2))process.env[k]='offline-preview';
 const {prompt,providerCalls}=await capture(previous.INPUT);a.equal(providerCalls,0);
 const doc=fs.readFileSync(__dirname+'/qa/qa7-editorial-work-note.md','utf8');
 const body=doc.split('## 독자용 첫 문단')[1].split('## 편집 경계')[0]
  .replace(/## 독자용[^\n]*\n/g,'').trim();
 const sample=structuredClone(revision.make(prompt.facts).candidate);
 sample.text=body;sample.label='배운 일을 계속하는 조건이 달라지는 이유';
 const safe=audit.screen(prompt,sample);
 a.equal(safe.mechanicallyEligible,true,JSON.stringify(safe.findings));
 const compared=value.compare(prompt,previous.make(prompt.facts).proposal,sample);
 a.equal(compared.revision.containsConcreteIllustration,true);
 a.equal(compared.revision.changedHourCounterexample,true);
 a.equal(compared.revision.twoClassicalSourcesDiscussed,true);
 a.equal(compared.canSell,false);
 console.log('QA7_READER_DRAFT={"offlineOnly":true,"appliedExample":true,"originalFiveClaimsChecked":true,"expertApproved":false,"paidCalls":0}');
 }finally{for(const [k,v] of Object.entries(old))if(v===undefined)delete process.env[k];else process.env[k]=v;}
})().catch(e=>{console.error(e);process.exitCode=1});
