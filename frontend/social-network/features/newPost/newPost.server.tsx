// newPost.server.tsx
import { Suspense } from 'react';
import { displayName, handleName } from '@/libs/helpers'
import type { ProfileAPIResponse } from '@/libs/globalTypes'
import { getProfileServer } from '../profile_summary'


import styles from "./styles.module.css";
import { NewPostClient } from "./newPost.client";
import { useAuth } from '@/providers/authProvider';
import AvatarHolder from '@/components/ui/avatar_holder/avatarholder.client';

type Props = {
  userId?: string | number
  data?: ProfileAPIResponse
  isMyprofile: boolean
}

export function NewPost({ userId, data, isMyprofile }: Props) {
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
    return (
    <div className={styles.wrapper}>
      {/* Fallback form for users with JS disabled */}

      <noscript>
        <form method="POST" action="/api/v1/posts" className={styles.form}>
          <div className={styles.leftPart}>
            <AvatarHolder avatarId={profile.avatarId ?? null} size={60} />
          </div>
          
          <div className={styles.rightPart}>
            <div className={styles.userInfo}>
              <div className={styles.miniHandle}>{profile.nickname || name}</div>
              <h4 className={styles.miniName}>{profile.firstName + ' ' + profile.lastName}</h4>
            </div>
            
            <div className={styles.topPart}>
              <textarea
                name="content"
                placeholder="What's on your mind?"
                className={styles.textArea}
                required
                minLength={1}
              />
            </div>

            <div className={styles.bottomPart}>
              <label className={styles.uploadImageButton}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="9" cy="9" r="2"/>
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                </svg>
                Photo
                <input
                  type="file"
                  name="media"
                  accept="image/*"
                  multiple
                  hidden
                />
              </label>

              <div className={styles.privacyButton}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
                <select name="privacy" className={styles.noJsPrivacySelect}>
                  <option value="public">Public</option>
                  <option value="followers">Followers</option>
                  <option value="private">Private</option>
                </select>
              </div>

              <button className={styles.actionButton} type="submit">
                Post
              </button>
            </div>
          </div>
        </form>
      </noscript>

      <Suspense fallback={
        <div ></div>
      }>
        <NewPostClient />
      </Suspense>
    </div>
  );
}