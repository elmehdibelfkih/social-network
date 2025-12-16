'use client'

import { useEffect, useRef, useState } from 'react'
import type { Notification } from '../types'
import styles from './styles.module.css'
import AvatarHolder from '@/components/ui/avatar_holder/avatarholder.client'
import { http } from '@/libs/apiFetch'
import { ProfileAPIResponse } from '@/libs/globalTypes'

type Props = {
  notification: Notification
  onMarkAsRead?: (id: number) => void
}

const formatTimeAgo = (createdAt: string) => {
  const date = new Date(createdAt)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export function FollowNotification({ notification, onMarkAsRead }: Props) {
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

export function GroupInviteNotification({ notification, onMarkAsRead }: Props) {
  const [group, setGroup] = useState<ProfileAPIResponse>(null)
  // const [isDecisionMade, setIsDecisionMade] = useState(!isActive)
  const [isRead, setIsRead] = useState(notification.isRead == 1)
  const notifRef = useRef<HTMLDivElement>(null)

  const getReferenceGroup = async () => {
    try {
      const response = await http.get<ProfileAPIResponse>(`/api/v1/groups/${notification.referenceId}`)
      setGroup(response)
    } catch (error) {
      console.error('Failed to fetch group:', error)
    }
  }

  useEffect(() => {
    getReferenceGroup()
  }, [notification.notificationId])

  useEffect(() => {
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

  const acceptInvitation = async () => {
    try {
      await http.post(`/api/v1/groups/${notification.referenceId}/accept`)
      // setIsDecisionMade(true)
    } catch (error) {

    }
  }

  const declineInvitation = async () => {
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
    <div className={styles.notifContainer} ref={notifRef}>
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

export function EventNotification({ notification, onMarkAsRead }: Props) {
  const [event, setEvent] = useState<any>(null)
  const [isRead, setIsRead] = useState(notification.isRead == 1)
  const notifRef = useRef<HTMLDivElement>(null)

  const getReferenceEvent = async () => {
    if (!notification.referenceId) {
      console.log('No referenceId in notification:', notification)
      return
    }

    try {
      const response = await http.get(`/api/v1/events/${notification.referenceId}`)
      console.log('Event response:', response)
      setEvent(response)
    } catch (error) {
      console.error('Failed to fetch event:', error)
    }
  }

  useEffect(() => {
    getReferenceEvent()
  }, [notification.notificationId])

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

  if (!event) {
    return (
      <div className={styles.notifContainer}>
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div className={styles.notifContainer} ref={notifRef}>
      <div className={styles.avatar}>
        <AvatarHolder avatarId={event.creatorAvatarId} />
      </div>

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

export function PostLikedNotification({ notification, onMarkAsRead }: Props) {
  const [profile, setProfile] = useState<ProfileAPIResponse>(null)
  const [isRead, setIsRead] = useState(notification.isRead == 1)
  const notifRef = useRef<HTMLDivElement>(null)

  const getReferenceProfile = async () => {
    if (!notification.referenceId) {
      console.log('No referenceId in notification:', notification)
      return
    }

    try {
      const response = await http.get<ProfileAPIResponse>(`/api/v1/users/${notification.referenceId}/profile`)
      console.log('Profile response:', response)
      setProfile(response)
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    }
  }

  useEffect(() => {
    getReferenceProfile()
  }, [notification.notificationId])

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
      </div>
    </div>
  )
}

export function PostCommentedNotification({ notification, onMarkAsRead }: Props) {
  const [profile, setProfile] = useState<ProfileAPIResponse>(null)
  const [isRead, setIsRead] = useState(notification.isRead == 1)
  const notifRef = useRef<HTMLDivElement>(null)

  const getReferenceProfile = async () => {
    if (!notification.referenceId) {
      console.log('No referenceId in notification:', notification)
      return
    }

    try {
      const response = await http.get<ProfileAPIResponse>(`/api/v1/users/${notification.referenceId}/profile`)
      console.log('Profile response:', response)
      setProfile(response)
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    }
  }

  useEffect(() => {
    getReferenceProfile()
  }, [notification.notificationId])

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

  const handleClick = () => {
    if (notification.referenceId) {
      window.location.href = `/profile?postId=${notification.referenceId}`
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
    <div className={styles.notifContainer} ref={notifRef} onClick={handleClick}>
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
      </div>
    </div>
  )
}

export function CustomNotification({ notification, onMarkAsRead }: Props) {
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