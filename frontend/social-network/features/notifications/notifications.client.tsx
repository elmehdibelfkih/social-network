'use client'

import { useState, useEffect } from 'react'
import type { Notification } from './types'
import { NotificationItem } from './components/notification-item.client'
import { notificationsService } from './notificationsService'
import styles from './styles.module.css'

type Props = {
  initialNotifications?: Notification[]
  initialLimit?: number
}

export function NotificationsClient({ initialNotifications = [], initialLimit = 20 }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const [limit] = useState(initialLimit)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)

  const loadNotifications = async () => {
    if (loading) return

    setLoading(true)
    try {
      const lastItemId = notifications.length > 0 ? notifications[notifications.length - 1].notificationId : undefined
      const response = await notificationsService.getNotifications(limit, lastItemId)

      setNotifications((prev) => [...prev, ...response.notifications])
      setHasMore(response.notifications.length >= limit)
    } catch (error) {
      console.error('Failed to load notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialNotifications.length === 0) {
      loadNotifications()
    }
  }, [])

  const handleMarkAsRead = async (notificationId: number) => {
    const success = await notificationsService.markAsRead(notificationId)
    if (success) {
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.notificationId === notificationId ? { ...notif, isRead: 1 } : notif
        )
      )
    }
  }

  const handleMarkAllAsRead = async () => {
    const success = await notificationsService.markAllAsRead()
    if (success) {
      setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: 1 })))
    }
  }

  const handleLoadMore = () => {
    loadNotifications()
  }

  const unreadCount = notifications.filter((n) => n.isRead === 0).length

  return (
    <div className={styles.notificationsContainer}>
      <div className={styles.notificationsHeader}>
        <h2 className={styles.notificationsTitle}>Notifications</h2>
        {unreadCount > 0 && (
          <button className={styles.markAllReadBtn} onClick={handleMarkAllAsRead}>
            Mark all as read
          </button>
        )}
      </div>

      <div className={styles.notificationsList}>
        {loading && notifications.length === 0 ? (
          <div className={styles.loadingState}>Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>🔔</span>
            <p>No notifications yet</p>
          </div>
        ) : (
          <>
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.notificationId}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
              />
            ))}
            {hasMore && (
              <button
                className={styles.loadMoreBtn}
                onClick={handleLoadMore}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load more'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
