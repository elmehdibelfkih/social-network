'use client'

import { useState } from 'react'
import styles from './styles.module.css'
import { PostsSection } from './posts_section.client'
import { AboutSection } from './profile_about.server'
import { FollowersList } from './profile_followers.client'
import { ProfileData } from '../profile/types'

export default function ProfileFeed({ profile, tab: initialTab }: { profile: ProfileData, tab: string }) {
  const [activeTab, setActiveTab] = useState(initialTab || 'posts')

  return (
    <div className={styles.feedContainer}>
      <div className={styles.tabs}>
        <button
          onClick={() => setActiveTab('posts')}
          className={`${styles.tab} ${activeTab === 'posts' ? styles.tabActive : ''}`}
        >
          Posts
        </button>
        <button
          onClick={() => setActiveTab('about')}
          className={`${styles.tab} ${activeTab === 'about' ? styles.tabActive : ''}`}
        >
          About
        </button>
        <button
          onClick={() => setActiveTab('followers')}
          className={`${styles.tab} ${activeTab === 'followers' ? styles.tabActive : ''}`}
        >
          Followers
        </button>
        <button
          onClick={() => setActiveTab('following')}
          className={`${styles.tab} ${activeTab === 'following' ? styles.tabActive : ''}`}
        >
          Following
        </button>
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'posts' && <PostsSection userId={String(profile.userId)} avatarId={profile.avatarId} />}
        {activeTab === 'about' && <AboutSection profile={profile} />}
        {activeTab === 'followers' && <FollowersList userId={String(profile.userId)} type="followers" />}
        {activeTab === 'following' && <FollowersList userId={String(profile.userId)} type="following" />}
      </div>
    </div>
  )
}