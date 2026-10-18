const explorationEvents = [
    // =========================
    // 일반 이벤트
    // =========================

    {
        id: 'empty_hallway',
        type: 'normal',

        title: '끝없는 복도',

        description:
            '낡은 형광등이 일정한 간격으로 깜빡인다.',

        sanityLoss: 3,
    },


    // =========================
    // 선택지 이벤트
    // =========================

    {
        id: 'strange_door',
        type: 'choice',

        title: '잠긴 문',

        description:
            '복도 한가운데 다른 벽과 어울리지 않는 금속 문이 있다. 안쪽에서 희미한 두드리는 소리가 들린다.',

        choices: [
            {
                id: 'open',

                text: '문을 연다',

                results: [

                    // 70% - 별일 없음
                    {
                        weight: 70,

                        text:
                            '문 너머에는 아무도 없었다. 텅 빈 방만 남아 있다.',

                        sanityChange: -3,
                    },


                    // 25% - 위험
                    {
                        weight: 25,

                        text:
                            '문이 열리자 안쪽에서 검은 형체가 빠르게 지나갔다.',

                        sanityChange: -15,
                    },


                    // 5% - 아이템 발견
                    {
                        weight: 5,

                        text:
                            '방 안을 살펴보던 중 바닥에서 사용할 수 있을 것 같은 물건을 발견했다.',

                        sanityChange: -5,

                        itemReward: {
                            itemId: 'bandage',
                            quantity: 1,
                        },
                    },
                ],
            },


            {
                id: 'ignore',

                text: '무시하고 지나간다',

                results: [
                    {
                        weight: 100,

                        text:
                            '두드리는 소리를 뒤로하고 복도를 계속 걸었다.',

                        sanityChange: -2,
                    },
                ],
            },
        ],
    },
]


export default explorationEvents