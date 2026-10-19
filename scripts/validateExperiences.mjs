import assert from 'node:assert/strict'
import { missionCatalog } from '../src/data/contracts/contentAdapter.js'
import { EXPERIENCE_RULES } from '../src/data/missionExperience.js'
import { generateMissionExperiences } from '../src/game/experience.js'

const durations = [30, 60, 120, 180]
const startedAt = 1_800_000_000_000
let checked = 0
let sawEmptyLootRun = false
let sawMultiLootRun = false

for (const mission of missionCatalog) {
  for (const duration of durations.filter((value) => mission.durations.includes(value))) {
    for (let sample = 0; sample < 12; sample += 1) {
      const seed = `${mission.id}:${duration}:${sample}`
      const events = generateMissionExperiences(mission, duration, startedAt, seed)
      const repeated = generateMissionExperiences(mission, duration, startedAt, seed)
      assert.deepEqual(events, repeated, `${mission.id}: 같은 시드는 같은 기록을 복원해야 합니다.`)
      assert.ok(events.length >= Math.ceil(duration / EXPERIENCE_RULES.minimumEventsPerMinutes), `${mission.id}: 경험 문구 수가 최소치보다 적습니다.`)
      const boundaries = [startedAt, ...events.map((event) => event.occursAt), startedAt + duration * 60 * 1000]
      for (let index = 1; index < boundaries.length; index += 1) {
        const interval = (boundaries[index] - boundaries[index - 1]) / 1000
        assert.ok(interval >= EXPERIENCE_RULES.minimumIntervalSeconds, `${mission.id}: 경험 간격이 30초 미만입니다.`)
        assert.ok(interval <= EXPERIENCE_RULES.maximumIntervalSeconds, `${mission.id}: 경험 간격이 30분을 초과합니다.`)
      }
      const lootCount = events.filter((event) => event.kind === 'loot').length
      if (lootCount === 0) sawEmptyLootRun = true
      if (lootCount >= 2) sawMultiLootRun = true
      checked += 1
    }
  }
}

assert.ok(sawEmptyLootRun, '획득물이 없는 임무 결과가 생성되어야 합니다.')
assert.ok(sawMultiLootRun, '획득물이 여러 개인 임무 결과가 생성되어야 합니다.')
console.log(`experience validation passed: ${checked} randomized mission timelines`)
