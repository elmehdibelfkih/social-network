import styles from './styles.module.css'
import { Privacy, ProfileTopActions } from './profile.client'
import { CalendarIcon, GlobeIcon } from '../../components/ui/icons'
import { ProfileSettings } from './privacy.client'
import { ProfileData } from './types'
import AvatarHolder from '@/components/ui/avatar_holder/avatarholder.client'

export function Profile({ profile }: { profile: ProfileData }) {

    if (profile == null) return
    return (
        <div className={styles.profileContainer}>
            <ProfileTopActions userId={String(profile.userId)} profile={profile} />

            <div className={styles.bottomPart}>
                <div className={styles.dataPart}>
                    <AvatarHolder avatarId={profile.avatarId ?? null} size={150} />
                    <div className={styles.info}>
                        <h2 className={styles.fullname}>
                            {profile.firstName} {profile.lastName}
                        </h2>
                        <h3 className={styles.nickname}>@{profile.nickname}</h3>
                        <p className={styles.aboutMe}>{profile.aboutMe}</p>

                        <div className={styles.stats}>
                            <span><b>{profile.stats.postsCount || 0}</b> Posts</span>
                            <span><b>{profile.stats.followersCount}</b> Followers</span>
                            <span><b>{profile.stats.followingCount}</b> Following</span>
                        </div>
                        <div className={styles.meta}>
                            <span className={styles.joinDate}>
                                <CalendarIcon />
                                Joined {new Date(profile.joinedAt).toLocaleDateString()}
                            </span>
                            <Privacy userId={profile.userId} privacy={profile.privacy}/>
                            {/* <span className={`${styles.privacy} ${styles[profile.privacy]}`}>
                                <GlobeIcon fillColor={profile.privacy === 'public' ? '#01a63f' : '#F7773D'} />
                                {profile.privacy} profile
                            </span> */}
                        </div>
                    </div>
                </div>
                <ProfileSettings privacy={profile.privacy} userId={String(profile.userId)} />

            </div>
        </div>
    )
}



