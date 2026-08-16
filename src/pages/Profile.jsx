import { useState } from 'react'
import './Profile.css'

function Profile({
    characterId,
    onBack,
    onDelete,
    onEdit,
}) {
    const [character] = useState(() => {
        const savedCharacters =
            JSON.parse(localStorage.getItem('characters')) || []

        return savedCharacters.find(
            character => character.id === characterId
        ) || null
    })

    if (!character) {
        return (
            <div>
                캐릭터를 찾을 수 없습니다.

                <button onClick={onBack}>
                    HOME
                </button>
            </div>
        )
    }

    return (
        <div className="profile-page">

            <button
                className="profile-back-button"
                onClick={onBack}
            >
                ← HOME
            </button>

            <div className="profile-character">

                <div className="profile-thumbnail">
                    캐릭터 미리보기
                </div>
                
                <h1>{character.name}</h1>

                <div className="profile-data">
                    <p>성별 : {character.gender + 1}</p>
                    <p>피부 : {character.skin + 1}</p>
                    <p>헤어 : {character.hair + 1}</p>
                    <p>눈 : {character.eyes + 1}</p>
                    <p>표정 : {character.mouth + 1}</p>
                    <p>옷 : {character.clothes + 1}</p>
                    <p>악세사리 : {character.accessory + 1}</p>
                </div>

            </div>

            <button onClick={() => onEdit(character.id)}>
                캐릭터 수정
            </button>

                <button onClick={() => onDelete(character.id)}>
                    캐릭터 삭제
                </button>
        </div >
    )
}

export default Profile