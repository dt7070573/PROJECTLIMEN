# Design QA

## Evidence

- Source visual truth: `/var/folders/pr/br805gh17t98hpnd8rzhqw2r0000gn/T/codex-clipboard-7bc928b4-731a-4efc-8291-450449a837ab.png`
- Implementation screenshot: `.codex-qa/implementation-orange-pass2.png`
- Combined comparison: `.codex-qa/reference-vs-implementation-pass2.png`
- Source pixels: 1200 × 882
- Implementation pixels: 1200 × 882
- CSS viewport: 1200 × 882
- Device scale factor: 1
- State: 공동 이상구역, 첫 번째 구역 선택, 진입 설정 표시

## Full-view comparison

두 화면을 같은 크기로 나란히 비교했다. 구현 화면은 레퍼런스의 검정 프레임, 차콜 패널, 낮은 채도의 회색 정보층, 가는 직선 테두리와 조밀한 관제 화면 비율을 따른다. 레퍼런스의 도시 3D 지도 대신 게임 기능에 필요한 이상구역 노드 지도를 유지했으며, 선택·활성 상태는 사용자가 지정한 오렌지레드로 통일했다.

## Focused comparison

- Fonts and typography: Geist의 좁고 단단한 인상을 유지했다. 페이지 제목 외의 작은 영문 장식 문구는 전부 비표시 처리했다. 정보 코드와 수치만 작은 고정폭 스타일을 유지한다.
- Spacing and layout rhythm: 좌측 고정 탐색, 상단 상태 바, 중앙 구역 목록, 우측 지도와 설정이라는 고밀도 관제 구조를 유지한다. 1200px 화면에서 우측 패널 잘림이 발생한 초기 문제를 열 비율 축소로 수정했다.
- Colors and visual tokens: 배경 `#0b0b0c`, 패널 `#151516`, 보조 패널 `#1c1c1e`, 선 `#343436`, 강조 `#f0522c`를 사용한다. 강조색은 선택·활성·위험과 주요 행동에 제한한다.
- Image quality and asset fidelity: 레퍼런스의 도시 지도 이미지는 제품 고유 콘텐츠이므로 복제하지 않았다. LIMEN의 노드 지도는 기존 기능을 보존하며 동일한 명암과 관제 화면 밀도로 조정했다.
- Copy and content: PROJECT LIMEN의 한국어 기능명, 이상구역 데이터와 탐사 설정을 유지했다. 제목 위 영어 장식 문구는 화면에서 제거했다.

## Findings

- P0/P1/P2: 남은 문제 없음.
- P3: 레퍼런스는 사진 기반 도시 지도에서 더 강한 공간적 깊이를 만든다. LIMEN에서는 이상구역별 전용 지도 에셋이 준비되면 배경 레이어로 확장할 수 있다.

## Interaction and responsive checks

- 공동 이상구역 이동, 구역 선택, 노드 지도 표시와 진입 설정 노출을 확인했다.
- 데스크톱 1200 × 882와 모바일 390 × 844 화면을 확인했다.
- 모바일 하단 탐색의 잘림과 데스크톱 우측 패널의 가로 잘림을 수정했다.
- 브라우저 콘솔 오류 없음.
- 콘텐츠 검증, ESLint와 프로덕션 빌드 통과.

## Comparison history

- Pass 1: 1200px 화면에서 구역 목록과 상세 패널 최소 너비 합계가 가용 폭을 초과해 우측 위험도와 설정 일부가 잘렸다.
- Fix: 공동 이상구역의 열 최소 너비를 420/560px에서 340/460px로 낮추고 목록 메타데이터 열을 압축했다.
- Pass 2: 같은 1200 × 882 상태에서 두 패널이 모두 가시 영역 안에 들어오며, 영문 장식 문구 제거와 오렌지레드 강조 상태가 확인됐다.

final result: passed
