/* Export the actual coded first page, including personalized assets and SVG charts. */
(function(root){
'use strict';
async function dataURL(url){const response=await fetch(url);if(!response.ok)throw Error('이미지를 불러오지 못했습니다');const blob=await response.blob();return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(blob)})}
async function capture(element){
 await document.fonts?.ready;
 const original=[element,...element.querySelectorAll('*')],clone=element.cloneNode(true),copies=[clone,...clone.querySelectorAll('*')],cache=new Map();
 const inline=async url=>{const absolute=new URL(url,location.href).href;if(!cache.has(absolute))cache.set(absolute,dataURL(absolute));return cache.get(absolute)};
 for(let i=0;i<original.length;i++){
  const source=original[i],copy=copies[i],computed=getComputedStyle(source);let style='';
  for(const key of computed){let value=computed.getPropertyValue(key);if(value.includes('url(')){const matches=[...value.matchAll(/url\(["']?([^"')]+)["']?\)/g)];for(const match of matches){if(match[1].includes('#')&&!match[1].includes('/assets/'))value=value.replace(match[0],`url(#${match[1].split('#').pop()})`);else value=value.replace(match[0],`url("${await inline(match[1])}")`)}}style+=`${key}:${value};`}
  copy.setAttribute('style',style+'animation:none!important;transition:none!important;');
  if(source.tagName==='IMG'){copy.setAttribute('src',await inline(source.currentSrc||source.src));copy.removeAttribute('srcset');copy.removeAttribute('loading')}
 }
 clone.querySelectorAll('[data-share-exclude],.result-nav,.full-analysis-cta,.chart-explanation').forEach(el=>el.remove());
 const width=Math.ceil(element.getBoundingClientRect().width),host=document.createElement('div');host.style.cssText=`position:fixed;left:-20000px;top:0;width:${width}px;pointer-events:none;`;clone.style.height='auto';clone.style.margin='0';host.append(clone);document.body.append(host);
 const height=Math.ceil(clone.getBoundingClientRect().height);host.remove();
 // The hero's existing ::before gradient is a native CSS layer; reproduce it in the clone.
 const sourceVisual=element.querySelector('.hero-visual'),visual=clone.querySelector('.hero-visual');
 if(sourceVisual&&visual){const layer=document.createElement('div'),css=getComputedStyle(sourceVisual,'::before');layer.style.cssText=`position:absolute;inset:0;background:${css.backgroundImage};z-index:-1;pointer-events:none;`;visual.prepend(layer)}
 const markup=new XMLSerializer().serializeToString(clone),svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml">${markup}</div></foreignObject></svg>`;
 const image=new Image();await new Promise((ok,fail)=>{image.onload=ok;image.onerror=()=>fail(Error('이미지 변환에 실패했습니다'));image.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg)});
 const canvas=document.createElement('canvas'),scale=Math.min(2,1800/width);canvas.width=Math.ceil(width*scale);canvas.height=Math.ceil(height*scale);const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.scale(scale,scale);ctx.drawImage(image,0,0);
 return new Promise((ok,fail)=>canvas.toBlob(blob=>blob?ok(blob):fail(Error('이미지를 저장하지 못했습니다')),'image/png'));
}
function download(blob,name='saju-mbti-first-page.png'){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000)}
function mount(element,text){const share=element.querySelector('#shareReport'),save=element.querySelector('#saveReportImage'),status=element.querySelector('#shareStatus');let file,blob;const buttons=[share,save].filter(Boolean);buttons.forEach(b=>b.disabled=true);status.textContent='공유할 첫 페이지를 준비하고 있어요';
 const prepare=async()=>{try{blob=await capture(element);file=new File([blob],'saju-mbti-first-page.png',{type:'image/png'});buttons.forEach(b=>b.disabled=false);status.textContent='카카오톡 등은 공유 메뉴에서 선택 · 인스타그램은 이미지 저장 후 업로드';return blob}catch(e){buttons.forEach(b=>b.disabled=false);status.textContent='이미지 준비를 다시 시도해주세요';throw e}};
 // Prebuild so the native share call still has the user's activation at click time.
 prepare().catch(()=>{});
 share?.addEventListener('click',async()=>{if(!file){prepare().catch(()=>{});return}try{if(navigator.share&&navigator.canShare?.({files:[file]})){await navigator.share({title:'나의 사주 × MBTI 결과',text,files:[file]});status.textContent='공유 메뉴를 열었습니다'}else{download(blob);status.textContent='첫 페이지 이미지를 저장했습니다. 원하는 앱에서 첨부해주세요'}}catch(e){if(e.name!=='AbortError')status.textContent='공유가 지원되지 않으면 이미지 저장을 이용해주세요'}});
 save?.addEventListener('click',()=>{if(blob){download(blob);status.textContent='첫 페이지 이미지 저장 완료'}else prepare().catch(()=>{})});
 return {prepare};
}
// A stored ZIP keeps all report pages together without a third-party upload or dependency.
async function zipPages(files){
 const encoder=new TextEncoder(),chunks=[],directory=[];let offset=0;
 const crc32=bytes=>{let c=0xffffffff;for(const b of bytes){c^=b;for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0)}return (c^0xffffffff)>>>0};
 const header=(size,fields)=>{const bytes=new Uint8Array(size),v=new DataView(bytes.buffer);for(const [at,value,width] of fields)width===2?v.setUint16(at,value,true):v.setUint32(at,value,true);return bytes};
 for(const file of files){const name=encoder.encode(file.name),bytes=new Uint8Array(await file.arrayBuffer()),crc=crc32(bytes),local=header(30,[[0,0x04034b50,4],[4,20,2],[14,crc,4],[18,bytes.length,4],[22,bytes.length,4],[26,name.length,2]]);chunks.push(local,name,bytes);directory.push(header(46,[[0,0x02014b50,4],[4,20,2],[6,20,2],[16,crc,4],[20,bytes.length,4],[24,bytes.length,4],[28,name.length,2],[42,offset,4]]),name);offset+=local.length+name.length+bytes.length}
 const directorySize=directory.reduce((n,b)=>n+b.length,0);return new Blob([...chunks,...directory,header(22,[[0,0x06054b50,4],[8,files.length,2],[10,files.length,2],[12,directorySize,4],[16,offset,4]])],{type:'application/zip'});
}
function mountFull(element){
 const share=element.querySelector('#shareFullReport'),save=element.querySelector('#saveFullReport'),status=element.querySelector('#fullShareStatus');if(!share||!save||!status)return;
 let files=null,archive=null,pending=null;
 const prepare=()=>pending||(pending=(async()=>{try{share.disabled=save.disabled=true;const sections=[...element.querySelectorAll('.approved-cover,.detail-section,.final-card')],pages=[];for(let i=0;i<sections.length;i++){status.textContent=`전체 풀이 이미지 준비 중 · ${i+1}/${sections.length}`;const blob=await capture(sections[i]);pages.push(new File([blob],`saju-report-${String(i+1).padStart(2,'0')}.png`,{type:'image/png'}))}archive=await zipPages(pages);files=pages;status.textContent=`${files.length}장 준비 완료 · 전체 사주 공유하기를 눌러주세요`;return files}catch(e){status.textContent='전체 이미지 준비에 실패했습니다. 다시 눌러주세요.';throw e}finally{share.disabled=save.disabled=false;pending=null}})());
 share.addEventListener('click',async()=>{try{if(!files){await prepare();if(navigator.share&&navigator.canShare?.({files}))return}if(navigator.share&&navigator.canShare?.({files})){await navigator.share({title:'나의 전체 사주 풀이',files});status.textContent='전체 사주 공유 메뉴를 열었습니다'}else{download(archive,'saju-mbti-full-report.zip');status.textContent='전체 풀이 ZIP 저장 완료 · 압축을 풀면 순서대로 된 이미지를 볼 수 있습니다'}}catch(e){if(e.name!=='AbortError')status.textContent='공유를 지원하지 않는 기기에서는 전체 사주 저장하기를 이용해주세요'}});
 save.addEventListener('click',async()=>{try{if(!archive)await prepare();download(archive,'saju-mbti-full-report.zip');status.textContent='전체 풀이 ZIP 저장 완료 · 압축을 풀어 원하는 앱에 이미지를 첨부하세요'}catch(e){/* prepare displays the recoverable error */}});
}

root.REPORT_SHARE={capture,mount,mountFull,zipPages};
})(window);
