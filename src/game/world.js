const isFailure = (mission) => mission.report?.outcome !== 'success'

export function applyMissionToWorld(game, mission) {
  if (mission.type !== 'containment') return game
  const streaks = { ...(game.containmentStreaks ?? {}) }
  streaks[mission.contentId] = isFailure(mission) ? (streaks[mission.contentId] ?? 0) + 1 : 0
  let worldEvents = [...(game.worldEvents ?? [])]
  const alreadyActive = worldEvents.some((event) => event.contentId === mission.contentId && event.status === 'active')
  if (streaks[mission.contentId] >= 3 && !alreadyActive) {
    worldEvents = [{
      id: `breach-${mission.contentId}-${mission.report.completedAt}`,
      contentId: mission.contentId,
      code: mission.code,
      name: `${mission.name} 격리 이탈`,
      status: 'active',
      severity: mission.risk,
      progress: 0,
      target: 100,
      createdAt: mission.report.completedAt,
      participants: 0,
    }, ...worldEvents].slice(0, 8)
  }
  return { ...game, containmentStreaks: streaks, worldEvents }
}

export function respondToWorldEvent(game, eventId) {
  if (game.activeMission) throw new Error('임무 진행 중에는 월드 사건에 대응할 수 없습니다.')
  const target = game.worldEvents.find((event) => event.id === eventId)
  if (!target || target.status !== 'active') throw new Error('종료되었거나 존재하지 않는 사건입니다.')
  if (game.character.condition.physical < 30 || game.character.condition.mental < 25) throw new Error('현재 상태로는 대응 임무에 참여할 수 없습니다.')
  const contribution = 28 + Math.min(12, game.character.skills.containment * 2)
  const nextProgress = Math.min(target.target, target.progress + contribution)
  const resolved = nextProgress >= target.target
  const worldEvents = game.worldEvents.map((event) => event.id === eventId ? { ...event, progress: nextProgress, participants: event.participants + 1, status: resolved ? 'resolved' : 'active', resolvedAt: resolved ? Date.now() : null } : event)
  const character = {
    ...game.character,
    credits: game.character.credits + (resolved ? 90 : 20),
    condition: { ...game.character.condition, fatigue: Math.min(100, game.character.condition.fatigue + 8), mental: Math.max(0, game.character.condition.mental - target.severity) },
    progress: { ...game.character.progress, worldResponses: (game.character.progress?.worldResponses ?? 0) + 1 },
  }
  return { ...game, character, worldEvents }
}
