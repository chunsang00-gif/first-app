'use strict';
// Narrow mechanical lint for draft reader-facing Korean.
// NEVER a certificate of specialist validity, literary depth or paid quality.
const BLOCK_JARGON=/(?:월간|월지|원국|지장간|통근|신강|신약|용신|사령|십성|일간|대운|세운|태어난 달의 본기|명리학적 근거)/;
const OLD_CANNED=/(?:설명서가 낯설고|부품도 한곳에 없는|교통편이 여럿이고|공식 안내와 먼저 다녀온)/;
const FILLER=/(?:살펴볼 필요가 있습니다|중요하다고 볼 수 있습니다|더 잘 맞을 수 있습니다|뿌리 충)/;
function inspect(reader){
 const problems=[];
 if(!reader||typeof reader!=='object')
  return {mechanicalPass:false,problems:['missing-reader'],humanReviewRequired:true};
 const title=reader.title,judgment=reader.keyJudgment;
 const ps=reader.paragraphs||{};
 if(typeof title!=='string'||title.length<8||title.length>45)
  problems.push('unreadable-title');
 if(typeof judgment!=='string'||judgment.length<30||judgment.length>150)
  problems.push('unsupported-or-verbose-judgment');
 if(!ps.strength||typeof ps.strength.text!=='string'||ps.strength.text.length<180)
  problems.push('missing-everyday-explanation');
 const paragraphRows=[ps.temperament,ps.strength,ps.context,ps.hour,ps.seasonRoot].filter(Boolean);
 if(paragraphRows.some(x=>typeof x.label!=='string'||typeof x.text!=='string'||
    x.text.trim().length<100))problems.push('unreadable-paragraph');
 const body=[title,judgment,...paragraphRows.flatMap(x=>[x.label,x.text])]
  .filter(x=>typeof x==='string').join('\n');
 if(BLOCK_JARGON.test(body))problems.push('reader-visible-jargon');
 if(OLD_CANNED.test(body))problems.push('unreviewed-canned-scene');
 if(FILLER.test(body))problems.push('generic-or-unnatural-filler');
 if(/\?\s*$/.test(body))problems.push('final-reader-question');
 if(/(?:당신은 실제로|당신의 실제 성격은|틀림없이|반드시 성공|누구보다 우수)/.test(body))
  problems.push('unverified-real-world-claim');
 const sentences=paragraphRows.flatMap(p=>(p.text.match(/[^.!?。！？]+[.!?。！？]/g)||[])
  .map(s=>s.replace(/\s+/g,' ').trim()));
 if(new Set(sentences).size!==sentences.length)
  problems.push('exact-duplicate-sentences');
 return {mechanicalPass:problems.length===0,problems,humanReviewRequired:true,
  approval:'not-approved',checkedParagraphCount:paragraphRows.length,
  note:'Static wording guard; traditional inference and paid reading quality require human editorial review.'};
}
module.exports={inspect};
