const voices = [
  { id: 'analyst', name: '분석관', stat: 'analysis', line: '보고서의 모순을 먼저 찾아. 위험은 대개 누락된 한 줄에 숨어 있어.', excess: '모든 것을 규칙으로 만들려는 집착이 사람의 말을 잡음으로 취급한다.' },
  { id: 'watcher', name: '감시자', stat: 'perception', line: '바뀐 것은 작아. 조명, 발자국, 숨소리. 작은 차이를 놓치지 마.', excess: '의미 없는 변화까지 위협으로 해석해 긴장을 풀지 못한다.' },
  { id: 'survivor', name: '생존 본능', stat: 'will', line: '돌아오는 것이 임무다. 명예도 보상도 살아 있는 다음에 고르면 돼.', excess: '철수해야 할 이유만 끝없이 만들어 기회를 버리게 한다.' },
  { id: 'liaison', name: '연결자', stat: 'empathy', line: '저 사람의 침묵도 정보야. 혼자 견디게 두지 마.', excess: '타인의 공포와 죄책감을 자신의 감정처럼 떠안는다.' },
]

export function getInnerVoices(character) {
  const pressure = Math.round((100 - character.condition.mental + character.condition.fatigue) / 2)
  return voices
    .map((voice) => ({ ...voice, value: character.stats[voice.stat], intrusive: pressure >= 55 || character.stats[voice.stat] >= 8 }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 3)
    .map((voice) => ({ ...voice, message: voice.intrusive ? voice.excess : voice.line }))
}
