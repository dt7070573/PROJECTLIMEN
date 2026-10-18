import assert from 'node:assert/strict'
import { containmentEntities } from '../src/data/entities.js'
import { explorationZones } from '../src/data/zones.js'
import { titles } from '../src/data/titles.js'

const allMissions = [...containmentEntities, ...explorationZones]
const unique = (values) => new Set(values).size === values.length

assert.equal(containmentEntities.length, 60, '관리 개체는 정확히 60종이어야 합니다.')
assert.equal(explorationZones.length, 40, '탐사 구역은 정확히 40종이어야 합니다.')
assert.ok(titles.length >= 1, '칭호가 최소 1개 필요합니다.')
assert.ok(unique(allMissions.map((entry) => entry.id)), '임무 id가 중복되었습니다.')
assert.ok(unique(allMissions.map((entry) => entry.code)), '임무 code가 중복되었습니다.')

for (const mission of allMissions) {
  assert.ok(mission.name && mission.summary && mission.primaryRule, `${mission.id}: 필수 설명이 없습니다.`)
  assert.ok(mission.party.min >= 1 && mission.party.max <= 8, `${mission.id}: 편성은 1~8인 범위여야 합니다.`)
  assert.ok(mission.party.recommended >= mission.party.min && mission.party.recommended <= mission.party.max, `${mission.id}: 권장 인원이 범위를 벗어났습니다.`)
  assert.ok(mission.durations.every((duration) => [30, 60, 120, 180].includes(duration)), `${mission.id}: 지원하지 않는 임무 시간이 있습니다.`)
  assert.ok(mission.intel.length >= 1, `${mission.id}: 실제 판정에 적용할 단서가 없습니다.`)
}

console.log(`content validation passed: ${containmentEntities.length} entities, ${explorationZones.length} zones, ${titles.length} titles`)
