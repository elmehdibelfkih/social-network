import styles from './styles.module.css'
import getProfileData from './services/profile'
import EditProfileButton, { FollowButton } from './profile.client'
import { CalendarIcon, GlobeIcon } from '@/components/ui/icons'

export async function Profile({ userId }: { userId: string }) {
    const profile = await getProfileData(userId)

    const isOwnProfile = currentUserId === userId; // TODO: should get the current user's id

    return (
        <div className={styles.profileContainer}>
            <div className={styles.topPart}>
                {isOwnProfile ? (
                    <EditProfileButton profile={profile} />
                ) : (
                    <FollowButton
                        targetUserId={userId}
                        initialStatus={profile.followStatus || 'none'}
                        isPrivate={profile.privacy === 'private'}
                    />
                )}
            </div>

            <div className={styles.bottomPart}>
                <AvatarComponent avatarUrl={profile.avatarId} />

                <div className={styles.info}>
                    <h2 className={styles.fullname}>
                        {profile.firstname} {profile.lastname}
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
                        <span className={styles.privacy}>
                            <GlobeIcon fillColor={profile.privacy === 'public' ? '#01a63f' : '#666'} />
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

