const entityModules = import.meta.glob('../entities.js', { eager: true })
const zoneModules = import.meta.glob('../zones.js', { eager: true })
const titleModules = import.meta.glob('../titles.js', { eager: true })

const fallbackEntities = [
  {
    id: 'entity-echo', code: 'CT-014', name: '잔향 저장체', risk: 2, minRank: 1,
    party: { min: 1, recommended: 1, max: 2 }, durations: [30, 60, 120],
    summary: '주기적인 음성 기록과 격리실 공명 수치를 대조한다.',
    primaryRule: '대상 음성을 직접 재생하지 않는다.', requirements: ['기록 1'],
    hazards: ['인지 피로', '정보 오염'], rewards: { credits: 45, xp: 30 }, intel: ['무음 구간을 우선 기록'],
  },
  {
    id: 'entity-moss', code: 'CT-031', name: '청록 균사군', risk: 3, minRank: 2,
    party: { min: 1, recommended: 2, max: 3 }, durations: [60, 120, 180],
    summary: '격리 온도와 배양 경계를 유지하며 표본 변화를 관찰한다.',
    primaryRule: '습도 조절 중 조명을 끄지 않는다.', requirements: ['관리 2'],
    hazards: ['생체 오염', '피로'], rewards: { credits: 75, xp: 55 }, intel: ['섭씨 17도에서 활동 둔화'],
  },
]

const fallbackZones = [
  {
    id: 'zone-service', code: 'EX-B02', name: '폐쇄 정비층', risk: 2, minRank: 1,
    party: { min: 1, recommended: 2, max: 4 }, durations: [30, 60, 120],
    summary: '정전된 정비층에서 전력 기록과 회수 가능 자재를 탐색한다.',
    primaryRule: '붉은 유도등을 따라가지 않는다.', requirements: ['탐사 1'],
    hazards: ['낙상', '방향 감각 상실'], rewards: { credits: 55, xp: 40 }, intel: ['청록 표식은 귀환 경로'],
    stages: [{ id: 'entry', name: '진입구' }, { id: 'grid', name: '전력 격자' }, { id: 'archive', name: '기록 보관실' }],
  },
  {
    id: 'zone-loop', code: 'EX-C07', name: '순환 복도', risk: 4, minRank: 3,
    party: { min: 2, recommended: 3, max: 5 }, durations: [60, 120, 180],
    summary: '구조가 반복되는 복도를 측량하고 현실 고정 장치를 설치한다.',
    primaryRule: '같은 문을 세 번 통과하지 않는다.', requirements: ['탐사 2', '분석 5'],
    hazards: ['시간 불일치', '기억 누락'], rewards: { credits: 110, xp: 85 }, intel: ['시계보다 호흡 횟수가 정확함'],
    stages: [{ id: 'threshold', name: '경계' }, { id: 'loop', name: '반복 구간' }, { id: 'anchor', name: '고정점' }],
  },
]

const entityModule = entityModules['../entities.js']
const zoneModule = zoneModules['../zones.js']
const titleModule = titleModules['../titles.js']

export const containmentEntities = entityModule?.containmentEntities?.length
  ? entityModule.containmentEntities
  : fallbackEntities

export const explorationZones = zoneModule?.explorationZones?.length
  ? zoneModule.explorationZones
  : fallbackZones

export const titles = titleModule?.titles?.length
  ? titleModule.titles
  : [
      { id: 'new-assignee', name: '신규 배속자', requirement: { type: 'default' } },
      { id: 'threshold-crosser', name: '경계 통과자', requirement: { type: 'missions', count: 1 } },
      { id: 'safe-returner', name: '무사 귀환자', requirement: { type: 'missions', count: 3 } },
    ]

export const contentSource = {
  entities: entityModule ? 'external' : 'fallback',
  zones: zoneModule ? 'external' : 'fallback',
  titles: titleModule ? 'external' : 'fallback',
}

export function normalizeMissionContent(item, type) {
  const list = (value, formatter) => Array.isArray(value)
    ? value
    : Object.entries(value ?? {}).map(([key, amount]) => formatter(key, amount))
  const requirementLabels = { physical: '신체', mental: '정신', anomaly: '이상 저항' }
  return {
    ...item,
    type,
    party: item.party ?? { min: 1, recommended: 1, max: 1 },
    durations: item.durations?.filter((duration) => [30, 60, 120, 180].includes(duration)) ?? [30],
    requirements: list(item.requirements, (key, amount) => `${requirementLabels[key] ?? key} ${amount}`),
    hazards: list(item.hazards, (key, amount) => `${key} ${amount}`),
    intel: list(item.intel, (key, amount) => `${key} ${amount}`),
    rewards: item.rewards ?? { credits: 30, xp: 25 },
    stages: (item.stages ?? []).map((stage, index) => typeof stage === 'string'
      ? { id: `${item.id}-stage-${index + 1}`, name: stage }
      : stage),
  }
}

export const missionCatalog = [
  ...containmentEntities.map((item) => normalizeMissionContent(item, 'containment')),
  ...explorationZones.map((item) => normalizeMissionContent(item, 'exploration')),
]
