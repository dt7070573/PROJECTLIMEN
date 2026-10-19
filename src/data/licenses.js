export const licenseSections = [
  { id: 'fonts', title: '글꼴', description: '이 게임은 다음 글꼴을 SIL Open Font License 1.1 조건으로 자체 서빙합니다.', entries: [{ name: 'Geist Variable', holder: 'The Geist Project Authors', license: 'SIL Open Font License 1.1', notice: 'Geist variable font files are provided through Fontsource. Copyright 2024 The Geist Project Authors.', modification: '수정하지 않음 · @fontsource-variable/geist 패키지의 WOFF2 서브셋을 자체 호스팅', source: 'https://github.com/vercel/geist-font', licenseUrl: 'https://openfontlicense.org/open-font-license-official-text/' }] },
  { id: 'icons', title: '아이콘', description: '인터페이스 아이콘은 lucide-react를 통해 SVG 요소로 렌더링합니다.', entries: [{ name: 'Lucide Icons', holder: 'Lucide Icons and Contributors', license: 'ISC License · 일부 Feather 파생 아이콘은 MIT License', notice: 'Copyright 2026 Lucide Icons and Contributors. Feather-derived icons copyright 2013–present Cole Bemis.', modification: '수정하지 않음 · React 컴포넌트로 필요한 아이콘만 번들링', source: 'https://lucide.dev/', licenseUrl: 'https://lucide.dev/license' }] },
  { id: 'software', title: '오픈소스 소프트웨어', description: '브라우저에서 실행되는 핵심 UI 런타임입니다.', entries: [{ name: 'React · React DOM · Scheduler', holder: 'Meta Platforms, Inc. and affiliates', license: 'MIT License', notice: 'React 19.2.8, React DOM 19.2.8 and Scheduler 0.27.0 are distributed under the MIT License.', modification: '라이브러리 원본 수정 없음', source: 'https://react.dev/', licenseUrl: 'https://github.com/facebook/react/blob/main/LICENSE' }] },
]

export const licenseTexts = [
  { name: 'SIL Open Font License 1.1', short: 'OFL 1.1', url: 'https://openfontlicense.org/open-font-license-official-text/', summary: '글꼴 소프트웨어를 자유롭게 사용·연구·수정·재배포할 수 있으며, 글꼴 자체만 단독 판매할 수 없습니다. 배포 시 저작권 고지와 라이선스를 포함해야 합니다.' },
  { name: 'ISC License', short: 'ISC', url: 'https://lucide.dev/license', summary: '저작권 고지와 허가 문구를 모든 사본에 포함하는 조건으로 사용·복사·수정·배포할 수 있습니다.' },
  { name: 'MIT License', short: 'MIT', url: 'https://opensource.org/license/mit', summary: '저작권 및 허가 고지를 포함하는 조건으로 소프트웨어를 제한 없이 사용·복사·수정·배포할 수 있습니다.' },
]
