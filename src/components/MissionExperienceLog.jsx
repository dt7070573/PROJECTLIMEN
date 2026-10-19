import { useEffect, useMemo, useRef } from 'react'
import { visibleMissionExperiences } from '../game/experience.js'

const durationLabel = (minutes) => minutes < 60 ? `${minutes}분` : `${minutes / 60}시간`
const timeLabel = (timestamp) => new Date(timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })

function MissionExperienceLog({ mission, clock }) {
  const scrollRef = useRef(null)
  const visible = useMemo(() => visibleMissionExperiences(mission, clock), [mission, clock])
  const next = mission.experiences?.find((entry) => entry.occursAt > clock)

  useEffect(() => {
    const container = scrollRef.current
    if (container) container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
  }, [visible.length])

  return <section className="experience-console" aria-label="실시간 임무 경험 기록">
    <header>
      <div><h2>{mission.type === 'exploration' ? '탐사 일지' : '관리 일지'}</h2><span>{durationLabel(mission.duration)}</span><span>{mission.name}</span></div>
      <p><i /> {mission.status === 'active' ? '재생 중' : '기록 종료'}</p>
    </header>
    <div className="experience-viewport" ref={scrollRef} aria-live="polite" aria-relevant="additions">
      <div className="experience-spacer" />
      <ol>
        {visible.map((entry, index) => <li className={`${entry.kind} ${index === visible.length - 1 ? 'latest' : ''}`} key={entry.id}>
          <time dateTime={new Date(entry.occursAt).toISOString()}>{timeLabel(entry.occursAt)}</time>
          <p>{entry.text}</p>
        </li>)}
        {!visible.length && <li className="experience-await"><time>--:--</time><p>첫 현장 기록을 기다리는 중이다.</p></li>}
      </ol>
    </div>
    <footer>{next ? <>다음 기록은 현장 상황에 따라 <strong>{timeLabel(next.occursAt)}</strong> 이후 수신됩니다.</> : '현재 임무에서 예정된 현장 기록을 모두 수신했습니다.'}</footer>
  </section>
}

export default MissionExperienceLog
