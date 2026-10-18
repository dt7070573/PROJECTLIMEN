import { titles } from '../data/contracts/contentAdapter.js'

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

function seededFraction(seed) {
  const value = Math.sin(seed) * 10000
  return value - Math.floor(value)
}

export function startMission({ content, duration, character, now = Date.now() }) {
  if (!content.durations.includes(duration)) throw new Error('지원하지 않는 임무 시간입니다.')
  if (character.rank < content.minRank) throw new Error('사내 등급이 부족합니다.')
  return {
    id: `mission-${now}`,
    contentId: content.id,
    type: content.type,
    name: content.name,
    code: content.code,
    duration,
    startedAt: now,
    completesAt: now + duration * 60 * 1000,
    status: 'active',
    risk: content.risk,
    rewards: content.rewards,
    hazards: content.hazards,
    report: null,
  }
}

export function missionProgress(mission, now = Date.now()) {
  const total = mission.completesAt - mission.startedAt
  return clamp((now - mission.startedAt) / total, 0, 1)
}

export function canCompleteMission(mission, now = Date.now()) {
  return mission.status === 'active' && now >= mission.completesAt
}

export function completeMission(mission, character, now = Date.now()) {
  if (!canCompleteMission(mission, now)) throw new Error('임무가 아직 진행 중입니다.')
  const roll = seededFraction(mission.startedAt + mission.duration + character.stats.will)
  const statPower = mission.type === 'containment'
    ? character.stats.analysis + character.skills.containment
    : character.stats.perception + character.skills.exploration
  const success = roll + statPower / 25 >= mission.risk / 8
  const xp = Math.round((mission.rewards?.xp ?? 25) * (success ? 1 : 0.55))
  const credits = Math.round((mission.rewards?.credits ?? 30) * (success ? 1 : 0.35))
  const physicalLoss = success ? mission.risk * 2 : mission.risk * 5
  const mentalLoss = success ? mission.risk : mission.risk * 4
  const report = {
    completedAt: now,
    outcome: success ? 'success' : 'partial',
    headline: success ? '임무 목표 달성' : '비상 철수 · 부분 성과',
    lines: success
      ? [`${mission.name}의 핵심 절차를 완료했습니다.`, '회수 자료가 기록국으로 이관되었습니다.']
      : [`${mission.name}에서 위험 징후를 확인하고 철수했습니다.`, '사전 안전 규약으로 치명 피해를 회피했습니다.'],
    gains: { xp, credits },
    losses: { physical: physicalLoss, mental: mentalLoss },
  }
  return { ...mission, status: 'completed', report }
}

export function applyMissionReport(character, mission) {
  const { gains, losses, outcome } = mission.report
  let xp = character.xp + gains.xp
  let level = character.level
  while (xp >= level * 100) {
    xp -= level * 100
    level += 1
  }
  const completedCount = character.missionHistory.length + 1
  const progress = {
    ...(character.progress ?? {}),
    missionsCompleted: completedCount,
    containmentCompleted: (character.progress?.containmentCompleted ?? 0) + (mission.type === 'containment' ? 1 : 0),
    explorationCompleted: (character.progress?.explorationCompleted ?? 0) + (mission.type === 'exploration' ? 1 : 0),
    longMissionCompleted: (character.progress?.longMissionCompleted ?? 0) + (mission.duration === 180 ? 1 : 0),
    intel: (character.progress?.intel ?? 0) + (mission.rewards?.intel ?? 0),
  }
  const unlockedTitles = titles
    .filter((entry) => entry.condition?.type === 'always' || Number(progress[entry.condition?.type] ?? 0) >= Number(entry.condition?.value ?? Infinity))
    .map((entry) => entry.name)
  if (!unlockedTitles.length) unlockedTitles.push(...character.unlockedTitles)
  return {
    ...character,
    level,
    xp,
    credits: character.credits + gains.credits,
    title: unlockedTitles.at(-1),
    unlockedTitles,
    progress,
    rank: Math.min(45, 1 + Math.floor(completedCount / 2)),
    skills: {
      ...character.skills,
      [mission.type]: character.skills[mission.type] + (outcome === 'success' ? 1 : 0),
    },
    condition: {
      ...character.condition,
      physical: clamp(character.condition.physical - losses.physical, 0, 100),
      mental: clamp(character.condition.mental - losses.mental, 0, 100),
      fatigue: clamp(character.condition.fatigue + mission.duration / 6, 0, 100),
      effects: outcome === 'partial'
        ? [...character.condition.effects, { id: `${mission.id}-stress`, name: '임무 후 스트레스', severity: mission.risk }]
        : character.condition.effects,
    },
    missionHistory: [mission.id, ...character.missionHistory].slice(0, 20),
  }
}
