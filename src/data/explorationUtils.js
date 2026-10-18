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

export function getWeightedRandom(results) {

    const totalWeight =
        results.reduce(
            (sum, result) =>
                sum + result.weight,
            0
        )

    let random =
        Math.random() * totalWeight


    for (const result of results) {

        random -= result.weight

        if (random <= 0) {
            return result
        }
    }


    return results[results.length - 1]
}