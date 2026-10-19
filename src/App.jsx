import { useEffect, useMemo, useState } from 'react'
import { Activity, Archive, ClipboardList, Dna, LayoutDashboard, RadioTower, Scale, ShoppingBag, UserRound, UsersRound } from 'lucide-react'
import CharacterCreator from './pages/CharacterCreator.jsx'
import Home from './pages/Home.jsx'
import Daily from './pages/Daily.jsx'
import Profile from './pages/Profile.jsx'
import Store from './pages/Store.jsx'
import Records from './pages/Records.jsx'
import Crew from './pages/Crew.jsx'
import Critical from './pages/Critical.jsx'
import License from './pages/License.jsx'
import Cooperative from './pages/Cooperative.jsx'
import { completeMission, applyMissionReport, canCompleteMission, startMission } from './game/mission.js'
import { createCharacter } from './game/character.js'
import { applyTreatment, buyItem, consumeItem, equipItem, getEquipmentPower, reserveMissionSupply, selectTitle } from './game/systems.js'
import { crewSeed } from './data/contracts/systemAdapter.js'
import { applyMissionToWorld, respondToWorldEvent } from './game/world.js'
import { applyLegacy, closeCharacterRecord, markCritical, rescueCharacter } from './game/survival.js'
import { claimPayroll, syncClearance } from './game/employment.js'
import { gameRepository } from './services/gameRepository.js'
import { advanceCooperativeMission, completeCooperativeMission, createCooperativeLobby, fillLobbyWithSimulatedPlayers, launchCooperativeMission, resolveCooperativeDecision, selectCooperativeRole, setCooperativePolicy } from './game/cooperativeMission.js'
import './App.css'
import './components/MissionExperienceLog.css'
import './pages/License.css'

const NAV = [
  { id: 'dashboard', label: '상황실', icon: LayoutDashboard }, { id: 'missions', label: '임무 배정', icon: ClipboardList },
  { id: 'cooperative', label: '공동 임무', icon: RadioTower },
  { id: 'condition', label: '상태 기록', icon: Activity }, { id: 'store', label: '배급 상점', icon: ShoppingBag },
  { id: 'records', label: '기록국', icon: Archive }, { id: 'crew', label: '작업반', icon: UsersRound },
  { id: 'license', label: '라이선스', icon: Scale },
]

function App() {
  const [game, setGame] = useState(() => gameRepository.load())
  const [page, setPage] = useState(game.character?.alive ? 'dashboard' : 'creator')
  const [notice, setNotice] = useState('')
  const [clock, setClock] = useState(() => Date.now())
  useEffect(() => { const timer = window.setInterval(() => setClock(Date.now()), 1000); return () => window.clearInterval(timer) }, [])
  const persist = (next, message) => { gameRepository.save(next); setGame(next); if (message) setNotice(message) }
  const changeCharacter = (transform, message) => { try { persist({ ...game, character: transform(game.character) }, message) } catch (error) { setNotice(error.message) } }

  const handleCreate = (draft) => { if (game.character?.alive) throw new Error('생존 캐릭터는 한 명만 운용할 수 있습니다.'); const character = { ...applyLegacy(createCharacter(draft), game.legacy), rank: game.clearance?.rank ?? 1 }; persist({ ...game, character, activeMission: null, crew: game.crew ?? crewSeed }, '실험체 등록과 이전 기록 계승이 완료되었습니다.'); setPage('dashboard') }
  const handleStartMission = (content, duration, options) => { if (game.activeMission?.status === 'active' || game.cooperativeLobby || game.cooperativeRun?.status === 'active') throw new Error('이미 진행 또는 모집 중인 임무가 있습니다.'); const reserved = reserveMissionSupply(game.character, options.supplyItemId); const activeMission = startMission({ content, duration, options: { ...options, supply: reserved.supply, equipmentPower: getEquipmentPower(reserved.character, content.type) }, character: reserved.character }); persist({ ...game, character: reserved.character, activeMission }, `${duration}분 · ${activeMission.options.partySize}인 임무를 시작했습니다.`); setPage('dashboard') }
  const handleCompleteMission = (developerOverride = false) => {
    const completed = completeMission(game.activeMission, game.character, Date.now(), { developerOverride })
    const intel = [...new Set([...(game.discoveredIntel ?? []), ...(completed.report.gains.intel ?? [])])]
    const completedGame = { ...game, character: markCritical(applyMissionReport(game.character, completed), completed), activeMission: null, discoveredIntel: intel, reports: [completed, ...game.reports].slice(0, 20) }
    const itemCount = completed.report.gains.items.reduce((sum, item) => sum + item.quantity, 0)
    persist(syncClearance(applyMissionToWorld(completedGame, completed)), `${developerOverride ? '개발자 시간 가속 완료 · ' : ''}${completed.report.headline}${itemCount ? ` · 획득물 ${itemCount}개 수령` : ''}`)
  }
  const respondToEvent = (eventId) => { try { persist(respondToWorldEvent(game, eventId), '월드 사건 대응 결과가 반영되었습니다.') } catch (error) { setNotice(error.message) } }
  const addCrewMessage = (text) => persist({ ...game, crew: game.crew ?? crewSeed, crewMessages: [{ id: `message-${Date.now()}`, text, author: game.character.name, createdAt: Date.now() }, ...game.crewMessages].slice(0, 20) }, '정형 메시지를 공유했습니다.')
  const contribute = () => { if (game.character.credits < 10) return setNotice('기여에 필요한 10 CR이 부족합니다.'); persist({ ...game, character: { ...game.character, credits: game.character.credits - 10 }, crew: game.crew ?? crewSeed, crewContributions: game.crewContributions + 10 }, '공동 목표에 10점을 기여했습니다.') }
  const context = useMemo(() => ({ game, clock }), [game, clock])
  const handleRescue = () => persist({ ...game, character: rescueCharacter(game.character) }, '긴급 구조가 완료되었습니다. 영구 후유증을 상태 기록에서 확인하십시오.')
  const handleDeath = () => { persist(closeCharacterRecord(game), '실험체 기록이 종료되었습니다.'); setPage('creator') }
  const handlePayroll = () => { try { persist(claimPayroll(game), '금일 사내 급여가 지급되었습니다.') } catch (error) { setNotice(error.message) } }
  const createCoopLobby = (developerOverride) => { try { persist({ ...game, cooperativeLobby: createCooperativeLobby(game.character, 'coop-zone-001', Date.now(), { developerOverride }), cooperativeRun: null }, developerOverride ? '개발자 테스트 모집방을 생성했습니다.' : '공동 임무 모집방을 생성했습니다.') } catch (error) { setNotice(error.message) } }
  const updateLobby = (transform, message) => { try { persist({ ...game, cooperativeLobby: transform(game.cooperativeLobby) }, message) } catch (error) { setNotice(error.message) } }
  const launchCoop = () => { try { const cooperativeRun = launchCooperativeMission(game.cooperativeLobby); persist({ ...game, cooperativeLobby: null, cooperativeRun }, '네 명이 모였습니다. 공동 임무가 동시에 시작됩니다.') } catch (error) { setNotice(error.message) } }
  const updateCoopRun = (transform, message) => { try { persist({ ...game, cooperativeRun: transform(game.cooperativeRun) }, message) } catch (error) { setNotice(error.message) } }
  const completeCoop = (developerOverride = false) => { try { const completed = completeCooperativeMission(game.cooperativeRun, game.character, game.relationships, { developerOverride }); const mission = completed.run; const character = markCritical(applyMissionReport(game.character, mission), mission); const intel = [...new Set([...(game.discoveredIntel ?? []), ...mission.report.gains.intel])]; persist(syncClearance({ ...game, character, cooperativeRun: mission, relationships: completed.relationships, discoveredIntel: intel, reports: [mission, ...game.reports].slice(0, 20) }), developerOverride ? '개발자 시간 가속 완료 · 보상과 관계 변화가 반영되었습니다.' : '공동 임무 완료 · 보상과 관계 변화가 반영되었습니다.') } catch (error) { setNotice(error.message) } }
  if (!game.character?.alive) return <CharacterCreator onComplete={handleCreate} legacy={game.legacy} />
  if (game.character.criticalState?.status === 'critical') return <Critical character={game.character} onRescue={handleRescue} onDeath={handleDeath} />
  return <div className="app-shell"><aside className="sidebar"><div className="brand"><Dna size={20} /><span>LIMEN</span></div><div className="subject-chip">{game.character.portrait ? <img src={game.character.portrait} alt="" /> : <UserRound />}<div><strong>{game.character.name}</strong><small>RANK {String(game.character.rank).padStart(2, '0')} · LV.{game.character.level}</small></div></div><nav>{NAV.map(({ id, label, icon: Icon }) => <button className={page === id ? 'active' : ''} key={id} onClick={() => setPage(id)}><Icon size={18} />{label}</button>)}</nav><div className="sidebar-foot"><span className="status-dot" />LOCAL SECURE NODE<small>v0.2 · OFFLINE MVP</small></div></aside>
    <main className="main-frame"><header className="topbar"><div><span className="eyebrow">PROJECT LIMEN / INTERNAL</span><strong>{NAV.find((item) => item.id === page)?.label}</strong></div><time>{new Date(clock).toLocaleString('ko-KR')}</time></header>{notice && <button className="notice" onClick={() => setNotice('')}>{notice}<span>닫기 ×</span></button>}
      {page === 'dashboard' && <Home {...context} onCompleteMission={() => handleCompleteMission(false)} onDeveloperComplete={() => handleCompleteMission(true)} canComplete={game.activeMission ? canCompleteMission(game.activeMission, clock) : false} onNavigate={setPage} onRespondEvent={respondToEvent} onPayroll={handlePayroll} />}
      {page === 'missions' && <Daily {...context} onStartMission={handleStartMission} />}
      {page === 'cooperative' && <Cooperative {...context} onCreateLobby={createCoopLobby} onRole={(roleId) => updateLobby((lobby) => selectCooperativeRole(lobby, game.character.id, roleId), '역할을 변경했습니다.')} onPolicy={(policyId, optionId) => updateLobby((lobby) => setCooperativePolicy(lobby, policyId, optionId))} onFillBots={() => updateLobby(fillLobbyWithSimulatedPlayers, '개발자용 시뮬레이션 참가자 3명이 합류했습니다.')} onLaunch={launchCoop} onAdvance={(mode) => updateCoopRun((run) => advanceCooperativeMission(run, mode), mode === 'next' ? '다음 사건 시각으로 이동했습니다.' : '종료 시각으로 이동했습니다.')} onDecision={(decisionId, optionId) => updateCoopRun((run) => resolveCooperativeDecision(run, decisionId, optionId), '결정이 공동 사건 기록에 반영되었습니다.')} onComplete={completeCoop} onReset={() => persist({ ...game, cooperativeRun: null }, '공동 임무 완료 기록을 닫았습니다.')} />}
      {page === 'condition' && <Profile {...context} onTreat={(id) => changeCharacter((character) => applyTreatment(character, id, Boolean(game.activeMission)), '치료가 완료되었습니다.')} onSelectTitle={(name) => changeCharacter((character) => selectTitle(character, name), '활성 칭호를 변경했습니다.')} />}
      {page === 'store' && <Store {...context} onBuy={(item) => changeCharacter((character) => buyItem(character, item), `${item.name}을 구매했습니다.`)} onEquip={(item) => changeCharacter((character) => equipItem(character, item), `${item.name}을 장착했습니다.`)} onUse={(item) => changeCharacter((character) => consumeItem(character, item), `${item.name}을 사용했습니다.`)} />}
      {page === 'records' && <Records {...context} />}{page === 'crew' && <Crew {...context} onMessage={addCrewMessage} onContribute={contribute} />}
      {page === 'license' && <License />}
    </main></div>
}
export default App
