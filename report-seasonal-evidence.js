'use strict';
// Seasonal *evidence*, not a school-independent strong/weak Day Master score.
// The final four Earth-storage months remain transitional: branch main qi and
// seasonal dominance are different concepts and must never be conflated.
const ELEMENTS={
 甲:'wood',乙:'wood',丙:'fire',丁:'fire',戊:'earth',己:'earth',
 庚:'metal',辛:'metal',壬:'water',癸:'water'
};
const GENERATES={wood:'fire',fire:'earth',earth:'metal',metal:'water',water:'wood'};
const CONTROLS={wood:'earth',earth:'water',water:'fire',fire:'metal',metal:'wood'};
const HIDDEN={
 子:['癸'],丑:['己','癸','辛'],寅:['甲','丙','戊'],卯:['乙'],
 辰:['戊','乙','癸'],巳:['丙','戊','庚'],午:['丁','己'],
 未:['己','丁','乙'],申:['庚','壬','戊'],酉:['辛'],
 戌:['戊','辛','丁'],亥:['壬','甲']
};
const MONTH={
 寅:{season:'spring',status:'core',dominant:'wood'},
 卯:{season:'spring',status:'core',dominant:'wood'},
 辰:{season:'spring',status:'transition',dominant:null},
 巳:{season:'summer',status:'core',dominant:'fire'},
 午:{season:'summer',status:'core',dominant:'fire'},
 未:{season:'summer',status:'transition',dominant:null},
 申:{season:'autumn',status:'core',dominant:'metal'},
 酉:{season:'autumn',status:'core',dominant:'metal'},
 戌:{season:'autumn',status:'transition',dominant:null},
 亥:{season:'winter',status:'core',dominant:'water'},
 子:{season:'winter',status:'core',dominant:'water'},
 丑:{season:'winter',status:'transition',dominant:null}
};
const positions=['year','month','day','hour'];
function relation(element,dayElement){
 if(!element||!dayElement)throw Error('Unsupported Five Element');
 if(element===dayElement)return 'same-element';
 if(GENERATES[element]===dayElement)return 'resource';
 if(GENERATES[dayElement]===element)return 'output';
 if(CONTROLS[element]===dayElement)return 'control-on-day';
 if(CONTROLS[dayElement]===element)return 'day-controls';
 throw Error('Invalid Five Element relation');
}
function evaluate(chart){
 const monthBranch=chart?.month?.[1],dayStem=chart?.day?.[0];
 if(!MONTH[monthBranch]||!ELEMENTS[dayStem]||chart.month.length!==2||chart.day.length!==2)
  throw Error('Month branch and day stem required for seasonal evidence');
 const dayElement=ELEMENTS[dayStem],phase=MONTH[monthBranch];
 const monthHidden=HIDDEN[monthBranch].map((stem,index)=>({
  stem,element:ELEMENTS[stem],layer:index===0?'main':index===1?'secondary':'residual',
  relationToDay:relation(ELEMENTS[stem],dayElement)
 }));
 const roots=[],visible=[];
 for(const position of positions){
  const pillar=chart[position];
  if(pillar==null)continue;
  if(typeof pillar!=='string'||pillar.length!==2||!ELEMENTS[pillar[0]]||!HIDDEN[pillar[1]])
   throw Error('Invalid chart pillar '+position);
  for(const [index,stem] of HIDDEN[pillar[1]].entries()){
   if(ELEMENTS[stem]!==dayElement)continue;
   roots.push({position,branch:pillar[1],stem,layer:index===0?'main':index===1?'secondary':'residual',
    monthRoot:position==='month',weight:'not-assessed'});
  }
  if(position==='day')continue;
  visible.push({position,stem:pillar[0],element:ELEMENTS[pillar[0]],
   relationToDay:relation(ELEMENTS[pillar[0]],dayElement)});
 }
 const phaseRelation=phase.dominant?relation(phase.dominant,dayElement):'transitional-month-unresolved';
 return {
  version:'seasonal-evidence-v1',monthBranch,monthSeason:phase.season,
  monthPhase:phase.status,coreSeasonElement:phase.dominant,
  monthMainQiStem:monthHidden[0].stem,monthMainQiElement:monthHidden[0].element,
  monthHiddenStems:monthHidden,dayStem,dayElement,
  seasonToDayRelation:phaseRelation,
  directSeasonalSupport:phase.status==='core'?
   (phaseRelation==='same-element'||phaseRelation==='resource'):
   null,
  monthlyRoots:roots.filter(x=>x.monthRoot),
  roots,visible,
  supportPositions:visible.filter(x=>['same-element','resource'].includes(x.relationToDay)).map(x=>x.position),
  controlPositions:visible.filter(x=>x.relationToDay==='control-on-day').map(x=>x.position),
  outputPositions:visible.filter(x=>x.relationToDay==='output').map(x=>x.position),
  unresolved:[
   'exact-solar-term-segment-and-active-hidden-qi',
   'root-strength-and-seasonal-weight',
   'interactions-climate-and-special-following-patterns',
   'final-day-master-strength-and-useful-god'
  ],
  strengthVerdict:'not-assessed',usefulGodVerdict:'not-assessed',
  observationOnly:true,
  interpretationRule:'계산된 월지의 계절과 일간의 오행 관계, 실제 지장간 뿌리와 겉천간의 오행 관계만 설명한다. 전환월은 본기 오행과 계절 우세를 혼동하지 않는다. 신강·신약·용신·성격·실제 사건의 결론은 내리지 않는다.'
 };
}
module.exports={evaluate,relation,MONTH,HIDDEN,ELEMENTS};
