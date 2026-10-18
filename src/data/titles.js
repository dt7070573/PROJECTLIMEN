export const titles = [
  { id: 'title-new', name: '신규 배정자', description: '리멘 연구소에 첫 발을 들였다.', tone: 'neutral', condition: { type: 'always', value: 0 } },
  { id: 'title-first-return', name: '첫 귀환자', description: '첫 임무에서 생환했다.', tone: 'teal', condition: { type: 'missionsCompleted', value: 1 } },
  { id: 'title-field-hand', name: '현장 요원', description: '임무를 5회 완료했다.', tone: 'teal', condition: { type: 'missionsCompleted', value: 5 } },
  { id: 'title-veteran', name: '경계 너머의 생존자', description: '임무를 20회 완료했다.', tone: 'gold', condition: { type: 'missionsCompleted', value: 20 } },
  { id: 'title-caretaker', name: '침착한 관리인', description: '개체 관리 임무를 5회 완료했다.', tone: 'teal', condition: { type: 'containmentCompleted', value: 5 } },
  { id: 'title-explorer', name: '문턱을 넘는 자', description: '공간 탐사 임무를 5회 완료했다.', tone: 'teal', condition: { type: 'explorationCompleted', value: 5 } },
  { id: 'title-deep', name: '심층 답사자', description: '3시간 탐사를 마치고 귀환했다.', tone: 'gold', condition: { type: 'longMissionCompleted', value: 1 } },
  { id: 'title-clean', name: '무결점 절차', description: '상처 없이 임무를 완료했다.', tone: 'teal', condition: { type: 'perfectMissions', value: 1 } },
  { id: 'title-analyst', name: '기록 해독자', description: '정보 단서를 10개 확보했다.', tone: 'teal', condition: { type: 'intel', value: 10 } },
  { id: 'title-archive', name: '금지 문서 열람자', description: '정보 단서를 40개 확보했다.', tone: 'violet', condition: { type: 'intel', value: 40 } },
  { id: 'title-scarred', name: '흉터의 증언', description: '중상을 입고도 귀환했다.', tone: 'red', condition: { type: 'criticalReturns', value: 1 } },
  { id: 'title-unbroken', name: '붕괴하지 않는 자', description: '정신 안정도 20 이하에서 귀환했다.', tone: 'red', condition: { type: 'lowMindReturns', value: 1 } },
  { id: 'title-anomaly', name: '오염된 관찰자', description: '이상 오염을 안고 임무를 완료했다.', tone: 'violet', condition: { type: 'anomalousReturns', value: 1 } },
  { id: 'title-rank-five', name: '승인 등급 5', description: '사내 5등급에 도달했다.', tone: 'teal', condition: { type: 'rank', value: 5 } },
  { id: 'title-rank-ten', name: '내부 인가자', description: '사내 10등급에 도달했다.', tone: 'gold', condition: { type: 'rank', value: 10 } },
  { id: 'title-rank-twenty', name: '상층 접근자', description: '사내 20등급에 도달했다.', tone: 'gold', condition: { type: 'rank', value: 20 } },
  { id: 'title-rich', name: '배급 우선권자', description: '크레딧 1,000을 보유했다.', tone: 'gold', condition: { type: 'credits', value: 1000 } },
  { id: 'title-equipped', name: '완전 무장', description: '장비 슬롯을 모두 채웠다.', tone: 'teal', condition: { type: 'equippedSlots', value: 3 } },
  { id: 'title-recovered', name: '회복실 단골', description: '치료를 5회 완료했다.', tone: 'neutral', condition: { type: 'treatments', value: 5 } },
  { id: 'title-helper', name: '구조 신호 응답자', description: '다른 실험체의 구조 요청에 응답했다.', tone: 'teal', condition: { type: 'rescues', value: 1 } },
  { id: 'title-trader', name: '배급망 중개인', description: '거래를 5회 성사시켰다.', tone: 'gold', condition: { type: 'trades', value: 5 } },
  { id: 'title-team', name: '작업반의 손', description: '작업반 공동 목표에 기여했다.', tone: 'teal', condition: { type: 'crewContributions', value: 1 } },
  { id: 'title-secret', name: '문턱이 기억한 이름', description: '특수 조건을 충족했다.', tone: 'violet', secret: true, condition: { type: 'secret', value: 1 } },
  { id: 'title-successor', name: '기억 계승자', description: '이전 실험체의 기록을 이어받았다.', tone: 'red', condition: { type: 'legacyCount', value: 1 } },
]

export const getTitleById = (id) => titles.find((title) => title.id === id)

export const isTitleUnlocked = (title, progress = {}) => {
  if (title.condition.type === 'always') return true
  return Number(progress[title.condition.type] ?? 0) >= title.condition.value
}
