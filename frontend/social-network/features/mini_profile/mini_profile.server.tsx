import { getMiniProfileServer } from './mini_profile.services'
import { displayName, handleName } from '@/libs/helpers'
import styles from './styles.module.css'
import type { MiniProfile } from '@/libs/globalTypes'
import { MiniProfileActions } from './mini_profile.client'
import { AvatarHolder } from '@/components/ui/avatar_holder/avatarholder.client'

type Props = {
  userId?: string | number
  data?: MiniProfile
}

export default function MiniProfile({ userId, data }: Props) {
  let profile: MiniProfile | null = data ?? null

  if (!profile && userId != null) {
    const fetchProfile = async () => {
      profile = await getMiniProfileServer(userId)
    }
    fetchProfile()
  }

  const name = displayName(profile)
  const handle = handleName(profile)
  const joinedLabel = profile.joinedAt
    ? new Date(profile.joinedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : ''

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
          </div>

          <div className={styles.statusBadges}>
            <span className={styles.badgePrivacy}>
              {profile.privacy === 'public' ? 'Public' : 'Private'}
            </span>
          </div>

          {joinedLabel ? <div className={styles.joined}>Joined {joinedLabel}</div> : null}
        </div>
      </div>

      <div className={styles.miniDivider} />
      <MiniProfileActions data={profile} />
    </aside>
  )
}
