import { useState } from 'react'
import Home from './pages/Home.jsx'
import CharacterCreator from './pages/CharacterCreator.jsx'

function App() {
    const [page, setPage] = useState('home')

    if (page === 'creator') {
        return (<CharacterCreator
            onBack={() => setPage('home')}
        />
        )
    }
    return (
        <Home onStart={() => setPage('creator')} />
    )
}

export default App