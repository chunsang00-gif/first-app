'use strict';
const {Solar,Lunar}=require('lunar-javascript');
function validateInput(input){
 if(!input||typeof input!=='object'||Array.isArray(input))return ['입력 정보를 확인해 주세요.'];
 const errors=[];
 if(!['solar','lunar'].includes(input.calendar))errors.push('양력 또는 음력을 선택해 주세요.');
 if(!['male','female'].includes(input.gender))errors.push('성별을 선택해 주세요.');
 if(input.mbti&&input.mbti!=='모름'&&!/^[EI][NS][FT][JP]$/.test(input.mbti))errors.push('MBTI를 확인해 주세요.');
 if(typeof input.birthDate!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(input.birthDate))errors.push('생년월일을 확인해 주세요.');
 else{
  const [y,m,d]=input.birthDate.split('-').map(Number);
  if(y<1900||input.birthDate>new Date().toISOString().slice(0,10)||m<1||m>12||d<1||d>31)errors.push('생년월일을 확인해 주세요.');
  else try{
   if(input.calendar==='lunar'){const lunar=Lunar.fromYmd(y,input.leapMonth?-m:m,d);if(lunar.getYear()!==y||lunar.getMonth()!==(input.leapMonth?-m:m)||lunar.getDay()!==d)throw Error();}
   else if(Solar.fromYmd(y,m,d).toYmd()!==input.birthDate||d>new Date(Date.UTC(y,m,0)).getUTCDate())throw Error();
  }catch{errors.push('달력에 없는 날짜입니다. 음력이라면 윤달 선택도 확인해 주세요.');}
 }
 if(input.unknownBirthTime!==undefined&&typeof input.unknownBirthTime!=='boolean')errors.push('출생시간 모름 여부를 확인해 주세요.');
 if(!input.unknownBirthTime&&(typeof input.birthTime!=='string'||!/^([01]\d|2[0-3]):[0-5]\d$/.test(input.birthTime)))errors.push('출생시간을 입력하거나 모름을 선택해 주세요.');
 if(input.leapMonth!==undefined&&typeof input.leapMonth!=='boolean')errors.push('윤달 여부를 확인해 주세요.');
 if(input.calendar==='solar'&&input.leapMonth===true)errors.push('윤달은 음력에서만 선택할 수 있습니다.');
 for(const key of ['name','birthplace'])if(input[key]!==undefined&&(typeof input[key]!=='string'||input[key].length>100))errors.push('이름과 출생지는 각각 100자 이내로 입력해 주세요.');
 return [...new Set(errors)];
}
module.exports={validateInput};
