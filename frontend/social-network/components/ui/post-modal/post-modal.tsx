'use client'
import { useEffect, useState } from 'react'
import { http } from '@/libs/apiFetch'
import { Post } from '@/libs/globalTypes'
import PostCard from '@/features/posts/PostCard'
import styles from './post-modal.module.css'

interface PostModalProps {
  postId: number
  isOpen: boolean
  onClose: () => void
}

export function PostModal({ postId, isOpen, onClose }: PostModalProps) {
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return

    const fetchPost = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await http.get<Post>(`/api/v1/posts/${postId}`)
        setPost(response)
      } catch (err) {
        console.error('Failed to fetch post:', err)
        setError('Failed to load post')
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [postId, isOpen])

  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Post</h3>
          <button onClick={onClose} className={styles.closeButton}>
            ×
          </button>
        </div>

        <div className={styles.content}>
          {loading && <div className={styles.loading}>Loading...</div>}
          {error && <div className={styles.error}>{error}</div>}
          {post && <PostCard post={post} />}
        </div>
      </div>
    </div>
  )
}
