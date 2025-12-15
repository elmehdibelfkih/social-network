'use client'

import { useState } from 'react'
import type { Notification } from '../types'
import styles from '../styles.module.css'

type Props = {
  notification: Notification
  onMarkAsRead?: (id: number) => void
}

export function NotificationItem({ notification, onMarkAsRead }: Props) {
  const [isRead, setIsRead] = useState(notification.isRead === 1)

  const handleClick = () => {
    if (!isRead && onMarkAsRead) {
      onMarkAsRead(notification.notificationId)
      setIsRead(true)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'post_liked':
        return '❤️'
      case 'post_commented':
        return '💬'
      case 'follow_request':
        return '👤'
      case 'group_invite':
        return '👥'
      case 'group_join':
        return '🎉'
      case 'event_created':
        return '📅'
      default:
        return '🔔'
    }
  }

  const formatTimeAgo = (createdAt: string) => {
    const date = new Date(createdAt)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div
      className={`${styles.notificationItem} ${isRead ? styles.read : styles.unread}`}
      onClick={handleClick}
    >
      <div className={styles.notificationIcon}>
        {getNotificationIcon(notification.type)}
      </div>
      <div className={styles.notificationContent}>
        <p className={styles.notificationText}>{notification.content || 'No content'}</p>
        <span className={styles.notificationTime}>
          {formatTimeAgo(notification.createdAt)}
        </span>
      </div>
      {!isRead && <div className={styles.unreadDot} />}
    </div>
  )
}
