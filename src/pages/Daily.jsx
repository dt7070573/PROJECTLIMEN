import { useMemo, useState } from 'react'
import { AlertTriangle, Clock3, LockKeyhole, Shield, Users } from 'lucide-react'
import { contentSource, missionCatalog } from '../data/contracts/contentAdapter.js'

function Daily({ game, onStartMission }) {
  const [type, setType] = useState('containment')
  const [selection, setSelection] = useState(null)
  const [duration, setDuration] = useState(30)
  const [error, setError] = useState('')
  const missions = useMemo(() => missionCatalog.filter((item) => item.type === type), [type])
  const select = (mission) => { setSelection(mission); setDuration(mission.durations[0]); setError('') }
  const start = () => {
    try { onStartMission(selection, duration) } catch (reason) { setError(reason.message) }
  }
  return (
    <section className="page-content">
      <div className="page-heading"><div><span className="eyebrow">ASSIGNMENT DIRECTORY</span><h1>임무 배정</h1><p>위험, 규칙과 투입 시간을 검토한 뒤 명령을 확정하십시오.</p></div><span className="clearance">DATA · {contentSource.entities === 'external' || contentSource.zones === 'external' ? 'LIVE CONTRACT' : 'FALLBACK SAMPLE'}</span></div>
      {game.activeMission && <div className="warning"><AlertTriangle /> 진행 중인 임무를 완료하기 전에는 새 임무를 시작할 수 없습니다.</div>}
      <div className="tabs"><button className={type === 'containment' ? 'active' : ''} onClick={() => { setType('containment'); setSelection(null) }}>격리 개체 관리</button><button className={type === 'exploration' ? 'active' : ''} onClick={() => { setType('exploration'); setSelection(null) }}>단계형 공간 탐사</button></div>
      <div className="mission-layout"><div className="mission-list">{missions.map((mission) => {
        const locked = game.character.rank < mission.minRank
        return <button key={mission.id} className={`mission-card ${selection?.id === mission.id ? 'selected' : ''}`} onClick={() => select(mission)}><div><span>{mission.code}</span><b>RISK {mission.risk}</b></div><h2>{mission.name}</h2><p>{mission.summary}</p><footer><span><Users /> {mission.party.min}–{mission.party.max}인</span><span><Clock3 /> {mission.durations.join(' / ')}분</span>{locked && <span className="locked"><LockKeyhole /> RANK {mission.minRank}</span>}</footer></button>
      })}</div>
      <aside className="mission-detail panel">{!selection ? <div className="empty-state"><Shield /><strong>임무를 선택하십시오</strong><p>세부 규칙과 위험 정보를 표시합니다.</p></div> : <><span className="eyebrow">{selection.code} / BRIEFING</span><h2>{selection.name}</h2><p>{selection.summary}</p><h3>최우선 규칙</h3><blockquote>{selection.primaryRule}</blockquote><h3>요구 조건</h3><ul>{selection.requirements.map((item) => <li key={item}>{item}</li>)}</ul><h3>예상 위험</h3><div className="tag-list">{selection.hazards.map((item) => <span key={item}>{item}</span>)}</div><h3>확보 정보</h3><ul>{selection.intel.map((item) => <li key={item}>{item}</li>)}</ul><h3>투입 시간</h3><div className="duration-grid">{selection.durations.map((item) => <button className={duration === item ? 'selected' : ''} key={item} onClick={() => setDuration(item)}>{item < 60 ? `${item}분` : `${item / 60}시간`}</button>)}</div><div className="reward">예상 보상 <strong>{selection.rewards.xp} XP · {selection.rewards.credits} CR</strong></div>{error && <p className="field-error">{error}</p>}<button className="primary-action" disabled={Boolean(game.activeMission) || game.character.rank < selection.minRank} onClick={start}>임무 명령 확정</button></>}</aside></div>
    </section>
  )
}

export default Daily
