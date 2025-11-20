'use client'

import { useState } from 'react'
import styles from './styles.module.css'
// @ts-ignore
import { FollowIcon, SettingsIcon } from '@/components/ui/icons'
import { unfollowPerson, followPerson } from './services/profile'
import { ProfileData } from './types'

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

type FollowStatus = 'none' | 'follow' | 'following' | 'pending' | 'declined';

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
            <span>{getButtonText()}</span>
        </button>
    );
}