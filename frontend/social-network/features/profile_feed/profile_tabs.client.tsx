'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import styles from './styles.module.css'

export function ProfileTabs() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentTab = searchParams.get('tab') || 'posts'

  const handleTabClick = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tab)
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  return (
    <div className={styles.tabs}>
      <button
        onClick={() => handleTabClick('posts')}
        className={`${styles.tab} ${currentTab === 'posts' ? styles.tabActive : ''}`}
      >
        Posts
      </button>
      <button
        onClick={() => handleTabClick('about')}
        className={`${styles.tab} ${currentTab === 'about' ? styles.tabActive : ''}`}
      >
        About
      </button>
      <button
        onClick={() => handleTabClick('followers')}
        className={`${styles.tab} ${currentTab === 'followers' ? styles.tabActive : ''}`}
      >
        Followers
      </button>
      <button
        onClick={() => handleTabClick('following')}
        className={`${styles.tab} ${currentTab === 'following' ? styles.tabActive : ''}`}
      >
        Following
      </button>
    </div>
  )
}
