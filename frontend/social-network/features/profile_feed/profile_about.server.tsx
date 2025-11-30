import styles from './about.module.css'
import getProfileData from '../profile/profileSrevice'
import { ProfileData } from '../profile/types'

export function AboutSection({ profile }: { profile: ProfileData }) {

    if (!profile) {
        return (
            <div className={styles.aboutContainer}>
                <p>Unable to load profile information</p>
            </div>
        )
    }

    const memberSince = profile.joinedAt
        ? new Date(profile.joinedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        : 'Unknown'

    const dateOfBirth = profile.dateOfBirth
        ? new Date(profile.dateOfBirth).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        : null

    return (
        <div className={styles.aboutContainer}>
            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Bio</h3>
                <p className={styles.bioText}>
                    {profile.aboutMe || 'No bio available'}
                </p>
            </div>

            <div className={styles.divider} />

            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Personal Information</h3>
                {dateOfBirth && (
                    <div className={styles.contactItem}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="16" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <span>Born {dateOfBirth}</span>
                    </div>
                )}
            </div>

            <div className={styles.divider} />

            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Profile Stats</h3>
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>Total Posts</div>
                        <div className={styles.statValue}>{profile.stats.postsCount}</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>Member Since</div>
                        <div className={styles.statValue}>{memberSince}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}