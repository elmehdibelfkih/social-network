import styles from './styles.module.css'
import getProfileData from './services/profile'
import EditProfileButton from './profile.client'
import { CalendarIcon, GlobeIcon } from '@/components/ui/icons'

export async function Profile({ userId }: { userId: string }) {
    const profile = await getProfileData(userId)

    // TODO: should compare the userIds to find out if own profile or visiting other's

    return (
        <div className={styles.profileContainer}>
            <div className={styles.topPart}>
                <EditProfileButton profile={profile} />
            </div>

            <div className={styles.bottomPart}>
                <AvatarComponent avatarUrl={profile.avatarId} />

                <div className={styles.info}>
                    <h2 className={styles.fullname}>{profile.firstname} {profile.lastname}</h2>
                    <h3 className={styles.nickname}>@{profile.nickname}</h3>
                    <p className={styles.aboutMe}>{profile.aboutMe}</p>

                    <div className={styles.stats}>
                        <span><b>{profile.stats.followersCount}</b> Followers</span>
                        <span><b>{profile.stats.followingCount}</b> Following</span>
                    </div>

                    <div className={styles.meta}>
                        <span className={styles.joinDate}>
                            <CalendarIcon />
                            Joined {profile.joinedAt}
                        </span>
                        <span className={styles.privacy}>
                            <GlobeIcon fillColor='#01a63f' />
                            {profile.privacy} profile
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

function AvatarComponent({ avatarUrl }: { avatarUrl?: string }) {
    return (
        <div className={styles.avatarContainer}>
            <img
                className={styles.avatar}
                src={avatarUrl}
            />
        </div>
    )
}

