import styles from './styles.module.css'
import { Counts, Privacy, ProfileTopActions } from './profile.client'
import { CalendarIcon, GlobeIcon } from '../../components/ui/icons'
import { ProfileSettings } from './privacy.client'
import { ProfileData } from './types'
import AvatarHolder from '@/components/ui/avatar_holder/avatarholder.client'
import { ProfileProvider } from './profile.provider'

export function Profile({ profile }: { profile: ProfileData }) {

    if (profile == null) return
    const initialStats = {
        followersCount: profile.stats.followersCount,
        followingCount: profile.stats.followingCount,
        postsCount: profile.stats.postsCount
    }
    return (
        <ProfileProvider initialStats={initialStats}>
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

                        <Counts userId={profile.userId}/>
                        <div className={styles.meta}>
                            <span className={styles.joinDate}>
                                <CalendarIcon />
                                Joined {new Date(profile.joinedAt).toLocaleDateString()}
                            </span>
                            <Privacy userId={profile.userId} privacy={profile.privacy}/>
                        </div>
                    </div>
                </div>
                <ProfileSettings privacy={profile.privacy} userId={String(profile.userId)} />

            </div>
        </div>
        </ProfileProvider>
    )
}
