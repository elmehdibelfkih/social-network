
import styles from './about.module.css'
import { ProfileAPIResponse } from "@/libs/globalTypes";


const InfoItem = ({ icon, text }: { icon: React.ReactNode, text: string }) => (
    <div className={styles.contactItem}>
        {icon}
        <span>{text}</span>
    </div>
);


const StatCard = ({ label, value }: { label: string, value: string | number }) => (
    <div className={styles.statCard}>
        <div className={styles.statLabel}>{label}</div>
        <div className={styles.statValue}>{value}</div>
    </div>
);

export function AboutSection({ profile }: { profile: ProfileAPIResponse }) {
    if (!profile) {
        return (
            <div className={styles.aboutContainer}>
                <p>Unable to load profile information</p>
            </div>
        )
    }

    const memberSince = formatDate(profile.joinedAt, { month: 'long', year: 'numeric' }) || 'Unknown'
    const dateOfBirth = formatDate(profile.dateOfBirth, { day: 'numeric', month: 'long', year: 'numeric' })


    const personalInfo = [
        ...(dateOfBirth ? [{
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>,
            text: `Born ${dateOfBirth}`
        }] : []),
        {
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>,
            text: `Email: ${profile.email}`
        },
        {
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
            text: `First Name: ${profile.firstName}`
        },
        {
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
            text: `Last Name: ${profile.lastName}`
        },
        ...(profile.nickname ? [{
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
            text: `Nickname: ${profile.nickname}`
        }] : [])
    ];

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
                <div className={styles.contactGrid}>
                    {personalInfo.map((item, index) => <InfoItem key={index} icon={item.icon} text={item.text} />)}
                </div>
            </div>

            <div className={styles.divider} />

            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Profile Stats</h3>
                <div className={styles.statsGrid}>
                    <StatCard label="Total Posts" value={profile.stats.postsCount} />
                    <StatCard label="Followers" value={profile.stats.followersCount} />
                    <StatCard label="Following" value={profile.stats.followingCount} />
                    <StatCard label="Member Since" value={memberSince} />
                </div>
            </div>
        </div>
    )
}

const formatDate = (date: string | null, options?: Intl.DateTimeFormatOptions) => {
    if (!date) return null
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        ...options
    })
}
