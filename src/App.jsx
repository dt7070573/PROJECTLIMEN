import { useEffect, useMemo, useState } from 'react'
import { Activity, ClipboardList, Dna, LayoutDashboard, UserRound } from 'lucide-react'
import CharacterCreator from './pages/CharacterCreator.jsx'
import Home from './pages/Home.jsx'
import Daily from './pages/Daily.jsx'
import Profile from './pages/Profile.jsx'
import { completeMission, applyMissionReport, canCompleteMission, startMission } from './game/mission.js'
import { createCharacter } from './game/character.js'
import { gameRepository } from './services/gameRepository.js'
import './App.css'

const NAV = [
  { id: 'dashboard', label: '상황실', icon: LayoutDashboard },
  { id: 'missions', label: '임무 배정', icon: ClipboardList },
  { id: 'condition', label: '상태 기록', icon: Activity },
]

function App() {
  const [game, setGame] = useState(() => gameRepository.load())
  const [page, setPage] = useState(game.character?.alive ? 'dashboard' : 'creator')
  const [notice, setNotice] = useState('')
  const [clock, setClock] = useState(() => Date.now())

  useEffect(() => {
    const timer = window.setInterval(() => setClock(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const persist = (next) => {
    gameRepository.save(next)
    setGame(next)
  }

  const handleCreate = (draft) => {
    if (game.character?.alive) throw new Error('생존 캐릭터는 한 명만 운용할 수 있습니다.')
    persist({ ...game, character: createCharacter(draft), activeMission: null })
    setPage('dashboard')
    setNotice('실험체 등록이 완료되었습니다.')
  }

  const handleStartMission = (content, duration) => {
    if (game.activeMission?.status === 'active') throw new Error('이미 진행 중인 임무가 있습니다.')
    const mission = startMission({ content, duration, character: game.character })
    persist({ ...game, activeMission: mission })
    setNotice(`${duration}분 임무를 시작했습니다.`)
    setPage('dashboard')
  }

  const handleCompleteMission = () => {
    const completed = completeMission(game.activeMission, game.character)
    const character = applyMissionReport(game.character, completed)
    persist({ ...game, character, activeMission: null, reports: [completed, ...game.reports].slice(0, 12) })
    setNotice(completed.report.headline)
  }

  const context = useMemo(() => ({ game, clock }), [game, clock])

  if (!game.character?.alive) return <CharacterCreator onComplete={handleCreate} />

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><Dna size={20} /><span>LIMEN</span></div>
        <div className="subject-chip">
          {game.character.portrait ? <img src={game.character.portrait} alt="" /> : <UserRound />}
          <div><strong>{game.character.name}</strong><small>RANK {String(game.character.rank).padStart(2, '0')} · LV.{game.character.level}</small></div>
        </div>
        <nav>{NAV.map(({ id, label, icon: Icon }) => <button className={page === id ? 'active' : ''} key={id} onClick={() => setPage(id)}><Icon size={18} />{label}</button>)}</nav>
        <div className="sidebar-foot"><span className="status-dot" />LOCAL SECURE NODE<small>v0.1 · OFFLINE MVP</small></div>
      </aside>

      <main className="main-frame">
        <header className="topbar"><div><span className="eyebrow">PROJECT LIMEN / INTERNAL</span><strong>{NAV.find((item) => item.id === page)?.label}</strong></div><time>{new Date(clock).toLocaleString('ko-KR')}</time></header>
        {notice && <button className="notice" onClick={() => setNotice('')}>{notice}<span>닫기 ×</span></button>}
        {page === 'dashboard' && <Home {...context} onCompleteMission={handleCompleteMission} canComplete={game.activeMission ? canCompleteMission(game.activeMission, clock) : false} onNavigate={setPage} />}
        {page === 'missions' && <Daily {...context} onStartMission={handleStartMission} />}
        {page === 'condition' && <Profile {...context} />}
      </main>
    </div>
  )
}

export default App
