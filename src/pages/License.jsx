import { ExternalLink, Scale } from 'lucide-react'
import { licenseSections, licenseTexts } from '../data/licenses.js'

function License() {
  return <section className="page-content license-page">
    <div className="page-heading"><div><span className="eyebrow">LEGAL / ATTRIBUTION</span><h1>라이선스와 크레딧</h1><p>PROJECT LIMEN에서 실제 사용하는 외부 글꼴, 아이콘과 오픈소스 소프트웨어를 공개합니다.</p></div><span className="clearance">THIRD-PARTY NOTICES</span></div>
    {licenseSections.map((section, index) => <section className="license-section" key={section.id}><header><span>{String(index + 1).padStart(2, '0')}</span><div><h2>{section.title}</h2><p>{section.description}</p></div></header><div className="license-list">{section.entries.map((entry) => <article key={entry.name}><div className="license-name"><Scale /><div><h3>{entry.name}</h3><span>{entry.holder} · {entry.license}</span></div></div><p>{entry.notice}</p><p className="license-modification">{entry.modification}</p><footer><a href={entry.source} target="_blank" rel="noreferrer">출처 <ExternalLink /></a><a href={entry.licenseUrl} target="_blank" rel="noreferrer">라이선스 원문 <ExternalLink /></a></footer></article>)}</div></section>)}
    <section className="license-section license-texts"><header><span>04</span><div><h2>라이선스 안내</h2><p>아래 요약은 이해를 돕기 위한 것이며, 정확한 조건은 연결된 원문이 우선합니다.</p></div></header><div>{licenseTexts.map((entry) => <details key={entry.short}><summary><strong>{entry.name}</strong><span>{entry.short}</span></summary><p>{entry.summary}</p><a href={entry.url} target="_blank" rel="noreferrer">공식 라이선스 원문 보기 <ExternalLink /></a></details>)}</div></section>
    <p className="license-scope">외부 배경음·환경음·스톡 이미지는 현재 사용하지 않습니다. 사용자가 직접 업로드한 프로필 이미지는 외부로 전송하지 않으며 해당 이미지의 이용 권리는 업로드한 사용자에게 있습니다.</p>
  </section>
}

export default License
