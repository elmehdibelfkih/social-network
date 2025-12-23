'use client'
import { useState } from 'react'
import type { NotificationProps } from './shared-types'
import styles from './styles.module.css'
import AvatarHolder from '@/components/ui/avatar_holder/avatarholder.client'
import { http } from '@/libs/apiFetch'
import { formatTimeAgo } from '@/libs/helpers'
import { useRouter } from 'next/navigation'

export function FollowNotification({ notification, onMarkAsRead }: NotificationProps) {
  const [requestHandled, setRequestHandled] = useState(false)
  const [isRead, setIsRead] = useState(notification.isRead == 1)
  const router = useRouter()

  const handleClick = () => {
    if (!isRead && onMarkAsRead) {
      setIsRead(true)
      onMarkAsRead(notification.notificationId)
    }

    if (notification.referenceId) {
      router.push(`/profile/${notification.referenceId}`)
    }
  }

  const acceptInvitation = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await http.post(`/api/v1/follow-requests/${notification.referenceId}/accept`)
      setRequestHandled(true)
    } catch (error) {
      console.error('Failed to accept follow request:', error)
    }
  }

  const declineInvitation = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await http.post(`/api/v1/follow-requests/${notification.referenceId}/decline`)
      setRequestHandled(true)
    } catch (error) {
      console.error('Failed to decline follow request:', error)
    }
  }

  return (
    <div className={isRead ? styles.readNotif : styles.notifContainer} onClick={handleClick}>
      <div className={styles.avatar}>
        <AvatarHolder avatarId={notification.actorAvatarId} />
      </div>

      <div className={styles.contentSection}>
        <div className={styles.contentContainer}>
          <p>
            <strong>{notification.actorName || 'Someone'}</strong> sent you a follow request
          </p>
          {!isRead && <div className={styles.unreadDot} />}
        </div>

        <p className={styles.timeAgo}>{formatTimeAgo(notification.createdAt)}</p>

        <div className={styles.actionButtons}>
          <button className={styles.acceptButton}
            onClick={acceptInvitation}
            disabled={notification.status !== 'pending' || requestHandled}
          >✓ Accept</button>
          <button className={styles.declineButton}
            onClick={declineInvitation}
            disabled={notification.status !== 'pending' || requestHandled}
          >× Decline</button>
        </div>
      </div>
    </div>
  )
}
