import { BODY_TYPES, GENDERS, STAT_LABELS } from '../game/character.js'

const ANOMALY_LABELS = { biologicalIntegrity: '생체 무결성', cognitiveStability: '인지 안정성', memoryContinuity: '기억 연속성', identityCohesion: '정체성 응집도', temporalSync: '시간 동기율', informationContamination: '정보 오염도', entityResonance: '개체 동조도', realityAnchor: '현실 고정도' }

function Gauge({ label, value, inverse = false }) {
  const safe = inverse ? value < 30 : value >= 70
  return <div className="gauge"><div><span>{label}</span><strong>{value}%</strong></div><i><b className={safe ? '' : 'danger'} style={{ width: `${value}%` }} /></i></div>
}

function Profile({ game }) {
  const { character } = game
  return <section className="page-content"><div className="page-heading"><div><span className="eyebrow">SUBJECT MEDICAL RECORD</span><h1>상태 기록</h1><p>신체·정신·이상현상 노출 상태를 검토합니다.</p></div><span className="clearance">{character.id.toUpperCase()}</span></div>
    <div className="profile-grid"><article className="panel identity-card">{character.portrait ? <img src={character.portrait} alt="" /> : <div className="portrait-placeholder">NO IMAGE</div>}<span className="eyebrow">ACTIVE SUBJECT</span><h2>{character.name}</h2><p>{GENDERS.find((item) => item.id === character.gender)?.label} · {BODY_TYPES.find((item) => item.id === character.bodyType)?.label} 체격</p><dl><div><dt>신장</dt><dd>{character.height} cm</dd></div><div><dt>체중</dt><dd>{character.weight} kg</dd></div><div><dt>칭호</dt><dd>{character.title}</dd></div></dl></article>
      <article className="panel"><div className="panel-title"><div><span className="eyebrow">VITAL CONDITION</span><h2>신체·정신 상태</h2></div></div><Gauge label="신체 기능" value={character.condition.physical} /><Gauge label="정신 안정" value={character.condition.mental} /><Gauge label="피로" value={character.condition.fatigue} inverse />{character.condition.effects.length ? <div className="effects">{character.condition.effects.map((effect) => <span key={effect.id}>{effect.name} · {effect.severity}단계</span>)}</div> : <p className="muted">활성 상태 이상 없음</p>}</article>
      <article className="panel stats-panel"><div className="panel-title"><div><span className="eyebrow">BASE ATTRIBUTES</span><h2>기초 능력</h2></div></div><div>{Object.entries(character.stats).map(([key, value]) => <p key={key}><span>{STAT_LABELS[key]}</span><strong>{value}</strong><i><b style={{ width: `${value * 10}%` }} /></i></p>)}</div></article>
    </div>
    <article className="panel anomaly-panel"><div className="panel-title"><div><span className="eyebrow">LIMINAL INTEGRITY</span><h2>이상 건강 지표</h2></div></div><div className="anomaly-grid">{Object.entries(character.condition.anomaly).map(([key, value]) => <Gauge key={key} label={ANOMALY_LABELS[key]} value={value} inverse={key === 'informationContamination' || key === 'entityResonance'} />)}</div></article>
  </section>
}

export default Profile
