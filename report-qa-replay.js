'use strict';
// Offline QA replay: local JSON only. Never calls a model, writes user data, or sends a network request.
const fs=require('node:fs');
const quality=require('./report-quality-node');
const contract=require('./report-server-contract');
function replay(payload){
 const report=payload?.report||payload;
 if(!Array.isArray(report?.sections))throw Error('Expected a report or QA artifact containing report.sections');
 const sections=report.sections;
 const chapterErrors=contract.findRecycledThemes(sections);
 const topicErrors=contract.findRepeatedTopicContent(sections);
 const result=quality.validate(report);
 return {status:payload.status||null,chapterCount:sections.length,topicCount:sections.reduce((n,s)=>n+(s.body||[]).length,0),originalErrors:payload?.qa?.errors||[],currentErrors:result.errors,themeErrors:chapterErrors,topicErrors};
}
if(require.main===module){
 const path=process.argv[2];
 if(!path){console.error('Usage: node report-qa-replay.js path/to/private-qa-report.json');process.exitCode=2}
 else try{const input=JSON.parse(fs.readFileSync(path,'utf8'));console.log(JSON.stringify(replay(input),null,2))}
 catch(err){console.error(err.message);process.exitCode=1}
}
module.exports={replay};
