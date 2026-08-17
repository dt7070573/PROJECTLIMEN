import './Avatar.css'


function Avatar({ character, className = '' }) {
    if (!character) {
        return null
    }

    const imageNumber = (value) => {
        return String((value ?? 0) + 1).padStart(2, '0')
    }

    return (
        <div className={`avatar ${className}`}>

            <img
                className="avatar-layer"
                src={`${import.meta.env.BASE_URL}character/skin/SKIN_${imageNumber(character.skin)}.png`}
                alt=""
            />

            <img
                className="avatar-layer"
                src={`${import.meta.env.BASE_URL}character/clothes/CLOTHES_${imageNumber(character.clothes)}.png`}
                alt=""
            />

            <img
                className="avatar-layer"
                src={`${import.meta.env.BASE_URL}character/hair/HAIR_${imageNumber(character.hair)}.png`}
                alt=""
            />

            <img
                className="avatar-layer"
                src={`${import.meta.env.BASE_URL}character/eyes/EYES_${imageNumber(character.eyes)}.png`}
                alt=""
            />

            <img
                className="avatar-layer"
                src={`${import.meta.env.BASE_URL}character/mouth/MOUTH_${imageNumber(character.eyes)}.png`}
                alt=""
            />

            <img
                className="avatar-layer"
                src={`${import.meta.env.BASE_URL}character/glasses/GLASSES_${imageNumber(character.glasses)}.png`}
                alt=""
            />

        </div>
    )
}

export default Avatar
