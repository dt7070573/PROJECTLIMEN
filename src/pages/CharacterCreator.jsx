import { useState } from 'react'
import './CharacterCreator.css'
import Avatar from '../components/Avatar.jsx'

const categories = [
    { id: 'gender', label: '성별' },
    { id: 'skin', label: '피부색' },
    { id: 'hair', label: '헤어스타일' },
    { id: 'eyes', label: '눈' },
    { id: 'mouth', label: '입' },
    { id: 'clothes', label: '옷' },
    { id: 'accessory', label: '악세사리' },
    { id: 'glasses', label: '안경' },
]

const options = {
    gender: ['여성', '남성'],
    skin: ['피부 01', '피부 02', '피부 03', '피부 04'],
    hair: [
        '헤어 01',
        '헤어 02',
        '헤어 03',
        '헤어 04',
        '헤어 05',
        '헤어 06',
        '헤어 07',
        '헤어 08',
    ],
    eyes: [
        '눈 01',
        '눈 02',
        '눈 03',
        '눈 04',
        '눈 05',
        '눈 06',
    ],
    mouth: [
        '표정 01',
        '표정 02',
        '표정 03',
        '표정 04',
    ],
    clothes: [
        '의상 01',
        '의상 02',
        '의상 03',
        '의상 04',
        '의상 05',
        '의상 06',
    ],
    accessory: [
        '악세사리 01',
        '악세사리 02',
        '악세사리 03',
        '악세사리 04',
    ],
    glasses: [
        '안경 01',
        '안경 02',
        '안경 03',
        '안경 04',
    ]
}

function CharacterCreator({
    onBack,
    onComplete,
    editingCharacterId
})
{
    const [selectedCategory, setSelectedCategory] = useState('hair')

    const [character, setCharacter] = useState(() => {

        if (editingCharacterId !== null) {
            const savedCharacters =
                JSON.parse(localStorage.getItem('characters')) || []

            const existingCharacter =
                savedCharacters.find(
                    character =>
                        character.id === editingCharacterId
                )

            if (existingCharacter) {
                return {
                    name: '',
                    gender: 0,
                    skin: 0,
                    hair: 0,
                    eyes: 0,
                    mouth: 0,
                    clothes: 0,
                    accessory: 0,
                    glasses: 0,
                    ...existingCharacter,
                }
            }
        }

        return {
            name: '',
            gender: 0,
            skin: 0,
            hair: 0,
            eyes: 0,
            mouth: 0,
            clothes: 0,
            accessory: 0,
            glasses: 0
        }
    })

    const handleOptionSelect = (index) => {
        setCharacter({
            ...character,
            [selectedCategory]: index,
        })
    }

    const handleComplete = () => {
        const savedCharacters =
            JSON.parse(localStorage.getItem('characters')) || []

        if (character.name.trim() === '') {
            alert('캐릭터 이름을 입력해주세요.')
            return
        }


        // 기존 캐릭터 수정
        if (editingCharacterId !== null) {

            const updatedCharacters =
                savedCharacters.map(savedCharacter => {

                    if (savedCharacter.id === editingCharacterId) {
                        return {
                            ...character,
                            id: editingCharacterId,
                        }
                    }

                    return savedCharacter
                })

            localStorage.setItem(
                'characters',
                JSON.stringify(updatedCharacters)
            )

            alert('캐릭터가 수정되었습니다.')

            onComplete()

            return
        }


        // 신규 캐릭터 생성
        if (savedCharacters.length >= 5) {
            alert('캐릭터는 최대 5개까지 만들 수 있습니다.')
            return
        }

        const newCharacter = {
            ...character,
            id: Date.now(),
        }

        const updatedCharacters = [
            ...savedCharacters,
            newCharacter,
        ]

        localStorage.setItem(
            'characters',
            JSON.stringify(updatedCharacters)
        )

        alert('캐릭터가 생성되었습니다.')

        onComplete()
    }

    const currentOptions = options[selectedCategory]

    const selectedCategoryLabel =
        categories.find(category => category.id === selectedCategory)?.label

    return (
        <div className="creator-page">

            {/* 왼쪽 대분류 */}
            <aside className="category-panel">
                <h2>외형 설정</h2>

                <div className="category-list">
                    {categories.map(category => (
                        <button
                            key={category.id}
                            className={
                                selectedCategory === category.id
                                    ? 'category-button active'
                                    : 'category-button'
                            }
                            onClick={() => setSelectedCategory(category.id)}
                        >
                            {category.label}
                        </button>
                    ))}
                </div>

                <button
                    className="back-button"
                    onClick={onBack}
                >
                    ← HOME
                </button>
            </aside>


            {/* 중앙 캐릭터 */}
            <main className="character-preview-panel">

                <h1>캐릭터 생성</h1>
                <div className="character-preview">
                    <Avatar character={character} />
                </div>

                <input
                    type="text"
                    placeholder="캐릭터 이름"
                    value={character.name}
                    onChange={(e) =>
                        setCharacter({
                            ...character,
                            name: e.target.value,
                        })
                    }
                />

                <div className="character-info">
                    <span>헤어 {character.hair + 1}</span>
                    <span>눈 {character.eyes + 1}</span>
                    <span>옷 {character.clothes + 1}</span>
                </div>

            </main>


            {/* 오른쪽 상세 선택 */}
            <aside className="option-panel">

                <h2>{selectedCategoryLabel}</h2>

                <div className="option-grid">
                    {currentOptions.map((option, index) => (
                        <button
                            key={index}
                            className={
                                character[selectedCategory] === index
                                    ? 'option-button active'
                                    : 'option-button'
                            }
                            onClick={() => handleOptionSelect(index)}
                        >
                            <div className="option-thumbnail">
                                {index + 1}
                            </div>

                            <span>{option}</span>
                        </button>
                    ))}
                </div>

                <button
                    className="complete-button"
                    onClick={handleComplete}
                >
                    캐릭터 완성
                </button>

            </aside>

        </div>
    )
}

export default CharacterCreator
