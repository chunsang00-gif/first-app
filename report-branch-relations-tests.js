'use strict';
const assert=require('node:assert/strict');
const relation=require('./report-branch-relations');
const expected={
 충:['子午','丑未','寅申','卯酉','辰戌','巳亥'],
 육합:['子丑','寅亥','卯戌','辰酉','巳申','午未'],
 형:['寅巳','寅申','巳申','丑戌','丑未','未戌','子卯','辰辰','午午','酉酉','亥亥'],
 파:['子酉','丑辰','寅亥','卯午','巳申','未戌'],
 해:['子未','丑午','寅巳','卯辰','申亥','酉戌']
};
for(const [type,pairs] of Object.entries(expected))for(const chars of pairs){
 const [a,b]=chars;
 assert(relation.pairRelations(a,b).includes(type),type+' pair missing: '+chars);
 assert(relation.pairRelations(b,a).includes(type),type+' pair must be symmetrical: '+chars);
}
for(const a of '子丑寅卯辰巳午未申酉戌亥')for(const b of '子丑寅卯辰巳午未申酉戌亥'){
 const actual=relation.pairRelations(a,b);
 for(const type of actual)assert(expected[type].some(x=>x.includes(a)&&x.includes(b)),
  'invented '+type+': '+a+b);
}
const chart={year:'甲子',month:'乙丑',day:'丙午',hour:'丁戌'};
const annual=relation.annual(chart,'丁未');
const typesFor=position=>annual.pairs.filter(x=>x.between===position).map(x=>x.type);
assert.deepEqual(typesFor('year'),['해'],'子未 is harm, not clash');
assert.deepEqual(typesFor('month'),['충','형'],'丑未 simultaneously clash and punishment');
assert.deepEqual(typesFor('day'),['육합'],'午未 is pair harmony, NOT proven transformation');
assert.deepEqual(typesFor('hour'),['형','파'],'戌未 has punishment and break');
assert(annual.pairs.every(x=>x.transformation==='not-assessed'&&x.evidenceType==='pair-table'));
assert.deepEqual(annual.groups,[],'two different existing branches may not create a fictitious three-branch combination');
const natal=relation.natal(chart);
assert(!natal.pairs.some(x=>x.positions.includes('annual')));
assert(natal.pairs.every(x=>x.transformation==='not-assessed'));
const completeTriad=relation.annual({year:'甲亥',month:'乙卯',day:'丙午',hour:null},'丁未');
assert(completeTriad.groups.some(x=>x.type==='삼합'&&x.branches==='亥卯未'&&
 x.positions.includes('annual')&&x.evidenceType==='complete-group-membership'));
assert(!completeTriad.groups.some(x=>x.type==='방합'),'incomplete season trio cannot become 방합');
const duplicateAnnual=relation.annual({year:'甲亥',month:'乙卯',day:'丙未',hour:null},'丁未');
assert(duplicateAnnual.groups.some(x=>x.type==='삼합'&&x.branches==='亥卯未'&&
 x.positions.includes('annual')&&!x.positions.includes('day')),
 'the yearly branch must be an independent year fact even if the same natal branch appears');
const completeSeason=relation.annual({year:'甲巳',month:'乙午',day:'丙戌',hour:null},'丁未');
assert(completeSeason.groups.some(x=>x.type==='방합'&&x.branches==='巳午未'));
assert(!completeSeason.groups.some(x=>x.type==='삼합'));
const missingHour=relation.annual({year:'甲巳',month:'乙午',day:'丙戌',hour:null},'丁未');
assert(missingHour.pairs.every(x=>x.between!=='hour'));
assert(relation.natal({year:'甲辰',month:'乙辰',day:'丙子',hour:null}).pairs.some(x=>
 x.type==='형'&&x.branches==='辰辰'&&x.positions.join(',')==='year,month'),
 'self punishment is only possible with two distinct source positions');
assert.deepEqual(relation.natal({year:'甲辰',month:null,day:'丙子',hour:null}).pairs.filter(x=>x.type==='형'),[]);
assert.throws(()=>relation.pairRelations('A','未'),/invalid branch/);
assert.throws(()=>relation.annual(chart,'甲?'),/invalid annual/);
console.log('PASS complete standard branch pair tables, overlaps, group membership, unknown-hour and no assumed transformations; no paid API');
