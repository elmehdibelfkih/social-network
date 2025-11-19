'use client'

import { useState } from 'react'
import styles from './styles.module.css'
import { SettingsIcon } from '../../components/ui/icons'
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