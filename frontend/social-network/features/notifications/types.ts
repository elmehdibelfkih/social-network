export type NotificationType =
    | 'post_liked'
    | 'post_commented'
    | 'group_invite'
    | 'group_join'
    | 'event_created'
    | 'follow_request'
    | 'custom'

export type ReferenceType =
    | 'post'
    | 'comment'
    | 'group'
    | 'event'
    | 'user'
    | 'chat'

export type Notification = {
    notificationId: number
    type: NotificationType
    referenceType: ReferenceType
    referenceId?: number
    content?: string
    isRead: number
    createdAt: string
    readAt?: string
}

export type NotificationsResponse = {
    limit: number
    notifications: Notification[]
}

export type UnreadCountResponse = {
    unreadCount: number
}