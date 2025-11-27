// mini_profile.server.tsx
import React from 'react'
import { AvatarHolder } from './profile_summary.client' // per your instruction
import type { ProfileAPIResponse } from './types'
import styles from './styles.module.css'

type Props = {
  data: ProfileAPIResponse
}

/**
 * MiniProfile (server component).
 * - data: profile object passed as prop (shape provided by you)
 * - View Profile links to /profile/:user_id
 * - AvatarHolder is a client component that fetches the image using http.get
 */
export default function MiniProfile({ data }: Props) {
  const displayName =
    (data.nickname && data.nickname.trim()) ||
    `${data.firstName ?? ''} ${data.lastName ?? ''}`.trim() ||
    'User'

  const handle = data.nickname
    ? `@${data.nickname}`
    : `@${(data.firstName ?? '') + (data.lastName ?? '')}`.replace(/\s+/g, '').toLowerCase() ||
      `@${data.userId}`

  const privacy = data.privacy ?? 'public'

  // Follow button state mapping:
  // - 'pending' -> Pending (disabled)
  // - 'accepted' -> Following (outlined)
  // - 'declined' or null -> Follow (primary)
  const status = data.status ?? null
  const followState = (() => {
    if (status === 'pending') return { label: 'Pending', kind: 'disabled' }
    if (status === 'accepted') return { label: 'Following', kind: 'outline' }
    // 'declined' or 'follow' or null -> actionable follow
    return { label: 'Follow', kind: 'primary' }
  })()

  return (
    <aside className={styles.miniCard} aria-label={`Mini profile for ${displayName}`}>
      <div className={styles.miniHeader}>
        <AvatarHolder avatarId={data.avatarId ?? null} />
        <div className={styles.miniInfo}>
          <div className={styles.miniTitleRow}>
            <h4 className={styles.miniName}>{displayName}</h4>
            {privacy !== 'public' && (
              <span className={styles.miniLock} title="Private profile" aria-hidden>
                {/* small lock icon */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12 2a4 4 0 00-4 4v2H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-2V6a4 4 0 00-4-4zM8 8a4 4 0 018 0v2H8V8z" />
                </svg>
              </span>
            )}
          </div>

          <div className={styles.miniHandleRow}>
            <div className={styles.miniHandle}>{handle}</div>
            {privacy !== 'public' && <span className={styles.badge}>Private</span>}
          </div>
        </div>
      </div>

      <div className={styles.miniDivider} />

      <div className={styles.miniStats}>
        <div className={styles.miniStat}>
          <span className={styles.miniStatValue}>{data.stats?.followersCount ?? 0}</span>
          <span className={styles.miniStatLabel}>followers</span>
        </div>
        <div className={styles.miniStat}>
          <span className={styles.miniStatValue}>{data.stats?.followingCount ?? 0}</span>
          <span className={styles.miniStatLabel}>following</span>
        </div>
      </div>

      <div className={styles.miniActions}>
        <a className={styles.viewProfileBtn} href={`/profile/${data.userId}`}>
          View Profile
        </a>

        <div className={styles.actionIcons}>
          <button
            type="button"
            className={styles.iconBtn}
            aria-label="Message"
            title="Message"
          >
            {/* message icon (outline) */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M21 15a2 2 0 01-2 2H8l-5 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <button
            type="button"
            className={`${styles.followBtn} ${followState.kind === 'primary' ? styles.followPrimary : ''} ${followState.kind === 'outline' ? styles.followOutline : ''} ${followState.kind === 'disabled' ? styles.followDisabled : ''}`}
            aria-disabled={followState.kind === 'disabled' ? true : undefined}
            title={followState.label}
          >
            {followState.label}
            {followState.kind === 'primary' && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden style={{ marginLeft: 8 }}>
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </aside>
  )
}
