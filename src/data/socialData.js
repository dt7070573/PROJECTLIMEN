export const crewSeed = {
  id: 'crew-07',
  name: '제7 작업반 · 문턱지기',
  motto: '먼저 돌아온 자가 다음 사람의 길을 남긴다.',
  members: [
    { id: 'npc-archive', name: '기록원 M-12', status: '기록 분석 중', contribution: 184 },
    { id: 'npc-medic', name: '의무담당 라온', status: '회복실 대기', contribution: 151 },
    { id: 'npc-scout', name: '탐사자 백야', status: 'RIFT-56 투입', contribution: 137 },
  ],
  weeklyGoal: { name: '안전 귀환 경로 12건 검증', current: 7, target: 12, reward: '작업반 배급 150 CR' },
  notices: [
    { id: 'notice-1', author: '기록원 M-12', text: '백색 타일 평원에서 형광등 점멸 횟수를 반드시 기록하십시오.', time: '08:40' },
    { id: 'notice-2', author: '의무담당 라온', text: '정보 오염 30 이상 인원은 단독 탐사를 피하십시오.', time: '07:15' },
  ],
}

export const messageTemplates = {
  subject: ['이 구역은', '이 개체는', '다음 단계는', '귀환 경로는'],
  observation: ['소리에 반응한다', '빛을 피한다', '시간에 따라 변한다', '인원 수를 감지한다', '기록과 다르게 행동한다'],
  advice: ['천천히 접근하라', '직접 바라보지 마라', '표식을 따라가라', '장비를 확인하라', '즉시 철수하라'],
  certainty: ['확인됨', '높은 가능성', '추가 검증 필요'],
}
