import { titles } from '../data/contracts/contentAdapter.js'

export const GENDERS = [
  { id: 'female', label: '여성', modifiers: { agility: 1, empathy: 1 } },
  { id: 'male', label: '남성', modifiers: { strength: 1, endurance: 1 } },
  { id: 'nonbinary', label: '논바이너리', modifiers: { perception: 1, will: 1 } },
  { id: 'undisclosed', label: '비공개', modifiers: { analysis: 1, will: 1 } },
]

export const BODY_TYPES = [
  { id: 'light', label: '경량', description: '민첩·정밀에 유리', modifiers: { agility: 2, precision: 1, strength: -1 } },
  { id: 'balanced', label: '균형', description: '편향 없는 표준 체격', modifiers: {} },
  { id: 'heavy', label: '중량', description: '근력·체력에 유리', modifiers: { strength: 2, endurance: 1, agility: -1 } },
]

const BASE_STATS = {
  strength: 5,
  endurance: 5,
  agility: 5,
  precision: 5,
  perception: 5,
  analysis: 5,
  will: 5,
  empathy: 5,
}

export const STAT_LABELS = {
  strength: '근력', endurance: '체력', agility: '민첩', precision: '정밀',
  perception: '지각', analysis: '분석', will: '의지', empathy: '공감',
}

export const BODY_PART_LABELS = {
  head: '머리', torso: '몸통', leftArm: '왼팔', rightArm: '오른팔', leftLeg: '왼다리', rightLeg: '오른다리',
}

export const createHealthyBodyParts = () => Object.fromEntries(
  Object.keys(BODY_PART_LABELS).map((id) => [id, { integrity: 100, injury: null, permanent: false }]),
)

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

export function deriveStats({ gender, bodyType, height, weight }) {
  const type = BODY_TYPES.find((item) => item.id === bodyType) ?? BODY_TYPES[1]
  const genderProfile = GENDERS.find((item) => item.id === gender)
  const bmi = weight / ((height / 100) ** 2)
  const stats = { ...BASE_STATS }

  Object.entries(type.modifiers).forEach(([key, value]) => { stats[key] += value })
  Object.entries(genderProfile?.modifiers ?? {}).forEach(([key, value]) => { stats[key] += value })

  if (height >= 180) stats.strength += 1
  if (height <= 165) stats.agility += 1
  if (bmi >= 18.5 && bmi <= 25) stats.endurance += 1
  if (bmi < 18.5) stats.agility += 1
  if (bmi > 27) stats.strength += 1
  return Object.fromEntries(Object.entries(stats).map(([key, value]) => [key, clamp(value, 1, 10)]))
}

export function validateCharacterDraft(draft) {
  const errors = {}
  if (!draft.name?.trim() || draft.name.trim().length > 16) errors.name = '이름은 1~16자로 입력하세요.'
  if (!GENDERS.some((item) => item.id === draft.gender)) errors.gender = '성별을 선택하세요.'
  if (!BODY_TYPES.some((item) => item.id === draft.bodyType)) errors.bodyType = '체격을 선택하세요.'
  if (Number(draft.height) < 140 || Number(draft.height) > 210) errors.height = '신장은 140~210cm 범위여야 합니다.'
  if (Number(draft.weight) < 35 || Number(draft.weight) > 160) errors.weight = '체중은 35~160kg 범위여야 합니다.'
  return errors
}

export function createCharacter(draft, now = Date.now()) {
  const starterTitle = titles.find((title) => title.condition?.type === 'always')?.name ?? '신규 배속자'
  return {
    id: `subject-${now}`,
    name: draft.name.trim(),
    gender: draft.gender,
    bodyType: draft.bodyType,
    height: Number(draft.height),
    weight: Number(draft.weight),
    portrait: draft.portrait || null,
    alive: true,
    createdAt: now,
    level: 1,
    xp: 0,
    rank: 1,
    credits: 120,
    title: starterTitle,
    unlockedTitles: [starterTitle],
    progress: { missionsCompleted: 0, containmentCompleted: 0, explorationCompleted: 0, longMissionCompleted: 0, intel: 0 },
    stats: deriveStats(draft),
    skills: { containment: 1, exploration: 1, medical: 0, records: 0 },
    condition: {
      physical: 100,
      mental: 100,
      fatigue: 10,
      bodyParts: createHealthyBodyParts(),
      effects: [],
    },
    missionHistory: [],
  }
}
