'use client'
import { http } from '@/libs/apiFetch'
import styles from './style.module.css'
import { useAuth } from '@/providers/authProvider'
import { useEffect, useState } from 'react'
import { Follower } from '@/libs/globalTypes'
import { UserIcon } from '../icons'
import { useDebounce } from '@/libs/debounce'
import { getMedia } from '@/features/profile/profileSrevice'

interface AddFriendsProps {
    title: string
    desc: string
    componentId: string
    purpose: 'group' | 'post'
    onComplete?: (selectedUserIds: number[]) => void
    onClose?: () => void
}

export default function AddFriends({ title, desc, componentId, purpose, onComplete, onClose }: AddFriendsProps) {
    const { user } = useAuth()
    const [followers, setFollowers] = useState<Follower[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const debounceValue = useDebounce(searchQuery, 350)
    const [selectedFollowers, setSelectedFollowers] = useState<Set<number>>(new Set())

    useEffect(() => {
        const fetchFollowers = async () => {
            if (!user?.userId) return

            try {
                const endpoint = debounceValue.length === 0
                    ? `/api/v1/users/${user.userId}/followers`
                    : `/api/v1/search?q=${debounceValue}&type=users`

                const resp = await http.get<(Follower)[]>(endpoint)

                setFollowers(resp)
            } catch (error) {
                console.error('Failed to fetch followers:', error)
                setFollowers([])
            }
        }

        fetchFollowers()
    }, [debounceValue, user?.userId])

    const handleInvite = async () => {
        const userIds = Array.from(selectedFollowers);

        if (purpose === "post") {
            if (onComplete) {
                onComplete(userIds);
            }
            setSelectedFollowers(new Set());
            return;
        }

        if (purpose === "group") {
            try {
                for (const userId of userIds) {
                    try {
                        await http.post(`/api/v1/groups/${componentId}/invite/${userId}`);
                    } catch (error) {
                        console.error(`Failed to invite user ${userId}:`, error);
                    }
                }
                setSelectedFollowers(new Set());
                if (onComplete) {
                    onComplete(userIds);
                }
            } catch (error) {
                console.error('Failed to complete operation:', error);
            }
        }
    }

    const toggleSelection = (userId: number) => {
        setSelectedFollowers(prev => {
            const newSet = new Set(prev)
            if (newSet.has(userId)) {
                newSet.delete(userId)
            } else {
                newSet.add(userId)
            }
            return newSet
        })
    }

    return (
        <div className={styles.outerContainer}>
            <div className={styles.header}>
                <div>
                    <h3>{title}</h3>
                    <h4>{desc}</h4>
                </div>
                {onClose && (
                    <button className={styles.closeBtn} onClick={onClose}>
                        ×
                    </button>
                )}
            </div>
            <div className={styles.searchContainer}>
                <input
                    type="text"
                    placeholder="Search by name or username..."
                    className={styles.searchInput}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    maxLength={50}
                    required
                />
            </div>
            <div className={styles.friendsList}>
                {followers?.length === 0 ? (
                    <p className={styles.noResults}>
                        {searchQuery ? 'No results found' : 'No followers found'}
                    </p>
                ) : (
                    followers?.map((follower) => (
                        <FriendBlock
                            key={follower.userId}
                            friend={follower}
                            isSelected={selectedFollowers.has(follower.userId)}
                            onToggle={() => toggleSelection(follower.userId)}
                        />
                    ))
                )}
            </div>

            {selectedFollowers.size > 0 && (
                <div className={styles.inviteFooter}>
                    <span>{selectedFollowers.size} selected</span>
                    <button
                        className={styles.inviteBtn}
                        onClick={handleInvite}>
                        {purpose === "group"
                            ? `Invite Selected (${selectedFollowers.size})`
                            : `Allow Selected (${selectedFollowers.size})`
                        }
                    </button>
                </div>
            )}
        </div>
    )
}

type FriendBlockProps = {
    friend: Follower
    isSelected: boolean
    onToggle: () => void
}

function FriendBlock({ friend, isSelected, onToggle }: FriendBlockProps) {
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

    useEffect(() => {
        if (!friend.avatarId) {
            setAvatarUrl(null)
            return
        }

        getMedia(String(friend.avatarId))
            .then((response) => {
                if (response.mediaEncoded) {
                    setAvatarUrl(`data:image/png;base64,${response.mediaEncoded}`)
                }
            })
            .catch(() => {
                setAvatarUrl(null)
            })
    }, [friend.avatarId])

    return (
        <div
            className={`${styles.friendBlock} ${isSelected ? styles.selected : ''}`}
            onClick={onToggle}
        >
            {avatarUrl ? (
                <img src={avatarUrl} className={styles.avatar} />
            ) : (
                <div className={styles.avatarPlaceholder}>
                    <UserIcon />
                </div>
            )}
            <div className={styles.friendInfo}>
                <h3>{friend.firstName} {friend.lastName}</h3>
                <h4>@{friend.nickname || 'No nickname'}</h4>
            </div>
            <span className={styles.selectText}>
                {isSelected ? '✓ Selected' : 'Select'}
            </span>
        </div>
    )
}