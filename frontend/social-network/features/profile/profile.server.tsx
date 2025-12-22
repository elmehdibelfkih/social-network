import styles from './styles.module.css'
import { Counts, Privacy, ProfileTopActions } from './profile.client'
import { CalendarIcon } from '../../components/ui/icons'
import { ProfileSettings } from './privacy.client'
import AvatarHolder from '@/components/ui/avatar_holder/avatarholder.client'
import { ProfileProvider } from './profile.provider'
import { timeAgo } from "@/libs/helpers";
import { ProfileAPIResponse } from '@/libs/globalTypes'

export function Profile({ profile }: { profile: ProfileAPIResponse }) {
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
                            <h3 className={styles.nickname}>{profile.nickname ? `@${profile.nickname}` : `@` + profile.firstName + profile.lastName} </h3>
                            <p className={styles.aboutMe}>{profile.aboutMe}</p>

                            <Counts userId={profile.userId} />
                            <div className={styles.meta}>
                                <span className={styles.joinDate}>
                                    <CalendarIcon />
                                    Joined {timeAgo(profile.joinedAt)}
                                </span>
                                <Privacy userId={profile.userId} privacy={profile.privacy} />
                            </div>
                        </div>
                    </div>
                    <ProfileSettings privacy={profile.privacy} userId={String(profile.userId)} />

                </div>
            </div>
        </ProfileProvider>
    )
}
