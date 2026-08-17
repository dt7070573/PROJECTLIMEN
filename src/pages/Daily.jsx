import { useState } from 'react'
import items from '../data/items.js'

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
                    {
                        text: '안에는 지친 생존자가 있었다. 그는 식량을 조금 나눠주었다.',
                        reward: {
                            food: 2,
                            credit: 0,
                            hp: 0,
                        },
                    },

                    {
                        text: '문을 여는 순간 약탈자가 달려들었다. 간신히 도망쳤다.',
                        reward: {
                            food: 0,
                            credit: 0,
                            hp: -15,
                        },
                    },

                    {
                        text: '낡은 가방 안에서 크레딧을 발견했다.',
                        reward: {
                            food: 0,
                            credit: 20,
                            hp: 0,
                        },
                    },
                ]
            },

            {
                text: '무시한다',

                results: [
                    {
                        text: '안에는 지친 생존자가 있었다. 그는 식량을 조금 나눠주었다.',
                        reward: {
                            food: 2,
                            credit: 0,
                            hp: 0,
                        },
                    },

                    {
                        text: '문을 여는 순간 약탈자가 달려들었다. 간신히 도망쳤다.',
                        reward: {
                            food: 0,
                            credit: 0,
                            hp: -15,
                        },
                    },

                    {
                        text: '낡은 가방 안에서 크레딧을 발견했다.',
                        reward: {
                            food: 0,
                            credit: 20,
                            hp: 0,
                        },
                    },
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
                    {
                        text: '안에는 지친 생존자가 있었다. 그는 식량을 조금 나눠주었다.',
                        reward: {
                            food: 2,
                            credit: 0,
                            hp: 0,
                        },
                        itemReward: {
                            itemIdid: 'bandage',
                            quantity: 1,
                        },
                    },

                    {
                        text: '문을 여는 순간 약탈자가 달려들었다. 간신히 도망쳤다.',
                        reward: {
                            food: 0,
                            credit: 0,
                            hp: -15,
                        },
                        itemReward: {
                            itemId: 'bandage',
                            quantity: 1,
                        },
                    },

                    {
                        text: '낡은 가방 안에서 크레딧을 발견했다.',
                        reward: {
                            food: 0,
                            credit: 20,
                            hp: 0,
                        },
                        itemReward: {
                            itemId: 'bandage',
                            quantity: 1,
                        },
                    },
                ],
            },

            {
                text: '통신기를 끈다',

                results: [
                    {
                        text: '안에는 지친 생존자가 있었다. 그는 식량을 조금 나눠주었다.',
                        reward: {
                            food: 2,
                            credit: 0,
                            hp: 0,
                        },
                        itemReward: {
                            itemId: 'bandage',
                            quantity: 1,
                        },
                    },

                    {
                        text: '문을 여는 순간 약탈자가 달려들었다. 간신히 도망쳤다.',
                        reward: {
                            food: 0,
                            credit: 0,
                            hp: -15,
                        },
                        itemReward: {
                            itemId: 'bandage',
                            quantity: 1,
                        },
                    },

                    {
                        text: '낡은 가방 안에서 크레딧을 발견했다.',
                        reward: {
                            food: 0,
                            credit: 20,
                            hp: 0,
                        },
                        itemReward: {
                            itemId: 'bandage',
                            quantity: 1,
                        },
                    },
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
                    {
                        text: '안에는 지친 생존자가 있었다. 그는 식량을 조금 나눠주었다.',
                        reward: {
                            food: 2,
                            credit: 0,
                            hp: 0,
                        },
                        itemReward: {
                            itemId: 'bandage',
                            quantity: 1,
                        },
                    },

                    {
                        text: '문을 여는 순간 약탈자가 달려들었다. 간신히 도망쳤다.',
                        reward: {
                            food: 0,
                            credit: 0,
                            hp: -15,
                        },
                        itemReward: {
                            itemId: 'bandage',
                            quantity: 1,
                        },
                    },

                    {
                        text: '낡은 가방 안에서 크레딧을 발견했다.',
                        reward: {
                            food: 0,
                            credit: 20,
                            hp: 0,
                        },
                        itemReward: {
                            itemId: 'bandage',
                            quantity: 1,
                        },
                    },
                ],
            },

            {
                text: '그냥 지나간다',

                results: [
                    {
                        text: '안에는 지친 생존자가 있었다. 그는 식량을 조금 나눠주었다.',
                        reward: {
                            food: 2,
                            credit: 0,
                            hp: 0,
                        },
                        itemReward: {
                            itemId: 'bandage',
                            quantity: 1,
                        },
                    },

                    {
                        text: '문을 여는 순간 약탈자가 달려들었다. 간신히 도망쳤다.',
                        reward: {
                            food: 0,
                            credit: 0,
                            hp: -15,
                        },
                        itemReward: {
                            itemId: 'bandage',
                            quantity: 1,
                        },
                    },

                    {
                        text: '낡은 가방 안에서 크레딧을 발견했다.',
                        reward: {
                            food: 0,
                            credit: 20,
                            hp: 0,
                        },
                        itemReward: {
                            itemId: 'bandage',
                            quantity: 1,
                        },
                    },
                ],
            },
        ],
    },
]

function getRandomIndex(length) {
    return Math.floor(Math.random() * length)
}

function addItemToInventory(inventory, itemReward) {
    if (!itemReward) {
        return inventory
    }

    const existingItem =
        inventory.find(
            item => item.itemId === itemReward.itemId
        )

    if (existingItem) {
        return inventory.map(item => {

            if (item.itemId === itemReward.itemId) {
                return {
                    ...item,
                    quantity:
                        item.quantity +
                        itemReward.quantity,
                }
            }

            return item
        })
    }

    return [
        ...inventory,
        {
            itemId: itemReward.itemId,
            quantity: itemReward.quantity,
        },
    ]
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

        const selectedResult =
            choice.results[randomResultIndex]


        const reward = selectedResult.reward ?? {
            hp: 0,
            food: 0,
            credit: 0,
        }


        const itemReward =
            selectedResult.itemReward ?? null


        // =========================
        // 캐릭터 데이터 갱신
        // =========================

        const savedCharacters =
            JSON.parse(
                localStorage.getItem('characters')
            ) || []


        const updatedCharacters =
            savedCharacters.map(character => {

                if (character.id !== characterId) {
                    return character
                }


                const currentInventory =
                    character.inventory ?? []


                const updatedInventory =
                    addItemToInventory(
                        currentInventory,
                        itemReward
                    )


                return {
                    ...character,

                    hp: Math.max(
                        0,
                        (character.hp ?? 100) +
                        (reward.hp ?? 0)
                    ),

                    food:
                        (character.food ?? 0) +
                        (reward.food ?? 0),

                    credit:
                        (character.credit ?? 0) +
                        (reward.credit ?? 0),

                    inventory: updatedInventory,
                }
            })


        localStorage.setItem(
            'characters',
            JSON.stringify(updatedCharacters)
        )


        // =========================
        // Daily 결과 저장
        // =========================

        const result = {
            date: today,

            eventId: currentEvent.id,
            eventTitle: currentEvent.title,
            eventDescription:
                currentEvent.description,

            choice: choice.text,

            result: selectedResult.text,

            reward: {
                hp: reward.hp ?? 0,
                food: reward.food ?? 0,
                credit: reward.credit ?? 0,
            },

            itemReward: itemReward,
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

                    <div className="daily-reward">

                        <h3>변화</h3>

                        {(dailyResult.reward?.hp ?? 0) !== 0 && (
                            <p>
                                HP
                                {' '}
                                {(dailyResult.reward?.hp ?? 0) > 0 ? '+' : ''}
                                {dailyResult.reward?.hp}
                            </p>
                        )}

                        {(dailyResult.reward?.food ?? 0) !== 0 && (
                            <p>
                                FOOD
                                {' '}
                                {(dailyResult.reward?.food ?? 0) > 0 ? '+' : ''}
                                {dailyResult.reward?.food}
                            </p>
                        )}

                        {(dailyResult.reward?.credit ?? 0) !== 0 && (
                            <p>
                                CREDIT
                                {' '}
                                {(dailyResult.reward?.credit ?? 0) > 0 ? '+' : ''}
                                {dailyResult.reward?.credit}
                            </p>
                        )}

                        {dailyResult.itemReward && (

                            <div className="daily-item-reward">

                                <h3>획득 아이템</h3>

                                <p>
                                    {items[dailyResult.itemReward.itemId]?.name}
                                    {' ×'}
                                    {dailyResult.itemReward.quantity}
                                </p>

                            </div>

                        )}

                    </div>

                    <p>
                        오늘의 활동을 완료했습니다.
                    </p>

                </div>

            )}

        </div>
    )


}



export default Daily
