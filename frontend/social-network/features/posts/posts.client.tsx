'use client'
import { useState } from 'react'
import { postsService } from './postsService'
import { Comments } from '@/components/ui/comments/comments'
import styles from './styles.module.css'
import { Post } from '@/libs/globalTypes'
import { http } from '@/libs/apiFetch'

export function PostsClient({ post, onStatsUpdate }: { post: Post, onStatsUpdate?: (stats: { reactionCount: number, commentCount: number }) => void }) {
  const [liked, setLiked] = useState(post?.isLikedByUser)
  const [isLoading, setIsLoading] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [commentCount, setCommentCount] = useState(post?.stats?.commentCount)
  const [likeCount, setLikeCount] = useState(post?.stats?.reactionCount || 0)

  const handleLike = async () => {
    if (isLoading) return

    setIsLoading(true)

    const success = await postsService.likePost(post.postId)

    if (success) {
      const newLiked = !liked
      setLiked(newLiked)
      const newCount = newLiked ? likeCount + 1 : likeCount - 1
      setLikeCount(newCount)
      if (onStatsUpdate) {
        onStatsUpdate({ reactionCount: newCount, commentCount })
      }
    }

    setIsLoading(false)
  }

  const handleComment = () => {
    setShowComments(true)
  }

  const handleCommentAdded = async () => {
    // Fetch real comment count from server
    try {
      const data = await http.get<any>(`/api/v1/posts/${post.postId}/comments?page=1&limit=1`)
      const realCount = data?.totalComments || commentCount + 1
      setCommentCount(realCount)
      if (onStatsUpdate) {
        onStatsUpdate({ reactionCount: likeCount, commentCount: realCount })
      }
    } catch {
      setCommentCount(prev => prev + 1)
    }
  }

  return (
    <div className={styles.actions}>
      <button
        className={`${styles.actionButton} ${liked ? styles.liked : ''}`}
        onClick={handleLike}
        disabled={isLoading}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        Like
      </button>

      <button className={styles.actionButton} onClick={handleComment}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        Comment
      </button>

      <Comments
        postId={post.postId}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        commentCount={commentCount}
        onCommentAdded={handleCommentAdded}
      />
    </div>
  )
}