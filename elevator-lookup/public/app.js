'use strict';
const form = document.querySelector('#lookup-form');
const input = document.querySelector('#number');
const counter = document.querySelector('#char-count');
const button = document.querySelector('#search-button');
const statusArea = document.querySelector('#status');
const resultSection = document.querySelector('#result-section');
const resultList = document.querySelector('#result-list');
const copyResult = document.querySelector('#copy-result-number');
const officialUrl = 'https://www.elevator.go.kr/opn/info/ComElvtrNumAddrNewL01.do';
let lastNumber = '';
const fields = [
  ['number', '승강기 고유번호'], ['address', '설치 주소'], ['unit', '호기'],
  ['category', '승강기 종류'], ['type', '승강기 형식'], ['status', '운행 상태'],
  ['manufacturer', '제조업체'], ['installed', '설치일'], ['weight', '적재하중'],
  ['capacity', '정원'], ['travel', '운행층수·구간'], ['inspectionResult', '최근 검사 결과'],
  ['inspectionFrom', '검사유효기간 시작'], ['inspectionTo', '검사유효기간 종료']
];
function create(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined && text !== null) el.textContent = String(text);
  return el;
}
function showStatus(title, message, error = false, showOfficial = true) {
  statusArea.replaceChildren();
  statusArea.className = 'status' + (error ? ' error' : '');
  statusArea.append(create('strong', '', title), create('div', '', message));
  if (showOfficial) {
    const actions = create('div', 'status-actions');
    const official = create('a', '', '국가승강기정보센터에서 조회 ↗');
    official.href = officialUrl;
    official.target = '_blank';
    official.rel = 'noopener noreferrer';
    const copy = create('button', 'copy-link', '고유번호 복사');
    copy.type = 'button';
    copy.addEventListener('click', () => copyNumber(lastNumber, copy));
    actions.append(official, copy);
    statusArea.append(actions);
  }
}
async function copyNumber(number, target) {
  if (!number) return;
  try {
    await navigator.clipboard.writeText(number);
    const old = target.textContent;
    target.textContent = '복사 완료 ✓';
    setTimeout(() => { target.textContent = old; }, 1800);
  } catch {
    showStatus('번호 복사 실패', '브라우저에서 클립보드 복사가 허용되지 않았습니다. 번호를 직접 선택해 복사해 주세요.', true, false);
  }
}
function renderResults(items) {
  resultList.replaceChildren();
  items.forEach((item) => {
    const card = create('article', 'result-card');
    const banner = create('div', 'result-banner');
    const textWrap = create('div');
    textWrap.append(create('h3', '', item.building || '건물명 미제공'), create('p', '', `승강기 번호 ${item.number || lastNumber}`));
    banner.append(textWrap, create('span', 'result-tag', item.status || '공식 조회 결과'));
    const grid = create('div', 'result-grid');
    for (const [key, label] of fields) {
      const cell = create('div', 'field');
      cell.append(create('span', '', label), create('strong', '', item[key] || '정보 없음'));
      grid.append(cell);
    }
    card.append(banner, grid);
    resultList.append(card);
  });
  resultSection.classList.remove('hidden');
  resultSection.scrollIntoView({behavior: 'smooth', block: 'start'});
}
input.addEventListener('input', () => {
  const digits = input.value.replace(/\D/g, '').slice(0, 7);
  if (input.value !== digits) input.value = digits;
  counter.textContent = `${digits.length} / 7`;
  input.removeAttribute('aria-invalid');
});
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const number = input.value.trim();
  lastNumber = number;
  resultSection.classList.add('hidden');
  statusArea.classList.add('hidden');
  if (!/^[0-9]{7}$/.test(number)) {
    input.setAttribute('aria-invalid', 'true');
    showStatus('번호를 확인해 주세요', '승강기 고유번호는 7자리 숫자입니다.', true, false);
    input.focus();
    return;
  }
  button.disabled = true;
  button.textContent = '조회 중…';
  try {
    const response = await fetch(`/api/elevator?number=${encodeURIComponent(number)}`, {headers: {'Accept':'application/json'}});
    const data = await response.json();
    if (!response.ok) {
      if (data.error === 'NOT_CONFIGURED') {
        showStatus('공공데이터 연동 준비 중', '현재 검색 사이트의 API 인증키가 등록되지 않았습니다. 아래 공식 조회 버튼을 눌러 고유번호로 검색해 주세요. 인증키가 등록되면 이 화면에서 상세 정보가 표시됩니다.', false, true);
      } else {
        showStatus('조회 결과를 표시하지 못했습니다', data.message || '일시적인 오류가 발생했습니다.', true, true);
      }
      return;
    }
    if (!Array.isArray(data.items) || data.items.length === 0) {
      showStatus('조회된 정보 없음', '공식 사이트에서 번호를 다시 확인해 주세요.', true, true);
      return;
    }
    statusArea.classList.add('hidden');
    renderResults(data.items);
  } catch {
    showStatus('서버와 연결할 수 없습니다', '인터넷 연결을 확인하거나 공식 정보센터에서 직접 조회해 주세요.', true, true);
  } finally {
    button.disabled = false;
    button.replaceChildren('조회하기 ', create('span', '', '→'));
  }
});
copyResult.addEventListener('click', () => copyNumber(lastNumber, copyResult));
const params = new URLSearchParams(location.search);
const fromUrl = params.get('number');
if (fromUrl && /^[0-9]{7}$/.test(fromUrl)) {
  input.value = fromUrl;
  counter.textContent = '7 / 7';
}
