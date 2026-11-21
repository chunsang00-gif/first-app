'use strict';
// Work59 ACTUAL Chromium renderer test, not a fake DOM replay.
// Run only by the isolated GitHub Actions visual job with playwright-core.
// Visits a local file: URI: no site deploy, API, checkout or model provider.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const {execFileSync}=require('node:child_process');
const {chromium}=require('playwright-core');
const html=path.resolve(__dirname,'workbook-mobile-offline-trial.html');
const out=process.env.WORK59_SCREENSHOT_DIR||
 path.join(os.tmpdir(),'work59-offline-mobile');
fs.mkdirSync(out,{recursive:true});
const executables=[
 process.env.CHROME_PATH,process.env.CHROMIUM_PATH,
 '/usr/bin/google-chrome','/usr/bin/google-chrome-stable',
 '/usr/bin/chromium','/usr/bin/chromium-browser'
].filter(Boolean);
const chrome=executables.find(x=>fs.existsSync(x));
if(!chrome)throw Error('WORK59_CHROME_NOT_FOUND_ON_CI_RUNNER');
// A screenshot with all Korean letters rendered as square glyphs is NOT a
// meaningful mobile usability review. Explicitly fail rather than publish.
const koreanFonts=execFileSync('fc-list',[':lang=ko'],{
 encoding:'utf8',timeout:10000
}).trim();
if(!koreanFonts)throw Error('WORK59_NO_KOREAN_FONTS_SCREENSHOTS_UNREADABLE');
function imageName(tag){return path.join(out,tag+'.png')}
async function visualSize(page,label,maxOverflow=2){
 const dims=await page.evaluate(()=>({
  width:document.documentElement.clientWidth,
  scrollWidth:document.documentElement.scrollWidth,
  bodyWidth:document.body.scrollWidth,
  viewport:window.innerWidth
 }));
 assert(dims.scrollWidth<=dims.width+maxOverflow,
  label+': horizontal viewport overflow '+JSON.stringify(dims));
 for(const selector of [
  '#readerDecision','#wb-weeklyStudyHours','#wb-targetWeeks',
  '#workSkillWorkbookResult'
 ]){
  const box=await page.locator(selector).boundingBox();
  assert(box&&box.x>=-2&&box.x+box.width<=dims.width+maxOverflow,
   label+': clipped interactive element '+selector+' '+JSON.stringify(box));
 }
 return dims;
}
async function run(){
 const browser=await chromium.launch({
  executablePath:chrome,headless:true,
  args:['--no-sandbox','--disable-dev-shm-usage',
   '--disable-background-networking']
 });
 const results=[],browserErrors=[],externalRequests=[];
 try{
  const context=await browser.newContext({
   viewport:{width:390,height:844},
   deviceScaleFactor:1,isMobile:true,hasTouch:true,
   acceptDownloads:true,locale:'ko-KR'
  });
  const page=await context.newPage();
  page.on('pageerror',e=>browserErrors.push(String(e.message)));
  page.on('request',req=>{
   if(/^https?:/i.test(req.url()))externalRequests.push(req.url());
  });
  await page.goto('file://'+html,{waitUntil:'load'});
  assert.equal(await page.locator('#workSkillWorkbook').isVisible(),true,
   'matching decision must display numeric preview on a real mobile browser');
  assert.equal(await page.locator('#workSkillExport').isVisible(),false);
  results.push({stage:'initial',viewport:await visualSize(page,'mobile-initial')});
  await page.screenshot({path:imageName('mobile-01-initial'),fullPage:true});
  await page.locator('#wb-weeklyStudyHours').fill('8');
  await page.locator('#wb-targetWeeks').fill('8');
  assert.equal(await page.locator('#workSkillWorkbookResult').getAttribute('data-workbook-status'),
   'partial-capacity-preview');
  assert((await page.locator('#workSkillWorkbookResult').innerText()).includes('64시간'));
  assert.equal(await page.locator('#workSkillExportPrepare').isEnabled(),true);
  await page.locator('#workSkillExportPrepare').click();
  assert.equal(await page.locator('#workSkillExportText').isVisible(),true);
  let summary=await page.locator('#workSkillExportText').inputValue();
  assert(summary.includes('목표 기간에 배치 가능한 시간: 64시간'));
  assert(summary.includes('필요 학습시간: 미입력'));
  assert(!summary.includes('부족한 학습시간: 0시간'));
  results.push({stage:'partial-numbers',viewport:await visualSize(page,'mobile-partial')});
  await page.screenshot({path:imageName('mobile-02-partial-result'),fullPage:true});
  await page.locator('#trialExample').click();
  assert.equal(await page.locator('#wb-weeklyStudyHours').inputValue(),'3');
  assert.equal(await page.locator('#wb-trainingCostKRW').inputValue(),'300000');
  const text=await page.locator('#workSkillWorkbookResult').innerText();
  for(const phrase of ['36시간','200,000원','4.5시간','12주 연장'])
   assert(text.includes(phrase),'real mobile result is missing '+phrase);
  assert.equal(await page.locator('#workSkillExportText').inputValue(),'',
   'changing any numeric value must clear stale downloadable results');
  await page.locator('.workbook-more-summary').click();
  assert.equal(await page.locator('details.workbook-more').evaluate(e=>e.open),true);
  await page.screenshot({path:imageName('mobile-03-expanded-options'),fullPage:true});
  results.push({stage:'complete-example',viewport:await visualSize(page,'mobile-complete')});
  await page.locator('#workSkillExportPrepare').click();
  summary=await page.locator('#workSkillExportText').inputValue();
  for(const phrase of ['36시간','200,000원','12주 연장'])
   assert(summary.includes(phrase),'numeric export missing '+phrase);
  for(const sensitive of ['물류 재고 확인','엑셀 자동화',
   '기존 일을 유지할지 새로운 기술을 배울지 고민 중입니다.'])
   assert(!summary.includes(sensitive),'customer text leaked into local TXT export');
  await page.screenshot({path:imageName('mobile-04-export-review'),fullPage:true});
  const [download]=await Promise.all([
   page.waitForEvent('download',{timeout:15000}),
   page.locator('#workSkillExportSave').click()
  ]);
  assert.equal(download.suggestedFilename(),'learning-time-budget-summary.txt');
  const saved=await download.path();
  assert(saved,'local TXT download could not be created by actual Chromium');
  const downloaded=fs.readFileSync(saved,'utf8');
  assert.equal(downloaded,summary,'downloaded bytes must equal reviewed summary');
  await page.locator('#wb-weeklyStudyHours').fill('4');
  assert.equal(await page.locator('#workSkillExportText').inputValue(),'');
  assert.equal(await page.locator('#workSkillExportSave').isEnabled(),false);
  await page.locator('#trialClear').click();
  assert.equal(await page.locator('#workSkillExport').isVisible(),false);
  assert.equal(await page.locator('#wb-weeklyStudyHours').inputValue(),'');
  // Small phone; repeat layout after all of the same code has rendered.
  await page.setViewportSize({width:320,height:720});
  await page.locator('#trialExample').click();
  results.push({stage:'small-phone',viewport:await visualSize(page,'small-phone-320')});
  await page.screenshot({path:imageName('mobile-05-narrow-320'),fullPage:true});
  await page.setViewportSize({width:1280,height:900});
  results.push({stage:'desktop',viewport:await visualSize(page,'desktop-1280')});
  await page.screenshot({path:imageName('desktop-06-example'),fullPage:true});
  assert.equal(externalRequests.length,0,'offline HTML made unexpected HTTP/HTTPS requests');
  assert.deepEqual(browserErrors,[],'browser JavaScript runtime errors');
  assert.equal(fs.readdirSync(out).filter(x=>x.endsWith('.png')).length,6);
  console.log('PASS WORK59 REAL CHROMIUM OFFLINE MOBILE '+JSON.stringify({
   chromium:chrome,results,screenshotCount:6,
   localTextFileCreated:true,personalTextExcluded:true,
   externalRequests:externalRequests.length,
   browserErrors:browserErrors.length,
   actualPhoneHardwareTested:false,realBuyersTested:0,
   providerCalls:0,merchantCalls:0,productionDeploy:false,
   premiumSaleApproved:false
  }));
 }finally{await browser.close()}
}
run().catch(e=>{console.error('WORK59_REAL_BROWSER_FAIL:'+e.stack);process.exitCode=1});
