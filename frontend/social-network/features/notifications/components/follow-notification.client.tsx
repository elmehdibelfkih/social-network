'use client'
import { useEffect, useState } from 'react'
import type { NotificationProps } from './shared-types'
import styles from './styles.module.css'
import AvatarHolder from '@/components/ui/avatar_holder/avatarholder.client'
import { http } from '@/libs/apiFetch'
import { ProfileAPIResponse } from '@/libs/globalTypes'
import { formatTimeAgo } from '@/libs/helpers'
import { useRouter } from 'next/navigation'

export function FollowNotification({ notification, onMarkAsRead }: NotificationProps) {
  const [profile, setProfile] = useState<ProfileAPIResponse>(null)
  // const [isDecisionMade, setIsDecisionMade] = useState(!isActive)
  const [isRead, setIsRead] = useState(notification.isRead == 1)
  const router = useRouter()

  const getReferenceProfile = async () => {
    try {
      const response = await http.get<ProfileAPIResponse>(`/api/v1/users/${notification.referenceId}/profile`)
      setProfile(response)
      console.log("ccccc", response)
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    }
  }

  useEffect(() => {
    getReferenceProfile()
  }, [notification.notificationId])

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
      // setIsDecisionMade(true)
    } catch (error) {

    }
  }

  const declineInvitation = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await http.post(`/api/v1/follow-requests/${notification.referenceId}/decline`)
      // setIsDecisionMade(true)
    } catch (error) {

    }
  }

  if (!profile) {
    return (
      <div className={styles.notifContainer}>
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div className={isRead ? styles.readNotif : styles.notifContainer} onClick={handleClick}>
      <div className={styles.avatar}>
        <AvatarHolder avatarId={profile.avatarId} />
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
            disabled={profile.status === 'accepted'}
          >✓ Accept</button>
          <button className={styles.declineButton}
            onClick={declineInvitation}
            disabled={profile.status === 'accepted'}
          >× Decline</button>
        </div>
      </div>
    </div>
  )
}
