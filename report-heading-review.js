'use strict';
const editorial=require('./report-editorial');
const bareHeading=/^(?:납득의?\s*순서|참여\s*여부|금전\s*경계)[.!。]?$/;
function fields(report){const out=[];const add=(path,text,body)=>{if(typeof text==='string')out.push({path,text,body});};
 add('cover.headline',report.cover?.headline);add('cover.description',report.cover?.description);
 (report.cover?.keywords||[]).forEach((t,i)=>add(`cover.keywords.${i}`,t));
 (report.cover?.highlights||[]).forEach((h,i)=>{add(`cover.highlights.${i}.title`,h.title,h.description);add(`cover.highlights.${i}.description`,h.description);});
 (report.sections||[]).forEach((s,i)=>{const root=`sections.${i}`;add(root+'.title',s.title,s.keyJudgment);add(root+'.keyJudgment',s.keyJudgment);for(const name of ['body','bodyLabels','evidence'])(s[name]||[]).forEach((t,j)=>add(`${root}.${name}.${j}`,t,name==='bodyLabels'?s.body?.[j]:undefined));});
 const final=report.finalJudgment||{};for(const name of ['headline','closingQuestion'])add('finalJudgment.'+name,final[name]);
 for(const name of ['body','strengths','watchouts'])(final[name]||[]).forEach((t,i)=>add(`finalJudgment.${name}.${i}`,t));
 (final.routines||[]).forEach((r,i)=>{for(const key of ['trigger','action','reason'])add(`finalJudgment.routines.${i}.${key}`,r[key]);});return out;
}
const isHeading=path=>/(?:headline|title|bodyLabels\.\d+)$/.test(path);
function issues(report){return fields(report).flatMap(f=>{const reasons=editorial.wordingErrors([f.text]);if(isHeading(f.path)&&bareHeading.test(f.text.trim()))reasons.push('abstract headline without concrete meaning');return reasons.map(reason=>({path:f.path,text:f.text,reason}));});}
// Use only an intact sentence already written for this exact heading. No model
// call, invented interpretation, sentence truncation, or changes to body content.
function repair(report){const edits=[];for(const f of fields(report)){if(!isHeading(f.path)||(!bareHeading.test(f.text.trim())&&!editorial.wordingErrors([f.text]).length)||!f.body)continue;
 const sentence=String(f.body).split(/(?<=[.!?])\s+/)[0].trim();
 if(sentence.length<12||sentence.length>60||bareHeading.test(sentence)||editorial.wordingErrors([sentence]).length)continue;
 const parts=f.path.split('.');let target=report;for(const part of parts.slice(0,-1))target=target[part];target[parts.at(-1)]=sentence;edits.push({path:f.path,before:f.text,after:sentence});
 }return edits;}
module.exports={fields,issues,repair,isHeading,bareHeading};
