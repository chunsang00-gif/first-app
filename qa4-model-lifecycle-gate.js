'use strict';
// OFFICIAL PUBLIC CATALOG STATUS ONLY; it cannot verify a user's API access.
// GPT-4.1 was deprecated 2026-10-14; shutdown is 2027-01-14.
// https://developers.openai.com/api/docs/deprecations
// A new model needs a NEW reviewed request hash, schema and consent.
const MODEL='gpt-4.1';
const ANNOUNCED='2026-10-14';
const SHUTDOWN='2027-01-14';
const SHUTDOWN_START_UTC=Date.parse(SHUTDOWN+'T00:00:00Z');
const RECOMMENDED_MIGRATION='gpt-6-luna';
const SOURCE='https://developers.openai.com/api/docs/deprecations';
const CONTEXT_TOKENS=1047576;
const MAX_OUTPUT_TOKENS=32768;
function status(model=MODEL,now=new Date()){
 if(model!==MODEL)throw Error('QA4_UNREVIEWED_MODEL_REQUIRES_NEW_HASH');
 const timestamp=now instanceof Date?now.valueOf():Number(now);
 if(!Number.isFinite(timestamp))throw Error('QA4_INVALID_CLOCK');
 const until=SHUTDOWN_START_UTC-timestamp;
 return {
  model,deprecatedSince:ANNOUNCED,
  announcedShutdownDate:SHUTDOWN,shutdownClockUTC:'start-of-date-conservative',
  // The publication of a shutdown date is NOT verification of access to
  // the model on the specific OpenAI organization/project.
  eligibleForRequestTimeGate:until>0,
  calendarDaysUntilConservativeStop:Math.max(0,Math.ceil(until/86400000)),
  modelAccessVerified:false,
  publicDocumentationReportsStructuredOutputs:true,
  recommendedMigrationModel:RECOMMENDED_MIGRATION,
  contextTokens:CONTEXT_TOKENS,maxOutputTokens:MAX_OUTPUT_TOKENS,
  source:SOURCE,
  newRequestAuthorizationNeeded:true
 };
}
function assertBeforeShutdown(model=MODEL,now=new Date()){
 const result=status(model,now);
 if(!result.eligibleForRequestTimeGate)
  throw Error('QA4_GPT41_SHUTDOWN_DATE_REACHED_REQUIRE_NEW_MODEL_AND_HASH');
 return result;
}
module.exports={status,assertBeforeShutdown,MODEL,ANNOUNCED,SHUTDOWN,
 SHUTDOWN_START_UTC,SOURCE,RECOMMENDED_MIGRATION,
 CONTEXT_TOKENS,MAX_OUTPUT_TOKENS};
