'use strict';
const path=require('path');
const files=new Set(['index.html','character-assets.css','result-dashboard.css',
 'report-validator.js','report-prompt.js','character-assets.js','share-export.js',
 'report-renderer.js','report-api-contract.js','report-checkout-ui.js','live-report-ui.js',
 // Every LOCAL script referenced by the actual index.html must be allowed.
 // The explicit allowlist protects source and private QA files from GET.
 'report-paid-reader-question-domain.js','report-readable-export.js',
 'free-calculation-state.js','birth-day-options.js',
 'report-buyer-work-skill-scope.js',
 'report-buyer-decision-context.js','report-work-skill-decision-workbook.js',
 'report-work-skill-decision-comparison.js',
 'report-work-skill-decision-workbook-ui.js',
 'report-work-skill-decision-workbook.css']);
function resolvePublic(root,url){
 let pathname;try{pathname=decodeURIComponent(url.split('?')[0]);}catch{return null;}
 if(pathname==='/')pathname='/index.html';
 const relative=pathname.replace(/^\//,'');
 if(!files.has(relative)&&!/^assets\/(?:characters|result)\/[a-zA-Z0-9_-]+\.webp$/.test(relative))return null;
 return path.join(root,relative);
}
module.exports={resolvePublic};
