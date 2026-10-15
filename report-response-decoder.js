'use strict';
// The ONLY paid provider-value -> app-batch decoder. Used live and in QA
// replay. No network calls; decoding does not certify editorial quality.
const wire=require('./report-wire');
const generation=require('./report-generation-request');
const reader=require('./report-reader-policy');
function decode(value,prompt){
 // These two shapes are operator-only archived provider failures, never
 // successful report data. They must round-trip through free QA replay.
 if(value?.status==='invalid_json')throw Error('AI report service returned invalid report data');
 if(value?.status==='empty_output')throw Error('AI report service returned no output');
 if(value?.status==='incomplete'){
  const reason=value.incomplete_details?.reason;
  throw Error(reason==='max_output_tokens'?'AI report service output token limit':
   reason==='content_filter'?'AI report service content filter':
   'AI report service returned incomplete report data');
 }
 if(!value||typeof value!=='object'||Array.isArray(value))
  throw Error('AI report service returned invalid report data');
 return reader.normalizeVisible(wire.decode(generation.restoreEvidence(value,prompt),prompt));
}
module.exports={decode};
