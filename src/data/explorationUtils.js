export function getDailyTarget(targets) {
    const now =
        new Date()

    const dateNumber =
        now.getFullYear() * 10000 +
        (now.getMonth() + 1) * 100 +
        now.getDate()

    return targets[
        dateNumber % targets.length
    ]
}


export function getRandomItem(array) {
    return array[
        Math.floor(
            Math.random() * array.length
        )
    ]
}