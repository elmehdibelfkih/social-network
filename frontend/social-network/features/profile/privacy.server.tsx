'use client'
import styles from './styles.module.css'
import PrivacyToggle from './privacy.client'
import { useAuth } from '../../providers/authProvider'

export default function ProfileSettings({ privacy, userId }: { privacy: string, userId: string }) {
    const { user } = useAuth()
    if (!user) return
    const isOwnProfile = user.userId == userId
    if (!isOwnProfile) return
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
