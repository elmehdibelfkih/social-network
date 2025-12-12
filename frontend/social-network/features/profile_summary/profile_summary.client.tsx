"use client";

import styles from './styles.module.css'
import { AvatarHolder } from '@/components/ui/avatar_holder/avatarholder.client'
import { displayName, handleName } from '@/libs/helpers'
import { useUserStats } from '@/providers/userStatsContext';

export default function ProfileSummary() {
  const { state: profile } = useUserStats();
  console.log(profile);

  const name = displayName(profile)
  const handle = handleName(profile)

  const joinedLabel = profile.joinedAt
    ? new Date(profile.joinedAt).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    : ''

  return (
    <aside className={styles.profileCard} aria-label="Your profile summary">
      <div className={styles.header}>
        <AvatarHolder avatarId={profile.avatarId ?? null} size={90} />
        <div className={styles.textWrap}>
          <h3 className={styles.displayName}>{name}</h3>
          <div className={styles.username}>{handle}</div>
          {profile.privacy !== 'public' && (
            <div className={styles.privacy} aria-label="Private profile">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 2a4 4 0 00-4 4v2H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-2V6a4 4 0 00-4-4zM8 8a4 4 0 018 0v2H8V8z" />
              </svg>
            </div>
          )}
          {joinedLabel ? <div className={styles.joined}>Joined {joinedLabel}</div> : null}
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.statsContainer}>
        <div className={styles.statBlock}>
          <div className={styles.statLabel}>Posts</div>
          <div className={styles.statValue}>{profile.postsCount ?? 0}</div>
        </div>

        <div className={styles.statBlock}>
          <div className={styles.statLabel}>Followers</div>
          <div className={styles.statValue}>{profile.followersCount ?? 0}</div>
        </div>

        <div className={styles.statBlock}>
          <div className={styles.statLabel}>Following</div>
          <div className={styles.statValue}>{profile.followingCount ?? 0}</div>
        </div>
      </div>
    </aside>
  )
}
