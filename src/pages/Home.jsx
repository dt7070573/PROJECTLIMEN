import { useState } from 'react'
import './Home.css'
import Avatar from '../components/Avatar.jsx'

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

function Home({
    onCreateCharacter,
    onSelectCharacter,
}) {
    const [characters] = useState(() => {
        return JSON.parse(localStorage.getItem('characters')) || []
    })

    return (
        <div className="home-page">

            <div className="space-y-2 text-center">
                <h1 className="text-4xl font-bold">
                    PROJECT LIMEN
                </h1>

                <p className="text-muted-foreground">
                    나만의 캐릭터를 만들고 PROJECT LIMEN에 참가하세요.
                </p>
            </div>


            {characters.length === 0 ? (

                <Button
                    size="lg"
                    className="create-first-button"
                    onClick={onCreateCharacter}
                >
                    캐릭터 생성
                </Button>

            ) : (

                <div className="character-list">

                    {characters.map(character => (

                        <Card
                            key={character.id}
                            className="character-card cursor-pointer"
                            onClick={() =>
                                onSelectCharacter(character.id)
                            }
                        >
                            <CardContent className="flex flex-col items-center gap-3 p-4">

                                <div className="character-thumbnail">
                                    <Avatar character={character} />
                                </div>

                                <span className="font-medium">
                                    {character.name}
                                </span>

                            </CardContent>
                        </Card>

                    ))}


                    {characters.length < 5 && (

                        <Button
                            variant="outline"
                            className="add-character-button"
                            onClick={onCreateCharacter}
                        >
                            +
                        </Button>

                    )}

                </div>

            )}


            <Badge
                variant="secondary"
                className="character-count"
            >
                {characters.length} / 5
            </Badge>

        </div>
    )
}

export default Home
