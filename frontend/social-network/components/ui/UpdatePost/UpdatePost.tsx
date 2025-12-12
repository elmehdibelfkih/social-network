'use client'

import { useState } from 'react'
import styles from './UpdatePost.module.css'
import { http } from '@/libs/apiFetch'

interface UpdatePostProps {
  postId: number
  initialContent: string
  initialPrivacy: string
  initialMediaIds?: number[]
  onClose: () => void
  onUpdate: () => void
}

export function UpdatePost({ postId, initialContent, initialPrivacy, initialMediaIds, onClose, onUpdate }: UpdatePostProps) {
  const [content, setContent] = useState(initialContent)
  const [privacy, setPrivacy] = useState(initialPrivacy)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setIsSubmitting(true)
    try {
      await http.put(`/api/v1/posts/${postId}`, {
        content: content.trim(),
        privacy,
        mediaIds: initialMediaIds || []
      })
      onUpdate()
      onClose()
    } catch (error) {
      console.error('Failed to update post:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Update Post</h3>
          <button onClick={onClose} className={styles.closeButton}>×</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <textarea
            className={styles.textarea}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            rows={6}
          />

          <div className={styles.privacySelect}>
            <label>Privacy:</label>
            <select value={privacy} onChange={(e) => setPrivacy(e.target.value)}>
              <option value="public">Public</option>
              <option value="followers">Followers</option>
              <option value="private">Private</option>
              <option value="restricted">Restricted</option>
            </select>
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting || !content.trim()} className={styles.submitBtn}>
              {isSubmitting ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
