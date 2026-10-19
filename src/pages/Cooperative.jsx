import { Clock3, FastForward, Radio, ShieldCheck, UserPlus } from 'lucide-react'
import MissionExperienceLog from '../components/MissionExperienceLog.jsx'
import { cooperativeNow, getCooperativeMission, pendingCooperativeDecision } from '../game/cooperativeMission.js'
import './Cooperative.css'

const time = (value) => new Date(value).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })

function Cooperative({ game, clock, onCreateLobby, onRole, onPolicy, onFillBots, onLaunch, onAdvance, onDecision, onComplete, onReset }) {
  const mission = getCooperativeMission()
  const lobby = game.cooperativeLobby
  const run = game.cooperativeRun
  const simulatedClock = run ? cooperativeNow(run, clock) : clock
  const decision = run?.status === 'active' ? pendingCooperativeDecision(run, clock) : null
  const canFinishNormally = Boolean(run?.status === 'active' && simulatedClock >= run.completesAt && run.decisionResults.length === run.decisions.length)
  const occupiedRoles = new Set(lobby?.members.map((member) => member.roleId) ?? [])

  return <section className="page-content cooperative-page">
    <div className="page-heading"><div><span className="eyebrow">JOINT OPERATION / LOCAL AUTHORITY SIMULATION</span><h1>공동 임무</h1><p>네 명의 판단이 서로의 생존과 이후 관계 기록에 남습니다.</p></div><span className="clearance">4 / 4 REQUIRED</span></div>

    {!lobby && !run && <div className="coop-intro panel">
      <div><span className="eyebrow">{mission.code} · RISK {mission.risk}</span><h2>{mission.name}</h2><p>{mission.summary}</p><blockquote>{mission.primaryRule}</blockquote></div>
      <dl><div><dt>정원</dt><dd>정확히 4명</dd></div><div><dt>소요 시간</dt><dd>{mission.durationMinutes}분</dd></div><div><dt>입장 등급</dt><dd>RANK {mission.minRank}</dd></div></dl>
      <button className="primary-action" disabled={Boolean(game.activeMission) || game.character.rank < mission.minRank} onClick={() => onCreateLobby(false)}>{game.character.rank < mission.minRank ? `RANK ${mission.minRank} 필요` : '모집방 생성'}</button>
      {game.character.rank < mission.minRank && <button className="dev-entry" disabled={Boolean(game.activeMission)} onClick={() => onCreateLobby(true)}>DEV · 등급 제한 없이 테스트 모집방 생성</button>}
      <p className="dev-note">서버 없이도 개발자 모드에서 나머지 세 자리를 시뮬레이션 참가자로 채울 수 있습니다.</p>
    </div>}

    {lobby && <div className="coop-grid">
      <article className="panel coop-roster"><div className="panel-title"><div><span className="eyebrow">RECRUITING ROOM</span><h2>참가자 모집</h2></div><strong>{lobby.members.length} / 4</strong></div>
        <div className="roster-list">{[0, 1, 2, 3].map((index) => { const member = lobby.members[index]; const role = member && mission.roles.find((entry) => entry.id === member.roleId); return <div className={member ? 'filled' : ''} key={index}>{member ? <><span>{member.isPlayer ? 'YOU' : member.simulated ? 'SIM' : 'USER'}</span><strong>{member.name}</strong><small>{role?.name}</small></> : <><UserPlus /><strong>모집 중</strong><small>대기 슬롯</small></>}</div> })}</div>
        <div className="developer-box"><span>LOCAL TEST HARNESS</span><p>가상 참가자는 실제 플레이어와 같은 역할 슬롯·사건·관계 판정을 사용합니다.</p><button disabled={lobby.members.length >= 4} onClick={onFillBots}>DEV · 시뮬레이션 참가자 채우기</button></div>
      </article>

      <article className="panel coop-settings"><div className="panel-title"><div><span className="eyebrow">PRE-MISSION COMMITMENT</span><h2>역할과 사전 방침</h2></div></div>
        <h3>내 역할</h3><div className="role-grid">{mission.roles.map((role) => { const selected = lobby.members.find((member) => member.isPlayer)?.roleId === role.id; const unavailable = occupiedRoles.has(role.id) && !selected; return <button className={selected ? 'selected' : ''} disabled={unavailable} onClick={() => onRole(role.id)} key={role.id}><strong>{role.name}</strong><small>{role.responsibility}</small></button> })}</div>
        <h3>자동 대응 방침</h3><div className="policy-list">{mission.preMissionPolicies.map((policy) => <label key={policy.id}><span><strong>{policy.label}</strong><small>미접속 시에도 적용</small></span><select value={lobby.policies[policy.id]} onChange={(event) => onPolicy(policy.id, event.target.value)}>{policy.options.map((option) => <option value={option.id} key={option.id}>{option.label}</option>)}</select></label>)}</div>
        <button className="primary-action" disabled={lobby.members.length !== 4} onClick={onLaunch}>{lobby.members.length === 4 ? '4인 동시 출발' : `${4 - lobby.members.length}명 대기 중`}</button>
      </article>
    </div>}

    {run && <>
      <div className="coop-status panel"><div><span className="eyebrow">SHARED INSTANCE · {run.code}</span><h2>{run.name}</h2><p><Radio /> 네 참가자가 동일한 사건 시각과 결과를 공유하고 있습니다.</p></div><div><span>인스턴스 시각</span><strong>{time(simulatedClock)}</strong><small>종료 {time(run.completesAt)}</small></div></div>
      <div className="active-roster">{run.members.map((member) => { const role = mission.roles.find((entry) => entry.id === member.roleId); const relation = game.relationships?.[member.id]; return <article key={member.id}><span>{role.shortName}</span><strong>{member.name}</strong><small>{member.isPlayer ? '내 캐릭터' : `신뢰 ${relation?.trust ?? 0} · 마찰 ${relation?.friction ?? 0}`}</small></article> })}</div>
      {decision && <section className="coop-decision"><span>RESPONSE REQUIRED</span><h2>{decision.title}</h2><p>{decision.prompt}</p><div>{decision.options.map((option) => <button key={option.id} onClick={() => onDecision(decision.id, option.id)}><strong>{option.label}</strong><small>이 선택은 상태와 관계 근거에 기록됩니다.</small></button>)}</div></section>}
      <MissionExperienceLog mission={run} clock={simulatedClock} />
      {run.status === 'active' && <><button className="primary-action" disabled={!canFinishNormally} onClick={() => onComplete(false)}>{canFinishNormally ? '공동 임무 완료 보고 확인' : '종료 시각과 필수 결정을 기다리는 중'}</button><details className="developer-tools coop-dev" open><summary>개발자용 공동 임무 제어</summary><p>실제 서버 시계 대신 이 인스턴스의 시각만 이동합니다. 즉시 종료는 미결정 사건에 첫 번째 안전 행동을 적용하고 모든 로그·보상·관계를 정상 반영합니다.</p><div><button onClick={() => onAdvance('next')}><FastForward /> 다음 사건까지 진행</button><button onClick={() => onAdvance('complete')}><Clock3 /> 종료 시각까지 진행</button><button onClick={() => onComplete(true)}><ShieldCheck /> DEV · 안전 기본값으로 즉시 완료</button></div></details></>}
      {run.status === 'completed' && <section className="coop-complete panel"><h2>공동 임무 기록 완료</h2><p>{run.report.headline}</p><div>{Object.values(game.relationships ?? {}).map((relation) => <article key={relation.characterId}><strong>{relation.name}</strong><span>공동 임무 {relation.sharedMissions}회</span><span>친숙 {relation.familiarity}</span><span>신뢰 {relation.trust}</span><span>부채 {relation.debt}</span><span>마찰 {relation.friction}</span></article>)}</div><button onClick={onReset}>완료 기록을 닫고 다시 테스트</button></section>}
    </>}
  </section>
}

export default Cooperative
