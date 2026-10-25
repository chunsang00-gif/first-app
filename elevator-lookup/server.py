"""승강기 고유번호 조회 웹앱 - Python standard library only.

The government API key and URL are server-side configuration only.
Do not expose them to the browser or include them in URL/log messages.
"""
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PUBLIC = ROOT / "public"
GOV_SITE = "https://www.elevator.go.kr/opn/info/ComElvtrNumAddrNewL01.do"
NUMBER_RE = re.compile(r"^[0-9]{7}$")

# API field aliases: provider data can differ by version / endpoint.
FIELDS = {
    "number": ["elevator_no", "elevatorNo", "elvtrNo", "elvtr_no", "승강기고유번호"],
    "building": ["buldNm", "bldgNm", "bldgName", "buildingName", "building_nm", "bldNm", "건물명"],
    "address": ["addr1", "address1", "buldAddr", "bldgAddr", "adres", "addr", "소재지1", "도로명주소"],
    "unit": ["elvtrSn", "elevatorHo", "elevatorUnit", "hoGi", "elevator_nm", "승강기호기"],
    "category": ["elvtrSe", "elevatorType", "elevatorKind", "승강기구분", "승강기종류"],
    "type": ["elvtrForm", "elevatorForm", "elevatorDetailType", "승강기형식", "승강기세부형식"],
    "status": ["elvtrSttus", "elevatorStatus", "operStatus", "승강기상태"],
    "manufacturer": ["mfcNm", "manufacturerNm", "makerNm", "제조업체명"],
    "installed": ["instlDe", "installDate", "installationDate", "설치일자", "최초설치일자"],
    "weight": ["ratedLoad", "loadWeight", "weight", "적재하중"],
    "capacity": ["ratedCapacity", "maxPerson", "capacity", "최대정원"],
    "travel": ["operationFloor", "operationSection", "운행구간", "운행층수"],
    "inspectionResult": ["lastInspctRslt", "lastInspectResult", "lastInspectionResult", "최종검사판정결과"],
    "inspectionFrom": ["lastInspctBeginDe", "lastInspectStartDate", "최종검사유효기간시작일"],
    "inspectionTo": ["lastInspctEndDe", "lastInspectEndDate", "lastInspectionEndDate", "최종검사유효기간종료일"],
}


def strip_namespace(tag):
    return tag.split("}", 1)[-1]


def xml_text_dict(item):
    result = {}
    for node in item.iter():
        if node is item or len(node):
            continue
        txt = (node.text or "").strip()
        if txt:
            result[strip_namespace(node.tag)] = txt
    return result


def normalize(raw, query_number):
    lowered = {k.lower().replace("_", ""): v for k, v in raw.items()}
    out = {}
    for target, aliases in FIELDS.items():
        value = next((lowered.get(name.lower().replace("_", "")) for name in aliases if lowered.get(name.lower().replace("_", ""))), None)
        out[target] = value
    out["number"] = out["number"] or query_number
    # Keep only named, published fields. Do not accidentally expose arbitrary records.
    return out


def parse_xml(payload, number):
    root = ET.fromstring(payload)
    code = next((n.text for n in root.iter() if strip_namespace(n.tag) == "resultCode"), None)
    message = next((n.text for n in root.iter() if strip_namespace(n.tag) == "resultMsg"), None)
    if code is not None and code.strip() not in {"00", "0", "000"}:
        raise ValueError("공공데이터 서비스가 오류를 반환했습니다. (코드: " + code.strip()[:12] + ")")
    items = [n for n in root.iter() if strip_namespace(n.tag) == "item"]
    if not items:
        # Some APIs emit one record directly inside <body> rather than <items><item>.
        bodies = [n for n in root.iter() if strip_namespace(n.tag) == "body"]
        if bodies and any(strip_namespace(x.tag).lower() in {"elevator_no", "elevatorno", "elvtrno"} for x in bodies[0].iter()):
            items = [bodies[0]]
    return [normalize(xml_text_dict(n), number) for n in items][:20], message


def fetch_elevator(number):
    api_key = os.environ.get("ELEVATOR_API_KEY", "").strip()
    api_url = os.environ.get("ELEVATOR_API_URL", "").strip()
    if not api_key or not api_url:
        return 503, {"error": "NOT_CONFIGURED", "message": "공공데이터 API 연결 전입니다. 공식 승강기정보센터에서 직접 조회할 수 있습니다.", "officialUrl": GOV_SITE}
    parsed = urllib.parse.urlparse(api_url)
    if parsed.scheme not in ("http", "https") or not parsed.netloc or parsed.username or parsed.password:
        return 503, {"error": "BAD_CONFIGURATION", "message": "서버 API 주소 설정을 확인해 주세요."}
    key_param = os.environ.get("ELEVATOR_API_KEY_PARAM", "ServiceKey")
    num_param = os.environ.get("ELEVATOR_NUMBER_PARAM", "elevator_no")
    if not re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]{0,40}", key_param) or not re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]{0,40}", num_param):
        return 503, {"error": "BAD_CONFIGURATION", "message": "서버 파라미터 설정을 확인해 주세요."}
    params = dict(urllib.parse.parse_qsl(parsed.query, keep_blank_values=True))
    params.update({key_param: api_key, num_param: number, "pageNo": "1", "numOfRows": "20"})
    url = urllib.parse.urlunparse(parsed._replace(query=urllib.parse.urlencode(params)))
    request = urllib.request.Request(url, headers={"User-Agent": "ElevatorLookup/1.0", "Accept": "application/xml,text/xml,*/*"})
    try:
        with urllib.request.urlopen(request, timeout=12) as response:
            data = response.read(1_000_001)
        if len(data) > 1_000_000:
            return 502, {"error": "RESPONSE_TOO_LARGE", "message": "공공데이터 응답이 너무 큽니다."}
        items, _ = parse_xml(data, number)
        if not items:
            return 404, {"error": "NOT_FOUND", "message": "해당 번호의 공개 승강기 정보가 조회되지 않았습니다.", "officialUrl": GOV_SITE}
        return 200, {"number": number, "items": items, "source": "한국승강기안전공단 공공데이터", "officialUrl": GOV_SITE}
    except urllib.error.HTTPError as exc:
        if exc.code in (401, 403):
            return 502, {"error": "UNAUTHORIZED_API", "message": "공공데이터 API 인증 또는 활용신청 상태를 확인해야 합니다.", "officialUrl": GOV_SITE}
        return 502, {"error": "UPSTREAM_ERROR", "message": "공공데이터 서버에서 오류가 발생했습니다.", "officialUrl": GOV_SITE}
    except (urllib.error.URLError, TimeoutError):
        return 504, {"error": "UPSTREAM_TIMEOUT", "message": "공공데이터 서버 연결이 지연되고 있습니다. 다시 시도하거나 공식 사이트를 이용해 주세요.", "officialUrl": GOV_SITE}
    except (ET.ParseError, ValueError):
        return 502, {"error": "INVALID_RESPONSE", "message": "공공데이터 응답을 해석하지 못했습니다. API 주소와 상세 명세를 확인해 주세요.", "officialUrl": GOV_SITE}


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        # Don't log API keys, which never enter a client request.
        sys.stderr.write("[%s] %s\n" % (self.log_date_time_string(), fmt % args))

    def json_response(self, status, obj):
        blob = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Content-Security-Policy", "default-src 'none'")
        self.send_header("Content-Length", str(len(blob)))
        self.end_headers()
        self.wfile.write(blob)

    def do_GET(self):
        parsed = urllib.parse.urlsplit(self.path)
        if parsed.path == "/api/health":
            return self.json_response(200, {"ok": True, "apiConfigured": bool(os.getenv("ELEVATOR_API_KEY") and os.getenv("ELEVATOR_API_URL"))})
        if parsed.path == "/api/elevator":
            params = urllib.parse.parse_qs(parsed.query)
            number = (params.get("number") or [""])[0]
            if not NUMBER_RE.fullmatch(number):
                return self.json_response(400, {"error": "BAD_NUMBER", "message": "승강기 고유번호 7자리를 정확히 입력해 주세요."})
            status, data = fetch_elevator(number)
            return self.json_response(status, data)
        if parsed.path in ("/", "/index.html"):
            name, kind = "index.html", "text/html; charset=utf-8"
        elif parsed.path in ("/styles.css", "/app.js"):
            name, kind = parsed.path[1:], "text/css; charset=utf-8" if parsed.path.endswith(".css") else "application/javascript; charset=utf-8"
        else:
            return self.json_response(404, {"error": "NOT_FOUND"})
        blob = (PUBLIC / name).read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", kind)
        self.send_header("Cache-Control", "public, max-age=300" if name != "index.html" else "no-cache")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Content-Security-Policy", "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; base-uri 'none'; form-action 'self'; object-src 'none'")
        self.send_header("Content-Length", str(len(blob)))
        self.end_headers()
        self.wfile.write(blob)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8000"))
    print(f"Elevator lookup server listening on 0.0.0.0:{port}", flush=True)
    ThreadingHTTPServer(("0.0.0.0", port), Handler).serve_forever()
