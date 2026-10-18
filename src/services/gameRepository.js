const STORAGE_KEY = 'project-limen:mvp:v2'
const LEGACY_KEY = 'project-limen:mvp:v1'

const emptyState = () => ({ version: 2, character: null, activeMission: null, reports: [], discoveredIntel: [], crew: null, crewMessages: [], crewContributions: 0 })

const defaultBodyParts = () => Object.fromEntries(['head', 'torso', 'leftArm', 'rightArm', 'leftLeg', 'rightLeg'].map((id) => [id, { integrity: 100, injury: null, permanent: false }]))

const migrate = (data) => {
  if (!data) return emptyState()
  const base = { ...emptyState(), ...data, version: 2 }
  if (!base.character) return base
  const character = { inventory: [], equipment: {}, progress: {}, ...base.character }
  return { ...base, character: { ...character, condition: { ...character.condition, bodyParts: { ...defaultBodyParts(), ...(character.condition?.bodyParts ?? {}) } } } }
}

export class LocalGameRepository {
  load() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_KEY))
      const migrated = migrate(data)
      if (data?.version !== 2) this.save(migrated)
      return migrated
    } catch {
      return emptyState()
    }
  }

  save(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, version: 2 }))
    return state
  }

  clear() {
    localStorage.removeItem(STORAGE_KEY)
  }
}

// UI는 이 인터페이스만 사용한다. 서버 도입 시 같은 메서드의 권한형 저장소로 교체한다.
export const gameRepository = new LocalGameRepository()
export { STORAGE_KEY }
