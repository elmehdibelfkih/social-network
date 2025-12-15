'use client'

import { useState } from 'react'
import styles from './UpdatePost.module.css'
import { http } from '@/libs/apiFetch'
import { GlobeIcon, DropdownIcon, LockIcon, UsersIcon } from '@/components/ui/icons'
import AddFriends from '@/components/ui/AddFriends/addFriends'

const privacyOptions = [
  { value: 'public', label: 'Public', description: 'Anyone can see this post', icon: 'globe' },
  { value: 'followers', label: 'Followers', description: 'Only your followers can see', icon: 'users' },
  { value: 'private', label: 'Private', description: 'Only you can see', icon: 'lock' },
  { value: 'restricted', label: 'Restricted', description: 'Only share with...', icon: 'users' }
] as const

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
  const [showPrivacyDropdown, setShowPrivacyDropdown] = useState(false)
  const [showAddFriends, setShowAddFriends] = useState(false)
  const [selectedFollowers, setSelectedFollowers] = useState<number[]>([])

  const getPrivacyIcon = (icon: string) => {
    if (icon === 'globe') return <GlobeIcon fillColor="currentColor" />
    if (icon === 'users') return <UsersIcon />
    if (icon === 'lock') return <LockIcon />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setIsSubmitting(true)
    try {
      await http.put(`/api/v1/posts/${postId}`, {
        content: content.trim(),
        privacy,
        mediaIds: initialMediaIds || [],
        allowedList: privacy === 'restricted' && selectedFollowers.length ? selectedFollowers : undefined
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

          <div className={styles.privacyContainer}>
            <button
              type="button"
              className={styles.privacyButton}
              onClick={() => setShowPrivacyDropdown(!showPrivacyDropdown)}
            >
              {getPrivacyIcon(privacyOptions.find(p => p.value === privacy)?.icon || '')}
              {privacyOptions.find(p => p.value === privacy)?.label}
              <DropdownIcon />
            </button>

            {showPrivacyDropdown && (
              <>
                <div
                  className={styles.dropdownBackdrop}
                  onClick={() => setShowPrivacyDropdown(false)}
                />

                <div className={styles.privacyDropdown}>
                  {privacyOptions.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`${styles.privacyOption} ${privacy === opt.value ? styles.active : ''}`}
                      onClick={() => {
                        setPrivacy(opt.value)
                        setShowPrivacyDropdown(false)
                        if (opt.value === 'restricted') setShowAddFriends(true)
                      }}
                    >
                      <div className={styles.privacyOptionIcon}>
                        {getPrivacyIcon(opt.icon)}
                      </div>

                      <div className={styles.privacyOptionContent}>
                        <div className={styles.privacyOptionLabel}>{opt.label}</div>
                        <div className={styles.privacyOptionDesc}>{opt.description}</div>
                      </div>

                      {privacy === opt.value && (
                        <div className={styles.privacyOptionCheck}>✓</div>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {showAddFriends && (
            <div className={styles.addFriendsPopup}>
              <AddFriends
                title="Allowed followers"
                desc="Choose who can see"
                groupId="0"
                purpose="post"
                onComplete={(ids) => {
                  setSelectedFollowers(ids)
                  setShowAddFriends(false)
                }}
                onClose={() => setShowAddFriends(false)}
              />
            </div>
          )}

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
