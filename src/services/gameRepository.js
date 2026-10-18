const STORAGE_KEY = 'project-limen:mvp:v1'

const emptyState = () => ({ version: 1, character: null, activeMission: null, reports: [] })

export class LocalGameRepository {
  load() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY))
      return data?.version === 1 ? { ...emptyState(), ...data } : emptyState()
    } catch {
      return emptyState()
    }
  }

  save(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, version: 1 }))
    return state
  }

  clear() {
    localStorage.removeItem(STORAGE_KEY)
  }
}

// UI는 이 인터페이스만 사용한다. 서버 도입 시 같은 메서드의 권한형 저장소로 교체한다.
export const gameRepository = new LocalGameRepository()
export { STORAGE_KEY }
