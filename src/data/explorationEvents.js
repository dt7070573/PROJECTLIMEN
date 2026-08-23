const explorationEvents = [
    {
        id: 'empty_hallway',
        type: 'normal',

        title: '끝없는 복도',

        description:
            '낡은 형광등이 일정한 간격으로 깜빡인다.',

        sanityLoss: 3,
    },

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
                    {
                        text:
                            '문 너머에는 아무도 없었다. 대신 바닥에 오래된 물건이 놓여 있다.',

                        sanityChange: -5,

                        itemReward: {
                            itemId: 'bandage',
                            quantity: 1,
                        },
                    },

                    {
                        text:
                            '문이 열리자 안쪽에서 검은 형체가 빠르게 지나갔다.',

                        sanityChange: -15,
                    },
                ],
            },

            {
                id: 'ignore',

                text: '무시하고 지나간다',

                results: [
                    {
                        text:
                            '소리를 뒤로하고 복도를 계속 걸었다.',

                        sanityChange: -2,
                    },
                ],
            },
        ],
    },
]

export default explorationEvents
