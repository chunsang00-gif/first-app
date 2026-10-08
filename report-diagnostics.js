'use strict';
function configuration(env=process.env){
 const external=Boolean(String(env.REPORT_MODEL_URL||'').trim());
 const issues=[];
 if(!external){
  if(!String(env.OPENAI_API_KEY||'').trim())issues.push('MODEL_API_KEY_MISSING');
  if(!String(env.REPORT_MODEL||'').trim())issues.push('MODEL_NAME_MISSING');
 }
 return {configured:issues.length===0,issues};
}
function failureCode(message){
 const m=String(message||'');
 if(m==='AI report service is not configured')return 'MODEL_API_KEY_MISSING';
 if(m==='AI report model is not configured')return 'MODEL_NAME_MISSING';
 if(m.includes('daily rate limit'))return 'MODEL_DAILY_LIMIT';
 if(m.includes('token rate limit'))return 'MODEL_TOKEN_RATE_LIMIT';
 if(m.includes('request rate limit'))return 'MODEL_REQUEST_RATE_LIMIT';
 if(m.includes('quota exhausted'))return 'MODEL_QUOTA_EXHAUSTED';
 if(m.includes('exceeds token limit'))return 'MODEL_REQUEST_TOO_LARGE';
 if(m.includes('incomplete report'))return 'MODEL_INCOMPLETE_OUTPUT';
 if(m.includes('timed out'))return 'MODEL_TIMEOUT';
 if(m.includes('no output'))return 'MODEL_EMPTY_OUTPUT';
 if(m.includes('invalid report data'))return 'MODEL_INVALID_OUTPUT';
 const status=Number(m.match(/AI report service error \((\d+)\)/)?.[1]);
 if(status===400)return 'MODEL_REQUEST_INVALID';
 if(status===401)return 'MODEL_AUTH_FAILED';
 if(status===403||status===404)return 'MODEL_ACCESS_FAILED';
 if(status===429)return 'MODEL_LIMIT_REACHED';
 if(status>=500)return 'MODEL_UNAVAILABLE';
 return 'REPORT_GENERATION_FAILED';
}
function messageFor(code){
 if(code==='MODEL_API_KEY_MISSING'||code==='MODEL_NAME_MISSING')return '분석 서비스 연결 설정이 완료되지 않았습니다. 서비스 운영자가 연결 설정을 확인해야 합니다.';
 if(code==='MODEL_AUTH_FAILED'||code==='MODEL_ACCESS_FAILED')return '분석 서비스에 연결할 수 없습니다. 서비스 운영자가 연결 권한을 확인해야 합니다.';
 if(code==='MODEL_DAILY_LIMIT')return 'AI 분석 서비스의 하루 처리 한도에 도달했습니다. 한도가 초기화되거나 운영자가 API 한도를 조정해야 다시 분석할 수 있습니다.';
 if(code==='MODEL_TOKEN_RATE_LIMIT')return 'AI 분석 서비스의 분당 글자 처리 한도에 도달했습니다. 잠시 후 다시 시도해 주세요. 반복되면 운영자의 API 처리 한도 확인이 필요합니다.';
 if(code==='MODEL_REQUEST_RATE_LIMIT')return 'AI 분석 서비스의 분당 요청 횟수 한도에 도달했습니다. 잠시 후 다시 시도해 주세요.';
 if(code==='MODEL_QUOTA_EXHAUSTED')return 'AI 분석 API의 잔액 또는 월 사용 한도를 확인해야 합니다. 서비스 운영자가 API 결제 설정을 확인한 뒤 다시 시도해 주세요.';
 if(code==='MODEL_REQUEST_TOO_LARGE')return '상세 풀이 요청이 AI 서비스의 1회 처리 한도를 넘었습니다. 서비스 운영자의 요청 분할 조정이 필요합니다.';
 if(code==='MODEL_INCOMPLETE_OUTPUT')return '상세 풀이 응답이 끝까지 생성되지 않았습니다. 잠시 후 다시 시도해 주세요.';
 if(code==='MODEL_LIMIT_REACHED')return '분석 서비스의 사용 한도에 도달했습니다. 잠시 후 다시 시도해 주세요.';
 if(code==='MODEL_TIMEOUT')return '분석 시간이 초과됐습니다. 입력 정보는 그대로 두고 다시 시도해 주세요.';
 return '분석 결과를 만드는 중 문제가 생겼습니다. 입력 정보는 그대로 두고 다시 시도해 주세요.';
}
module.exports={configuration,failureCode,messageFor};
