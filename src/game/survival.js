const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

export const RESCUE_COST = 80

export function markCritical(character, mission) {
  if (!character?.alive || character.condition.physical > 0 || character.criticalState) return character
  return {
    ...character,
    criticalState: {
      status: 'critical',
      enteredAt: mission?.report?.completedAt ?? Date.now(),
      cause: mission?.name ?? '원인 불명의 현장 사고',
      bodyPart: mission?.report?.losses?.bodyPart ?? 'torso',
    },
  }
}

export function rescueCharacter(character) {
  if (character?.criticalState?.status !== 'critical') throw new Error('구조 대상 상태가 아닙니다.')
  const partId = character.criticalState.bodyPart
  const bodyParts = { ...character.condition.bodyParts }
  if (bodyParts[partId]) {
    bodyParts[partId] = {
      ...bodyParts[partId],
      integrity: Math.max(25, bodyParts[partId].integrity),
      injury: '구조 후 영구 기능 손상',
      permanent: true,
    }
  }
  return {
    ...character,
    credits: Math.max(0, character.credits - RESCUE_COST),
    progress: { ...character.progress, rescues: (character.progress?.rescues ?? 0) + 1 },
    condition: {
      ...character.condition,
      physical: 30,
      mental: clamp(Math.max(20, character.condition.mental), 0, 100),
      fatigue: Math.max(80, character.condition.fatigue),
      bodyParts,
      effects: [...character.condition.effects, { id: `rescue-${Date.now()}`, name: '구조 후유증', severity: 5 }],
    },
    criticalState: null,
  }
}

export function closeCharacterRecord(game, now = Date.now()) {
  const character = game.character
  if (character?.criticalState?.status !== 'critical') throw new Error('사망 확정 대상 상태가 아닙니다.')
  const highestStat = Object.entries(character.stats).sort((a, b) => b[1] - a[1])[0]
  const generation = (game.legacy?.generation ?? 0) + 1
  return {
    ...game,
    activeMission: null,
    legacy: {
      generation,
      previousName: character.name,
      previousRank: character.rank,
      inheritedStat: highestStat?.[0] ?? 'will',
      inheritedTitle: character.title,
      missionsCompleted: character.progress?.missionsCompleted ?? 0,
      closedAt: now,
    },
    character: { ...character, alive: false, diedAt: now, criticalState: null },
  }
}

export function applyLegacy(character, legacy) {
  if (!legacy) return character
  const inheritedStat = legacy.inheritedStat
  return {
    ...character,
    credits: character.credits + 50,
    stats: { ...character.stats, [inheritedStat]: clamp((character.stats[inheritedStat] ?? 5) + 1, 1, 10) },
    progress: { ...character.progress, generation: legacy.generation },
    legacy: {
      generation: legacy.generation,
      previousName: legacy.previousName,
      inheritedStat,
      inheritedTitle: legacy.inheritedTitle,
    },
  }
}
