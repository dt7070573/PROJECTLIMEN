const DAY = 24 * 60 * 60 * 1000
export const DEMOTION_INTERVAL_DAYS = 14

export function normalizeClearance(game, now = Date.now()) {
  const clearance = game.clearance ?? { rank: game.character?.rank ?? 1, lastActiveAt: now, lastPayrollAt: 0 }
  const elapsedDays = Math.floor(Math.max(0, now - clearance.lastActiveAt) / DAY)
  const demotions = Math.floor(elapsedDays / DEMOTION_INTERVAL_DAYS)
  const rank = Math.max(1, Math.min(45, clearance.rank - demotions))
  return {
    ...game,
    clearance: { ...clearance, rank, lastActiveAt: now },
    character: game.character ? { ...game.character, rank } : null,
  }
}

export function syncClearance(game) {
  const rank = Math.max(game.clearance?.rank ?? 1, game.character?.rank ?? 1)
  return { ...game, clearance: { ...(game.clearance ?? {}), rank }, character: game.character ? { ...game.character, rank } : null }
}

export function payrollStatus(game, now = Date.now()) {
  const lastPayrollAt = game.clearance?.lastPayrollAt ?? 0
  const nextAt = lastPayrollAt + DAY
  return { available: now >= nextAt, nextAt, amount: 20 + (game.clearance?.rank ?? 1) * 3 }
}

export function claimPayroll(game, now = Date.now()) {
  const status = payrollStatus(game, now)
  if (!status.available) throw new Error('다음 급여 지급 시간이 아직 되지 않았습니다.')
  return {
    ...game,
    character: { ...game.character, credits: game.character.credits + status.amount },
    clearance: { ...game.clearance, lastPayrollAt: now },
  }
}
