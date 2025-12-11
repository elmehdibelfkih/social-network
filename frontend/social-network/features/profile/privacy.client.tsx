'use client'

import { useState, useEffect } from 'react'
import styles from './styles.module.css'
import { togglePrivacy } from './profileSrevice'
import { useAuth } from '@/providers/authProvider'

export default function PrivacyToggle({ privacy }: { privacy: string }) {
    const [isPublic, setIsPublic] = useState(privacy == 'public' ? true : false)
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

export function ProfileSettings({ privacy, userId }: { privacy: string, userId: string }) {
    const { user } = useAuth()
    const [mounted, setMounted] = useState(false)

    useEffect(() => setMounted(true), [])

    if (!mounted || !user) return null
    const isOwnProfile = user.userId == userId
    if (!isOwnProfile) return null
    return (
        <div className={styles.settingsSection}>
            <div className={styles.container}>
                <div className={styles.privacyBlock}>
                    <div className={styles.innerBlock}>
                        <div className={styles.content}>
                            <h4 className={styles.heading}>Profile Visibility</h4>
                            <p className={styles.description}>
                                {privacy === 'public'
                                    ? 'Anyone can see your profile and posts'
                                    : 'Only your followers can see your profile'}
                            </p>
                        </div>
                        <PrivacyToggle privacy={privacy} />
                    </div>
                </div>
            </div>
        </div>
    )
}