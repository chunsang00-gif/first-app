/* Saju x MBTI app engine v0.2
 * Deterministic interpretation inputs. AI must not invent these values.
 * Calendar pillar calculation will be connected to a verified ephemeris/calendar module before production.
 */
const SAJU_ENGINE = (() => {
  const hidden = {子:['癸'],丑:['己','癸','辛'],寅:['甲','丙','戊'],卯:['乙'],辰:['戊','乙','癸'],巳:['丙','戊','庚'],午:['丁','己'],未:['己','丁','乙'],申:['庚','壬','戊'],酉:['辛'],戌:['戊','辛','丁'],亥:['壬','甲']};
  const clashes = [['子','午'],['丑','未'],['寅','申'],['卯','酉'],['辰','戌'],['巳','亥']];
  const element = {甲:'wood',乙:'wood',丙:'fire',丁:'fire',戊:'earth',己:'earth',庚:'metal',辛:'metal',壬:'water',癸:'water'};
  const polarity = {甲:1,乙:0,丙:1,丁:0,戊:1,己:0,庚:1,辛:0,壬:1,癸:0};
  const produces = {wood:'fire',fire:'earth',earth:'metal',metal:'water',water:'wood'};
  const controls = {wood:'earth',earth:'water',water:'fire',fire:'metal',metal:'wood'};
  function tenGod(dm,x){
    const a=element[dm],b=element[x],same=polarity[dm]===polarity[x];
    if(a===b) return same?'比肩':'劫財';
    if(produces[a]===b) return same?'食神':'傷官';
    if(controls[a]===b) return same?'偏財':'正財';
    if(controls[b]===a) return same?'七殺':'正官';
    if(produces[b]===a) return same?'偏印':'正印';
    return null;
  }
  function branchOf(p){return p?.slice(-1)}
  function stemOf(p){return p?.slice(0,1)}
  function enrich(chart){
    const dm=stemOf(chart.day), pillars=['year','month','day','hour'];
    const tenGods={}, hiddenStems={}, roots=[];
    pillars.forEach(k=>{
      const p=chart[k],s=stemOf(p),b=branchOf(p);
      tenGods[k]={stem:s,tenGod:k==='day'?'日主':tenGod(dm,s)};
      hiddenStems[k]=(hidden[b]||[]).map(h=>({stem:h,tenGod:tenGod(dm,h)}));
      if((hidden[b]||[]).includes(dm)) roots.push({pillar:k,branch:b,stem:dm});
    });
    const relations=[];
    for(let i=0;i<pillars.length;i++) for(let j=i+1;j<pillars.length;j++){
      const a=branchOf(chart[pillars[i]]),b=branchOf(chart[pillars[j]]);
      if(clashes.some(c=>c.includes(a)&&c.includes(b))) relations.push({type:'충',a:pillars[i],b:pillars[j],branches:a+b});
    }
    return {chart:{...chart,dayMaster:dm},hiddenStems,tenGods,roots,relations};
  }
  const verifiedFixture={
    input:{calendar:'solar',birthDate:'1983-01-07',birthTime:'14:20',birthplace:'대구',gender:'male'},
    chart:{year:'壬戌',month:'癸丑',day:'乙未',hour:'癸未'},
    annual2027:{pillar:'丁未',stemTenGod:'食神',notes:['원국 일지 未 반복','원국 시지 未 반복','원국 월지 丑과 未가 충 관계를 다시 강조']}
  };
  function fixtureFor(input){
    if(input.calendar==='solar'&&input.birthDate==='1983-01-07'&&input.birthTime==='14:20'&&(input.birthplace||'').includes('대구')) return {...verifiedFixture,enriched:enrich(verifiedFixture.chart)};
    return null;
  }
  return {hidden,tenGod,enrich,fixtureFor};
})();
window.SAJU_ENGINE=SAJU_ENGINE;