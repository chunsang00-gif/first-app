'use strict';
// Explicit provider options for models whose defaults differ from legacy
// non-reasoning GPT-4.1. This is a REQUEST contract, not model approval.
// Terra supports none; use it for a like-for-like writing/output-budget
// preflight. Actual Korean prose quality and remote API acceptance are
// NOT verified by selecting this value.
function requestFields(model){
 if(model==='gpt-6.1-terra')return {reasoning:{effort:'none'}};
 return {};
}
module.exports={requestFields};
