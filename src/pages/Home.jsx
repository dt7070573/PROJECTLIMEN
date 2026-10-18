import { Activity, ArrowRight, Clock3, Coins, ShieldAlert, Sparkles } from 'lucide-react'
import { missionProgress } from '../game/mission.js'

const remainingText = (mission, now) => {
  const ms = Math.max(0, mission.completesAt - now)
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function Home({ game, clock, onCompleteMission, canComplete, onNavigate, onRespondEvent }) {
  const { character, activeMission, reports } = game
  const condition = character.condition
  return (
    <section className="page-content">
      <div className="page-heading"><div><span className="eyebrow">OPERATIONS OVERVIEW</span><h1>돌아오셨군요, {character.name}.</h1><p>현재 상태와 배정된 임무를 확인하십시오.</p></div><span className="clearance">CLEARANCE · {character.rank}/45</span></div>

      <div className="metric-grid">
        <article className="metric"><Activity /><span>신체 상태</span><strong>{condition.physical}<small>%</small></strong><i style={{ width: `${condition.physical}%` }} /></article>
        <article className="metric"><Sparkles /><span>정신 안정</span><strong>{condition.mental}<small>%</small></strong><i style={{ width: `${condition.mental}%` }} /></article>
        <article className="metric"><ShieldAlert /><span>정보 오염</span><strong>{condition.anomaly.informationContamination}<small>%</small></strong><i className="safe" style={{ width: `${condition.anomaly.informationContamination}%` }} /></article>
        <article className="metric"><Coins /><span>보유 크레딧</span><strong>{character.credits}<small>CR</small></strong><i style={{ width: `${Math.min(100, character.credits / 5)}%` }} /></article>
      </div>

      {(game.worldEvents ?? []).some((event) => event.status === 'active') && <section className="world-events"><div className="world-heading"><div><span className="eyebrow">FACILITY-WIDE EMERGENCY</span><h2>격리 이탈 경보</h2></div><strong>실시간 임무</strong></div>{game.worldEvents.filter((event) => event.status === 'active').map((event) => <article key={event.id}><div><span>{event.code} · 위험도 {event.severity}</span><h3>{event.name}</h3><p>관리 연속 실패로 개체가 격리 구역을 이탈했습니다. 진압·구조·관측 인력이 필요합니다.</p></div><div className="event-action"><div><span>연구소 대응도</span><strong>{event.progress} / {event.target}</strong></div><i><b style={{ width: `${event.progress}%` }} /></i><button disabled={Boolean(activeMission)} onClick={() => onRespondEvent(event.id)}>{activeMission ? '현재 임무 수행 중' : '대응 임무 참여'}</button></div></article>)}</section>}

      <div className="dashboard-grid">
        <article className="panel mission-live">
          <div className="panel-title"><div><span className="eyebrow">ACTIVE ASSIGNMENT</span><h2>현재 임무</h2></div>{activeMission && <span className="live-badge">● 진행 중</span>}</div>
          {!activeMission ? <div className="empty-state"><Clock3 /><strong>대기 상태</strong><p>현재 수행 중인 임무가 없습니다.</p><button onClick={() => onNavigate('missions')}>임무 선택 <ArrowRight /></button></div> : <>
            <div className="mission-code">{activeMission.code} / {activeMission.type === 'containment' ? '격리 개체 관리' : '단계형 공간 탐사'}</div>
            <h3>{activeMission.name}</h3><p>{activeMission.duration}분 자동 임무 · 위험도 {activeMission.risk}</p>
            <div className="mission-orders"><span>{activeMission.options?.approach === 'cautious' ? '안전 우선' : activeMission.options?.approach === 'assertive' ? '성과 우선' : '표준 절차'}</span><span>{activeMission.options?.partySize ?? 1}인 편성</span><span>철수 {activeMission.options?.retreatThreshold ?? 50}%</span><span>단서 {activeMission.options?.appliedIntel?.length ?? 0}건</span>{activeMission.options?.supply && <span>자동 소비 · {activeMission.options.supply.name}</span>}</div>
            <div className="progress"><i style={{ width: `${missionProgress(activeMission, clock) * 100}%` }} /></div>
            <div className="mission-time"><span>남은 시간</span><strong>{remainingText(activeMission, clock)}</strong></div>
            <button className="primary-action" disabled={!canComplete} onClick={onCompleteMission}>{canComplete ? '완료 보고 확인' : '임무 진행 중'}</button>
          </>}
        </article>

        <article className="panel growth-card"><div className="panel-title"><div><span className="eyebrow">PERSONNEL RECORD</span><h2>성장 기록</h2></div><span>{character.title}</span></div><div className="level"><strong>LV.{character.level}</strong><span>{character.xp} / {character.level * 100} XP</span></div><div className="progress"><i style={{ width: `${character.xp / (character.level * 100) * 100}%` }} /></div><dl><div><dt>사내 등급</dt><dd>{character.rank} / 45</dd></div><div><dt>관리 숙련</dt><dd>{character.skills.containment}</dd></div><div><dt>탐사 숙련</dt><dd>{character.skills.exploration}</dd></div><div><dt>획득 칭호</dt><dd>{character.unlockedTitles.length}</dd></div></dl></article>
      </div>

      <article className="panel reports"><div className="panel-title"><div><span className="eyebrow">AFTER-ACTION</span><h2>최근 완료 보고</h2></div></div>{reports.length === 0 ? <p className="muted">아직 제출된 보고가 없습니다.</p> : reports.slice(0, 4).map((mission) => <div className="report-row" key={mission.id}><span className={mission.report.outcome}>{mission.report.outcome === 'success' ? '성공' : '부분'}</span><div><strong>{mission.name}</strong><small>{mission.report.lines[0]}</small></div><time>{new Date(mission.report.completedAt).toLocaleString('ko-KR')}</time><b>+{mission.report.gains.xp} XP</b></div>)}</article>
    </section>
  )
}

export default Home
