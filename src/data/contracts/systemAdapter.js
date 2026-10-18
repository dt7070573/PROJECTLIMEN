const storeModules = import.meta.glob('../storeItems.js', { eager: true })
const socialModules = import.meta.glob('../socialData.js', { eager: true })

const fallbackStoreItems = [
  { id: 'med-gel', name: '응급 재생 젤', type: 'consumable', slot: null, price: 45, minRank: 1, description: '신체 기능을 15 회복한다.', effects: { physical: 15 } },
  { id: 'focus-ampoule', name: '인지 안정 앰풀', type: 'consumable', slot: null, price: 50, minRank: 1, description: '정신 안정을 15 회복한다.', effects: { mental: 15 } },
  { id: 'field-vest', name: '경량 현장 조끼', type: 'equipment', slot: 'body', price: 90, minRank: 1, description: '현장용 기본 방호 장비.', effects: { physicalGuard: 1 } },
  { id: 'signal-reader', name: '휴대 신호 판독기', type: 'equipment', slot: 'tool', price: 110, minRank: 2, description: '공간 신호를 판독하는 도구.', effects: { perception: 1 } },
]

const fallbackCrew = {
  id: 'crew-limen-7', name: '제7 경계 작업반', notice: '임무 전 철수 조건과 확보 정보를 반드시 공유하십시오.',
  members: [{ id: 'member-1', name: '기록원 한', role: '기록' }, { id: 'member-2', name: '의무관 윤', role: '의료' }],
  goal: { id: 'goal-intel', name: '주간 경계 정보 정리', current: 24, target: 100 },
}
const fallbackTemplates = [
  { id: 'safe-route', label: '안전 경로', text: '[구역]의 [표식]을 따라 이동하십시오.' },
  { id: 'hazard-seen', label: '위험 발견', text: '[구역]에서 [위험]을 확인했습니다.' },
  { id: 'supply-needed', label: '물자 요청', text: '[임무]에 [물자] 지원이 필요합니다.' },
]

const storeModule = storeModules['../storeItems.js']
const socialModule = socialModules['../socialData.js']

export const storeItems = (storeModule?.storeItems?.length ? storeModule.storeItems : fallbackStoreItems)
  .map((item) => ({ ...item, type: item.type ?? 'consumable', slot: item.slot ?? null, effects: item.effects ?? {} }))
const rawCrew = socialModule?.crewSeed ?? fallbackCrew
export const crewSeed = {
  ...rawCrew,
  notice: rawCrew.notice ?? rawCrew.notices?.[0]?.text ?? rawCrew.motto ?? '',
  members: (rawCrew.members ?? []).map((member) => ({ ...member, role: member.role ?? member.status ?? '작업반원' })),
  goal: rawCrew.goal ?? rawCrew.weeklyGoal ?? fallbackCrew.goal,
}
const rawTemplates = socialModule?.messageTemplates
export const messageTemplates = Array.isArray(rawTemplates) && rawTemplates.length
  ? rawTemplates
  : rawTemplates?.subject?.length
    ? rawTemplates.subject.flatMap((subject, index) => [{ id: `structured-${index}`, label: subject, text: `${subject} ${rawTemplates.observation[index % rawTemplates.observation.length]}. ${rawTemplates.advice[index % rawTemplates.advice.length]}. (${rawTemplates.certainty[index % rawTemplates.certainty.length]})` }])
    : fallbackTemplates

export const systemContentSource = { store: storeModule ? 'external' : 'fallback', social: socialModule ? 'external' : 'fallback' }
