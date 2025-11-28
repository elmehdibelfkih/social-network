'use client'

import { useState, useEffect } from 'react'
import styles from './styles.module.css'
import { unfollowPerson, followPerson, getMedia } from './profileSrevice'
import { FollowIcon, MessageIcon, SettingsIcon, UserIcon } from '@/components/ui/icons'
import { ProfileData } from './types'
import { FollowStatus } from '@/libs/globalTypes'
import { useAuth } from '@/providers/authProvider'

export function FollowButton({ targetUserId, initialStatus, isPrivate = false }: { targetUserId: string, initialStatus: FollowStatus, isPrivate?: boolean }) {
    const [status, setStatus] = useState<FollowStatus>(initialStatus);

    const handleFollow = async () => {
        if (status == 'follow' || status == 'none') {
            const previousStatus = status
            const nextState = isPrivate ? 'pending' : 'accepted';
            setStatus(nextState);

            followPerson(targetUserId).catch(() => {
                setStatus(previousStatus)
            })
        } else {
            const previousStatus = status
            setStatus('follow');

            unfollowPerson(targetUserId).catch(() => {
                setStatus(previousStatus)
            })
        }
    }

    const getButtonText = () => {
        switch (status) {
            case 'accepted': return 'Following';
            case 'pending': return 'Requested';
            case 'declined': return 'Follow';
            default: return 'Follow';
        }
    };

    return (
        <button className={styles.followButton} onClick={handleFollow} >
            <FollowIcon />
            <span>{getButtonText()}</span>
        </button>
    );
}

export function MessageButton() {
    const handleMessage = () => {
        // TODO: should open the conversation modal
    }
    return (
        <button className={styles.messageButton} onClick={handleMessage} >
            <MessageIcon />
            <span>{"Message"}</span>
        </button>
    )
}

export function ProfileTopActions({ userId, profile }: { userId: string, profile: ProfileData }) {
    const { user } = useAuth()

    if (!user) {
        return null
    }
    const isOwnProfile = user.userId == userId

    return (
        <div className={styles.topPart}>
            {!isOwnProfile && (
                <>
                    <FollowButton
                        targetUserId={userId}
                        initialStatus={profile.status || 'none'}
                        isPrivate={profile.privacy === 'private'}
                    />
                    <MessageButton />
                </>
            )}
        </div>
    )
}
export function AvatarHolder({ avatarId }: { avatarId: number | null }) {
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

    useEffect(() => {
        if (avatarId) {
            getMedia(String(avatarId))
                .then((response) => {
                    if (response.mediaEncoded) {
                        setAvatarUrl(`data:image/png;base64,${response.mediaEncoded}`)
                    }
                })
                .catch(() => {
                    setAvatarUrl(null)
                })
        }
    }, [avatarId])

    return (
        <div className={styles.avatarContainer}>
            {avatarUrl ? (
                <img
                    className={styles.avatar}
                    src={avatarUrl}
                    alt="User avatar"
                />
            ) : (
                <div className={styles.avatarPlaceholder}>
                    <UserIcon />
                </div>
            )}
        </div>
    )
}