import { useState } from 'react'
import Home from './pages/Home.jsx'
import CharacterCreator from './pages/CharacterCreator.jsx'
import Profile from './pages/Profile.jsx'

function App() {
    const [page, setPage] = useState('home')
    const [selectedCharacterId, setSelectedCharacterId] = useState(null)
    const [editingCharacterId, setEditingCharacterId] = useState(null)

    const goHome = () => {
        setPage('home')
        setSelectedCharacterId(null)
    }

    const goCreator = () => {
        setEditingCharacterId(null)
        setPage('creator')
    }

    const goProfile = (characterId) => {
        setSelectedCharacterId(characterId)
        setPage('profile')
    }

    const deleteCharacter = (characterId) => {
        const result = window.confirm(
            '정말 이 캐릭터를 삭제하시겠습니까?'
        )

        if (!result) {
            return
        }

        const savedCharacters =
            JSON.parse(localStorage.getItem('characters')) || []

        const updatedCharacters =
            savedCharacters.filter(
                character => character.id !== characterId
            )

        localStorage.setItem(
            'characters',
            JSON.stringify(updatedCharacters)
        )

        goHome()
    }

    const editCharacter = (characterId) => {
        setEditingCharacterId(characterId)
        setPage('creator')
    }

    if (page === 'creator') {
        return (<CharacterCreator
            onBack={goHome}
            onComplete={goHome}
            editingCharacterId={editingCharacterId}
        />
        )
    }
    if (page === 'profile') {
        return (
            <Profile
                characterId={selectedCharacterId}
                onBack={goHome}
                onDelete={deleteCharacter}
                onEdit={editCharacter}
            />
        )
    }

    return (
        <Home
            onCreateCharacter={goCreator}
            onSelectCharacter={goProfile}
        />
    )
}

export default App