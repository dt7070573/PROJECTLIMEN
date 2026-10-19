import { cooperativeMissions } from '../data/cooperativeMissions.js'

const BOT_POOL = [
  { id: 'sim-m12', name: '기록원 M-12', rolePreference: 'observer' },
  { id: 'sim-raon', name: '의무담당 라온', rolePreference: 'medic' },
  { id: 'sim-baekya', name: '탐사자 백야', rolePreference: 'custodian' },
]

const hash = (value) => [...String(value)].reduce((total, char) => ((total * 31) + char.charCodeAt(0)) >>> 0, 2166136261)
const pick = (items, seed) => items[hash(seed) % items.length]
const interpolate = (text, values) => text.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? key)

export const getCooperativeMission = (id = 'coop-zone-001') => cooperativeMissions.find((mission) => mission.id === id)

export function createCooperativeLobby(character, missionId = 'coop-zone-001', now = Date.now(), options = {}) {
  const mission = getCooperativeMission(missionId)
  if (!mission) throw new Error('공동 임무 데이터를 찾을 수 없습니다.')
  if (!options.developerOverride && character.rank < mission.minRank) throw new Error(`공동 임무에는 사내 등급 ${mission.minRank}이 필요합니다.`)
  return {
    id: `lobby-${now}`,
    missionId,
    status: 'recruiting',
    createdAt: now,
    expiresAt: now + mission.queue.expiresAfterMinutes * 60_000,
    members: [{ id: character.id, name: character.name, isPlayer: true, roleId: mission.roles[0].id, ready: true }],
    policies: Object.fromEntries(mission.preMissionPolicies.map((policy) => [policy.id, policy.safeDefault])),
  }
}

export function selectCooperativeRole(lobby, characterId, roleId) {
  const mission = getCooperativeMission(lobby.missionId)
  if (!mission.roles.some((role) => role.id === roleId)) throw new Error('존재하지 않는 역할입니다.')
  if (lobby.members.some((member) => member.id !== characterId && member.roleId === roleId)) throw new Error('이미 배정된 역할입니다.')
  return { ...lobby, members: lobby.members.map((member) => member.id === characterId ? { ...member, roleId } : member) }
}

export function setCooperativePolicy(lobby, policyId, optionId) {
  const mission = getCooperativeMission(lobby.missionId)
  const policy = mission.preMissionPolicies.find((entry) => entry.id === policyId)
  if (!policy?.options.some((option) => option.id === optionId)) throw new Error('허용되지 않는 행동 방침입니다.')
  return { ...lobby, policies: { ...lobby.policies, [policyId]: optionId } }
}

export function fillLobbyWithSimulatedPlayers(lobby) {
  const mission = getCooperativeMission(lobby.missionId)
  const occupied = new Set(lobby.members.map((member) => member.roleId))
  const openRoles = mission.roles.filter((role) => !occupied.has(role.id))
  const needed = mission.queue.requiredPlayers - lobby.members.length
  const availableBots = BOT_POOL.filter((bot) => !lobby.members.some((member) => member.id === bot.id)).slice(0, needed)
  const members = [...lobby.members]
  availableBots.forEach((bot, index) => {
    const preferred = openRoles.find((role) => role.id === bot.rolePreference)
    const role = preferred ?? openRoles[index] ?? mission.roles.find((entry) => !members.some((member) => member.roleId === entry.id))
    members.push({ id: bot.id, name: bot.name, isPlayer: false, simulated: true, roleId: role.id, ready: true })
    openRoles.splice(openRoles.findIndex((entry) => entry.id === role.id), 1)
  })
  return { ...lobby, members }
}

function buildTimeline(mission, lobby, startedAt) {
  const durationMs = mission.durationMinutes * 60_000
  const roleNames = Object.fromEntries(lobby.members.map((member) => [member.roleId, member.name]))
  const values = {
    ...roleNames,
    actor: lobby.members[1]?.name,
    target: lobby.members[0]?.name,
    other: lobby.members[2]?.name,
    resource: '인지 안정제',
  }
  const required = Math.max(mission.timeline.minimumEntries, Math.ceil(mission.durationMinutes / 10))
  const entries = Array.from({ length: required }, (_, index) => {
    const progress = index / Math.max(1, required - 1)
    const stageIndex = progress < .16 ? 0 : progress < .44 ? 1 : progress < .78 ? 2 : 3
    const stage = mission.stages[stageIndex]
    const kinds = index === 0 ? ['entry'] : index === required - 1 ? ['exit'] : ['movement', 'observation', 'cooperation', 'hazard']
    const kind = pick(kinds, `${lobby.id}:kind:${index}`)
    const templates = mission.sharedLogTemplates[kind]
    const template = pick(templates, `${lobby.id}:text:${index}`)
    const occursAt = startedAt + Math.round(durationMs * progress)
    return { id: `${lobby.id}-log-${index}`, occursAt, stageId: stage.id, kind, audience: 'shared', text: interpolate(template, { ...values, time: '' }).trim() }
  })
  const personalIndexes = [5, 11, 17, 21]
  personalIndexes.forEach((at, index) => {
    if (!entries[at]) return
    const template = mission.personalLogTemplates[index % mission.personalLogTemplates.length]
    entries.splice(at + 1, 0, {
      id: `${lobby.id}-personal-${index}`,
      occursAt: entries[at].occursAt + 1,
      stageId: entries[at].stageId,
      kind: 'personal',
      audience: 'player',
      text: interpolate(template.text, { ...values, time: '' }).trim(),
    })
  })
  return entries.sort((a, b) => a.occursAt - b.occursAt)
}

export function launchCooperativeMission(lobby, now = Date.now()) {
  const mission = getCooperativeMission(lobby.missionId)
  if (lobby.members.length !== mission.queue.requiredPlayers) throw new Error(`정확히 ${mission.queue.requiredPlayers}명이 모여야 출발할 수 있습니다.`)
  if (new Set(lobby.members.map((member) => member.roleId)).size !== mission.roles.length) throw new Error('네 역할을 각각 한 명씩 배정해야 합니다.')
  const startedAt = now
  const decisions = [
    { id: 'decision-stabilizer', occursAt: startedAt + mission.durationMinutes * 60_000 * .48, title: '인지 안정제 배분', prompt: `${lobby.members[1].name}의 기억 오염 수치가 임계선을 넘었다. 안정제는 하나만 남았다.`, options: [
      { id: 'share', label: '안정제를 건넨다', result: '개인 물자를 사용해 동료를 안정시켰다.', effects: { trust: 8, debt: 10, physical: 0, mental: -2 } },
      { id: 'reserve', label: '귀환을 위해 보존한다', result: '안정제를 보존했다. 동료는 끝까지 그 판단을 기억했다.', effects: { trust: -6, friction: 9, physical: 0, mental: -5 } },
    ] },
    { id: 'decision-record', occursAt: startedAt + mission.durationMinutes * 60_000 * .68, title: '비공개 기록', prompt: '원본 필름에서 현재 대원 한 명의 호출명을 쓰는 제5대원을 발견했다.', options: [
      { id: 'share', label: '즉시 전원에게 공유한다', result: '불안을 감수하고 기록을 공개했다.', effects: { trust: 7, friction: 0, physical: 0, mental: -4 } },
      { id: 'verify', label: '검증 후 공유한다', result: '모순을 대조한 뒤 신뢰도와 함께 공유했다.', effects: { trust: 10, friction: 1, physical: 0, mental: -2 } },
      { id: 'withhold', label: '혼자 보관한다', result: '공유 시각의 공백이 사후 기록에 남았다.', effects: { trust: -10, friction: 12, physical: 0, mental: -1 } },
    ] },
    { id: 'decision-exit', occursAt: startedAt + mission.durationMinutes * 60_000 * .88, title: '퇴실문 선택', prompt: '안전한 네 번째 문은 필름을 버려야 한다. 다섯 번째 문은 필름을 보존하지만 명단 밖 신호가 응답한다.', options: [
      { id: 'safe', label: '필름을 버리고 전원 철수', result: '네 명 모두 네 번째 문을 통과했다.', effects: { trust: 4, friction: 0, physical: -2, mental: -2, cleanExit: true } },
      { id: 'risk', label: '필름을 지키고 위험 감수', result: '다섯 번째 문으로 필름을 회수했다. 무언가 함께 귀환 신호를 탔다.', effects: { trust: 2, friction: 4, physical: -7, mental: -9, originalFilm: true } },
    ] },
  ]
  return {
    id: `coop-run-${now}`,
    contentId: mission.id,
    type: 'exploration',
    cooperative: true,
    name: mission.name,
    code: mission.code,
    duration: mission.durationMinutes,
    risk: mission.risk,
    status: 'active',
    startedAt,
    completesAt: startedAt + mission.durationMinutes * 60_000,
    virtualNow: startedAt,
    members: lobby.members,
    policies: lobby.policies,
    experiences: buildTimeline(mission, lobby, startedAt),
    decisions,
    decisionResults: [],
  }
}

export const cooperativeNow = (run, realNow = Date.now()) => Math.max(realNow, run.virtualNow ?? run.startedAt)
export const visibleCooperativeExperiences = (run, realNow = Date.now()) => run.experiences.filter((entry) => entry.occursAt <= cooperativeNow(run, realNow))
export const pendingCooperativeDecision = (run, realNow = Date.now()) => run.decisions.find((decision) => decision.occursAt <= cooperativeNow(run, realNow) && !run.decisionResults.some((result) => result.decisionId === decision.id))

export function advanceCooperativeMission(run, mode = 'next') {
  const unresolved = run.decisions.filter((decision) => !run.decisionResults.some((result) => result.decisionId === decision.id))
  const futureTimes = [...run.experiences.map((entry) => entry.occursAt), ...unresolved.map((entry) => entry.occursAt), run.completesAt].filter((time) => time > cooperativeNow(run))
  const virtualNow = mode === 'complete' ? run.completesAt : Math.min(...futureTimes)
  return { ...run, virtualNow }
}

export function resolveCooperativeDecision(run, decisionId, optionId) {
  const decision = run.decisions.find((entry) => entry.id === decisionId)
  const option = decision?.options.find((entry) => entry.id === optionId)
  if (!decision || !option) throw new Error('선택 데이터를 찾을 수 없습니다.')
  if (run.decisionResults.some((entry) => entry.decisionId === decisionId)) return run
  const experience = { id: `${run.id}-${decisionId}-result`, occursAt: cooperativeNow(run) + 2, kind: option.effects.friction > 5 ? 'conflict' : 'cooperation', audience: 'shared', text: option.result }
  return { ...run, experiences: [...run.experiences, experience].sort((a, b) => a.occursAt - b.occursAt), decisionResults: [...run.decisionResults, { decisionId, optionId, ...option.effects }] }
}

export function completeCooperativeMission(run, character, relationships = {}, { developerOverride = false } = {}) {
  let resolved = run
  if (developerOverride) {
    for (const decision of run.decisions) {
      if (!resolved.decisionResults.some((entry) => entry.decisionId === decision.id)) {
        resolved = { ...resolved, virtualNow: Math.max(resolved.virtualNow, decision.occursAt) }
        resolved = resolveCooperativeDecision(resolved, decision.id, decision.options[0].id)
      }
    }
    resolved = advanceCooperativeMission(resolved, 'complete')
  }
  if (cooperativeNow(resolved) < resolved.completesAt) throw new Error('공동 임무가 아직 진행 중입니다.')
  if (resolved.decisionResults.length < resolved.decisions.length) throw new Error('미결정 사건이 남아 있습니다.')
  const totals = resolved.decisionResults.reduce((sum, entry) => ({ trust: sum.trust + (entry.trust ?? 0), debt: sum.debt + (entry.debt ?? 0), friction: sum.friction + (entry.friction ?? 0), physical: sum.physical + (entry.physical ?? 0), mental: sum.mental + (entry.mental ?? 0) }), { trust: 0, debt: 0, friction: 0, physical: 0, mental: 0 })
  const nextRelationships = { ...relationships }
  resolved.members.filter((member) => !member.isPlayer).forEach((member) => {
    const previous = nextRelationships[member.id] ?? { characterId: member.id, name: member.name, familiarity: 0, trust: 0, debt: 0, friction: 0, sharedMissions: 0, evidence: [] }
    nextRelationships[member.id] = {
      ...previous,
      familiarity: Math.min(100, previous.familiarity + 12),
      trust: Math.max(-100, Math.min(100, previous.trust + totals.trust)),
      debt: Math.max(-100, Math.min(100, previous.debt + totals.debt)),
      friction: Math.min(100, previous.friction + totals.friction),
      sharedMissions: previous.sharedMissions + 1,
      evidence: [{ missionId: resolved.id, at: Date.now(), summary: resolved.decisionResults.map((entry) => entry.decisionId), changes: totals }, ...previous.evidence].slice(0, 20),
    }
  })
  const originalFilm = resolved.decisionResults.some((entry) => entry.originalFilm)
  const gains = { xp: originalFilm ? 145 : 115, credits: originalFilm ? 220 : 160, items: originalFilm ? [{ itemId: 'original-observation-film', quantity: 1 }] : [], intel: ['네 사람은 서로를 순환 관찰해야 존재가 안정된다.'] }
  const report = { completedAt: Date.now(), outcome: 'success', headline: '4인 공동 임무 전원 귀환', lines: ['네 명이 동일한 사건 기록을 공유하고 제4관측소에서 귀환했다.', `중요 결정 ${resolved.decisionResults.length}건이 관계 기록에 반영됐다.`], gains, losses: { physical: Math.max(2, 7 - totals.physical), mental: Math.max(3, 9 - totals.mental), bodyPart: 'torso', bodyPartDamage: 4 }, factors: { cooperative: true, partySize: 4, developerOverride } }
  return { run: { ...resolved, status: 'completed', report }, relationships: nextRelationships, report }
}
