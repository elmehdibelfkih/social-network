'use client'
import { useState } from 'react'
import type { NotificationProps } from './shared-types'
import styles from './styles.module.css'
import { formatTimeAgo } from '@/libs/helpers'
import { PostModal } from '@/components/ui/post-modal/post-modal'
import AvatarHolder from '@/components/ui/avatar_holder/avatarholder.client'

export function PostLikedNotification({ notification, onMarkAsRead }: NotificationProps) {
  const [isRead, setIsRead] = useState(notification.isRead == 1)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleClick = () => {
    if (!isRead && onMarkAsRead) {
      setIsRead(true)
      onMarkAsRead(notification.notificationId)
    }

    setIsModalOpen(true)
  }

  return (
    <>
      <div className={isRead ? styles.readNotif : styles.notifContainer} onClick={handleClick}>
        <div className={styles.avatar}>
          <AvatarHolder avatarId={notification.actorAvatarId} />
        </div>

        <div className={styles.contentSection}>
          <div className={styles.contentContainer}>
            <p>
              <strong>{notification.actorName || 'Someone'}</strong> liked your post
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
