const {spawn}=require('child_process');const assert=require('assert');const Q=require('./report-quality-node');
const IDS=Q.IDS;
function mockReport(){
 const bodies={
  saju_core:'새로운 일을 맡을 때 혼자 해 보는 경우와 다른 사람에게 방법을 묻는 경우를 나눠 설명합니다. 바로 답해야 하는 상황에서는 충분히 시간을 갖고 고를 때와 무엇이 달라지는지 살펴봅니다. 실제 개인에 대한 판단이 아닌 연결 상태 검사용 예문입니다.',
  mbti_contradiction:'겉으로 표현하는 반응과 사주 계산에서 읽히는 내부 반응이 같은 방향인지 비교합니다. 서로 어긋나는 지점에서는 한쪽을 정답으로 두지 않고 어떤 조건에서 표현 차이가 커지는지 분석합니다. 두 체계를 단순 대응하지 않는 것이 이 장의 핵심입니다.',
  decision:'선택 상황에서는 정보를 모으는 단계와 결론을 내리는 단계를 나누어 봅니다. 계산 근거가 가리키는 속도와 신중함이 실제 의사결정에서 어느 순서로 드러나는지 설명합니다. 결정을 미루는 경우와 빠르게 확정하는 경우의 조건 차이도 구분합니다.',
  money:'금전 영역은 수입 자체보다 비용 확대와 손실 허용 범위 그리고 같은 선택을 반복할 수 있는지를 중심으로 분석합니다. 사주 계산 근거와 성향 선호가 소비나 위험 판단에 어떤 기준을 더하는지 연결합니다. 다른 장의 성격 설명을 재사용하지 않습니다.',
  career:'일에서는 숙련도와 역할 범위 그리고 판단 권한을 따로 봅니다. 어떤 업무 구조에서 책임이 커지고 어떤 조건에서 자율성이 필요한지를 계산 근거와 성향 정보로 설명합니다. 직업명을 예언하지 않고 역할과 보상의 비대칭을 구분해 판단합니다.',
  relationship:'관계에서는 친밀도 자체보다 정보 공유 시점과 역할 조정 방식을 봅니다. 갈등이 생길 때 설명을 먼저 하는지 결론을 먼저 내리는지, 상대와 기대치를 언제 맞추는지가 핵심입니다. 사주에서 읽히는 서로 다른 관계 반응이 강화되거나 엇갈리는 조건을 분리합니다.',
  stress:'압박이 커질 때 평소 반응에서 무엇이 먼저 변하는지 분석합니다. 판단 속도와 표현량 그리고 직접 챙기려는 일이 얼마나 늘어나는지를 근거에 연결합니다. 스트레스 해소법을 일반 조언으로 제시하지 않고 과부하 시 나타날 수 있는 변화만 다룹니다.',
  integrated_judgment:'앞 장의 결론을 합산하지 않고 두 체계를 함께 볼 때만 드러나는 함께 볼 때 새로 보이는 점을 정리합니다. 사주에서 서로 다른 반응이 동시에 나타날 때 무엇이 강화되고 무엇이 상쇄되는지를 구분합니다. 모순을 없애지 않고 조건별 역할 차이로 해석합니다.',
  year_2027:'2027년의 계산 결과를 평생 성향과 구분해 비교합니다. 태어난 때와 해당 연도를 비교해 평소보다 더 자주 드러날 반응과 덜 드러날 반응이 있는지 확인합니다. 변화 근거가 약하면 변화가 크다고 만들지 않고 기존 패턴이 유지되는 쪽으로 판정합니다.',
  year_2027_money:'2027년 금전 판단은 평소 비용 기준과 비교해 손실 허용 범위와 반복 가능한 지출의 변화 여부를 봅니다. 해당 연도의 계산값이 책임이나 비용 부담을 더 키우는지 확인하고 근거가 약하면 기존 기준 유지로 설명합니다. 수입 증가 같은 사건은 확정하지 않습니다.',
  year_2027_career:'2027년 일에서는 평소 역할과 비교해 책임 범위와 판단권의 변화 가능성을 살핍니다. 연간 계산 근거가 기존 직업 성향을 더 강하게 만드는지 또는 다른 우선순위를 요구하는지 구분합니다. 이직이나 합격 같은 사건을 예측하지 않습니다.',
  year_2027_relationship:'2027년 관계는 평소 정보 공유와 역할 배분 방식에 연간 변화가 더해지는지를 봅니다. 시간 배분과 기대치 조정의 압력이 기존보다 강해지는지 비교하고 근거가 약하면 유지로 판정합니다. 특정 만남이나 결혼 같은 사건은 확정하지 않습니다.'
 };
 const judgments={
  saju_core:'처음 해 보는 일을 맡을 때 무엇부터 확인하는지 설명합니다.',
  mbti_contradiction:'외부 표현과 내부 반응의 간격이 두 체계의 핵심 차이입니다.',
  decision:'결정 전 정보 수집과 결정 후 실행 속도를 분리해서 봐야 합니다.',
  money:'금전 판단은 비용 확대와 손실 허용 범위를 우선 확인합니다.',
  career:'일의 적합성은 역할 범위와 판단 권한의 조합으로 구분합니다.',
  relationship:'관계의 변수는 정보 공유 시점과 역할 기대의 차이입니다.',
  stress:'압박 시에는 표현량과 챙기려는 일이 얼마나 늘어나는지가 먼저 드러납니다.',
  integrated_judgment:'두 체계의 충돌은 조건별 작동 차이로 통합해 해석합니다.',
  year_2027:'2027년 변화는 평소 패턴과 비교해 연간 근거가 있는 부분만 반영합니다.',
  year_2027_money:'2027년 돈은 평소보다 비용과 반복 가능성의 변화 여부를 봅니다.',
  year_2027_career:'2027년 일은 평소 역할에서 책임과 판단권이 달라지는지를 비교합니다.',
  year_2027_relationship:'2027년 관계는 기존 정보 공유와 시간 배분의 변화를 비교합니다.'
 };
 return {meta:{name:'',mbti:'모름',chart:{year:'甲子',month:'甲子',day:'甲子',hour:'甲子',calculationStatus:'complete'},targetYear:2027,versions:{ruleset:'test',prompt:'test',schema:'test'}},sections:Q.IDS.map((id,i)=>({id,title:'테스트 '+(i+1),mood:['confident','reflective','encouraging','cautious'][i%4],bodyTopics:Object.keys(require('./report-outline').topics[id]),bodyLabels:Object.keys(require('./report-outline').topics[id]).map((_,i)=>'검증 항목 '+i),body:Object.keys(require('./report-outline').topics[id]).map((topic,j)=>bodies[id].split(/(?<=다\.)\s+/)[j]||topic+'에 관한 독립적인 해석입니다.'),keyJudgment:judgments[id],evidence:['검증된 계산 사실 '+i]})),cover:{headline:'선택을 확인하고 행동으로 옮기는 사람',description:'테스트용 개인별 요약 설명입니다.',keywords:['직접확인','실행력','의견표현'],highlights:['money','relationship','career'].map(id=>({sectionId:id,title:'선별 '+id,description:judgments[id]}))},finalJudgment:{headline:'다음 선택에 강점을 쓰세요',strengths:['확인하고 실행하는 선택'],watchouts:['다른 의견을 늦게 듣는 선택'],routines:[{trigger:'결정하기 전',action:'반대 의견 한 가지를 먼저 확인해보세요',reason:'누락된 정보를 찾는 데 도움이 됩니다'}],body:['전체 판단을 종합합니다.'],closingQuestion:'서로 다른 의견을 들은 뒤 판단하면 놓치기 쉬운 문제를 줄일 수 있습니다.',afterClosingText:''}}}

assert.equal(Q.validate(mockReport()).pass,true,JSON.stringify(Q.validate(mockReport()).errors));
const child=spawn(process.execPath,['server.js'],{env:{...process.env,PORT:'3210',REPORT_MODEL_URL:'http://127.0.0.1:3211/report'},stdio:'ignore'});
let modelCalls=0,editorialCalls=0,rejectFixture=false;
const model=httpServer();
function httpServer(){const http=require('http');const s=http.createServer((req,res)=>{if(req.method==='POST'&&req.url==='/report'){let b='';req.on('data',c=>b+=c);req.on('end',()=>{const p=JSON.parse(b||'{}');modelCalls++;if(p.editorialDraft){editorialCalls++;assert(p.editorialDraft.sections.length>=1&&p.editorialDraft.sections.length<=12);assert.ok(p.editorialTask)}if(p.stage==='synthesis'){assert(editorialCalls>=0);assert(p.completedReport.sections.length>=1&&p.completedReport.sections.length<=12);assert.deepEqual(p.requestedSections,[]);assert(p.includeCover&&p.includeFinal)}else{assert(!p.includeCover&&!p.includeFinal)}const full=mockReport();if(p.stage==='body'&&p.requestedSections?.includes('saju_core')){const thesis=require('./report-core-thesis').forPrompt(p);const first=full.sections.find(s=>s.id==='saju_core');const main=first.bodyTopics.indexOf('strength');if(main<0)throw Error('smoke must provide core month paragraph');first.body[main]+=' '+require('./qa/core-meaning-mock').body(p);}if(rejectFixture)full.sections[0].body[0]+=' 이 점이 중요합니다.';const ids=p.requestedSections||IDS,sections=full.sections.filter(x=>ids.includes(x.id));res.writeHead(200,{'content-type':'application/json'});res.end(JSON.stringify({sections,finalJudgment:p.includeFinal?full.finalJudgment:null,cover:p.includeCover?full.cover:null}))});return}res.writeHead(404);res.end()});s.listen(3211);return s}
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{try{await wait(700);const healthResponse=await fetch('http://127.0.0.1:3210/api/health');assert.equal(healthResponse.status,200);const health=await healthResponse.json();assert.equal(health.status,'ok');assert.ok(Object.hasOwn(health,'deployCommit'));assert.ok(!JSON.stringify(health).includes('OPENAI_API_KEY'));console.log('PASS health endpoint exposes deploy commit without secrets');const home=await fetch('http://127.0.0.1:3210/?utm_source=smoke');assert.equal(home.status,200);const html=await home.text();assert.ok(html.includes('SAJU × MBTI'));assert.ok(html.includes('data-step="1"'));assert.ok(html.includes('data-step="2"'));assert.ok(html.includes('data-step="3"'));assert.ok(html.includes('id="reportBody"'));assert.ok(html.includes('report-renderer.js'));assert.ok(html.includes('live-report-ui.js'));console.log('PASS root page, 3-step UI, and report scripts');for(const privatePath of ['/server.js','/report-schema.json','/.env','/node_modules/lunar-javascript/index.js'])assert.equal((await fetch('http://127.0.0.1:3210'+privatePath)).status,404);const invalid=await fetch('http://127.0.0.1:3210/api/calculate',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({calendar:'solar',birthDate:'2000-02-30',gender:'male',unknownBirthTime:true})});assert.equal(invalid.status,422);
for(const birthDate of ['2999-01-01','2026-12-01']){
 const calendar=birthDate==='2026-12-01'?'lunar':'solar';
 const response=await fetch('http://127.0.0.1:3210/api/calculate',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({calendar,birthDate,gender:'male',unknownBirthTime:true})});
 assert.equal(response.status,422,'future '+calendar+' date must fail at HTTP boundary');
}
const validLunar=await fetch('http://127.0.0.1:3210/api/calculate',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({calendar:'lunar',birthDate:'2026-09-01',gender:'male',unknownBirthTime:true,mbti:'모름'})});
assert.equal(validLunar.status,200,'valid past lunar date must pass at HTTP boundary');
console.log('PASS HTTP blocks private files and invalid/future solar-lunar dates while accepting valid lunar input');for(const asset of require('./assets/characters/manifest.json').assets){const r=await fetch('http://127.0.0.1:3210/assets/characters/'+asset.file);assert.equal(r.status,200);assert.equal(r.headers.get('content-type'),'image/webp');assert((await r.arrayBuffer()).byteLength>10000)}console.log('PASS all 18 character images served with image/webp MIME');for(const asset of require('./assets/result/manifest.json').assets){const r=await fetch('http://127.0.0.1:3210/assets/result/'+asset.file);assert.equal(r.status,200);assert.equal(r.headers.get('content-type'),'image/webp');assert((await r.arrayBuffer()).byteLength>1000)}console.log('PASS all '+require('./assets/result/manifest.json').assets.length+' reference-style assets served with image/webp MIME');const input={calendar:'solar',birthDate:'2000-06-15',birthTime:'12:00',birthplace:'서울',gender:'female',mbti:'모름',name:''};const r=await fetch('http://127.0.0.1:3210/api/calculate',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(input)});assert.equal(r.status,200);const x=await r.json();assert.equal(x.status,'ready');assert.equal(x.targetYear.pillar,'丁未');assert.ok(x.chart.year&&x.chart.month&&x.chart.day&&x.chart.hour);console.log('PASS calculate API end-to-end');
const mbtiTypes=['INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP','ISTJ','ISTP','ESTJ','ESTP','ISFJ','ISFP','ESFJ','ESFP','모름'];
const apiProfiles=[
 {calendar:'solar',birthDate:'1990-05-15',birthTime:'10:30',gender:'male'},
 {calendar:'solar',birthDate:'1988-08-21',birthTime:'22:10',gender:'female'},
 {calendar:'lunar',birthDate:'1995-05-12',birthTime:'14:20',gender:'female'},
 {calendar:'solar',birthDate:'2001-11-03',birthTime:'',unknownBirthTime:true,gender:'male'}
];
for(const profile of apiProfiles)for(const mbti of mbtiTypes){
 const response=await fetch('http://127.0.0.1:3210/api/calculate',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({...profile,mbti})});
 assert.equal(response.status,200,'API '+JSON.stringify({...profile,mbti}));
 const packet=await response.json();
 assert.equal(packet.status,'ready');
 assert.equal(Boolean(packet.chart.hour),!profile.unknownBirthTime);
 assert.equal(packet.calculationInput.mbti,mbti);
}
console.log('PASS all 68 solar/lunar, known/unknown-hour, MBTI HTTP calculation cases');const rr=await fetch('http://127.0.0.1:3210/api/report',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({analysisInput:x,requestId:'smoke-unique-job-20261011'})});assert.equal(rr.status,202);const started=await rr.json();assert.equal(started.status,'processing');assert.ok(started.jobId);const duplicate=await fetch('http://127.0.0.1:3210/api/report',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({analysisInput:x,requestId:'smoke-unique-job-20261011'})});assert.equal(duplicate.status,202);assert.equal((await duplicate.json()).jobId,started.jobId,'identical request must reuse the existing paid job');console.log('PASS repeated user request shares one paid generation job');let done=null;for(let i=0;i<20;i++){await wait(100);const sr=await fetch('http://127.0.0.1:3210/api/report-status?id='+encodeURIComponent(started.jobId));if(sr.status===200){const sx=await sr.json();if(sx.status==='ready'){done=sx;break}}}assert.ok(done,'async report job did not complete');assert.equal(done.qualityWarning,undefined);const report=done.report;assert(report.sections.length>=1&&report.sections.length<=12);assert.equal(report.sections[0].id,'saju_core');assert(report.sections.some(s=>s.id==='year_2027'),'annual overview remains');assert.equal(report.meta.mbti,'모름');assert.equal(report.meta.profileBalance.mode,'saju-only');assert.ok(report.meta.profileBalance.note.includes('사주 결과'));assert.ok(report.meta.profileBalance.scaleLabel.includes('측정한 점수가 아닙니다'));assert.ok(!report.finalJudgment.closingQuestion.endsWith('?'));assert.equal(report.cover.keywords[0],'직접확인');assert.equal(report.sections[0].bodyLabels.length,2);assert.equal(report.sections[2].mood,'encouraging');assert.equal(report.finalJudgment.routines[0].trigger,'결정하기 전');console.log('PASS evidence-selected report API end-to-end with cover, content moods, paragraph labels and final routines');assert(modelCalls>=2&&modelCalls<=7);assert.equal(editorialCalls,0);rejectFixture=true;const badStart=await (await fetch('http://127.0.0.1:3210/api/report',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({analysisInput:x})})).json();let rejected;for(let i=0;i<20;i++){await wait(100);const res=await fetch('http://127.0.0.1:3210/api/report-status?id='+badStart.jobId);const value=await res.json();if(value.status!=='processing'){rejected={http:res.status,...value};break}}assert.equal(rejected.http,422);assert.equal(rejected.code,'REPORT_QUALITY_REJECTED');assert.ok(rejected.report);assert.ok(rejected.qa);console.log('PASS full-report editorial review and rejection without exposing failed report')}catch(e){console.error('FAIL',e.message);process.exitCode=1}finally{child.kill();model.close()}})();

