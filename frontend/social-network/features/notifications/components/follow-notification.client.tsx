'use client'

import { useEffect, useRef, useState } from 'react'
import type { NotificationProps } from './shared-types'
import styles from './styles.module.css'
import AvatarHolder from '@/components/ui/avatar_holder/avatarholder.client'
import { http } from '@/libs/apiFetch'
import { ProfileAPIResponse } from '@/libs/globalTypes'
import { formatTimeAgo } from '@/libs/helpers'

export function FollowNotification({ notification, onMarkAsRead }: NotificationProps) {
  const [profile, setProfile] = useState<ProfileAPIResponse>(null)
  // const [isDecisionMade, setIsDecisionMade] = useState(!isActive)
  const [isRead, setIsRead] = useState(notification.isRead == 1)
  const notifRef = useRef<HTMLDivElement>(null)

  const getReferenceProfile = async () => {
    try {
      const response = await http.get<ProfileAPIResponse>(`/api/v1/users/${notification.referenceId}/profile`)
      setProfile(response)
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    }
  }

  useEffect(() => {
    getReferenceProfile()
  }, [notification.notificationId])

  const acceptInvitation = async () => {
    try {
      await http.post(`/api/v1/follow-requests/${notification.referenceId}/accept`)
      // setIsDecisionMade(true)
    } catch (error) {

    }
  }

  const declineInvitation = async () => {
    try {
      await http.post(`/api/v1/follow-requests/${notification.referenceId}/decline`)
      // setIsDecisionMade(true)
    } catch (error) {

    }
  }

  useEffect(() => {
    // Don't set up observer if already read or no callback provided
    if (isRead) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRead(true)
          onMarkAsRead(notification.notificationId)
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

  if (!profile) {
    return (
      <div className={styles.notifContainer}>
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div className={styles.notifContainer} ref={notifRef}>
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
            onClick={() => acceptInvitation()}
          // disabled={isDecisionMade}
          >✓ Accept</button>
          <button className={styles.declineButton}
            onClick={() => declineInvitation()}
          // disabled={isDecisionMade}
          >× Decline</button>
        </div>
      </div>
    </div>
  )
}
