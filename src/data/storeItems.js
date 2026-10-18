export const storeItems = [
  { id: 'med-patch', name: '응급 봉합 패치', type: 'consumable', slot: null, price: 45, minRank: 1, description: '신체 기능을 12 회복한다.', effects: { physical: 12 } },
  { id: 'calm-dose', name: '인지 안정제', type: 'consumable', slot: null, price: 55, minRank: 1, description: '정신 안정을 12 회복한다.', effects: { mental: 12 } },
  { id: 'wake-ration', name: '각성 배급식', type: 'consumable', slot: null, price: 40, minRank: 1, description: '피로를 15 낮춘다.', effects: { fatigue: -15 } },
  { id: 'filter-mask', name: '밀폐형 여과 마스크', type: 'equipment', slot: 'protection', price: 160, minRank: 2, description: '정보·포자 계열 노출에 대비하는 기본 보호구.', effects: { anomalyGuard: 1 } },
  { id: 'field-vest', name: '경량 현장 조끼', type: 'equipment', slot: 'body', price: 190, minRank: 3, description: '기동성을 해치지 않고 물리 피해를 줄인다.', effects: { physicalGuard: 1 } },
  { id: 'record-kit', name: '봉인 기록 키트', type: 'equipment', slot: 'tool', price: 210, minRank: 3, description: '단서 회수와 개체 관리 판정에 도움을 준다.', effects: { analysis: 1 } },
  { id: 'anchor-tag', name: '현실 고정 표찰', type: 'equipment', slot: 'tool', price: 340, minRank: 6, description: '공간·시간 변칙에서 귀환 기준점을 유지한다.', effects: { anomalyGuard: 2 } },
  { id: 'trauma-plate', name: '충격 분산 흉갑', type: 'equipment', slot: 'body', price: 420, minRank: 8, description: '고위험 임무의 물리 손실을 완화한다.', effects: { physicalGuard: 2, agility: -1 } },
  { id: 'cognition-visor', name: '인지 차단 바이저', type: 'equipment', slot: 'protection', price: 460, minRank: 9, description: '시각·언어 오염과 정신 손실을 완화한다.', effects: { mentalGuard: 2 } },
  { id: 'signal-beacon', name: '청록 귀환 신호기', type: 'equipment', slot: 'tool', price: 520, minRank: 12, description: '단계형 탐사에서 부분 실패 확률을 줄인다.', effects: { exploration: 2 } },
  { id: 'containment-rig', name: '격리 절차 보조기', type: 'equipment', slot: 'tool', price: 520, minRank: 12, description: '격리 개체 관리 절차 판정을 보조한다.', effects: { containment: 2 } },
  { id: 'memory-seal', name: '기억 봉인 캡슐', type: 'consumable', slot: null, price: 180, minRank: 7, description: '정보 오염을 10 낮춘다.', effects: { informationContamination: -10 } },
  { id: 'gift-tea', name: '배급 외 홍차', type: 'gift', slot: null, price: 75, minRank: 2, description: '다른 실험체에게 전달할 수 있는 소형 선물.', effects: { rapport: 1 } },
  { id: 'gift-token', name: '황동 행운패', type: 'gift', slot: null, price: 130, minRank: 5, description: '작업반 동료에게 보내는 기념품.', effects: { rapport: 2 } },
  { id: 'cosmetic-frame', name: '청록 인식표 프레임', type: 'cosmetic', slot: 'frame', price: 240, minRank: 4, description: '프로필 사진 둘레에 청록색 인가 프레임을 표시한다.', effects: {} },
  { id: 'cosmetic-red', name: '적색 경계 인식표', type: 'cosmetic', slot: 'frame', price: 390, minRank: 10, description: '고위험 담당자를 위한 적색 인가 프레임.', effects: {} },
]

export const getStoreItem = (id) => storeItems.find((item) => item.id === id)
