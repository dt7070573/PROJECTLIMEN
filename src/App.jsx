import { useState } from 'react'
import Home from './pages/Home.jsx'
import CharacterCreator from './pages/CharacterCreator.jsx'
import Profile from './pages/Profile.jsx'

function App() {
    const [page, setPage] = useState('home')
    const [selectedCharacterId, setSelectedCharacterId] = useState(null)

    const goHome = () => {
        setPage('home')
        setSelectedCharacterId(null)
    }

    const goCreator = () => {
        setPage('creator')
    }

    const goProfile = (characterId) => {
        setSelectedCharacterId(characterId)
        setPage('profile')
    }

    if (page === 'creator') {
        return (<CharacterCreator
            onBack={goHome}
            onComplete={goHome}
        />
        )
    }
    if (page === 'profile') {
        return (
            <Profile
                characterId={selectedCharacterId}
                onBack={goHome}
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