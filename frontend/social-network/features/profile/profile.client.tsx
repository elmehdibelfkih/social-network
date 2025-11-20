'use client'

import { useState } from 'react'
import styles from './styles.module.css'
// @ts-ignore
import { SettingsIcon } from '@/components/ui/icons'

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

export function FollowButton(followStatus: string) {
    const [isFollowing, setIsFollowing] = useState(false)

    const handleFollow = () => {
        
    }

    return (
        <button className={styles.followButton} onClick={handleFollow}>
            {isFollowing ? 'Following' : 'Follow'}

        </button>
    )
}