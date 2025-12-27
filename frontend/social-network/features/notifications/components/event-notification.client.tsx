'use client'
import { useEffect, useState } from 'react'
import type { EventType } from '../types'
import type { NotificationProps } from './shared-types'
import styles from './styles.module.css'
import AvatarHolder from '@/components/ui/avatar_holder/avatarholder.client'
import { http } from '@/libs/apiFetch'
import { formatTimeAgo } from '@/libs/helpers'
import { useRouter } from 'next/navigation'

function EventCard({ title, date }: { title: string, date: string }) {
  return (
    <div className={styles.eventCard}>
      <h3 className={styles.eventTitle}>{title}</h3>
      <p>{date}</p>
    </div>
  )
}

export function EventNotification({ notification, onMarkAsRead }: NotificationProps) {
  const [event, setEvent] = useState<EventType>(null)
  const [isRead, setIsRead] = useState(notification.isRead == 1)
  const router = useRouter()

  const getReferenceEvent = async () => {
    if (!notification.referenceId) {
      return
    }

    try {
      const eventResponse = await http.get<EventType>(`/api/v1/events/${notification.referenceId}`)
      setEvent(eventResponse)
    } catch (error) {
      console.error('Failed to fetch event:', error)
    }
  }

  useEffect(() => {
    getReferenceEvent()
  }, [notification.notificationId])

  const handleClick = () => {
    if (!isRead && onMarkAsRead) {
      setIsRead(true)
      onMarkAsRead(notification.notificationId)
    }

    if (notification.referenceId && event?.groupId) {
      router.push(`/groups/${event.groupId}`)
    }
  }

  if (!event) {
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
            <span>{notification.content}</span>
          </p>
          <EventCard title={event.title} date={event.startAt} />
          {!isRead && <div className={styles.unreadDot} />}
        </div>

        <p className={styles.timeAgo}>{formatTimeAgo(notification.createdAt)}</p>
      </div>
    </div>
  )
}
