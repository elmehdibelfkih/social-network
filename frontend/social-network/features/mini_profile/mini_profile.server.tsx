import { getProfileServer } from './mini_profile.services'
import { displayName, handleName } from '@/libs/helpers'
import styles from './styles.module.css'
import type { ProfileAPIResponse } from '@/libs/globalTypes'
import { MiniProfileActions } from './mini_profile.client'
import { AvatarHolder } from '@/components/ui/avatar_holder/avatarholder.client'


type Props = {
  userId?: string | number
  data?: ProfileAPIResponse
  isMyprofile: boolean
}

export default function MiniProfile({ userId, data, isMyprofile }: Props) {
  let profile: ProfileAPIResponse | null = data ?? null

  if (!profile && userId != null) {
    const fetchProfile = async () => {
      profile = await getProfileServer(userId)
    }    
    fetchProfile()
  }

  if (!profile) {
    profile = {
      userId: Number(userId ?? 0),
      status: null,
      nickname: null,
      firstName: '',
      lastName: '',
      avatarId: null,
      aboutMe: null,
      dateOfBirth: null,
      privacy: 'public',
      stats: { postsCount: 0, followersCount: 0, followingCount: 0 },
      joinedAt: null,
      chatId: null,
    }
  }

  const name = displayName(profile)
  const handle = handleName(profile)
  const joinedLabel = profile.joinedAt
    ? new Date(profile.joinedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : ''

  // todo
  let isOnline = false;

  return (
    <aside className={styles.miniCardLarge} aria-label={`Mini profile for ${name}`}>
      <div className={styles.miniHeaderLarge}>
        <AvatarHolder avatarId={profile.avatarId ?? null} />
        <div className={styles.miniInfoLarge}>
          <div className={styles.miniTitleRow}>
            <h4 className={styles.miniName}>{name}</h4>
            {profile.privacy !== 'public' && (
              <span className={styles.miniLock} title="Private profile" aria-hidden>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12 2a4 4 0 00-4 4v2H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-2V6a4 4 0 00-4-4zM8 8a4 4 0 018 0v2H8V8z" />
                </svg>
              </span>
            )}
          </div>

          <div className={styles.miniHandleRow}>
            <div className={styles.miniHandle}>{handle}</div>
            {/* {profile.privacy !== 'public' && <span className={styles.badge}>Private</span>} */}
          </div>

          <div className={styles.statusBadges}>
            <span className={isOnline ? styles.badgeOnline : styles.badgeOffline}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
            <span className={styles.badgePrivacy}>
              {profile.privacy === 'public' ? 'Public' : 'Private'}
            </span>
          </div>

          {profile.aboutMe ? <p className={styles.aboutMe}>{profile.aboutMe}</p> : null}
          {joinedLabel ? <div className={styles.joined}>Joined {joinedLabel}</div> : null}
        </div>
      </div>

      <div className={styles.miniDivider} />

      <div className={styles.miniStatsLarge}>
        <div className={styles.miniStat}>
          <div className={styles.miniStatValue}>{profile.stats?.postsCount ?? 0}</div>
          <div className={styles.miniStatLabel}>posts</div>
        </div>

        <div className={styles.miniStat}>
          <div className={styles.miniStatValue}>{profile.stats?.followersCount ?? 0}</div>
          <div className={styles.miniStatLabel}>followers</div>
        </div>

        <div className={styles.miniStat}>
          <div className={styles.miniStatValue}>{profile.stats?.followingCount ?? 0}</div>
          <div className={styles.miniStatLabel}>following</div>
        </div>
      </div>

      <div className={styles.miniActionsLarge}>
        <a className={styles.viewProfileBtnLarge} href={`/profile/${profile.userId}`}>
          View Profile
        </a>

        {isMyprofile ? <MiniProfileActions
          userId={profile.userId}
          initialStatus={profile.status ?? null}
          initialChatId={profile.chatId ?? null}
        /> : null}
      </div>
    </aside>
  )
}
