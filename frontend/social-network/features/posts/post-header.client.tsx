'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/providers/authProvider'
import { AvatarHolder } from '@/components/ui/avatar_holder/avatarholder.client'
import { PostMenu } from './post-menu.client'
import styles from './styles.module.css'

interface PostHeaderProps {
  authorId: number
  authorName: string
  timeAgo: string
  privacy: string
  avatarId: number | null
  postId: number
  postContent: string
  postPrivacy: string
  mediaIds?: number[]
}

export function PostHeader({
  authorId,
  authorName,
  timeAgo,
  privacy,
  avatarId,
  postId,
  postContent,
  postPrivacy,
  mediaIds
}: PostHeaderProps) {
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isAuthor = mounted && user && Number(user.userId) === authorId

  return (
    <div className={styles.header}>
      <AvatarHolder avatarId={avatarId} size={40} />
      <div className={styles.authorInfo}>
        <h3 className={styles.authorName} onClick={() => window.location.href = `/profile/${authorId}`}>
          {authorName}
        </h3>
        <div className={styles.postMeta}>
          <span className={styles.timeAgo}>{timeAgo}</span>
          <span className={styles.privacy}>🌐 {privacy}</span>
        </div>
      </div>
      {isAuthor && (
        <PostMenu
          postId={postId}
          content={postContent}
          privacy={postPrivacy}
          mediaIds={mediaIds}
        />
      )}
    </div>
  )
}
