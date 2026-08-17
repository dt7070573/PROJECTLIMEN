import { useState } from 'react'

const dailyEvents = [
    {
        id: 'survivor',
        title: '낯선 생존자',
        description:
            '폐건물 안에서 인기척이 들린다. 문 너머에서 누군가 도움을 요청하고 있다.',

        choices: [
            {
                text: '문을 연다',

                results: [
                    '안에는 지친 생존자가 있었다. 그는 감사의 인사를 남기고 떠났다.',
                    '문을 여는 순간 숨어 있던 약탈자가 달려들었다. 간신히 도망쳤다.',
                    '아무도 없었다. 대신 바닥에서 오래된 가방 하나를 발견했다.',
                ],
            },

            {
                text: '무시한다',

                results: [
                    '당신은 인기척을 무시하고 자리를 떠났다.',
                    '한참 뒤 건물 안에서 총성이 들렸다.',
                    '아무 일도 일어나지 않았다.',
                ],
            },
        ],
    },

    {
        id: 'signal',
        title: '이상 신호',
        description:
            '통신기에 정체불명의 신호가 잡힌다. 같은 메시지가 반복되고 있다.',

        choices: [
            {
                text: '신호를 추적한다',

                results: [
                    '신호를 따라가자 버려진 통신 시설이 나타났다.',
                    '신호는 갑자기 끊겼다. 누군가 일부러 송신을 중단한 것 같다.',
                    '신호의 근원에서는 아무것도 발견하지 못했다.',
                ],
            },

            {
                text: '통신기를 끈다',

                results: [
                    '위험을 감수하지 않기로 했다. 조용히 이동을 계속했다.',
                    '통신기를 끄기 직전, 좌표 하나가 화면에 나타났다.',
                ],
            },
        ],
    },

    {
        id: 'supply',
        title: '버려진 보급 상자',
        description:
            '길가에서 오래된 보급 상자를 발견했다. 자물쇠는 이미 부서져 있다.',

        choices: [
            {
                text: '상자를 조사한다',

                results: [
                    '상자 안에는 아직 사용할 수 있는 물자가 남아 있었다.',
                    '상자는 완전히 비어 있었다.',
                    '상자를 건드리는 순간 경보음이 울리기 시작했다.',
                ],
            },

            {
                text: '그냥 지나간다',

                results: [
                    '수상한 물건에는 손대지 않는 편이 낫다.',
                    '몇 걸음 지나자 뒤에서 무언가 움직이는 소리가 들렸다.',
                ],
            },
        ],
    },
]

function getRandomIndex(length) {
    return Math.floor(Math.random() * length)
}

function Daily({
    characterId,
    onBack,
})
{
    const today = new Date().toLocaleDateString('en-CA')

    const storageKey = `daily-${characterId}`

    const [dailyResult, setDailyResult] = useState(() => {
        const savedResult =
            JSON.parse(localStorage.getItem(storageKey))

        if (
            savedResult &&
            savedResult.date === today
        ) {
            return savedResult
        }

        return null
    })

    const [currentEvent, setCurrentEvent] = useState(null)

    const startDaily = () => {
        if (dailyResult) {
            return
        }

        const randomIndex =
            getRandomIndex(dailyEvents.length)

        const event = dailyEvents[randomIndex]

        setCurrentEvent(event)
    }

    const selectChoice = (choice) => {
        const randomResultIndex =
            getRandomIndex(choice.results.length)

        const resultText =
            choice.results[randomResultIndex]

        const result = {
            date: today,

            eventId: currentEvent.id,
            eventTitle: currentEvent.title,
            eventDescription: currentEvent.description,

            choice: choice.text,

            result: resultText,
        }

        localStorage.setItem(
            storageKey,
            JSON.stringify(result)
        )

        setDailyResult(result)
        setCurrentEvent(null)
    }

    return (
        <div className="daily-page">

            <button onClick={onBack}>
                ← PROFILE
            </button>

            <h1>오늘의 활동</h1>


            {/* 아직 오늘의 활동을 시작하지 않음 */}
            {!dailyResult && !currentEvent && (

                <div>
                    <p>
                        오늘 무슨 일이 일어날까요?
                    </p>

                    <button onClick={startDaily}>
                        오늘의 탐색 시작
                    </button>
                </div>

            )}


            {/* 이벤트 발생 */}
            {!dailyResult && currentEvent && (

                <div className="daily-event">

                    <h2>
                        {currentEvent.title}
                    </h2>

                    <p>
                        {currentEvent.description}
                    </p>

                    <div className="daily-choices">

                        {currentEvent.choices.map(
                            (choice, index) => (

                                <button
                                    key={index}
                                    onClick={() =>
                                        selectChoice(choice)
                                    }
                                >
                                    {choice.text}
                                </button>

                            )
                        )}

                    </div>

                </div>

            )}


            {/* 오늘의 활동 완료 */}
            {dailyResult && (

                <div className="daily-result">

                    <h2>
                        {dailyResult.eventTitle}
                    </h2>

                    <p>
                        {dailyResult.eventDescription}
                    </p>

                    <p>
                        선택: {dailyResult.choice}
                    </p>

                    <hr />

                    <h3>결과</h3>

                    <p>
                        {dailyResult.result}
                    </p>

                    <p>
                        오늘의 활동을 완료했습니다.
                    </p>

                </div>

            )}

        </div>
    )


}



export default Daily
