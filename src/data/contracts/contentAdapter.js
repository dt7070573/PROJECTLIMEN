import { containmentEntities } from '../entities.js'
import { explorationZones } from '../zones.js'
import { titles } from '../titles.js'

const requirementLabels = { physical: '신체', mental: '정신', anomaly: '이상 저항' }

const normalizeRequirements = (requirements) => {
  if (Array.isArray(requirements)) return requirements
  return Object.entries(requirements ?? {}).map(([key, value]) => `${requirementLabels[key] ?? key} ${value}`)
}

const normalizeStages = (stages) => (stages ?? []).map((stage, index) => (
  typeof stage === 'string' ? { id: `stage-${index + 1}`, name: stage } : stage
))

export { containmentEntities, explorationZones, titles }

export const contentSource = { entities: 'local-data', zones: 'local-data', titles: 'local-data' }

export function normalizeMissionContent(item, type) {
  return {
    ...item,
    type,
    party: item.party ?? { min: 1, recommended: 1, max: 1 },
    durations: item.durations?.filter((duration) => [30, 60, 120, 180].includes(duration)) ?? [30],
    requirements: normalizeRequirements(item.requirements),
    requirementScores: Array.isArray(item.requirements) ? {} : (item.requirements ?? {}),
    hazards: item.hazards ?? [],
    intel: item.intel ?? [],
    stages: normalizeStages(item.stages),
    rewards: item.rewards ?? { credits: 30, xp: 25, intel: 1 },
  }
}

export const missionCatalog = [
  ...containmentEntities.map((item) => normalizeMissionContent(item, 'containment')),
  ...explorationZones.map((item) => normalizeMissionContent(item, 'exploration')),
]
