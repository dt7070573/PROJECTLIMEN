import { useState } from 'react'
import './Home.css'

function Home({
    onCreateCharacter,
    onSelectCharacter,
}) {
    const [characters] = useState(() => {
        return JSON.parse(localStorage.getItem('characters')) || []
    })

    return (
        <div className="home-page">

            <h1>PROJECT LIMEN</h1>

            <p>
                나만의 캐릭터를 만들고 세계에 들어가세요.
            </p>

            {characters.length === 0 ? (

                <button
                    className="create-first-button"
                    onClick={onCreateCharacter}
                >
                    캐릭터 생성
                </button>

            ) : (

                <div className="character-list">

                    {characters.map(character => (

                        <button
                            key={character.id}
                            className="character-card"
                            onClick={() =>
                                onSelectCharacter(character.id)
                            }
                        >

                            <div className="character-thumbnail">
                                캐릭터
                            </div>

                            <span>
                                {character.name}
                            </span>

                        </button>

                    ))}

                    {characters.length < 5 && (

                        <button
                            className="add-character-button"
                            onClick={onCreateCharacter}
                        >
                            +
                        </button>

                    )}

                </div>

            )}

            <p className="character-count">
                {characters.length} / 5
            </p>

        </div>
    )
}

export default Home