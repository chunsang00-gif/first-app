/* Original character assets: selection uses verified chart facts, never birth-year guesses. */
(function(root){
 'use strict';
 const base='/assets/result/';
 const zodiac={子:'rat',丑:'ox',寅:'tiger',卯:'rabbit',辰:'dragon',巳:'snake',午:'horse',未:'goat',申:'monkey',酉:'rooster',戌:'dog',亥:'pig'};
 const labels={rat:'쥐',ox:'소',tiger:'호랑이',rabbit:'토끼',dragon:'용',snake:'뱀',horse:'말',goat:'양',monkey:'원숭이',rooster:'닭',dog:'개',pig:'돼지'};
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function select(report={},input={}){
  const year=String(report.meta?.chart?.year||'');
  const animal=zodiac[year.slice(-1)]||null;
  const gender=(report.meta?.characterGender||input.gender)==='female'?'female':'male';
  const axes=report.meta?.profileBalance?.axes||{};
  const number=v=>Number.isFinite(v)?v:null;
  const action=[number(axes.achievement),number(axes.planning)].filter(v=>v!==null);
  const reflection=[number(axes.emotion),number(axes.independence)].filter(v=>v!==null);
  const average=a=>a.reduce((n,v)=>n+v,0)/a.length;
  const mbti=report.meta?.mbti||input.mbti||'';
  const pose=action.length&&reflection.length?(average(action)>=average(reflection)?'confident':'reflective'):(/^E/.test(mbti)?'confident':'reflective');
  return {animal,gender,pose,portrait:`portrait-${gender}-${pose}`,zodiac:animal?`zodiac-${animal}`:null};
 }
 function image(id,alt,css='',priority=false){
  const path=base;
  return `<img class="character-asset ${escape(css)}" src="${path}${escape(id)}.webp" alt="${escape(alt)}" width="640" height="640" decoding="async" ${priority?'fetchpriority="high"':'loading="lazy"'}>`;
 }
 function hero(report,input){const s=select(report,input);return `<div class="character-stage asset-stage" data-character="${s.portrait}" data-zodiac="${s.animal||'unknown'}">${image(s.portrait,s.pose==='confident'?'자신 있게 표현하는 인물 캐릭터':'생각을 정리하는 인물 캐릭터','hero-portrait',true)}${s.zodiac?`<div class="asset-zodiac">${image(s.zodiac,labels[s.animal]+'띠 캐릭터','hero-zodiac',true)}</div>`:''}</div>`;}
 function state(kind){const loading=kind==='loading';return image(loading?'state-loading':'state-error',loading?'분석을 준비하는 캐릭터':'다시 시도를 안내하는 캐릭터','state-character',true);}
 function guide(input,confirm=false){const gender=input.gender==='female'?'female':'male';return image(`portrait-${gender}-${confirm?'reflective':'confident'}`,confirm?'입력 정보를 확인하는 캐릭터':'사주 분석을 안내하는 캐릭터','guide-character',true);}
 function detail(sectionId,report,input,section={}){const s=select(report,input);const allowed=['confident','reflective','encouraging','cautious'];const pose=allowed.includes(section.mood)?section.mood:(/stress|money/.test(sectionId)?'cautious':/relationship|integrated/.test(sectionId)?'encouraging':s.pose);return image(`portrait-${s.gender}-${pose}`,'','detail-character');}
 function badge(report,input){const s=select(report,input);return s.zodiac?image(s.zodiac,'','badge-character',true):'';}
 const api={select,hero,state,detail,guide,badge,zodiac,labels,base};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(root)root.CHARACTER_ASSETS=api;
})(typeof window!=='undefined'?window:null);
