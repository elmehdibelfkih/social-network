import styles from './styles.module.css'
import getProfileData from './services/profile.client'
import { ProfileTopActions, AvatarHolder } from './profile.client'
import { CalendarIcon, GlobeIcon } from '../../components/ui/icons'
import { ProfileSettings } from './privacy.client'

export  async function Profile({ user_id }: { user_id: string }) {
    const profile = await getProfileData(user_id)
    if (profile == null) return
    return (
        <div className={styles.profileContainer}>
            <ProfileTopActions userId={user_id} profile={profile} />

            <div className={styles.bottomPart}>
                <div className={styles.dataPart}>
                    <AvatarHolder avatarId={profile.avatarId} />

                    <div className={styles.info}>
                        <h2 className={styles.fullname}>
                            {profile.firstName} {profile.lastName}
                        </h2>
                        <h3 className={styles.nickname}>@{profile.nickname}</h3>
                        <p className={styles.aboutMe}>{profile.aboutMe}</p>

                        <div className={styles.stats}>
                            <span><b>{profile.stats.followersCount}</b> Followers</span>
                            <span><b>{profile.stats.followingCount}</b> Following</span>
                        </div>

                        <div className={styles.meta}>
                            <span className={styles.joinDate}>
                                <CalendarIcon />
                                Joined {new Date(profile.joinedAt).toLocaleDateString()}
                            </span>
                            <span className={`${styles.privacy} ${styles[profile.privacy]}`}>
                                <GlobeIcon fillColor={profile.privacy === 'public' ? '#01a63f' : '#F7773D'} />
                                {profile.privacy} profile
                            </span>
                        </div>
                    </div>
                </div>
                <ProfileSettings privacy={profile.privacy} userId={user_id} />

            </div>
        </div>
    )
}



