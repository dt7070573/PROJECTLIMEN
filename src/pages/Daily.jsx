import { useMemo, useState } from 'react'
import { AlertTriangle, Clock3, LockKeyhole, Radio, Route, Search, Signal, UserRound, Users } from 'lucide-react'
import { missionCatalog } from '../data/contracts/contentAdapter.js'
import { storeItems } from '../data/contracts/systemAdapter.js'

const ZONE_STATES = ['안정', '관측 중', '교전 흔적', '신호 감지']

function Daily({ game, onStartMission }) {
  const [selection, setSelection] = useState(null)
  const [duration, setDuration] = useState(30)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [risk, setRisk] = useState('all')
  const [approach, setApproach] = useState('standard')
  const [retreatThreshold, setRetreatThreshold] = useState(50)
  const [applyIntel, setApplyIntel] = useState(true)
  const [partySize, setPartySize] = useState(1)
  const [supplyItemId, setSupplyItemId] = useState('')

  const zones = useMemo(() => missionCatalog.filter((item) => {
    const needle = query.trim().toLocaleLowerCase('ko-KR')
    const matchesQuery = !needle || `${item.code} ${item.name} ${item.summary}`.toLocaleLowerCase('ko-KR').includes(needle)
    const matchesRisk = risk === 'all' || item.risk === Number(risk)
    return item.type === 'exploration' && matchesQuery && matchesRisk
  }), [query, risk])

  const select = (mission) => {
    setSelection(mission)
    setDuration(mission.durations[0])
    setApproach('standard')
    setRetreatThreshold(50)
    setApplyIntel(true)
    setPartySize(1)
    setSupplyItemId('')
    setError('')
  }

  const knownIntel = selection?.intel.filter((clue) => game.discoveredIntel.includes(clue)) ?? []
  const availableSupplies = storeItems.filter((item) => item.type === 'consumable' && game.character.inventory?.some((owned) => owned.itemId === item.id && owned.quantity > 0))
  const start = () => {
    try { onStartMission(selection, duration, { approach, retreatThreshold, partySize, supplyItemId, appliedIntel: applyIntel ? knownIntel : [] }) } catch (reason) { setError(reason.message) }
  }

  return <section className="page-content shared-zone-page">
    <div className="page-heading compact-heading">
      <div><span className="eyebrow">SHARED ANOMALOUS ZONES</span><h1>공동 이상구역</h1></div>
      <div className="zone-network"><span><i /> 3개 구역 활성</span><strong>27</strong><small>탐사자</small></div>
    </div>

    {game.activeMission && <div className="warning"><AlertTriangle /> 현재 탐사 진행 중</div>}

    <div className="zone-toolbar">
      <label><Search /><input aria-label="이상구역 검색" placeholder="구역 검색" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
      <select aria-label="위험도 필터" value={risk} onChange={(event) => setRisk(event.target.value)}><option value="all">RISK 전체</option>{[1, 2, 3, 4, 5].map((value) => <option value={value} key={value}>RISK {value}</option>)}</select>
      <span>{zones.length} ZONES</span>
    </div>

    <div className="zone-workspace">
      <div className="zone-directory">
        {zones.map((zone, index) => {
          const locked = game.character.rank < zone.minRank
          const explorers = ((index + 2) * (zone.risk + 1)) % 9
          return <button key={zone.id} className={`zone-row ${selection?.id === zone.id ? 'selected' : ''}`} onClick={() => select(zone)}>
            <span className="zone-index">{String(index + 1).padStart(2, '0')}</span>
            <span className="zone-identity"><small>{zone.code}</small><strong>{zone.name}</strong></span>
            <span className="zone-signal"><Signal />{ZONE_STATES[index % ZONE_STATES.length]}</span>
            <span className="zone-population"><Users />{explorers}</span>
            <span className={`risk risk-${zone.risk}`}>R{zone.risk}</span>
            {locked && <LockKeyhole className="zone-lock" />}
          </button>
        })}
      </div>

      <aside className="zone-console">
        {!selection ? <div className="zone-placeholder"><Route /><strong>구역을 선택하십시오</strong><div className="node-preview"><i /><i /><i /><i /><i /></div></div> : <>
          <header className="zone-brief">
            <div><span className="eyebrow">{selection.code}</span><h2>{selection.name}</h2></div>
            <span className={`risk risk-${selection.risk}`}>RISK {selection.risk}</span>
          </header>

          <div className="zone-map" aria-label="이상구역 노드 지도">
            <span className="map-line line-a" /><span className="map-line line-b" /><span className="map-line line-c" />
            <div className="map-node entry"><i /><b>진입점</b><small>YOU</small></div>
            <div className="map-node trace"><i /><b>흔적</b><small>12분 전</small></div>
            <div className="map-node signal"><i /><b>구조 신호</b><small>2명</small></div>
            <div className="map-node depth"><i /><b>심층부</b><small>RISK {selection.risk}</small></div>
          </div>

          <div className="zone-facts">
            <div><span>최우선 규칙</span><strong>{selection.primaryRule}</strong></div>
            <div><span>위험</span><p>{selection.hazards.map((item) => <b key={item}>{item}</b>)}</p></div>
            <div><span>정보</span>{knownIntel.length ? <label><input type="checkbox" checked={applyIntel} onChange={(event) => setApplyIntel(event.target.checked)} /><strong>{knownIntel.length}건 적용</strong></label> : <strong>미확인</strong>}</div>
          </div>

          <div className="deployment-grid">
            <fieldset><legend>진입 단위</legend><div className="unit-choice">{[[1, UserRound], [2, Users]].map(([value, Icon]) => <button className={partySize === value ? 'selected' : ''} onClick={() => setPartySize(value)} key={value}><Icon /><strong>{value}인</strong></button>)}</div></fieldset>
            <fieldset><legend>행동 방침</legend><div className="segmented">{[['cautious', '안전'], ['standard', '표준'], ['assertive', '성과']].map(([id, label]) => <button className={approach === id ? 'selected' : ''} key={id} onClick={() => setApproach(id)}>{label}</button>)}</div></fieldset>
            <fieldset><legend>자동 철수</legend><select value={retreatThreshold} onChange={(event) => setRetreatThreshold(Number(event.target.value))}><option value="70">신체 70%</option><option value="50">신체 50%</option><option value="30">신체 30%</option></select></fieldset>
            <fieldset><legend>예약 물자</legend><select value={supplyItemId} onChange={(event) => setSupplyItemId(event.target.value)}><option value="">없음</option>{availableSupplies.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></fieldset>
          </div>

          <div className="deploy-footer">
            <div className="duration-strip">{selection.durations.map((item) => <button className={duration === item ? 'selected' : ''} key={item} onClick={() => setDuration(item)}><Clock3 />{item < 60 ? `${item}분` : `${item / 60}시간`}</button>)}</div>
            <button className="primary-action" disabled={Boolean(game.activeMission) || game.character.rank < selection.minRank} onClick={start}><Radio /> 공동구역 진입</button>
          </div>
          {error && <p className="field-error">{error}</p>}
        </>}
      </aside>
    </div>
  </section>
}

export default Daily
