'use strict';
const path=require('path');
const files=new Set(['index.html','character-assets.css','result-dashboard.css',
 'report-validator.js','report-prompt.js','character-assets.js','share-export.js',
 'report-renderer.js','report-api-contract.js','live-report-ui.js']);
function resolvePublic(root,url){
 let pathname;try{pathname=decodeURIComponent(url.split('?')[0]);}catch{return null;}
 if(pathname==='/')pathname='/index.html';
 const relative=pathname.replace(/^\//,'');
 if(!files.has(relative)&&!/^assets\/(?:characters|result)\/[a-zA-Z0-9_-]+\.webp$/.test(relative))return null;
 return path.join(root,relative);
}
module.exports={resolvePublic};
