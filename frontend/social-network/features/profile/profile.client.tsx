'use client'

import { useState, useEffect } from 'react'
import styles from './styles.module.css'
import { unfollowPerson, followPerson } from './profileSrevice'
import { FollowIcon, MessageIcon } from '@/components/ui/icons'
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
    const [mounted, setMounted] = useState(false)

    useEffect(() => setMounted(true), [])

    if (!mounted || !user) {
        return <div className={styles.topPart}></div>
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
