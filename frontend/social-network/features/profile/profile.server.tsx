import styles from './styles.module.css'
import getProfileData from './services/profile'
import EditProfileButton, { FollowButton, MessageButton } from './profile.client'
import { CalendarIcon, GlobeIcon } from '../../components/ui/icons'
import { useAuth } from '../../providers/authProvider'

export async function Profile({ userId }: { userId: number }) {
    const profile = await getProfileData(userId)

    const { user } = useAuth()

    const isOwnProfile = user.userId === userId;

    return (
        <div className={styles.profileContainer}>
            <div className={styles.topPart}>
                {isOwnProfile ? (
                    <EditProfileButton profile={profile} />
                ) : (
                    <>
                        <FollowButton
                            targetUserId={userId}
                            initialStatus={profile.status || 'none'}
                            isPrivate={profile.privacy === 'private'}
                        />
                        <MessageButton />
                    </>
                )}
            </div>

            <div className={styles.bottomPart}>
                <AvatarComponent />

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

function AvatarComponent() {
    // should get the avatar from cache //TODO:
    const avatarUrl = 'https://placehold.co/140x140/8b4fc9/ffffff?text=ABDNOUR'
    return (
        <div className={styles.avatarContainer}>
            <img
                className={styles.avatar}
                src={avatarUrl}
            />
        </div>
    )
}

