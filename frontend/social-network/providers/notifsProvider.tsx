import { Notification, notificationsService } from "@/features/notifications"
import { createContext, useCallback, useContext, useEffect, useState } from "react"

type NotificationContextType = {
    notifications: Notification[]
    unreadCount: number
    loading: boolean
    hasMore: boolean
    loadMore: () => Promise<void>
    markAsRead: (notificationId: number) => Promise<void>
    markAllAsRead: () => Promise<void>
    addNotification: (notification: Notification) => void
}

export const NotificationContext = createContext<NotificationContextType | null>(null)

const MAX_CACHE_SIZE = 100

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [initialized, setInitialized] = useState(false)

    const loadNotifications = useCallback(async () => {
        if (initialized) return

        setLoading(true)
        try {
            const [notificationsResponse, count] = await Promise.all([
                notificationsService.getNotifications(20),
                notificationsService.getUnreadCount(),
            ])

            setNotifications(notificationsResponse.notifications)
            setUnreadCount(count)
            setHasMore(notificationsResponse.notifications.length == 20)
            setInitialized(true)
        } catch (error) {
            console.error('Failed to load notifications:', error)
        } finally {
            setLoading(false)
        }
    }, [initialized])

    useEffect(() => {
        console.log("Hello")
        loadNotifications()
    }, [loadNotifications])

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
        const previousUnreadCount = unreadCount

        setNotifications((prev) =>
            prev.map((notif) =>
                notif.notificationId === notificationId && notif.isRead === 0
                    ? { ...notif, isRead: 1 }
                    : notif
            )
        )

        setUnreadCount((prev) => {
            const notification = notifications.find(n => n.notificationId === notificationId)
            return notification?.isRead === 0 ? Math.max(0, prev - 1) : prev
        })

        const success = await notificationsService.markAsRead(notificationId)

        if (!success) {
            setNotifications(previousNotifications)
            setUnreadCount(previousUnreadCount)
            console.error('Failed to mark notification as read, reverting changes')
        }
    }, [notifications, unreadCount])

    const markAllAsRead = useCallback(async () => {
        const previousNotifications = [...notifications]
        const previousUnreadCount = unreadCount

        setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: 1 })))
        setUnreadCount(0)

        const success = await notificationsService.markAllAsRead()

        // Revert on failure
        if (!success) {
            setNotifications(previousNotifications)
            setUnreadCount(previousUnreadCount)
            console.error('Failed to mark all notifications as read, reverting changes')
        }
    }, [notifications, unreadCount])

    const addNotification = useCallback((notification: Notification) => {
        setNotifications((prev) => {
            const updated = [notification, ...prev]
            return updated.length > MAX_CACHE_SIZE
                ? updated.slice(0, MAX_CACHE_SIZE)
                : updated
        })

        if (notification.isRead === 0) {
            setUnreadCount((prev) => prev + 1)
        }
    }, [])

    const value: NotificationContextType = {
        notifications,
        unreadCount,
        loading,
        hasMore,
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