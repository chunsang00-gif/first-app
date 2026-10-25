import os,json,re,urllib.parse,urllib.request,urllib.error,xml.etree.ElementTree as ET
from http.server import ThreadingHTTPServer,BaseHTTPRequestHandler
HOST='https://www.data.go.kr/data/15150945/openapi.do'
HTML=r'''<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>승강기 고유번호 조회</title><style>body{font:16px system-ui,sans-serif;background:#f1f5f9;color:#192b43;margin:0}.wrap{max-width:700px;margin:7vh auto;padding:18px}section{background:white;border-radius:20px;padding:30px;box-shadow:0 5px 28px #20304b16}input{box-sizing:border-box;width:100%;padding:16px;font-size:25px;border:1px solid #bbc9d9;border-radius:12px}button{width:100%;padding:16px;background:#155bd4;border:0;border-radius:12px;color:white;font-size:18px;margin-top:12px;cursor:pointer}h1{font-size:27px}p{color:#52657d;line-height:1.6}.row{border-bottom:1px solid #e3e8f1;padding:11px 0;display:grid;grid-template-columns:150px 1fr;gap:10px}.row b{color:#46566b}article{margin-top:20px;border-radius:12px;background:#f8faff;padding:14px}#status{margin-top:16px;white-space:pre-wrap}a{color:#155bd4}@media(max-width:550px){.row{grid-template-columns:1fr;gap:3px}section{padding:22px}}</style><main class="wrap"><section><h1>🛗 승강기 정보 조회</h1><p>고유번호 7자리로 실제 공공데이터를 조회하여 <b>이 화면 안에</b> 표시합니다.</p><form id="f"><label for="n">승강기 고유번호</label><input id="n" placeholder="예: 8088381" inputmode="numeric" maxlength="7" required><button>승강기 정보 검색</button></form><div id="status" role="status"></div><div id="results"></div><p style="font-size:13px">출처: 한국승강기안전공단 공공데이터. 공식 정보 <a href="https://www.elevator.go.kr/opn/MainPage.do" target="_blank" rel="noopener">국가승강기정보센터</a></p></section></main><script>
const input=document.querySelector('#n'),status=document.querySelector('#status'),results=document.querySelector('#results');
input.addEventListener('input',()=>input.value=input.value.replace(/[^0-9]/g,'').slice(0,7));
document.querySelector('#f').addEventListener('submit',async e=>{e.preventDefault();results.replaceChildren();if(!/^\\d{7}$/.test(input.value)){status.textContent='숫자 7자리를 입력하세요.';return}status.textContent='공공데이터 조회 중...';try{const res=await fetch('/api/elevator?number='+encodeURIComponent(input.value));const data=await res.json();if(!res.ok)throw Error(data.message||'조회에 실패했습니다');status.textContent='조회 결과 '+data.items.length+'건';const labels={number:'승강기 고유번호',building:'건물명',address:'소재지',unit:'호기',category:'승강기 종류',type:'형식',status:'운행 상태',installed:'설치일',weight:'적재하중',capacity:'최대정원',inspectionResult:'최종검사 결과',inspectionFrom:'검사유효 시작일',inspectionTo:'검사유효 종료일',travel:'운행층'};data.items.forEach(it=>{let art=document.createElement('article');Object.entries(labels).forEach(([key,label])=>{if(!it[key])return;let r=document.createElement('div');r.className='row';let b=document.createElement('b');b.textContent=label;let v=document.createElement('span');v.textContent=it[key];r.append(b,v);art.append(r)});results.append(art)})}catch(err){status.textContent=err.message}});
</script></html>'''
FIELDS={'number':['elevator_no','elevatorNo','elvtrNo','승강기고유번호'],'building':['buldNm','bldgNm','buildingName','건물명'],'address':['addr1','adres','buldAddr','건물주소','소재지1'],'unit':['elvtrSn','elevatorHo','승강기호기'],'category':['elvtrSe','elevatorType','승강기종류'],'type':['elvtrForm','elevatorForm','승강기형식'],'status':['elvtrSttus','elevatorStatus','승강기상태'],'installed':['instlDe','installDate','설치일자'],'weight':['ratedLoad','적재하중'],'capacity':['ratedCapacity','최대정원'],'inspectionResult':['lastInspctRslt','최종검사판정결과'],'inspectionFrom':['lastInspctBeginDe','최종검사유효기간시작일'],'inspectionTo':['lastInspctEndDe','최종검사유효기간종료일'],'travel':['operationFloor','운행층수']}
def query(number):
    endpoint=os.getenv('ELEVATOR_API_URL','').strip()
    key=os.getenv('ELEVATOR_API_KEY','').strip()
    if not endpoint or not key: raise RuntimeError('공공데이터 인증키와 공식 API 요청주소가 아직 등록되지 않았습니다.')
    parsed=urllib.parse.urlsplit(endpoint)
    if parsed.scheme!='https' or not (parsed.hostname or '').endswith(('.go.kr','.or.kr')): raise RuntimeError('공공데이터 요청주소가 올바르지 않습니다.')
    params=dict(urllib.parse.parse_qsl(parsed.query))
    params.update({os.getenv('ELEVATOR_API_KEY_PARAM','serviceKey'):key,os.getenv('ELEVATOR_NUMBER_PARAM','elevator_no'):number,'pageNo':'1','numOfRows':'20'})
    url=urllib.parse.urlunsplit(parsed._replace(query=urllib.parse.urlencode(params)))
    with urllib.request.urlopen(urllib.request.Request(url,headers={'Accept':'application/xml,text/xml'}),timeout=14) as response: data=response.read(1000001)
    if len(data)>1000000:raise RuntimeError('공공데이터 응답이 너무 큽니다.')
    root=ET.fromstring(data)
    nodes=list(root.iter())
    rc=next((str(n.text).strip() for n in nodes if n.tag.split('}')[-1]=='resultCode'),None)
    if rc and rc not in ('00','0','000'): raise RuntimeError('공공데이터 API 오류: '+rc)
    items=[]
    for item in (n for n in nodes if n.tag.split('}')[-1] == 'item'):
        raw={n.tag.split('}')[-1].lower().replace('_',''): (n.text or '').strip() for n in item.iter() if len(n)==0}
        obj={k:next((raw.get(a.lower().replace('_','')) for a in al if raw.get(a.lower().replace('_',''))),'') for k,al in FIELDS.items()}
        if any(v for k,v in obj.items() if k!='number'):
            obj['number']=obj['number'] or number
            items.append(obj)
    return items
class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        route=urllib.parse.urlsplit(self.path)
        if route.path in ('/','/index.html'):
            data=HTML.encode();code=200;ctype='text/html; charset=utf-8'
        elif route.path=='/api/health':
            data=json.dumps({'ok':True,'apiConfigured':bool(os.getenv('ELEVATOR_API_URL') and os.getenv('ELEVATOR_API_KEY'))}).encode();code=200;ctype='application/json; charset=utf-8'
        elif route.path=='/api/elevator':
            num=urllib.parse.parse_qs(route.query).get('number',[''])[0]
            try:
                if not re.fullmatch(r'[0-9]{7}',num):raise ValueError('승강기 고유번호 7자리를 입력하세요.')
                items=query(num)
                code=200 if items else 404
                result={'items':items} if items else {'message':'해당 번호로 조회되는 승강기 정보가 없습니다.'}
            except (ValueError,RuntimeError) as ex:code=400 if isinstance(ex,ValueError) else 503;result={'message':str(ex)}
            except (urllib.error.URLError,ET.ParseError,TimeoutError) as ex:code=502;result={'message':'공공데이터 연결 실패. 요청주소·인증키 또는 네트워크를 확인하세요.'}
            data=json.dumps(result,ensure_ascii=False).encode();ctype='application/json; charset=utf-8'
        else:code=404;data=b'Not Found';ctype='text/plain'
        self.send_response(code);self.send_header('Content-Type',ctype);self.send_header('X-Content-Type-Options','nosniff');self.send_header('Content-Length',str(len(data)));self.end_headers();self.wfile.write(data)
if __name__=='__main__':ThreadingHTTPServer(('0.0.0.0',int(os.getenv('PORT',8000))),Handler).serve_forever()
