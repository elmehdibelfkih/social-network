'use client'

import { useState, useEffect } from 'react'
import styles from './styles.module.css'
import { unfollowPerson, followPerson, getMedia } from './services/profile.client'
import { FollowIcon, MessageIcon, SettingsIcon } from '../../components/ui/icons'
import { ProfileData } from './types'
import { FollowStatus } from '../../libs/globalTypes'
import { useAuth } from '../../providers/authProvider'

export function EditProfileButton({ profile }: { profile: ProfileData }) {
    const [isOpen, setIsOpen] = useState(false)

    const handleOpenModal = () => {
        setIsOpen(true)
    }
    return (
        <>
            <button className={styles.editProfile} onClick={handleOpenModal}>
                <SettingsIcon />
                Edit Profile
            </button>
        </>
    )
}

export function FollowButton({ targetUserId, initialStatus, isPrivate = false }: { targetUserId: string, initialStatus: FollowStatus, isPrivate?: boolean }) {
    const [status, setStatus] = useState<FollowStatus>(initialStatus);

    const handleFollow = async () => {
        if (status == 'follow' || status == 'none') {
            const nextState = isPrivate ? 'pending' : 'accepted';
            setStatus(nextState);

            await followPerson(targetUserId)
        } else {
            setStatus('follow');

            await unfollowPerson(targetUserId)
        }
    };

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
        return
    }
    const isOwnProfile = user.userId == userId

    return (
        <div className={styles.topPart}>
            {!isOwnProfile && (
                <>
                    <FollowButton
                        targetUserId={userId}
                        initialStatus={profile.payload.status || 'none'}
                        isPrivate={profile.payload.privacy === 'private'}
                    />
                    <MessageButton />
                </>
            )}
        </div>
    )
}

export function AvatarHolder() {
    const { user } = useAuth()
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

    useEffect(() => {

        if (user.avatarId) {
            getMedia(String(user.avatarId))
                .then((response) => {
                    if (response.payload.mediaEncoded) {
                        setAvatarUrl(`data:image/png;base64,${response.payload.mediaEncoded}`)
                    }
                })
                .catch((err) => {
                    console.error('Failed to fetch avatar:', err)
                })
        }
    }, [user?.avatarId])

    return (
        <div className={styles.avatarContainer}>
            <img
                className={styles.avatar}
                src={avatarUrl}
            />
        </div>
    )
}