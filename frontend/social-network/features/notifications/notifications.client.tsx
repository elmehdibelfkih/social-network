'use client'

import { useState, useEffect, useRef } from 'react'
import styles from './styles.module.css'
import { notificationsService } from './notificationsService'
import { Notification } from './types'
import { FollowNotification } from './components/notification-item.client'
import { BellIcon } from '@/components/ui/icons'

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    notificationsService.getUnreadCount().then(setUnreadCount)
  }, [])

  useEffect(() => {
    if (isOpen && notifications?.length === 0) {
      loadNotifications()
    }
  }, [isOpen])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const lastId = notifications.length > 0 ? notifications[notifications.length - 1].notificationId : undefined
      const response = await notificationsService.getNotifications(20, lastId)
      setNotifications(response.notifications)
    } catch (error) {
      console.error('Failed to load notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: number) => {
    const success = await notificationsService.markAsRead(notificationId)
    if (success) {
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.notificationId === notificationId ? { ...notif, isRead: 1 } : notif
        )
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    }
  }

  const handleMarkAllAsRead = async () => {
    const success = await notificationsService.markAllAsRead()
    if (success) {
      setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: 1 })))
      setUnreadCount(0)
    }
  }

  return (
    <div className={styles.notificationDropdown} ref={dropdownRef}>
      <button
        className={styles.notificationBtn}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className={styles.dropdownPanel}>
          <div className={styles.dropdownHeader}>
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllAsRead} className={styles.markAllBtn}>
                Mark all as read
              </button>
            )}
          </div>

          <div className={styles.dropdownBody}>
            {loading ? (
              <div className={styles.loading}>Loading...</div>
            ) : notifications?.length === 0 ? (
              <div className={styles.empty}>
                <p>No notifications</p>
              </div>
            ) : (
              notifications?.map((notification) => (
                <FollowNotification
                  key={notification.notificationId}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
