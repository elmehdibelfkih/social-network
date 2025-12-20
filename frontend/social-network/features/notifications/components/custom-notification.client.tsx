'use client'
import { useState } from 'react'
import type { NotificationProps } from './shared-types'
import styles from './styles.module.css'
import { formatTimeAgo } from '@/libs/helpers'

export function CustomNotification({ notification, onMarkAsRead }: NotificationProps) {
  const [isRead, setIsRead] = useState(notification.isRead == 1)

  const handleClick = () => {
    if (!isRead && onMarkAsRead) {
      setIsRead(true)
      onMarkAsRead(notification.notificationId)
    }
  }

  return (
    <div className={styles.notifContainer} onClick={handleClick}>
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
  )
}
