import { useState } from 'react'
import './Profile.css'
import Avatar from '../components/Avatar.jsx'
import items from '../data/items.js'

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"


function ItemDetail({
    itemId,
    inventory,
}) {
    const itemData = items[itemId]

    const inventoryItem =
        inventory.find(
            item => item.itemId === itemId
        )

    if (!itemData || !inventoryItem) {
        return null
    }

    return (
        <Card className="item-detail">

            <CardHeader className="item-detail-header">
                <CardTitle>
                    {itemData.name}
                </CardTitle>

                <Badge variant="secondary">
                    {itemData.rarity.toUpperCase()}
                </Badge>
            </CardHeader>

            <CardContent className="space-y-3">

                <p className="item-type">
                    TYPE : {itemData.type}
                </p>

                <Separator />

                <p className="item-description">
                    {itemData.description}
                </p>

                <Separator />

                <p className="item-quantity">
                    보유 수량 : {inventoryItem.quantity}
                </p>

            </CardContent>

        </Card>
    )
}


function Profile({
    characterId,
    onBack,
    onDelete,
    onEdit,
    onDaily,
}) {
    const [character] = useState(() => {
        const savedCharacters =
            JSON.parse(
                localStorage.getItem('characters')
            ) || []

        return savedCharacters.find(
            character =>
                character.id === characterId
        ) || null
    })

    const [
        selectedItemId,
        setSelectedItemId
    ] = useState(null)


    if (!character) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4">

                <p>
                    캐릭터를 찾을 수 없습니다.
                </p>

                <Button
                    variant="outline"
                    onClick={onBack}
                >
                    HOME
                </Button>

            </div>
        )
    }


    return (
        <div className="profile-page">

            <Button
                variant="ghost"
                className="profile-back-button"
                onClick={onBack}
            >
                ← HOME
            </Button>


            <Card className="profile-character">

                <CardContent className="space-y-6">

                    <div className="profile-thumbnail">
                        <Avatar character={character} />
                    </div>


                    <div className="profile-identity">

                        <h1 className="text-3xl font-semibold">
                            {character.name}
                        </h1>

                        <div className="profile-meta">

                            <span>
                                {character.age
                                    ? `${character.age}세`
                                    : '나이 미설정'}
                            </span>

                            <span className="profile-meta-divider">
                                /
                            </span>

                            <span>
                                {character.gender === 0
                                    ? '여성'
                                    : '남성'}
                            </span>

                            <span className="profile-meta-divider">
                                /
                            </span>

                            <Badge variant="secondary">
                                {
                                    {
                                        research: '연구부',
                                        exploration: '탐색부',
                                        security: '보안부',
                                        engineering: '공학부',
                                        office: '사무부',
                                        medical: '의료부',
                                    }[character.department] ?? '소속 미설정'
                                }
                            </Badge>

                        </div>

                    </div>


                    <Separator />


                    <div className="profile-stats grid grid-cols-3 gap-3">

                        <Card>
                            <CardContent className="p-4">
                                <p className="text-sm text-muted-foreground">
                                    HP
                                </p>

                                <p className="text-xl font-semibold">
                                    {character.hp ?? 100}
                                </p>
                            </CardContent>
                        </Card>


                        <Card>
                            <CardContent className="p-4">
                                <p className="text-sm text-muted-foreground">
                                    FOOD
                                </p>

                                <p className="text-xl font-semibold">
                                    {character.food ?? 0}
                                </p>
                            </CardContent>
                        </Card>


                        <Card>
                            <CardContent className="p-4">
                                <p className="text-sm text-muted-foreground">
                                    CREDIT
                                </p>

                                <p className="text-xl font-semibold">
                                    {character.credit ?? 0}
                                </p>
                            </CardContent>
                        </Card>

                    </div>


                    <Separator />


                    <Card className="profile-inventory">

                        <CardHeader>
                            <CardTitle>
                                인벤토리
                            </CardTitle>
                        </CardHeader>


                        <CardContent>

                            {(character.inventory ?? []).length === 0 ? (

                                <p className="text-muted-foreground">
                                    보유한 아이템이 없습니다.
                                </p>

                            ) : (

                                <div className="space-y-5">

                                    <div className="inventory-grid">

                                        {(character.inventory ?? []).map(
                                            inventoryItem => {

                                                const itemData =
                                                    items[
                                                    inventoryItem.itemId
                                                    ]

                                                if (!itemData) {
                                                    return null
                                                }

                                                const isSelected =
                                                    selectedItemId ===
                                                    inventoryItem.itemId

                                                return (
                                                    <Button
                                                        key={
                                                            inventoryItem.itemId
                                                        }
                                                        variant={
                                                            isSelected
                                                                ? "default"
                                                                : "outline"
                                                        }
                                                        className="inventory-slot"
                                                        onClick={() =>
                                                            setSelectedItemId(
                                                                selectedItemId === inventoryItem.itemId
                                                                    ? null
                                                                    : inventoryItem.itemId
                                                            )
                                                        }
                                                    >
                                                        <span className="inventory-slot-name">
                                                            {itemData.name}
                                                        </span>

                                                        <Badge
                                                            variant="secondary"
                                                            className="inventory-slot-quantity"
                                                        >
                                                            ×
                                                            {
                                                                inventoryItem.quantity
                                                            }
                                                        </Badge>
                                                    </Button>
                                                )
                                            }
                                        )}

                                    </div>


                                    {selectedItemId && (

                                        <ItemDetail
                                            itemId={
                                                selectedItemId
                                            }
                                            inventory={
                                                character.inventory
                                            }
                                        />

                                    )}

                                </div>

                            )}

                        </CardContent>

                    </Card>


                    <Separator />

                    <div className="activity-section">

                        <h2>활동 기록</h2>

                        {(character.activityLog ?? []).length === 0 ? (

                            <p>아직 활동 기록이 없습니다.</p>

                        ) : (

                            <div className="activity-list">

                                {(character.activityLog ?? []).map(
                                    (activity, index) => (

                                        <div
                                            key={`${activity.date}-${index}`}
                                            className="activity-card"
                                        >

                                            <div className="activity-card-header">

                                                <span className="activity-date">
                                                    {activity.date}
                                                </span>

                                                <span className="activity-title">
                                                    {activity.eventTitle}
                                                </span>

                                            </div>

                                            <p className="activity-choice">
                                                선택 : {activity.choice}
                                            </p>

                                            <p className="activity-result">
                                                {activity.result}
                                            </p>

                                        </div>

                                    )
                                )}

                            </div>

                        )}

                    </div>


                    <Card className="profile-data">

                        <CardHeader>
                            <CardTitle>
                                캐릭터 정보
                            </CardTitle>
                        </CardHeader>


                        <CardContent className="grid grid-cols-2 gap-3">

                            <p>
                                피부 : {character.skin + 1}
                            </p>

                            <p>
                                헤어 : {character.hair + 1}
                            </p>

                            <p>
                                눈 : {character.eyes + 1}
                            </p>

                            <p>
                                표정 : {character.mouth + 1}
                            </p>

                            <p>
                                옷 : {character.clothes + 1}
                            </p>

                            <p>
                                악세사리 : {character.accessory + 1}
                            </p>

                        </CardContent>

                    </Card>


                    <Separator />


                    <div className="flex flex-wrap gap-3">

                        <Button
                            onClick={() =>
                                onEdit(character.id)
                            }
                        >
                            캐릭터 수정
                        </Button>


                        <Button
                            variant="destructive"
                            onClick={() =>
                                onDelete(character.id)
                            }
                        >
                            캐릭터 삭제
                        </Button>


                        <Button
                            variant="secondary"
                            onClick={() =>
                                onDaily(character.id)
                            }
                        >
                            오늘의 활동
                        </Button>

                    </div>

                </CardContent>

            </Card>

        </div>
    )
}

export default Profile
