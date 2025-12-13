'use client'
import { Suspense, useState } from 'react'
import type { Post } from '@/libs/globalTypes'
import { PostsClient } from './posts.client'
import styles from './styles.module.css'

interface PostInteractionsProps {
  post: Post
  initialReactionCount: number
  initialCommentCount: number
}

export function PostInteractions({
  post,
  initialReactionCount,
  initialCommentCount
}: PostInteractionsProps) {
  const [stats, setStats] = useState({
    reactionCount: initialReactionCount,
    commentCount: initialCommentCount
  })

  return (
    <>
      <div className={styles.stats}>
        <span>{stats.reactionCount} like{stats.reactionCount !== 1 ? 's' : ''}</span>
        <span>{stats.commentCount} comment{stats.commentCount !== 1 ? 's' : ''}</span>
      </div>

      <Suspense fallback={<div className={styles.actionsLoading}>Loading...</div>}>
        <PostsClient post={{ ...post, stats }} onStatsUpdate={setStats} />
      </Suspense>
    </>
  )
}
