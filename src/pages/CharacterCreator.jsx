import { useState } from 'react'
import './CharacterCreator.css'
import Avatar from '../components/Avatar.jsx'

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

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
}) {
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
                return existingCharacter
            }
        }

        return {
            name: '',
            age: '',
            department: 'research',

            gender: 0,
            skin: 0,
            hair: 0,
            eyes: 0,
            mouth: 0,
            clothes: 0,
            accessory: 0,
            glasses: 0,

            hp: 100,
            food: 0,
            credit: 0,

            inventory: [],
            activityLog: [],
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
        categories.find(
            category => category.id === selectedCategory
        )?.label

    return (
        <div className="creator-page">

            {/* 왼쪽 대분류 */}
            <Card className="category-panel">

                <CardHeader>
                    <CardTitle>
                        외형 설정
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">

                    <div className="category-list">

                        {categories.map(category => (

                            <Button
                                key={category.id}
                                variant={
                                    selectedCategory === category.id
                                        ? "default"
                                        : "ghost"
                                }
                                className="category-button w-full justify-start"
                                onClick={() =>
                                    setSelectedCategory(category.id)
                                }
                            >
                                {category.label}
                            </Button>

                        ))}

                    </div>

                    <Separator />

                    <Button
                        variant="outline"
                        className="back-button w-full"
                        onClick={onBack}
                    >
                        ← HOME
                    </Button>

                </CardContent>

            </Card>


            {/* 중앙 캐릭터 */}
            <Card className="character-preview-panel">

                <CardHeader className="w-full items-center text-center">
                    <CardTitle className="text-2xl whitespace-nowrap">
                        캐릭터 생성
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-5">

                    <div className="character-preview">
                        <Avatar character={character} />
                    </div>

                    <div className="character-basic-info">

                        <div className="creator-field">
                            <label>이름</label>

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
                        </div>


                        <div className="creator-field">
                            <label>나이</label>

                            <input
                                type="number"
                                min="1"
                                max="999"
                                placeholder="나이"
                                value={character.age}
                                onChange={(e) =>
                                    setCharacter({
                                        ...character,
                                        age: e.target.value,
                                    })
                                }
                            />
                        </div>


                        <div className="creator-field">
                            <label>소속</label>

                            <select
                                value={character.department}
                                onChange={(e) =>
                                    setCharacter({
                                        ...character,
                                        department: e.target.value,
                                    })
                                }
                            >
                                <option value="research">연구부</option>
                                <option value="exploration">탐색부</option>
                                <option value="security">보안부</option>
                                <option value="engineering">공학부</option>
                                <option value="office">사무부</option>
                                <option value="medical">의료부</option>
                            </select>
                        </div>

                    </div>

                    <Separator />

                    <div className="character-info flex flex-wrap gap-2">

                        <Badge variant="secondary">
                            헤어 {character.hair + 1}
                        </Badge>

                        <Badge variant="secondary">
                            눈 {character.eyes + 1}
                        </Badge>

                        <Badge variant="secondary">
                            옷 {character.clothes + 1}
                        </Badge>

                    </div>

                </CardContent>

            </Card>


            {/* 오른쪽 상세 선택 */}
            <Card className="option-panel">

                <CardHeader>

                    <div className="flex items-center justify-between">

                        <CardTitle>
                            {selectedCategoryLabel}
                        </CardTitle>

                        <Badge variant="outline">
                            {currentOptions.length}
                        </Badge>

                    </div>

                </CardHeader>

                <CardContent className="space-y-5">

                    <div className="option-grid">

                        {currentOptions.map((option, index) => {

                            const isSelected =
                                character[selectedCategory] === index

                            return (
                                <Button
                                    key={index}
                                    variant={
                                        isSelected
                                            ? "default"
                                            : "outline"
                                    }
                                    className="option-button h-auto flex-col gap-2 p-3"
                                    onClick={() =>
                                        handleOptionSelect(index)
                                    }
                                >
                                    <div className="option-thumbnail">
                                        {index + 1}
                                    </div>

                                    <span>
                                        {option}
                                    </span>

                                </Button>
                            )
                        })}

                    </div>

                    <Separator />

                    <Button
                        className="complete-button w-full"
                        size="lg"
                        onClick={handleComplete}
                    >
                        캐릭터 완성
                    </Button>

                </CardContent>

            </Card>

        </div>
    )
}

export default CharacterCreator
