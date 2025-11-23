'use client'

import { useState } from 'react'
import styles from './styles.module.css'
import { togglePrivacy } from './services/profile.client'
import { useAuth } from '../../providers/authProvider'

export default function PrivacyToggle() {
    const [isPublic, setIsPublic] = useState(true)
    const { user } = useAuth()

    const handleToggle = async () => {
        try {
            const payload = {
                privacy: isPublic ? "private" : "public"
            }
            const resp = await togglePrivacy({
                userId: user.userId,
                body: payload
            })
            console.log(resp)
            setIsPublic(!isPublic)
        } catch (error) {
            console.error("Failed to toggle privacy", error)
        }
    }

    return (
        <button
            className={styles.toggleButton}
            onClick={handleToggle}
            style={{
                width: '44px',
                height: '24px',
                borderRadius: '12px',
                backgroundColor: isPublic ? '#000' : '#ccc',
                position: 'relative',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.3s'
            }}
        >
            <span style={{
                position: 'absolute',
                top: '2px',
                left: isPublic ? '22px' : '2px',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: 'white',
                transition: 'left 0.3s'
            }} />
        </button>
    )
}