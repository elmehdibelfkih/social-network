'use client'
import { useState, useEffect } from 'react'
import type { NotificationProps } from './shared-types'
import styles from './styles.module.css'
import { formatTimeAgo } from '@/libs/helpers'
import { PostModal } from '@/components/ui/post-modal/post-modal'
import AvatarHolder from '@/components/ui/avatar_holder/avatarholder.client'
import { http } from '@/libs/apiFetch'
import { ProfileAPIResponse } from '@/libs/globalTypes'

export function PostLikedNotification({ notification, onMarkAsRead }: NotificationProps) {
  const [isRead, setIsRead] = useState(notification.isRead == 1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [profile, setProfile] = useState<ProfileAPIResponse>(null)

  const getReferenceProfile = async () => {
    try {
      const response = await http.get<ProfileAPIResponse>(`/api/v1/users/${notification.referenceId}/profile`)
      setProfile(response)
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    }
  }

  useEffect(() => {
    getReferenceProfile()
  }, [notification.notificationId])

  const handleClick = () => {
    if (!isRead && onMarkAsRead) {
      setIsRead(true)
      onMarkAsRead(notification.notificationId)
    }

    setIsModalOpen(true)
  }

  if (!profile) {
    return (
      <div className={styles.notifContainer}>
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <>
      <div className={isRead ? styles.readNotif : styles.notifContainer} onClick={handleClick}>
        <div className={styles.avatar}>
          <AvatarHolder avatarId={profile.avatarId} />
        </div>

        <div className={styles.contentSection}>
          <div className={styles.contentContainer}>
            <p>
              <span>{notification.content}</span>
            </p>
            {!isRead && <div className={styles.unreadDot} />}
          </div>

          <p className={styles.timeAgo}>{formatTimeAgo(notification.createdAt)}</p>
        </div>
      </div>

      {notification.referenceId && (
        <PostModal
          postId={notification.referenceId}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  )
}
