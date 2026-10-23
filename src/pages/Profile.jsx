import bodySilhouette from '../assets/limen-body-silhouette.png'
import { BODY_PART_LABELS, BODY_TYPES, GENDERS, STAT_LABELS } from '../game/character.js'
import { titles } from '../data/contracts/contentAdapter.js'
import { TREATMENTS } from '../game/systems.js'
import { getInnerVoices } from '../game/psyche.js'

const ANOMALY_LABELS = { biologicalIntegrity: '생체 무결성', cognitiveStability: '인지 안정성', memoryContinuity: '기억 연속성', identityCohesion: '정체성 응집도', temporalSync: '시간 동기율', informationContamination: '정보 오염도', entityResonance: '개체 동조도', realityAnchor: '현실 고정도' }
const BODY_LAYOUT = [['head', 'leftArm', 'leftLeg'], ['torso', 'rightArm', 'rightLeg']]

function Gauge({ label, value, inverse = false }) {
  const safe = inverse ? value < 30 : value >= 70
  return <div className="gauge"><div><span>{label}</span><strong>{value}%</strong></div><i><b className={safe ? '' : 'danger'} style={{ width: `${value}%` }} /></i></div>
}

function BodyCallout({ id, part, side }) {
  return <div className={`body-callout ${side} ${part.integrity < 55 ? 'injured' : ''}`}>
    <div><span>{BODY_PART_LABELS[id]}</span><strong>{part.integrity}%</strong></div>
    <i><b style={{ width: `${part.integrity}%` }} /></i>
    <small>{part.permanent ? '영구 후유증' : part.injury ?? '이상 없음'}</small>
  </div>
}

function Profile({ game, onTreat, onSelectTitle }) {
  const { character } = game
  const innerVoices = getInnerVoices(character)
  const bodyParts = character.condition.bodyParts

  return <section className="page-content profile-page">
    <div className="page-heading"><div><span className="eyebrow">SUBJECT MEDICAL RECORD</span><h1>상태 기록</h1><p>신체·정신·이상현상 노출 상태를 검토합니다.</p></div><span className="clearance">{character.id.toUpperCase()}</span></div>

    <article className="panel profile-overview">
      <div className="identity-card">
        {character.portrait ? <img src={character.portrait} alt="" /> : <div className="portrait-placeholder">NO IMAGE</div>}
        <div className="identity-copy"><h2>{character.name}</h2><p>{GENDERS.find((item) => item.id === character.gender)?.label} · {BODY_TYPES.find((item) => item.id === character.bodyType)?.label} 체격</p><dl><div><dt>신장</dt><dd>{character.height} cm</dd></div><div><dt>체중</dt><dd>{character.weight} kg</dd></div><div><dt>칭호</dt><dd>{character.title}</dd></div></dl></div>
      </div>
      <div className="vital-summary">
        <div className="panel-title"><h2>신체·정신 상태</h2></div>
        <Gauge label="신체 기능" value={character.condition.physical} />
        <Gauge label="정신 안정" value={character.condition.mental} />
        <Gauge label="피로" value={character.condition.fatigue} inverse />
        {character.condition.effects.length ? <div className="effects">{character.condition.effects.map((effect) => <span key={effect.id}>{effect.name} · {effect.severity}단계</span>)}</div> : <p className="muted">활성 상태 이상 없음</p>}
      </div>
    </article>

    <article className="panel body-visual-panel">
      <div className="panel-title"><h2>신체 부위별 기능</h2></div>
      <div className="body-diagnostic">
        <div className="body-callout-column left">{BODY_LAYOUT[0].map((id) => <BodyCallout key={id} id={id} part={bodyParts[id]} side="left" />)}</div>
        <div className="body-figure"><img src={bodySilhouette} alt="전신 신체 상태 진단 실루엣" /></div>
        <div className="body-callout-column right">{BODY_LAYOUT[1].map((id) => <BodyCallout key={id} id={id} part={bodyParts[id]} side="right" />)}</div>
      </div>
    </article>

    <article className="panel stats-panel basic-attributes-panel">
      <div className="panel-title"><h2>기초 능력</h2></div>
      <div>{Object.entries(character.stats).map(([key, value]) => <p key={key}><span>{STAT_LABELS[key]}</span><strong>{value}</strong><i><b style={{ width: `${value * 10}%` }} /></i></p>)}</div>
    </article>

    <article className="panel anomaly-panel"><div className="panel-title"><h2>이상 건강 지표</h2></div><div className="anomaly-grid">{Object.entries(character.condition.anomaly).map(([key, value]) => <Gauge key={key} label={ANOMALY_LABELS[key]} value={value} inverse={key === 'informationContamination' || key === 'entityResonance'} />)}</div></article>
    <article className="panel psyche-panel"><div className="panel-title"><h2>내면 발화</h2><span>정신 압력에 따라 편향됨</span></div><div className="voice-grid">{innerVoices.map((voice) => <blockquote className={voice.intrusive ? 'intrusive' : ''} key={voice.id}><div><strong>{voice.name}</strong><span>{STAT_LABELS[voice.stat]} {voice.value}</span></div><p>“{voice.message}”</p>{voice.intrusive && <small>과잉 개입</small>}</blockquote>)}</div></article>
    <div className="condition-actions"><article className="panel"><div className="panel-title"><h2>치료 신청</h2><span>{character.credits} CR</span></div>{game.activeMission && <p className="field-error">임무 진행 중에는 치료할 수 없습니다.</p>}<div className="treatment-list">{TREATMENTS.map((treatment) => { const unavailable = (treatment.id === 'effects' && character.condition.effects.length === 0) || (treatment.id === 'physical' && character.condition.physical >= 100) || (treatment.id === 'mental' && character.condition.mental >= 100) || (treatment.id === 'fatigue' && character.condition.fatigue <= 0); return <div key={treatment.id}><div><strong>{treatment.name}</strong><small>{treatment.description}</small></div><button disabled={Boolean(game.activeMission) || unavailable || character.credits < treatment.cost} onClick={() => onTreat(treatment.id)}>{unavailable ? '치료 불필요' : `${treatment.cost} CR`}</button></div> })}</div></article>
      <article className="panel"><div className="panel-title"><h2>획득 칭호</h2><span>{character.unlockedTitles.length}개</span></div><div className="title-list">{titles.filter((title) => character.unlockedTitles.includes(title.name)).map((title) => <button className={character.title === title.name ? 'active' : ''} key={title.id} onClick={() => onSelectTitle(title.name)}><strong>{title.name}</strong><small>{title.description ?? '획득한 공식 칭호'}</small><span>{character.title === title.name ? '활성' : '선택'}</span></button>)}</div></article></div>
  </section>
}

export default Profile
