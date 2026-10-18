import { useEffect, useMemo, useState } from 'react'
import { Activity, Archive, ClipboardList, Dna, LayoutDashboard, ShoppingBag, UserRound, UsersRound } from 'lucide-react'
import CharacterCreator from './pages/CharacterCreator.jsx'
import Home from './pages/Home.jsx'
import Daily from './pages/Daily.jsx'
import Profile from './pages/Profile.jsx'
import Store from './pages/Store.jsx'
import Records from './pages/Records.jsx'
import Crew from './pages/Crew.jsx'
import { completeMission, applyMissionReport, canCompleteMission, startMission } from './game/mission.js'
import { createCharacter } from './game/character.js'
import { applyTreatment, buyItem, consumeItem, equipItem, selectTitle } from './game/systems.js'
import { crewSeed } from './data/contracts/systemAdapter.js'
import { gameRepository } from './services/gameRepository.js'
import './App.css'

const NAV = [
  { id: 'dashboard', label: '상황실', icon: LayoutDashboard }, { id: 'missions', label: '임무 배정', icon: ClipboardList },
  { id: 'condition', label: '상태 기록', icon: Activity }, { id: 'store', label: '배급 상점', icon: ShoppingBag },
  { id: 'records', label: '기록국', icon: Archive }, { id: 'crew', label: '작업반', icon: UsersRound },
]

function App() {
  const [game, setGame] = useState(() => gameRepository.load())
  const [page, setPage] = useState(game.character?.alive ? 'dashboard' : 'creator')
  const [notice, setNotice] = useState('')
  const [clock, setClock] = useState(() => Date.now())
  useEffect(() => { const timer = window.setInterval(() => setClock(Date.now()), 1000); return () => window.clearInterval(timer) }, [])
  const persist = (next, message) => { gameRepository.save(next); setGame(next); if (message) setNotice(message) }
  const changeCharacter = (transform, message) => { try { persist({ ...game, character: transform(game.character) }, message) } catch (error) { setNotice(error.message) } }

  const handleCreate = (draft) => { if (game.character?.alive) throw new Error('생존 캐릭터는 한 명만 운용할 수 있습니다.'); persist({ ...game, character: createCharacter(draft), activeMission: null, crew: crewSeed }, '실험체 등록이 완료되었습니다.'); setPage('dashboard') }
  const handleStartMission = (content, duration) => { if (game.activeMission?.status === 'active') throw new Error('이미 진행 중인 임무가 있습니다.'); persist({ ...game, activeMission: startMission({ content, duration, character: game.character }) }, `${duration}분 임무를 시작했습니다.`); setPage('dashboard') }
  const handleCompleteMission = () => {
    const completed = completeMission(game.activeMission, game.character)
    const intel = [...new Set([...(game.discoveredIntel ?? []), ...(completed.intel ?? [])])]
    persist({ ...game, character: applyMissionReport(game.character, completed), activeMission: null, discoveredIntel: intel, reports: [completed, ...game.reports].slice(0, 20) }, completed.report.headline)
  }
  const addCrewMessage = (text) => persist({ ...game, crew: game.crew ?? crewSeed, crewMessages: [{ id: `message-${Date.now()}`, text, author: game.character.name, createdAt: Date.now() }, ...game.crewMessages].slice(0, 20) }, '정형 메시지를 공유했습니다.')
  const contribute = () => { if (game.character.credits < 10) return setNotice('기여에 필요한 10 CR이 부족합니다.'); persist({ ...game, character: { ...game.character, credits: game.character.credits - 10 }, crew: game.crew ?? crewSeed, crewContributions: game.crewContributions + 10 }, '공동 목표에 10점을 기여했습니다.') }
  const context = useMemo(() => ({ game, clock }), [game, clock])
  if (!game.character?.alive) return <CharacterCreator onComplete={handleCreate} />
  return <div className="app-shell"><aside className="sidebar"><div className="brand"><Dna size={20} /><span>LIMEN</span></div><div className="subject-chip">{game.character.portrait ? <img src={game.character.portrait} alt="" /> : <UserRound />}<div><strong>{game.character.name}</strong><small>RANK {String(game.character.rank).padStart(2, '0')} · LV.{game.character.level}</small></div></div><nav>{NAV.map(({ id, label, icon: Icon }) => <button className={page === id ? 'active' : ''} key={id} onClick={() => setPage(id)}><Icon size={18} />{label}</button>)}</nav><div className="sidebar-foot"><span className="status-dot" />LOCAL SECURE NODE<small>v0.2 · OFFLINE MVP</small></div></aside>
    <main className="main-frame"><header className="topbar"><div><span className="eyebrow">PROJECT LIMEN / INTERNAL</span><strong>{NAV.find((item) => item.id === page)?.label}</strong></div><time>{new Date(clock).toLocaleString('ko-KR')}</time></header>{notice && <button className="notice" onClick={() => setNotice('')}>{notice}<span>닫기 ×</span></button>}
      {page === 'dashboard' && <Home {...context} onCompleteMission={handleCompleteMission} canComplete={game.activeMission ? canCompleteMission(game.activeMission, clock) : false} onNavigate={setPage} />}
      {page === 'missions' && <Daily {...context} onStartMission={handleStartMission} />}
      {page === 'condition' && <Profile {...context} onTreat={(id) => changeCharacter((character) => applyTreatment(character, id, Boolean(game.activeMission)), '치료가 완료되었습니다.')} onSelectTitle={(name) => changeCharacter((character) => selectTitle(character, name), '활성 칭호를 변경했습니다.')} />}
      {page === 'store' && <Store {...context} onBuy={(item) => changeCharacter((character) => buyItem(character, item), `${item.name}을 구매했습니다.`)} onEquip={(item) => changeCharacter((character) => equipItem(character, item), `${item.name}을 장착했습니다.`)} onUse={(item) => changeCharacter((character) => consumeItem(character, item), `${item.name}을 사용했습니다.`)} />}
      {page === 'records' && <Records {...context} />}{page === 'crew' && <Crew {...context} onMessage={addCrewMessage} onContribute={contribute} />}
    </main></div>
}
export default App
