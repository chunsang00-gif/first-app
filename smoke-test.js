const {spawn}=require('child_process');const assert=require('assert');const Q=require('./report-quality-node');
const IDS=Q.IDS;
function mockReport(){
 const bodies={
  saju_core:'원국의 중심축과 오행 분포를 기준으로 기본 반응의 방향을 설명합니다. 일간의 성질과 월지의 계절 조건이 어떤 긴장을 만드는지 계산 사실을 중심으로 풀어냅니다. 강약을 좋고 나쁨으로 단정하지 않고 반복해서 나타나는 반응 구조와 우선순위를 구분합니다.',
  mbti_contradiction:'MBTI 선호에서 기대되는 외부 표현과 사주 계산에서 읽히는 내부 반응이 같은 방향인지 비교합니다. 서로 어긋나는 지점에서는 한쪽을 정답으로 두지 않고 어떤 조건에서 표현 차이가 커지는지 분석합니다. 두 체계를 단순 대응하지 않는 것이 이 장의 핵심입니다.',
  decision:'선택 상황에서는 정보를 모으는 단계와 결론을 내리는 단계를 나누어 봅니다. 계산 근거가 가리키는 속도와 MBTI의 판단 선호가 실제 의사결정에서 어느 순서로 작동하는지 설명합니다. 결정을 미루는 경우와 빠르게 확정하는 경우의 조건 차이도 구분합니다.',
  money:'금전 영역은 수입 자체보다 비용 확대와 손실 허용 범위 그리고 같은 선택을 반복할 수 있는지를 중심으로 분석합니다. 사주 계산 근거와 성향 선호가 소비나 위험 판단에 어떤 기준을 더하는지 연결합니다. 다른 장의 성격 설명을 재사용하지 않습니다.',
  career:'일에서는 숙련도와 역할 범위 그리고 판단 권한을 따로 봅니다. 어떤 업무 구조에서 책임이 커지고 어떤 조건에서 자율성이 필요한지를 계산 근거와 성향 정보로 설명합니다. 직업명을 예언하지 않고 역할과 보상의 비대칭을 구분해 판단합니다.',
  relationship:'관계에서는 친밀도 자체보다 정보 공유 시점과 역할 조정 방식을 봅니다. 갈등이 생길 때 설명을 먼저 하는지 결론을 먼저 내리는지, 상대와 기대치를 언제 맞추는지가 핵심입니다. 사주와 MBTI가 관계 반응을 강화하거나 엇갈리게 하는 조건을 분리합니다.',
  stress:'압박이 커질 때 평소 반응에서 무엇이 먼저 변하는지 분석합니다. 판단 속도와 표현량 그리고 직접 챙기려는 일이 얼마나 늘어나는지를 근거에 연결합니다. 스트레스 해소법을 일반 조언으로 제시하지 않고 과부하 시 나타날 수 있는 변화만 다룹니다.',
  integrated_judgment:'앞 장의 결론을 합산하지 않고 두 체계를 함께 볼 때만 드러나는 함께 볼 때 새로 보이는 점을 정리합니다. 사주에서 강한 반응과 MBTI 선호가 동시에 작동할 때 무엇이 강화되고 무엇이 상쇄되는지를 구분합니다. 모순을 없애지 않고 조건별 역할 차이로 해석합니다.',
  year_2027:'2027년은 평생 성향과 분리해 연간 작동만 비교합니다. 원국과 해당 연도를 비교해 평소보다 더 자주 드러날 반응과 덜 드러날 반응이 있는지 확인합니다. 변화 근거가 약하면 변화가 크다고 만들지 않고 기존 패턴이 유지되는 쪽으로 판정합니다.',
  year_2027_money:'2027년 금전 판단은 평소 비용 기준과 비교해 손실 허용 범위와 반복 가능한 지출의 변화 여부를 봅니다. 해당 연도의 계산값이 책임이나 비용 부담을 더 키우는지 확인하고 근거가 약하면 기존 기준 유지로 설명합니다. 수입 증가 같은 사건은 확정하지 않습니다.',
  year_2027_career:'2027년 일에서는 평소 역할과 비교해 책임 범위와 판단권의 변화 가능성을 살핍니다. 연간 계산 근거가 기존 직업 성향을 더 강하게 만드는지 또는 다른 우선순위를 요구하는지 구분합니다. 이직이나 합격 같은 사건을 예측하지 않습니다.',
  year_2027_relationship:'2027년 관계는 평소 정보 공유와 역할 배분 방식에 연간 변화가 더해지는지를 봅니다. 시간 배분과 기대치 조정의 압력이 기존보다 강해지는지 비교하고 근거가 약하면 유지로 판정합니다. 특정 만남이나 결혼 같은 사건은 확정하지 않습니다.'
 };
 const judgments={
  saju_core:'기본 반응의 중심은 원국의 계절 조건과 일간 관계에서 판정합니다.',
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
 return {meta:{name:'',mbti:'모름',chart:{year:'甲子',month:'甲子',day:'甲子',hour:'甲子',calculationStatus:'complete'},targetYear:2027,versions:{ruleset:'test',prompt:'test',schema:'test'}},sections:Q.IDS.map((id,i)=>({id,title:'테스트 '+(i+1),body:[bodies[id],bodies[id]],keyJudgment:judgments[id],evidence:[id.startsWith('year_2027')?'일간 갑목과 월지 자수, 2027 연도 근거를 함께 확인 '+i:'일간 갑목과 월지 자수를 함께 확인한 근거 '+i]})),finalJudgment:{body:['전체 판단을 종합합니다.'],closingQuestion:'이 판단을 실제 선택에서 어떻게 확인할 것인가?',afterClosingText:''}}}

const child=spawn(process.execPath,['server.js'],{env:{...process.env,PORT:'3210',REPORT_MODEL_URL:'http://127.0.0.1:3211/report'},stdio:'ignore'});
const model=httpServer();
function httpServer(){const http=require('http');const s=http.createServer((req,res)=>{if(req.method==='POST'&&req.url==='/report'){let b='';req.on('data',c=>b+=c);req.on('end',()=>{const p=JSON.parse(b||'{}'),full=mockReport(),ids=p.requestedSections||IDS,sections=full.sections.filter(x=>ids.includes(x.id));res.writeHead(200,{'content-type':'application/json'});res.end(JSON.stringify({sections,finalJudgment:p.includeFinal?full.finalJudgment:null}))});return}res.writeHead(404);res.end()});s.listen(3211);return s}
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{try{await wait(700);const home=await fetch('http://127.0.0.1:3210/?utm_source=smoke');assert.equal(home.status,200);const html=await home.text();assert.ok(html.includes('SAJU × MBTI'));assert.ok(html.includes('data-step="1"'));assert.ok(html.includes('data-step="2"'));assert.ok(html.includes('data-step="3"'));assert.ok(html.includes('id="reportBody"'));assert.ok(html.includes('class="home-primary" id="openSaju"'));assert.ok(html.includes('id="openFullReport"'));assert.ok(html.includes('report-renderer.js'));assert.ok(html.includes('live-report-ui.js'));console.log('PASS root page, 3-step UI, and report scripts');const input={calendar:'solar',birthDate:'2000-06-15',birthTime:'12:00',birthplace:'서울',gender:'female',mbti:'모름',name:''};const r=await fetch('http://127.0.0.1:3210/api/calculate',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(input)});assert.equal(r.status,200);const x=await r.json();assert.equal(x.status,'ready');assert.equal(x.targetYear.pillar,'丁未');assert.ok(x.chart.year&&x.chart.month&&x.chart.day&&x.chart.hour);console.log('PASS calculate API end-to-end');const rr=await fetch('http://127.0.0.1:3210/api/report',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({analysisInput:x})});assert.equal(rr.status,202);const started=await rr.json();assert.equal(started.status,'processing');assert.ok(started.jobId);let done=null;for(let i=0;i<20;i++){await wait(100);const sr=await fetch('http://127.0.0.1:3210/api/report-status?id='+encodeURIComponent(started.jobId));if(sr.status===200){const sx=await sr.json();if(sx.status==='ready'){done=sx;break}}}assert.ok(done,'async report job did not complete');const report=done.report;assert.equal(report.sections.length,12);assert.equal(report.sections[0].id,'saju_core');assert.equal(report.sections[11].id,'year_2027_relationship');assert.equal(report.meta.mbti,'모름');assert.equal(report.meta.profileBalance.mode,'saju-only');assert.ok(report.meta.profileBalance.note.includes('사주 결과'));assert.ok(report.meta.profileBalance.scaleLabel.includes('높을수록'));assert.ok(report.finalJudgment.closingQuestion.endsWith('?'));console.log('PASS 12-section report API end-to-end')}catch(e){console.error('FAIL',e.message);process.exitCode=1}finally{child.kill();model.close()}})();
