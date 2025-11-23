'use client'

import { useState } from 'react'
import styles from './styles.module.css'
import { unfollowPerson, followPerson } from './services/profile.client'
import { FollowIcon, MessageIcon, SettingsIcon } from '../../components/ui/icons'
import { ProfileData } from './types'
import { FollowStatus } from '../../libs/globalTypes'
import { useAuth } from '../../providers/authProvider'

export default function EditProfileButton({ profile }: { profile: ProfileData }) {
    const [isOpen, setIsOpen] = useState(false)

    const handleOpenModal = () => {
        setIsOpen(true)
    }
    return (
        <>
            <button className={styles.editProfile} onClick={handleOpenModal}>
                <SettingsIcon />
                Edit Profile
                {/* {isOpen && <EditProfileModal profile={profile} onClose={() => setIsOpen(false)} />} */}
            </button>
        </>
    )
}

export function FollowButton({ targetUserId, initialStatus, isPrivate = false }: { targetUserId: string, initialStatus: FollowStatus, isPrivate?: boolean }) {
    const [status, setStatus] = useState<FollowStatus>(initialStatus);

    const handleFollow = async () => {
        if (status == 'follow' || status == 'none') {
            const nextState = isPrivate ? 'pending' : 'following';
            setStatus(nextState);

            await followPerson(targetUserId)
        } else {
            setStatus('follow');

            await unfollowPerson(targetUserId)
        }
    };

    const getButtonText = () => {
        switch (status) {
            case 'following': return 'Following';
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

export function ProfileClient({ userId, profile }: { userId: string, profile: ProfileData }) {
    const { user } = useAuth()

    if (!user) {
        return
    }

    const isOwnProfile = user.userId == userId
    return (
        <div className={styles.topPart}>
            {isOwnProfile ? (
                <EditProfileButton profile={profile} />
            ) : (
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