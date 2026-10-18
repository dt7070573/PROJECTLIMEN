import './Daily.css'
import { useState } from 'react'

import items from '../data/items.js'
import explorationEvents from '../data/explorationEvents.js'
import dailyTargets from '../data/dailyTargets.js'

import {
    getDailyTarget,
    getRandomItem,
    getWeightedRandom,
} from '../data/explorationUtils.js'


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
}) {
    const today =
        new Date().toLocaleDateString('en-CA')

    const dailyTarget =
        getDailyTarget(dailyTargets)

    const dailyStorageKey =
        `daily-${characterId}`

    const explorationStorageKey =
        `exploration-${characterId}`


    // =========================
    // 선택지 이벤트 대기 상태
    // =========================

const [
    pendingChoiceEvent,
    setPendingChoiceEvent,
] = useState(() => {

    const savedExploration =
        JSON.parse(
            localStorage.getItem(
                explorationStorageKey
            )
        )

    if (
        savedExploration &&
        savedExploration.date === today &&
        savedExploration.currentEvent?.type === 'choice' &&
        !savedExploration.currentEvent?.resultText
    ) {
        return savedExploration.currentEvent
    }

    return null
})


    // =========================
    // 오늘의 최종 결과
    // =========================

    const [dailyResult, setDailyResult] =
        useState(() => {

            const savedResult =
                JSON.parse(
                    localStorage.getItem(
                        dailyStorageKey
                    )
                )

            if (
                savedResult &&
                savedResult.date === today
            ) {
                return savedResult
            }

            return null
        })


    // =========================
    // 현재 탐사 상태
    // =========================

    const [exploration, setExploration] =
        useState(() => {

            const savedExploration =
                JSON.parse(
                    localStorage.getItem(
                        explorationStorageKey
                    )
                )

            if (
                savedExploration &&
                savedExploration.date === today &&
                !savedExploration.finished
            ) {
                return savedExploration
            }

            return {
                date: today,

                started: false,
                finished: false,

                depth: 0,
                sanity: 100,

                currentEvent: null,

                targetFound: false,
            }
        })


    // =========================
    // 탐사 상태 저장
    // =========================

    const saveExploration = (newState) => {

        setExploration(newState)

        localStorage.setItem(
            explorationStorageKey,
            JSON.stringify(newState)
        )
    }


    // =========================
    // 탐사 시작
    // =========================

    const startExploration = () => {

        if (dailyResult) {
            return
        }

        const newState = {
            ...exploration,

            started: true,
            finished: false,

            depth: 0,
            sanity: 100,

            currentEvent: null,

            targetFound: false,
        }

        saveExploration(newState)
    }


    // =========================
    // 앞으로 나가기
    // =========================

    const moveForward = () => {

        if (
            !exploration.started ||
            exploration.finished ||
            pendingChoiceEvent
        ) {
            return
        }

        const nextDepth =
            exploration.depth + 1

        const event =
            getRandomItem(explorationEvents)


        // =========================
        // 선택지 이벤트
        // =========================

        if (event.type === 'choice') {

            const nextState = {
                ...exploration,

                depth: nextDepth,

                currentEvent: event,
            }

            saveExploration(nextState)

            setPendingChoiceEvent(event)

            return
        }


        // =========================
        // 일반 이벤트
        // =========================

        const nextSanity =
            Math.max(
                0,
                exploration.sanity -
                (event.sanityLoss ?? 0)
            )


        let targetFound =
            exploration.targetFound


        // =========================
        // 목표물 발견 판정
        // =========================

        if (
            !targetFound &&
            nextDepth >= dailyTarget.minDepth
        ) {
            const depthBonus =
                (
                    nextDepth -
                    dailyTarget.minDepth
                ) * 0.08

            const chance =
                Math.min(
                    0.15 + depthBonus,
                    0.75
                )

            if (Math.random() < chance) {
                targetFound = true
            }
        }


        const nextState = {
            ...exploration,

            depth: nextDepth,
            sanity: nextSanity,

            currentEvent: event,

            targetFound,
        }


        // =========================
        // SANITY 0
        // =========================

        if (nextSanity <= 0) {

            finishExploration(
                nextState,
                'collapse'
            )

            return
        }


        saveExploration(nextState)
    }


    // =========================
    // 선택지 결과 처리
    // =========================

    const selectExplorationChoice = (choice) => {

        const selectedResult =
    getWeightedRandom(choice.results)

        const sanityChange =
            selectedResult.sanityChange ?? 0

        const nextSanity =
            Math.max(
                0,
                Math.min(
                    100,
                    exploration.sanity +
                    sanityChange
                )
            )


        const resolvedEvent = {
            ...pendingChoiceEvent,

            resultText:
                selectedResult.text,

            sanityChange,
        }


        let targetFound =
            exploration.targetFound


        // 선택지 이벤트에서도
        // 목표물 발견 조건 체크
        if (
            !targetFound &&
            exploration.depth >=
                dailyTarget.minDepth
        ) {
            const depthBonus =
                (
                    exploration.depth -
                    dailyTarget.minDepth
                ) * 0.08

            const chance =
                Math.min(
                    0.15 + depthBonus,
                    0.75
                )

            if (Math.random() < chance) {
                targetFound = true
            }
        }


        const nextState = {
            ...exploration,

            sanity: nextSanity,

            currentEvent:
                resolvedEvent,

            targetFound,
        }


        // =========================
        // 아이템 보상
        // =========================

        if (selectedResult.itemReward) {

            const savedCharacters =
                JSON.parse(
                    localStorage.getItem(
                        'characters'
                    )
                ) || []


            const updatedCharacters =
                savedCharacters.map(
                    character => {

                        if (
                            character.id !==
                            characterId
                        ) {
                            return character
                        }

                        return {
                            ...character,

                            inventory:
                                addItemToInventory(
                                    character.inventory ?? [],
                                    selectedResult.itemReward
                                ),
                        }
                    }
                )


            localStorage.setItem(
                'characters',
                JSON.stringify(
                    updatedCharacters
                )
            )
        }


        setPendingChoiceEvent(null)


        // =========================
        // SANITY 0
        // =========================

        if (nextSanity <= 0) {

            finishExploration(
                nextState,
                'collapse'
            )

            return
        }


        saveExploration(nextState)
    }


    // =========================
    // 복귀
    // =========================

    const returnFromExploration = () => {

        if (!exploration.started) {
            return
        }

        const resultType =
            exploration.targetFound
                ? 'success'
                : 'incomplete'

        finishExploration(
            exploration,
            resultType
        )
    }


    // =========================
    // 탐사 종료
    // =========================

    const finishExploration = (
        finalState,
        resultType
    ) => {

        const success =
            resultType === 'success'

        const result = {
            date: today,

            type: resultType,

            depth: finalState.depth,
            sanity: finalState.sanity,

            targetItemId:
                dailyTarget.itemId,

            targetFound:
                finalState.targetFound,

            success,

            eventTitle:
                success
                    ? '목표물 회수'
                    : resultType === 'collapse'
                        ? '정신 붕괴'
                        : '탐사 복귀',

            choice:
                success
                    ? '목표물을 가지고 복귀'
                    : resultType === 'collapse'
                        ? '강제 종료'
                        : '자진 복귀',

            result:
                success
                    ? `${dailyTarget.name}을(를) 회수하고 무사히 복귀했다.`
                    : resultType === 'collapse'
                        ? `DEPTH ${finalState.depth}에서 이성치가 완전히 붕괴했다.`
                        : `목표물을 발견하지 못한 채 DEPTH ${finalState.depth}에서 복귀했다.`,
        }


        // =========================
        // 캐릭터 데이터 갱신
        // =========================

        const savedCharacters =
            JSON.parse(
                localStorage.getItem(
                    'characters'
                )
            ) || []


        const updatedCharacters =
            savedCharacters.map(
                character => {

                    if (
                        character.id !==
                        characterId
                    ) {
                        return character
                    }


                    let updatedInventory =
                        character.inventory ?? []


                    // 목표물 회수 성공 시
                    // 인벤토리에 목표물 추가
                    if (success) {

                        updatedInventory =
                            addItemToInventory(
                                updatedInventory,
                                {
                                    itemId:
                                        dailyTarget.itemId,

                                    quantity: 1,
                                }
                            )
                    }


                    const currentActivityLog =
                        character.activityLog ?? []


                    const updatedActivityLog = [
                        result,
                        ...currentActivityLog,
                    ]


                    return {
                        ...character,

                        inventory:
                            updatedInventory,

                        activityLog:
                            updatedActivityLog,
                    }
                }
            )


        localStorage.setItem(
            'characters',
            JSON.stringify(
                updatedCharacters
            )
        )


        // =========================
        // 오늘 결과 저장
        // =========================

        localStorage.setItem(
            dailyStorageKey,
            JSON.stringify(result)
        )


        // 진행 중 탐사 데이터 삭제
        localStorage.removeItem(
            explorationStorageKey
        )


        setPendingChoiceEvent(null)

        setDailyResult(result)

        setExploration({
            ...finalState,
            finished: true,
        })
    }


    // =========================
    // 화면
    // =========================

    return (
        <div className="daily-page">

            <button
                className="page-back-button"
                onClick={onBack}
            >
                ← PROFILE
            </button>


            <h1>
                오늘의 탐사
            </h1>


            {/* =========================
                탐사 시작 전
            ========================= */}

            {!dailyResult &&
                !exploration.started && (

                    <div className="daily-target">

                        <p>
                            TODAY'S TARGET
                        </p>

                        <h2>
                            {dailyTarget.name}
                        </h2>

                        <p>
                            {
                                dailyTarget
                                    .description
                            }
                        </p>

                        <p>
                            발견 가능 심도 :
                            {' '}
                            DEPTH
                            {' '}
                            {dailyTarget.minDepth}+
                        </p>


                        <button
                            onClick={
                                startExploration
                            }
                        >
                            탐사 시작
                        </button>

                    </div>

                )}


            {/* =========================
                탐사 진행 중
            ========================= */}

            {!dailyResult &&
                exploration.started &&
                !exploration.finished && (

                    <div className="exploration-panel">


                        {/* 상태 */}

                        <div className="exploration-status">

                            <div>
                                <strong>
                                    DEPTH
                                </strong>

                                <p>
                                    {exploration.depth}
                                </p>
                            </div>


                            <div>
                                <strong>
                                    SANITY
                                </strong>

                                <p>
                                    {exploration.sanity}
                                    {' '}
                                    / 100
                                </p>
                            </div>

                        </div>


                        {/* SANITY BAR */}

                        <div className="sanity-bar">

                            <div
                                className="sanity-bar-fill"
                                style={{
                                    width:
                                        `${exploration.sanity}%`,
                                }}
                            />

                        </div>


                        {/* =========================
                            현재 공간
                        ========================= */}

                        {
                            exploration.currentEvent
                                ? (

                                    <div className="exploration-event">

                                        <h2>
                                            {
                                                exploration
                                                    .currentEvent
                                                    .title
                                            }
                                        </h2>

                                        <p>
                                            {
                                                exploration
                                                    .currentEvent
                                                    .description
                                            }
                                        </p>


                                        {/* 선택 결과 */}

                                        {
                                            exploration
                                                .currentEvent
                                                .resultText &&
                                            (

                                                <div className="exploration-choice-result">

                                                    <p>
                                                        {
                                                            exploration
                                                                .currentEvent
                                                                .resultText
                                                        }
                                                    </p>


                                                    {
                                                        (
                                                            exploration
                                                                .currentEvent
                                                                .sanityChange ??
                                                            0
                                                        ) !== 0 &&
                                                        (

                                                            <p>
                                                                SANITY
                                                                {' '}

                                                                {
                                                                    exploration
                                                                        .currentEvent
                                                                        .sanityChange >
                                                                    0
                                                                        ? '+'
                                                                        : ''
                                                                }

                                                                {
                                                                    exploration
                                                                        .currentEvent
                                                                        .sanityChange
                                                                }
                                                            </p>

                                                        )
                                                    }

                                                </div>

                                            )
                                        }


                                        {/* 일반 이벤트 SANITY 감소 */}

                                        {
                                            !exploration
                                                .currentEvent
                                                .resultText &&

                                            exploration
                                                .currentEvent
                                                .type !==
                                                'choice' &&

                                            (
                                                exploration
                                                    .currentEvent
                                                    .sanityLoss ??
                                                0
                                            ) > 0 &&
                                            (

                                                <p>
                                                    SANITY -
                                                    {
                                                        exploration
                                                            .currentEvent
                                                            .sanityLoss
                                                    }
                                                </p>

                                            )
                                        }

                                    </div>

                                )
                                : (

                                    <div className="exploration-event">

                                        <h2>
                                            탐사 시작
                                        </h2>

                                        <p>
                                            아직 특별한 이상은
                                            발견되지 않았다.
                                        </p>

                                    </div>

                                )
                        }


                        {/* =========================
                            선택지 이벤트
                        ========================= */}

                        {pendingChoiceEvent && (

                            <div className="exploration-choice">

                                <p className="exploration-choice-label">
                                    행동을 선택하세요
                                </p>


                                <div className="exploration-choice-buttons">

                                    {
                                        pendingChoiceEvent
                                            .choices
                                            .map(
                                                choice => (

                                                    <button
                                                        key={
                                                            choice.id
                                                        }
                                                        onClick={() =>
                                                            selectExplorationChoice(
                                                                choice
                                                            )
                                                        }
                                                    >
                                                        {
                                                            choice.text
                                                        }
                                                    </button>

                                                )
                                            )
                                    }

                                </div>

                            </div>

                        )}


                        {/* =========================
                            목표물 발견
                        ========================= */}

                        {exploration.targetFound && (

                            <div className="target-acquired">

                                <p>
                                    TARGET ACQUIRED
                                </p>

                                <h2>
                                    {dailyTarget.name}
                                </h2>

                                <p>
                                    목표물을 발견했다.
                                    이제 복귀하면
                                    오늘의 탐사는 성공한다.
                                </p>

                            </div>

                        )}


                        {/* =========================
                            행동
                        ========================= */}

                        <div className="exploration-actions">

                            <button
                                onClick={
                                    moveForward
                                }
                                disabled={
                                    pendingChoiceEvent !==
                                    null
                                }
                            >
                                앞으로 나가기
                            </button>


                            <button
                                onClick={
                                    returnFromExploration
                                }
                            >
                                {
                                    exploration
                                        .targetFound
                                        ? '목표물을 가지고 복귀'
                                        : '복귀하기'
                                }
                            </button>

                        </div>


                    </div>

                )}


            {/* =========================
                오늘 탐사 완료
            ========================= */}

            {dailyResult && (

                <div className="daily-result">


                    {
                        dailyResult.type ===
                        'success' && (

                            <>
                                <h2>
                                    MISSION COMPLETE
                                </h2>

                                <p>
                                    목표물을 회수하고
                                    무사히 복귀했습니다.
                                </p>

                                <p>
                                    획득 :
                                    {' '}
                                    {
                                        items[
                                            dailyResult
                                                .targetItemId
                                        ]?.name ??
                                        dailyTarget.name
                                    }
                                </p>
                            </>

                        )
                    }


                    {
                        dailyResult.type ===
                        'incomplete' && (

                            <>
                                <h2>
                                    MISSION INCOMPLETE
                                </h2>

                                <p>
                                    목표물을 찾지 못한 채
                                    탐사를 종료했습니다.
                                </p>
                            </>

                        )
                    }


                    {
                        dailyResult.type ===
                        'collapse' && (

                            <>
                                <h2>
                                    MENTAL COLLAPSE
                                </h2>

                                <p>
                                    이성치가 완전히
                                    붕괴했습니다.
                                </p>
                            </>

                        )
                    }


                    <hr />


                    <p>
                        최종 심도 :
                        {' '}
                        DEPTH
                        {' '}
                        {dailyResult.depth}
                    </p>

                    <p>
                        최종 SANITY :
                        {' '}
                        {dailyResult.sanity}
                        {' '}
                        / 100
                    </p>


                </div>

            )}


        </div>
    )
}


export default Daily
