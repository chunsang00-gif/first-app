'use strict';
// Standard terrestrial-branch relationship TABLE lookup, not causal fortune
// telling. Detection never means 合化, a realised event, or a stronger/favorable
// element. Pairwise 刑 is a candidate relation, not a completed 三刑 judgment.
// Reference tables: daysaju.com/guide/jiji and sajustudy.com/59.
const BRANCHES='子丑寅卯辰巳午未申酉戌亥';
const TABLES={
 '충':['子午','丑未','寅申','卯酉','辰戌','巳亥'],
 '육합':['子丑','寅亥','卯戌','辰酉','巳申','午未'],
 '형':['寅巳','寅申','巳申','丑戌','丑未','未戌','子卯','辰辰','午午','酉酉','亥亥'],
 '파':['子酉','丑辰','寅亥','卯午','巳申','未戌'],
 '해':['子未','丑午','寅巳','卯辰','申亥','酉戌']
};
const GROUPS={
 '삼합':['申子辰','寅午戌','巳酉丑','亥卯未'],
 '방합':['寅卯辰','巳午未','申酉戌','亥子丑']
};
function pairKey(a,b){return [a,b].sort().join('');}
const pairMaps=Object.fromEntries(Object.entries(TABLES).map(([name,pairs])=>[name,
 new Set(pairs.map(x=>pairKey(x[0],x[1])))]));
function pairRelations(a,b){
 if(!BRANCHES.includes(a)||!BRANCHES.includes(b)||!a||!b)throw Error('invalid branch for relation');
 const key=pairKey(a,b);
 return Object.keys(TABLES).filter(name=>pairMaps[name].has(key));
}
function branchesFrom(chart){
 if(!chart||typeof chart!=='object')throw Error('invalid pillar chart');
 const result=[];
 for(const position of ['year','month','day','hour']){
  const pillar=chart[position];
  if(pillar===undefined||pillar===null)continue;
  if(typeof pillar!=='string'||pillar.length!==2||!BRANCHES.includes(pillar[1]))
   throw Error('invalid pillar at '+position);
  result.push({position,branch:pillar[1]});
 }
 return result;
}
function groupRelations(rows){
 const result=[];
 // Three DISTINCT source positions are necessary for an exact complete group.
 // This is a membership result, NOT an assessment of seasonal transformation.
 for(const [type,groups] of Object.entries(GROUPS))for(const group of groups){
  const found=[...group].map(branch=>rows.find(row=>row.branch===branch));
  if(found.every(Boolean)){
   result.push({type,branches:group,positions:found.map(x=>x.position),
    evidenceType:'complete-group-membership',transformation:'not-assessed'});
  }
 }
 return result;
}
function natal(chart){
 const rows=branchesFrom(chart),pairs=[];
 for(let i=0;i<rows.length;i++)for(let j=i+1;j<rows.length;j++)
  for(const type of pairRelations(rows[i].branch,rows[j].branch))
   pairs.push({type,branches:rows[i].branch+rows[j].branch,
    positions:[rows[i].position,rows[j].position],evidenceType:'pair-table',
    transformation:'not-assessed'});
 return {pairs,groups:groupRelations(rows)};
}
function annual(chart,annualPillar){
 if(typeof annualPillar!=='string'||annualPillar.length!==2||!BRANCHES.includes(annualPillar[1]))
  throw Error('invalid annual pillar');
 const rows=branchesFrom(chart),annualRow={position:'annual',branch:annualPillar[1]};
 const pairs=rows.flatMap(row=>pairRelations(row.branch,annualRow.branch).map(type=>({
  type,branches:row.branch+annualRow.branch,between:row.position,
  evidenceType:'pair-table',transformation:'not-assessed'
 })));
 const groups=groupRelations([...rows,annualRow]).filter(row=>row.positions.includes('annual'));
 return {pairs,groups};
}
module.exports={natal,annual,pairRelations,TABLES,GROUPS};
