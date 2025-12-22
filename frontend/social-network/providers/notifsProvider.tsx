'use client'
import { Notification, notificationsService } from "@/features/notifications"
import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { useAuth } from "./authProvider"
import { useUserStats } from "./userStatsContext"

type NotificationContextType = {
    notifications: Notification[]
    loading: boolean
    hasMore: boolean
    prependNotifications: (newNotifications: Notification[]) => void
    loadNotifications: () => Promise<void>
    loadMore: () => Promise<void>
    markAsRead: (notificationId: number) => Promise<void>
    markAllAsRead: () => Promise<void>
    addNotification: (notification: Notification) => void
}

export const NotificationContext = createContext<NotificationContextType | null>(null)

const MAX_CACHE_SIZE = 100

export function NotificationProvider({ children }) {
    const { user } = useAuth()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const { dispatch: userStatsDispatch } = useUserStats()

    const loadNotifications = useCallback(async () => {
        setLoading(true)
        try {
            const notificationsResponse = await notificationsService.getNotifications(20)

            setNotifications(notificationsResponse.notifications)
            setHasMore(notificationsResponse?.notifications?.length == 20)
        } catch (error) {
            console.error('Failed to load notifications:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (user) {
            loadNotifications()
        } else {
            setNotifications([])
            setHasMore(true)
        }
    }, [user, loadNotifications])

    const loadMore = useCallback(async () => {
        if (loading || !hasMore) return

        setLoading(true)
        try {
            const lastId = notifications.length > 0
                ? notifications[notifications.length - 1].notificationId
                : undefined

            const response = await notificationsService.getNotifications(20, lastId)

            if (response.notifications.length > 0) {
                setNotifications((prev) => {
                    const combined = [...prev, ...response.notifications]
                    return combined.length > MAX_CACHE_SIZE ? combined.slice(0, MAX_CACHE_SIZE) : combined
                })
                setHasMore(response.notifications.length == 20)
            } else {
                setHasMore(false)
            }
        } catch (error) {
            console.error('Failed to load more notifications:', error)
        } finally {
            setLoading(false)
        }
    }, [loading, hasMore, notifications])

    const markAsRead = useCallback(async (notificationId: number) => {
        const previousNotifications = [...notifications]
        const notification = notifications.find(n => n.notificationId === notificationId)

        // Only update if the notification is currently unread
        if (notification?.isRead === 0) {
            setNotifications((prev) =>
                prev.map((notif) =>
                    notif.notificationId === notificationId
                        ? { ...notif, isRead: 1 }
                        : notif
                )
            )
            userStatsDispatch({ type: 'READ_NOTIFICATION' })

            const success = await notificationsService.markAsRead(notificationId)

            if (!success) {
                setNotifications(previousNotifications)
                userStatsDispatch({ type: 'NEW_NOTIFICATION' })
                console.error('Failed to mark notification as read, reverting changes')
            }
        }
    }, [notifications, userStatsDispatch])

    const markAllAsRead = useCallback(async () => {
        const previousNotifications = [...notifications]
        const unreadCount = notifications.filter(n => n.isRead === 0).length

        setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: 1 })))
        userStatsDispatch({ type: 'READ_ALL_NOTIFICATIONS' })

        const success = await notificationsService.markAllAsRead()

        // Revert on failure
        if (!success) {
            setNotifications(previousNotifications)
            // Revert the unread count by adding back the number of unread notifications
            for (let i = 0; i < unreadCount; i++) {
                userStatsDispatch({ type: 'NEW_NOTIFICATION' })
            }
            console.error('Failed to mark all notifications as read, reverting changes')
        }
    }, [notifications, userStatsDispatch])

    const addNotification = useCallback((notification: Notification) => {
        setNotifications((prev) => {
            const updated = [notification, ...prev]
            return updated.length > MAX_CACHE_SIZE
                ? updated.slice(0, MAX_CACHE_SIZE)
                : updated
        })

        if (notification.isRead === 0) {
            userStatsDispatch({ type: 'NEW_NOTIFICATION' })
        }
    }, [userStatsDispatch])

    const prependNotifications = useCallback((newNotifications: Notification[]) => {
        setNotifications((prev) => {
            const combined = [...newNotifications, ...prev]
            return combined.length > MAX_CACHE_SIZE
                ? combined.slice(0, MAX_CACHE_SIZE)
                : combined
        })

        const unreadInNew = newNotifications.filter(n => n.isRead === 0).length
        for (let i = 0; i < unreadInNew; i++) {
            userStatsDispatch({ type: 'NEW_NOTIFICATION' })
        }
    }, [userStatsDispatch])

    const value: NotificationContextType = {
        notifications,
        loading,
        hasMore,
        prependNotifications,
        loadNotifications,
        loadMore,
        markAsRead,
        markAllAsRead,
        addNotification,
    }

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    )
}

export function useNotifications() {
    const context = useContext(NotificationContext)

    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider')
    }

    return context
}