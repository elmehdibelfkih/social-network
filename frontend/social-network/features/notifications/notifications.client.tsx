'use client'
import { useState, useEffect, useRef } from 'react'
import styles from './styles.module.css'
import {
  FollowNotification,
  GroupInviteNotification,
  EventNotification,
  PostLikedNotification,
  PostCommentedNotification,
  CustomNotification,
} from './components/notification-item.client'
import { BellIcon } from '@/components/ui/icons'
import { useNotifications } from '@/providers/notifsProvider'
import { useUserStats } from '@/providers/userStatsContext'

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const {
    notifications,
    loading,
    hasMore,
    loadMore,
    markAsRead,
    markAllAsRead,
  } = useNotifications()

  const { state: userStats } = useUserStats()
  const unreadCount = userStats.unreadNotifications

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

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    if (!scrollContainer || !isOpen) return

    let isThrottled = false

    const handleScroll = () => {
      if (isThrottled || loading || !hasMore) return

      const { scrollTop, scrollHeight, clientHeight } = scrollContainer
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight

      if (scrollPercentage > 0.8) {
        isThrottled = true
        loadMore()

        setTimeout(() => {
          isThrottled = false
        }, 1000)
      }
    }

    scrollContainer.addEventListener('scroll', handleScroll)
    return () => scrollContainer.removeEventListener('scroll', handleScroll)
  }, [isOpen, loading, hasMore, loadMore])

  return (
    <div className={styles.notificationDropdown} ref={dropdownRef}>
      <button
        className={styles.notificationBtn}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className={styles.badge}>{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className={styles.dropdownPanel}>
          <div className={styles.dropdownHeader}>
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className={styles.markAllBtn}>
                Mark all as read
              </button>
            )}
          </div>

          <div className={styles.dropdownBody} ref={scrollContainerRef}>
            {loading && notifications.length === 0 ? (
              <div className={styles.loading}>Loading...</div>
            ) : notifications == undefined || notifications.length === 0 ? (
              <div className={styles.empty}>
                <p>No notifications</p>
              </div>
            ) : (
              <>
                {notifications?.map((notification) => {
                  const props = {
                    notification,
                    onMarkAsRead: markAsRead,
                  }

                  switch (notification.type) {
                    case 'follow_request':
                      return <FollowNotification key={notification.notificationId} {...props} />
                    case 'group_invite':
                    case 'group_join':
                      return <GroupInviteNotification key={notification.notificationId} {...props} />
                    case 'event_created':
                      return <EventNotification key={notification.notificationId} {...props} />
                    case 'post_liked':
                      return <PostLikedNotification key={notification.notificationId} {...props} />
                    case 'post_commented':
                      return <PostCommentedNotification key={notification.notificationId} {...props} />
                    case 'custom':
                      return <CustomNotification key={notification.notificationId} {...props} />
                    default:
                      return <CustomNotification key={notification.notificationId} {...props} />
                  }
                })}

                {loading && notifications.length > 0 && (
                  <div className={styles.loadingMore}>Loading more...</div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
