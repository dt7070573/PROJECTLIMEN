import { EXPERIENCE_KIND_WEIGHTS, EXPERIENCE_LOOT, EXPERIENCE_RULES, EXPERIENCE_TEXT } from '../data/missionExperience.js'

const hashSeed = (value) => {
  let hash = 2166136261
  for (const char of String(value)) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619)
  return hash >>> 0
}

const randomSource = (seed) => {
  let value = hashSeed(seed)
  return () => {
    value += 0x6D2B79F5
    let mixed = value
    mixed = Math.imul(mixed ^ mixed >>> 15, mixed | 1)
    mixed ^= mixed + Math.imul(mixed ^ mixed >>> 7, mixed | 61)
    return ((mixed ^ mixed >>> 14) >>> 0) / 4294967296
  }
}

const choose = (items, random) => items[Math.floor(random() * items.length)]
const weighted = (items, random) => {
  const total = items.reduce((sum, [, weight]) => sum + weight, 0)
  let roll = random() * total
  for (const [value, weight] of items) {
    roll -= weight
    if (roll <= 0) return value
  }
  return items.at(-1)[0]
}

const interpolate = (template, context) => template.replace(/\{(\w+)\}/g, (_, key) => context[key] ?? '')

function selectLoot(random) {
  const item = weighted(EXPERIENCE_LOOT.map((entry) => [entry, entry.weight]), random)
  return { ...item, quantity: item.quantity[0] + Math.floor(random() * (item.quantity[1] - item.quantity[0] + 1)) }
}

function createSchedule(startedAt, duration, count, combatIndex, random) {
  const totalMs = duration * 60 * 1000
  const base = totalMs / (count + 1)
  const times = Array.from({ length: count }, (_, index) => {
    const jitter = (random() - 0.5) * base * 0.5
    return Math.round(startedAt + base * (index + 1) + jitter)
  }).sort((a, b) => a - b)
  times[0] = startedAt + 30000 + Math.floor(random() * 60001)
  if (combatIndex >= 1 && combatIndex + 3 < count) {
    const anchor = times[combatIndex]
    times[combatIndex + 1] = anchor + 30000 + Math.floor(random() * 60001)
    times[combatIndex + 2] = times[combatIndex + 1] + 30000 + Math.floor(random() * 60001)
    times[combatIndex + 3] = times[combatIndex + 2] + 30000 + Math.floor(random() * 60001)
  }
  for (let index = 1; index < times.length; index += 1) {
    times[index] = Math.max(times[index], times[index - 1] + EXPERIENCE_RULES.minimumIntervalSeconds * 1000)
    times[index] = Math.min(times[index], times[index - 1] + EXPERIENCE_RULES.maximumIntervalSeconds * 1000)
  }
  return times.map((time) => Math.min(time, startedAt + totalMs - EXPERIENCE_RULES.minimumIntervalSeconds * 1000))
}

export function generateMissionExperiences(content, duration, startedAt = Date.now(), seed = `${content.id}:${startedAt}`) {
  const random = randomSource(seed)
  const minimumCount = Math.ceil(duration / EXPERIENCE_RULES.minimumEventsPerMinutes)
  const extraCount = Math.floor(random() * (Math.ceil(minimumCount * EXPERIENCE_RULES.extraEventRatio) + 1))
  const count = Math.max(3, minimumCount + extraCount)
  const kinds = Array.from({ length: count }, () => weighted(EXPERIENCE_KIND_WEIGHTS[content.type], random))
  kinds[0] = 'entry'
  kinds[count - 1] = 'exit'

  let combatIndex = -1
  if (count >= 7 && random() < 0.08 + content.risk * 0.08) {
    combatIndex = 1 + Math.floor(random() * (count - 5))
    kinds.splice(combatIndex, 4, 'combatStart', 'combatRound', 'combatRound', 'combatEnd')
  }
  for (let index = 1; index < count - 1; index += 1) {
    if (kinds[index] === 'loot' && random() > EXPERIENCE_RULES.lootChance) kinds[index] = 'search'
    else if (kinds[index - 1] === 'loot' && random() < EXPERIENCE_RULES.lootStreakChance) kinds[index] = 'loot'
    if (kinds[index] === 'clue' && random() > EXPERIENCE_RULES.clueChance) kinds[index] = 'observation'
  }

  const times = createSchedule(startedAt, duration, count, combatIndex, random)
  let round = 0
  return kinds.map((kind, index) => {
    const loot = kind === 'loot' ? selectLoot(random) : null
    if (kind === 'combatStart') round = 0
    if (kind === 'combatRound') round += 1
    const context = {
      name: content.name,
      rule: content.primaryRule,
      hazard: choose(content.hazards?.length ? content.hazards : ['알 수 없는 위험'], random),
      clue: choose(content.intel?.length ? content.intel : ['추가 관찰이 필요하다.'], random),
      stage: choose(content.stages?.length ? content.stages.map((stage) => stage.name ?? stage) : ['다음 구역'], random),
      item: loot?.name,
      quantity: loot?.quantity,
      round,
      damage: 1 + Math.floor(random() * Math.max(2, content.risk * 3)),
    }
    const pool = kind === 'entry' || kind === 'exit' ? EXPERIENCE_TEXT[kind][content.type] : EXPERIENCE_TEXT[kind]
    return {
      id: `experience-${index + 1}`,
      occursAt: times[index],
      kind,
      text: interpolate(choose(pool, random), context),
      outcome: loot ? { type: 'item', itemId: loot.id, name: loot.name, quantity: loot.quantity } : kind === 'clue' ? { type: 'intel', text: context.clue } : null,
    }
  })
}

export function visibleMissionExperiences(mission, now = Date.now()) {
  return (mission.experiences ?? []).filter((entry) => entry.occursAt <= now)
}
