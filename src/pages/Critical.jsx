import { useState } from 'react'
import { AlertTriangle, HeartPulse, Skull, ShieldAlert } from 'lucide-react'
import { BODY_PART_LABELS } from '../game/character.js'
import { RESCUE_COST } from '../game/survival.js'

function Critical({ character, onRescue, onDeath }) {
  const [confirmDeath, setConfirmDeath] = useState(false)
  const state = character.criticalState
  return <main className="critical-screen">
    <section className="critical-card">
      <div className="critical-signal"><ShieldAlert /><span>MEDICAL EMERGENCY / RESPONSE REQUIRED</span></div>
      <p className="eyebrow">SUBJECT STATUS · CRITICAL</p>
      <h1>생체 신호가<br /><em>임계치 아래입니다.</em></h1>
      <p className="critical-copy">미접속 중에는 상태가 더 악화되지 않습니다. 아래 결정을 내릴 때까지 기록은 안전하게 보류됩니다.</p>
      <dl className="critical-facts">
        <div><dt>사고 원인</dt><dd>{state.cause}</dd></div>
        <div><dt>중증 부위</dt><dd>{BODY_PART_LABELS[state.bodyPart] ?? state.bodyPart}</dd></div>
        <div><dt>보유 크레딧</dt><dd>{character.credits} CR</dd></div>
      </dl>
      <div className="critical-options">
        <article>
          <HeartPulse />
          <div><h2>긴급 구조 승인</h2><p>{RESCUE_COST} CR을 우선 징수합니다. 크레딧이 부족해도 구조되지만 잔액은 0이 됩니다. 중증 부위에는 영구 후유증이 남습니다.</p></div>
          <button className="primary-action" onClick={onRescue}>구조 승인 · {RESCUE_COST} CR</button>
        </article>
        <article className="death-option">
          <Skull />
          <div><h2>실험체 기록 종료</h2><p>현재 캐릭터는 영구 사망합니다. 다음 실험체는 핵심 능력 1점, 기록 칭호와 50 CR의 계승 지원을 받습니다.</p></div>
          {!confirmDeath ? <button onClick={() => setConfirmDeath(true)}>사망 절차 검토</button> : <div className="death-confirm"><span><AlertTriangle /> 이 결정은 되돌릴 수 없습니다.</span><button onClick={onDeath}>기록 종료 확정</button><button onClick={() => setConfirmDeath(false)}>취소</button></div>}
        </article>
      </div>
    </section>
  </main>
}

export default Critical
