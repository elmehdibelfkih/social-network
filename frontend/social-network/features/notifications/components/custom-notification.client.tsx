'use client'

import { useEffect, useRef, useState } from 'react'
import type { NotificationProps } from './shared-types'
import styles from './styles.module.css'
import { formatTimeAgo } from '@/libs/helpers'

export function CustomNotification({ notification, onMarkAsRead }: NotificationProps) {
  const [isRead, setIsRead] = useState(notification.isRead == 1)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isRead) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRead(true)
          onMarkAsRead?.(notification.notificationId)
          observer.disconnect()
        }
      },
      {
        threshold: 0.5,
      }
    )

    const currentElement = notifRef.current
    if (currentElement) {
      observer.observe(currentElement)
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement)
      }
      observer.disconnect()
    }
  })

  return (
    <div className={styles.notifContainer} ref={notifRef}>
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
