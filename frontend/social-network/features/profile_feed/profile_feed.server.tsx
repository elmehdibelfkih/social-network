'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import styles from './styles.module.css'
import { PostsSection } from './posts_section.client'
import { AboutSection } from './profile_about.server'
import { FollowersList } from './profile_followers.client'

export default function ProfileFeed({ userId, tab }: { userId: string, tab: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleTabChange = (newTab: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', newTab)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className={styles.feedContainer}>
      <div className={styles.tabs}>
        <button
          onClick={() => handleTabChange('posts')}
          className={`${styles.tab} ${tab === 'posts' ? styles.tabActive : ''}`}
        >
          Posts
        </button>
        <button
          onClick={() => handleTabChange('about')}
          className={`${styles.tab} ${tab === 'about' ? styles.tabActive : ''}`}
        >
          About
        </button>
        <button
          onClick={() => handleTabChange('followers')}
          className={`${styles.tab} ${tab === 'followers' ? styles.tabActive : ''}`}
        >
          Followers
        </button>
        <button
          onClick={() => handleTabChange('following')}
          className={`${styles.tab} ${tab === 'following' ? styles.tabActive : ''}`}
        >
          Following
        </button>
      </div>

      <div className={styles.tabContent}>
        {tab === 'posts' && <PostsSection userId={userId} />}
        {tab === 'about' && <AboutSection userId={userId} />}
        {tab === 'followers' && <FollowersList userId={userId} type="followers" />}
        {tab === 'following' && <FollowersList userId={userId} type="following" />}
      </div>
    </div>
  )
}