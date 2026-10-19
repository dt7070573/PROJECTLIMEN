import { titles } from '../data/contracts/contentAdapter.js'
import { generateMissionExperiences } from './experience.js'

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

function seededFraction(seed) {
  const value = Math.sin(seed) * 10000
  return value - Math.floor(value)
}

const APPROACHES = {
  cautious: { success: 0.08, reward: 0.85, damage: 0.65, label: '안전 우선' },
  standard: { success: 0, reward: 1, damage: 1, label: '표준 절차' },
  assertive: { success: -0.05, reward: 1.25, damage: 1.3, label: '성과 우선' },
}

export function startMission({ content, duration, character, options = {}, now = Date.now() }) {
  if (!content.durations.includes(duration)) throw new Error('지원하지 않는 임무 시간입니다.')
  if (character.rank < content.minRank) throw new Error('사내 등급이 부족합니다.')
  const partySize = Number(options.partySize ?? content.party?.recommended ?? 1)
  if (partySize < (content.party?.min ?? 1) || partySize > (content.party?.max ?? 1)) throw new Error('허용되지 않는 임무 편성입니다.')
  const experiences = generateMissionExperiences(content, duration, now, `${content.id}:${now}:${character.id}`)
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
    intel: content.intel,
    requirements: content.requirementScores ?? {},
    experiences,
    options: {
      approach: options.approach ?? 'standard',
      retreatThreshold: Number(options.retreatThreshold ?? 50),
      appliedIntel: (options.appliedIntel ?? []).filter((clue) => content.intel.includes(clue)),
      autoSupply: Boolean(options.autoSupply),
      equipmentPower: Number(options.equipmentPower ?? 0),
      partySize,
      recommendedParty: content.party?.recommended ?? 1,
      supply: options.supply ?? null,
    },
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
  const approach = APPROACHES[mission.options?.approach] ?? APPROACHES.standard
  const roll = seededFraction(mission.startedAt + mission.duration + character.stats.will)
  const coreStat = mission.type === 'containment' ? character.stats.analysis : character.stats.perception
  const skill = character.skills[mission.type] ?? 0
  const requirementAverage = Object.values(mission.requirements ?? {}).reduce((sum, value) => sum + Number(value), 0) / Math.max(1, Object.keys(mission.requirements ?? {}).length)
  const partyDelta = Number(mission.options?.partySize ?? 1) - Number(mission.options?.recommendedParty ?? 1)
  const partyBonus = clamp(partyDelta * 0.045, -0.16, 0.14)
  const readiness = (coreStat + skill + Number(mission.options?.equipmentPower ?? 0) - requirementAverage) / 24
  const knownIntel = mission.options?.appliedIntel?.length ?? 0
  const intelBonus = Math.min(0.42, knownIntel * 0.24)
  const conditionPenalty = ((100 - character.condition.physical) + (100 - character.condition.mental) + character.condition.fatigue) / 650
  const successScore = roll + readiness + intelBonus + partyBonus + approach.success - conditionPenalty
  const target = 0.36 + mission.risk * 0.085
  const success = successScore >= target
  const durationScale = 0.75 + mission.duration / 240
  const xp = Math.round((mission.rewards?.xp ?? 25) * durationScale * approach.reward * (success ? 1 : 0.55))
  const credits = Math.round((mission.rewards?.credits ?? 30) * durationScale * approach.reward * (success ? 1 : 0.35))
  const supplyProtection = Math.min(0.2, Number(mission.options?.supply?.protection ?? 0) * 0.08)
  const intelProtection = Math.max(0.35, 1 - knownIntel * 0.2 - supplyProtection)
  const physicalLoss = Math.round((success ? mission.risk * 2 : mission.risk * 5) * approach.damage * intelProtection)
  const mentalLoss = Math.round((success ? mission.risk : mission.risk * 4) * approach.damage * intelProtection)
  const safetyTriggered = character.condition.physical - physicalLoss <= (mission.options?.retreatThreshold ?? 50)
  const finalOutcome = safetyTriggered && !success ? 'safe-withdrawal' : success ? 'success' : 'partial'
  const bodyPartIds = ['head', 'torso', 'leftArm', 'rightArm', 'leftLeg', 'rightLeg']
  const damagedPart = bodyPartIds[Math.floor(seededFraction(mission.startedAt + mission.risk * 31) * bodyPartIds.length)]
  const report = {
    completedAt: now,
    outcome: finalOutcome,
    headline: success ? '임무 목표 달성' : safetyTriggered ? '안전 철수 규약 발동' : '비상 철수 · 부분 성과',
    lines: [
      success ? `${mission.name}의 핵심 절차를 완료했습니다.` : `${mission.name}에서 위험 징후를 확인하고 철수했습니다.`,
      knownIntel ? `확보 단서 ${knownIntel}건이 판정에 크게 기여했습니다.` : '검증된 사전 단서 없이 현장 판단으로 진행했습니다.',
      `${approach.label} 방침과 신체 ${mission.options?.retreatThreshold ?? 50}% 철수 기준을 적용했습니다.`,
      `${mission.options?.partySize ?? 1}인 비동기 편성${mission.options?.supply ? `과 ${mission.options.supply.name} 자동 소비` : ''}으로 수행했습니다.`,
    ],
    factors: { successScore: Number(successScore.toFixed(2)), target: Number(target.toFixed(2)), knownIntel, partySize: mission.options?.partySize ?? 1, partyBonus: Number(partyBonus.toFixed(2)), approach: mission.options?.approach ?? 'standard' },
    gains: { xp, credits },
    losses: { physical: physicalLoss, mental: mentalLoss, bodyPart: damagedPart, bodyPartDamage: Math.max(1, physicalLoss * 2) },
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
  const bodyParts = { ...(character.condition.bodyParts ?? {}) }
  const partId = losses.bodyPart
  if (partId && bodyParts[partId]) {
    const integrity = clamp(bodyParts[partId].integrity - losses.bodyPartDamage, 0, 100)
    bodyParts[partId] = { ...bodyParts[partId], integrity, injury: integrity < 25 ? '중증 기능 손상' : integrity < 55 ? '골절·심부 손상' : integrity < 85 ? '타박·열상' : null, permanent: bodyParts[partId].permanent || integrity <= 10 }
  }
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
      bodyParts,
      effects: outcome === 'partial'
        ? [...character.condition.effects, { id: `${mission.id}-stress`, name: '임무 후 스트레스', severity: mission.risk }]
        : character.condition.effects,
    },
    missionHistory: [mission.id, ...character.missionHistory].slice(0, 20),
  }
}
