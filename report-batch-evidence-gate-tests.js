'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const guidance=require('./report-analysis-guidance');
const gate=require('./report-batch-evidence-gate');
const outline=require('./report-outline');
const cases=[
 ['lunar','1982-11-24','14:20',9],
 ['solar','1994-07-15','14:20',10],
 ['solar','1994-01-15','14:20',10],
 ['solar','1994-05-15','20:20',11]
];
let eligibleChecked=0,blockedChecked=0;
for(const [calendar,birthDate,birthTime] of cases){
 const packet=facts.build({calendar,birthDate,birthTime,gender:'male',
  mbti:'ISFP',leapMonth:false},2027);
 assert.equal(packet.status,'ready');
 const plan=guidance.preflight(packet);
 for(const [id,spec] of Object.entries(outline.topics)){
  const anchor=plan[id].anchorTopic;
  if(!anchor||plan[id].topicTasks[anchor].mode==='state-limits')continue;
  const section={id,bodyTopics:[anchor]};
  const accepted=gate.check([section],plan);
  assert.equal(accepted.pass,true,id+' must allow its one active anchor');
  eligibleChecked++;
  const blocked=Object.keys(spec).filter(topic=>
   plan[id].topicTasks[topic]?.mode==='state-limits');
  for(const topic of blocked){
   const sent={id,bodyTopics:Object.keys(spec).filter(x=>
    x===anchor||x===topic)};
   const denied=gate.check([sent],plan);
   assert.equal(denied.pass,false,id+':'+topic+' falsely allowed');
   assert(denied.problems.includes('UNSUPPORTED_TOPIC:'+id+':'+topic));
   blockedChecked++;
  }
  if(Object.keys(spec).length>1){
   const second=Object.keys(spec).find(x=>x!==anchor);
   const canonicalPair=Object.keys(spec).filter(x=>x===anchor||x===second);
   const wrong={id,bodyTopics:canonicalPair.reverse()};
   assert(gate.check([wrong],plan).problems.includes('TOPIC_ORDER_OR_ID:'+id));
  }
 }
}
const duplicate=gate.check([{id:'saju_core',
 bodyTopics:['strength','strength']}],guidance.preflight(facts.build(
 {calendar:'solar',birthDate:'1994-07-15',birthTime:'14:20',
  gender:'male',mbti:'ISFP'},2027)));
assert(duplicate.problems.includes('DUPLICATE_TOPIC:saju_core'));
console.log('PASS live paid batch source-mode gate: '+eligibleChecked+
 ' independent chart/chapter anchors, '+blockedChecked+
 ' unsupported paragraphs rejected before next model call; no paid provider calls');
