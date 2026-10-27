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
 // This semantic gate is explicitly limited to operator QA: the live
 // first-chapter decoder and every other paid chapter remain unchanged.
 // First verify strict basis and source IDs, then check what the reader sees.
 // A separately opted-in, OFFLINE development preview may demonstrate
 // the actual reader result when a previous paid response left the optional
 // V2 paragraph null. Never change the archived/model value in place.
 // Never run this in production or in the original paid one-shot workflow.
 let readerValue=value;
 if(prompt?.paidCoreDepthV2===true&&
    process.env.PAID_CORE_V2_SOURCE_BOUND_READER==='offline-preview'&&
    process.env.NODE_ENV==='test'&&process.env.RENDER!=='true'){
  const candidate=require('./report-core-v2-source-bound-manuscript')
   .build(prompt,value);
  if(candidate){
   readerValue=structuredClone(value);
   readerValue.chapters.saju_core.paragraphs.temperament=candidate.proposal;
  }
 }
 // The model's basis.refs is not treated as authoritative provenance.
 // In guarded offline V2 only, calculated source IDs may be attached to
 // a CLONE after the concrete chart claim and reader checks both pass.
 // Production and historical raw provider response stay unchanged.
 const checked=require('./report-paid-core-v2-source-provenance')
  .bind(readerValue,prompt);
 readerValue=checked.value;
 const restored=generation.restoreEvidence(readerValue,prompt);
 if(prompt?.qaNatalDepthPreview===true)
  require('./report-core-paid-natal-depth-response-gate').assert(value,prompt);
 return reader.normalizeVisible(wire.decode(restored,prompt));
}
module.exports={decode};
