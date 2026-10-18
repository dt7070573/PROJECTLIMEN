import { useMemo, useRef, useState } from 'react'
import { Camera, ChevronRight, Dna, ShieldCheck, Upload, UserRound } from 'lucide-react'
import { BODY_TYPES, deriveStats, GENDERS, STAT_LABELS, validateCharacterDraft } from '../game/character.js'

const MAX_IMAGE_BYTES = 2 * 1024 * 1024

function CharacterCreator({ onComplete, legacy }) {
  const inputRef = useRef(null)
  const [draft, setDraft] = useState({ name: '', gender: '', bodyType: 'balanced', height: 170, weight: 65, portrait: null })
  const [errors, setErrors] = useState({})
  const stats = useMemo(() => deriveStats(draft), [draft])
  const update = (key, value) => setDraft((current) => ({ ...current, [key]: value }))

  const readImage = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) return setErrors((current) => ({ ...current, portrait: '이미지 형식만 업로드할 수 있습니다.' }))
    if (file.size > MAX_IMAGE_BYTES) return setErrors((current) => ({ ...current, portrait: '이미지는 2MB 이하여야 합니다.' }))
    const reader = new FileReader()
    reader.onload = () => { update('portrait', reader.result); setErrors((current) => ({ ...current, portrait: null })) }
    reader.onerror = () => setErrors((current) => ({ ...current, portrait: '이미지를 읽을 수 없습니다.' }))
    reader.readAsDataURL(file)
  }

  const submit = (event) => {
    event.preventDefault()
    const nextErrors = validateCharacterDraft(draft)
    setErrors(nextErrors)
    if (!Object.keys(nextErrors).length) onComplete(draft)
  }

  return (
    <main className="onboarding">
      <section className="onboarding-intro">
        <div className="brand large"><Dna /> PROJECT LIMEN</div><p className="eyebrow">SUBJECT REGISTRATION / 01</p>
        <h1>경계 너머로<br />투입될 실험체를<br /><em>등록하십시오.</em></h1>
        <p>생존 캐릭터는 한 번에 한 명만 운용할 수 있습니다. 신체 정보는 초기 능력과 임무 적합도에 반영됩니다.</p>
        {legacy && <div className="legacy-note"><strong>기록 계승 · 제 {legacy.generation + 1} 실험체</strong><span>{legacy.previousName}의 {STAT_LABELS[legacy.inheritedStat]} +1 · 지원금 50 CR · 기록 칭호 보존</span></div>}
        <div className="security-note"><ShieldCheck /><div><strong>로컬 보안 저장</strong><span>업로드 이미지는 외부로 전송되지 않으며 이 브라우저에만 저장됩니다.</span></div></div>
      </section>
      <form className="creator-card" onSubmit={submit}>
        <div className="form-heading"><div><span>SUBJECT PROFILE</span><h2>기초 신원 등록</h2></div><b>01 / 01</b></div>
        <div className="portrait-row">
          <button type="button" className="portrait-upload" onClick={() => inputRef.current?.click()}>{draft.portrait ? <img src={draft.portrait} alt="프로필 미리보기" /> : <><UserRound /><span><Upload size={14} /> 이미지 선택</span></>}</button>
          <div><strong>프로필 이미지</strong><p>JPG, PNG, WEBP 등 이미지 형식 · 최대 2MB</p><button type="button" className="text-button" onClick={() => inputRef.current?.click()}><Camera size={15} /> 파일 찾아보기</button></div>
          <input ref={inputRef} hidden type="file" accept="image/*" onChange={(event) => readImage(event.target.files?.[0])} />
        </div>
        {errors.portrait && <p className="field-error">{errors.portrait}</p>}
        <label>식별명<input value={draft.name} maxLength={16} placeholder="1~16자" onChange={(event) => update('name', event.target.value)} /></label>
        {errors.name && <p className="field-error">{errors.name}</p>}
        <fieldset><legend>성별</legend><div className="choice-grid">{GENDERS.map((item) => <button type="button" className={draft.gender === item.id ? 'selected' : ''} key={item.id} onClick={() => update('gender', item.id)}>{item.label}</button>)}</div></fieldset>
        {errors.gender && <p className="field-error">{errors.gender}</p>}
        <fieldset><legend>체격</legend><div className="body-grid">{BODY_TYPES.map((item) => <button type="button" className={draft.bodyType === item.id ? 'selected' : ''} key={item.id} onClick={() => update('bodyType', item.id)}><strong>{item.label}</strong><span>{item.description}</span></button>)}</div></fieldset>
        <div className="measure-grid"><label>신장 (cm)<input type="number" min="140" max="210" value={draft.height} onChange={(event) => update('height', event.target.value)} /></label><label>체중 (kg)<input type="number" min="35" max="160" value={draft.weight} onChange={(event) => update('weight', event.target.value)} /></label></div>
        <div className="stat-preview"><span>예상 기초 능력</span><div>{Object.entries(stats).map(([key, value]) => <p key={key}><small>{STAT_LABELS[key]}</small><strong>{value}</strong></p>)}</div></div>
        <button className="primary-action" type="submit">실험체 등록 완료 <ChevronRight /></button>
      </form>
    </main>
  )
}

export default CharacterCreator
