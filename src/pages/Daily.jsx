import { useState } from 'react'

const dailyEvents = [
    {
        title: '폐허 탐색',
        description: '버려진 건물에서 오래된 보급 상자를 발견했다.',
    },
    {
        title: '이상 신호',
        description: '통신기에 정체불명의 신호가 잡혔다.',
    },
    {
        title: '조용한 하루',
        description: '오늘은 별다른 사건 없이 무사히 지나갔다.',
    },
    {
        title: '낯선 흔적',
        description: '격리구역 외곽에서 누군가 지나간 흔적을 발견했다.',
    },
]

function Daily({
    characterId,
    onBack,
}) {
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

    const startDaily = () => {

        if (dailyResult) {
            return
        }

        const randomIndex =
            Math.floor(
                Math.random() * dailyEvents.length
            )

        const event = dailyEvents[randomIndex]

        const result = {
            date: today,
            event,
        }

        localStorage.setItem(
            storageKey,
            JSON.stringify(result)
        )

        setDailyResult(result)
    }

    return (
        <div>

            <button onClick={onBack}>
                ← PROFILE
            </button>

            <h1>오늘의 활동</h1>

            {!dailyResult ? (
                <button onClick={startDaily}>
                    오늘의 탐색 시작
                </button>
            ) : (
                <div>
                    <h2>
                        {dailyResult.event.title}
                    </h2>

                    <p>
                        {dailyResult.event.description}
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
