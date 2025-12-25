'use client'
import { useEffect, useState } from 'react'
import type { GroupType } from '../types'
import type { NotificationProps } from './shared-types'
import styles from './styles.module.css'
import AvatarHolder from '@/components/ui/avatar_holder/avatarholder.client'
import { http } from '@/libs/apiFetch'
import { formatTimeAgo } from '@/libs/helpers'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/authProvider'

export function GroupInviteNotification({ notification, onMarkAsRead }: NotificationProps) {
  console.log(notification)
  const { user } = useAuth()
  const [group, setGroup] = useState<GroupType>(null)
  const [requestHandled, setRequestHandled] = useState(false)
  const [isRead, setIsRead] = useState(notification.isRead == 1)
  const router = useRouter()

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const url = notification.type === 'group_join'
          ? `/api/v1/groups/${notification.referenceId}?checkUserId=${notification.actorId}`
          : `/api/v1/groups/${notification.referenceId}`

        const response = await http.get<GroupType>(url)
        setGroup(response)
      } catch (error) {
        console.error('Failed to fetch group:', error)
      }
    }

    fetchGroup()
  }, [notification.referenceId, notification.actorId, notification.type])

  const handleClick = () => {
    if (!isRead && onMarkAsRead) {
      setIsRead(true)
      onMarkAsRead(notification.notificationId)
    }

    if (notification.referenceId) {
      router.push(`/groups/${notification.referenceId}/posts`)
    }
  }

  const acceptInvitation = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const targetUserId = notification.type === 'group_invite' ? user?.userId : notification.actorId

      if (!targetUserId) {
        console.error('Target user ID is undefined', { notification, user })
        return
      }

      await http.post(`/api/v1/groups/${notification.referenceId}/members/${targetUserId}/accept`)
      setRequestHandled(true)
    } catch (error) {
      console.error('Failed to accept invitation:', error)
    }
  }

  const declineInvitation = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const targetUserId = notification.type === 'group_invite' ? user?.userId : notification.actorId

      if (!targetUserId) {
        console.error('Target user ID is undefined', { notification, user })
        return
      }

      await http.post(`/api/v1/groups/${notification.referenceId}/members/${targetUserId}/decline`)
      setRequestHandled(true)
    } catch (error) {
      console.error('Failed to decline invitation:', error)
    }
  }

  if (!group) {
    return (
      <div className={styles.notifContainer}>
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div className={isRead ? styles.readNotif : styles.notifContainer} onClick={handleClick}>
      <div className={styles.avatar}>
        <AvatarHolder avatarId={notification.actorAvatarId} />
      </div>

      <div className={styles.contentSection}>
        <div className={styles.contentContainer}>
          <p>
            {notification.type === 'group_invite' ? (
              <>
                <strong>{notification.actorName || 'Someone'}</strong> invited you to join <strong>{group.title}</strong>
              </>
            ) : (
              <>
                <strong>{notification.actorName || 'Someone'}</strong> wants to join <strong>{group.title}</strong>
              </>
            )}
          </p>
          {!isRead && <div className={styles.unreadDot} />}
        </div>

        <p className={styles.timeAgo}>{formatTimeAgo(notification.createdAt)}</p>

        <div className={styles.actionButtons}>
          <button className={styles.acceptButton}
            onClick={acceptInvitation}
            disabled={group.memberStatus !== 'pending' || requestHandled}
          >✓ Accept</button>
          <button className={styles.declineButton}
            onClick={declineInvitation}
            disabled={group.memberStatus !== 'pending' || requestHandled}
          >× Decline</button>
        </div>
      </div>
    </div>
  )
}
