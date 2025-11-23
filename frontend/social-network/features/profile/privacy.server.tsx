import styles from './styles.module.css'
import PrivacyToggle from './privacy.client'

export default function ProfileSettings({ privacy, joinDate }: { privacy: string, joinDate: string }) {
    return (
        <div className={styles.settingsSection}>
            <div className={styles.container}>
                <h2 className={styles.title}>Profile Settings</h2>

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
                        <PrivacyToggle />
                    </div>

                    <div className={styles.innerBlock}>
                        <div className={styles.content}>
                            <h4 className={styles.heading}>Account Status</h4>
                            <p className={styles.description}>{`Active since ${joinDate}`}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
