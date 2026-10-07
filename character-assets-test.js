'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const A=require('./character-assets');
for(const [branch,animal] of Object.entries(A.zodiac)){
 assert.equal(A.select({meta:{chart:{year:'甲'+branch}}}).animal,animal);
 assert(fs.existsSync('assets/characters/zodiac-'+animal+'.webp'));
}
assert.equal(A.select({meta:{chart:{year:''}}}).animal,null);
const result={meta:{characterGender:'female',mbti:'ENTJ',chart:{year:'甲辰'},profileBalance:{axes:{achievement:20,planning:30,emotion:80,independence:95}}}};
assert.equal(A.select(result,{gender:'male'}).portrait,'portrait-female-reflective');
assert.equal(A.select({meta:{mbti:'모름'}}).pose,'reflective');
assert(!A.hero({meta:{chart:{year:'invalid'}}},{}).includes('zodiac-dragon'));
for(const gender of ['male','female'])for(const pose of ['confident','reflective'])assert(fs.existsSync(`assets/characters/portrait-${gender}-${pose}.webp`));
for(const state of ['loading','error'])assert(fs.existsSync(`assets/characters/state-${state}.webp`));
console.log('PASS 18 character assets, all 12 chart branches, unknown zodiac, resumed gender and result-driven pose');

for(const gender of ['male','female'])for(const confirm of [false,true])assert(A.guide({gender},confirm).includes('portrait-'+gender+'-'+(confirm?'reflective':'confident')));
