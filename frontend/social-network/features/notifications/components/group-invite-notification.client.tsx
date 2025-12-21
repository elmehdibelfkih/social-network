'use client'
import { useEffect, useState } from 'react'
import type { GroupType } from '../types'
import type { NotificationProps } from './shared-types'
import styles from './styles.module.css'
import AvatarHolder from '@/components/ui/avatar_holder/avatarholder.client'
import { http } from '@/libs/apiFetch'
import { formatTimeAgo } from '@/libs/helpers'
import { useRouter } from 'next/navigation'

export function GroupInviteNotification({ notification, onMarkAsRead }: NotificationProps) {
  const [group, setGroup] = useState<GroupType>(null)
  // const [isDecisionMade, setIsDecisionMade] = useState(!isActive)
  const [isRead, setIsRead] = useState(notification.isRead == 1)
  const router = useRouter()

  const getReferenceGroup = async () => {
    try {
      const response = await http.get<GroupType>(`/api/v1/groups/${notification.referenceId}`)
      setGroup(response)
    } catch (error) {
      console.error('Failed to fetch group:', error)
    }
  }

  useEffect(() => {
    getReferenceGroup()
  }, [notification.notificationId])

  const handleClick = () => {
    if (!isRead && onMarkAsRead) {
      setIsRead(true)
      onMarkAsRead(notification.notificationId)
    }

    if (notification.referenceId) {
      router.push(`/groups/${notification.referenceId}`)
    }
  }

  const acceptInvitation = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await http.post(`/api/v1/groups/${notification.referenceId}/accept`)
      // setIsDecisionMade(true)
    } catch (error) {

    }
  }

  const declineInvitation = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await http.post(`/api/v1/groups/${notification.referenceId}/decline`)
      // setIsDecisionMade(true)
    } catch (error) {

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
        <AvatarHolder avatarId={group.avatarId} />
      </div>

      <div className={styles.contentSection}>
        <div className={styles.contentContainer}>
          <p>
            <span>{notification.content}</span>
          </p>
          {!isRead && <div className={styles.unreadDot} />}
        </div>

        <p className={styles.timeAgo}>{formatTimeAgo(notification.createdAt)}</p>

        <div className={styles.actionButtons}>
          <button className={styles.acceptButton}
            onClick={acceptInvitation}
          // disabled={isDecisionMade}
          >✓ Accept</button>
          <button className={styles.declineButton}
            onClick={declineInvitation}
          // disabled={isDecisionMade}
          >× Decline</button>
        </div>
      </div>
    </div>
  )
}
