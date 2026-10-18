import { titles } from '../data/contracts/contentAdapter.js'
import { storeItems } from '../data/contracts/systemAdapter.js'

const clamp = (value, min = 0, max = 100) => Math.min(max, Math.max(min, value))

export const TREATMENTS = [
  { id: 'physical', name: '신체 재생 처치', cost: 35, amount: 25, description: '신체 기능을 회복합니다.' },
  { id: 'mental', name: '인지 안정 처치', cost: 35, amount: 25, description: '정신 안정을 회복합니다.' },
  { id: 'fatigue', name: '회복실 이용', cost: 25, amount: 30, description: '피로를 낮춥니다.' },
  { id: 'effects', name: '상태이상 정밀 치료', cost: 60, amount: 1, description: '가장 오래된 상태이상 하나를 제거합니다.' },
]

export function applyTreatment(character, treatmentId, missionActive) {
  if (missionActive) throw new Error('임무 진행 중에는 치료할 수 없습니다.')
  const treatment = TREATMENTS.find((item) => item.id === treatmentId)
  if (!treatment) throw new Error('알 수 없는 치료입니다.')
  if (character.credits < treatment.cost) throw new Error('크레딧이 부족합니다.')
  const condition = { ...character.condition }
  if (treatmentId === 'fatigue') condition.fatigue = clamp(condition.fatigue - treatment.amount)
  else if (treatmentId === 'effects') condition.effects = condition.effects.slice(1)
  else condition[treatmentId] = clamp(condition[treatmentId] + treatment.amount)
  if (treatmentId === 'physical' && condition.bodyParts) {
    const targetId = Object.entries(condition.bodyParts).sort(([, a], [, b]) => a.integrity - b.integrity)[0]?.[0]
    if (targetId) {
      const part = condition.bodyParts[targetId]
      const integrity = Math.min(part.permanent ? 60 : 100, part.integrity + treatment.amount)
      condition.bodyParts = { ...condition.bodyParts, [targetId]: { ...part, integrity, injury: integrity < 25 ? '중증 기능 손상' : integrity < 55 ? '골절·심부 손상' : integrity < 85 ? '타박·열상' : null } }
    }
  }
  return { ...character, credits: character.credits - treatment.cost, condition, progress: { ...character.progress, treatments: (character.progress?.treatments ?? 0) + 1 } }
}

export function selectTitle(character, titleName) {
  if (!character.unlockedTitles.includes(titleName) || !titles.some((title) => title.name === titleName)) throw new Error('획득하지 않은 칭호입니다.')
  return { ...character, title: titleName }
}

export function buyItem(character, item) {
  if (character.rank < item.minRank) throw new Error('사내 등급이 부족합니다.')
  if (character.credits < item.price) throw new Error('크레딧이 부족합니다.')
  const inventory = [...(character.inventory ?? [])]
  const existing = inventory.find((entry) => entry.itemId === item.id)
  if (existing) existing.quantity += 1
  else inventory.push({ itemId: item.id, quantity: 1 })
  return { ...character, credits: character.credits - item.price, inventory }
}

export function equipItem(character, item) {
  if (item.type !== 'equipment' || !item.slot) throw new Error('장착할 수 없는 아이템입니다.')
  if (!(character.inventory ?? []).some((entry) => entry.itemId === item.id && entry.quantity > 0)) throw new Error('보유하지 않은 아이템입니다.')
  return { ...character, equipment: { ...(character.equipment ?? {}), [item.slot]: item.id } }
}

export function consumeItem(character, item) {
  const entry = (character.inventory ?? []).find((owned) => owned.itemId === item.id)
  if (item.type !== 'consumable' || !entry?.quantity) throw new Error('사용할 수 없는 아이템입니다.')
  const condition = { ...character.condition }
  if (item.effects.physical) condition.physical = clamp(condition.physical + item.effects.physical)
  if (item.effects.mental) condition.mental = clamp(condition.mental + item.effects.mental)
  if (item.effects.fatigue) condition.fatigue = clamp(condition.fatigue + item.effects.fatigue)
  if (item.effects.informationContamination) condition.anomaly = { ...condition.anomaly, informationContamination: clamp(condition.anomaly.informationContamination + item.effects.informationContamination) }
  const inventory = character.inventory.map((owned) => owned.itemId === item.id ? { ...owned, quantity: owned.quantity - 1 } : owned).filter((owned) => owned.quantity > 0)
  return { ...character, condition, inventory }
}

export function getEquipmentPower(character, missionType) {
  return Object.values(character.equipment ?? {}).reduce((total, itemId) => {
    const item = storeItems.find((entry) => entry.id === itemId)
    if (!item) return total
    const effects = item.effects ?? {}
    return total + Number(effects[missionType] ?? 0) + Number(effects.analysis ?? 0) * 0.5 + Number(effects.anomalyGuard ?? 0) * 0.35
  }, 0)
}

export function reserveMissionSupply(character, itemId) {
  if (!itemId) return { character, supply: null }
  const item = storeItems.find((entry) => entry.id === itemId)
  const owned = (character.inventory ?? []).find((entry) => entry.itemId === itemId)
  if (item?.type !== 'consumable' || !owned?.quantity) throw new Error('자동 소비용 물자를 보유하고 있지 않습니다.')
  const inventory = character.inventory
    .map((entry) => entry.itemId === itemId ? { ...entry, quantity: entry.quantity - 1 } : entry)
    .filter((entry) => entry.quantity > 0)
  const effects = item.effects ?? {}
  const protection = Number(Boolean(effects.physical)) + Number(Boolean(effects.mental)) + Number(Boolean(effects.informationContamination))
  return { character: { ...character, inventory }, supply: { itemId, name: item.name, protection } }
}
