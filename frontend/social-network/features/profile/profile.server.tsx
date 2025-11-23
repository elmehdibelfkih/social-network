import styles from './styles.module.css'
import getProfileData from './services/profile.client'
import { ProfileClient, AvatarHolder } from './profile.client'
import { CalendarIcon, GlobeIcon } from '../../components/ui/icons'
import PrivacySettings from './privacy.server'

export async function Profile({ user_id }: { user_id: string }) {

    const profile = await getProfileData(user_id)

    return (
        <div className={styles.profileContainer}>
            <ProfileClient userId={user_id} profile={profile} />

            <div className={styles.bottomPart}>
                <div className={styles.dataPart}>
                    <AvatarHolder />

                    <div className={styles.info}>
                        <h2 className={styles.fullname}>
                            {profile.payload.firstName} {profile.payload.lastName}
                        </h2>
                        <h3 className={styles.nickname}>@{profile.payload.nickname}</h3>
                        <p className={styles.aboutMe}>{profile.payload.aboutMe}</p>

                        <div className={styles.stats}>
                            <span><b>{profile.payload.stats.followersCount}</b> Followers</span>
                            <span><b>{profile.payload.stats.followingCount}</b> Following</span>
                        </div>

                        <div className={styles.meta}>
                            <span className={styles.joinDate}>
                                <CalendarIcon />
                                Joined {new Date(profile.payload.joinedAt).toLocaleDateString()}
                            </span>
                            <span className={`${styles.privacy} ${styles[profile.payload.privacy]}`}>
                                <GlobeIcon fillColor={profile.payload.privacy === 'public' ? '#01a63f' : '#F7773D'} />
                                {profile.payload.privacy} profile
                            </span>
                        </div>
                    </div>
                </div>
                <PrivacySettings privacy={profile.payload.privacy} joinDate={profile.payload.joinedAt} />

            </div>
        </div>
    )
}



