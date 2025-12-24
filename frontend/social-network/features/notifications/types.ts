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
    status: string
    isRead: number
    createdAt: string
    readAt?: string
    actorId?: number
    actorName?: string
    actorAvatarId?: number
}

export type GroupType = {
    groupId: number
    creatorId: number
    title: string
    description: string
    memberCount: number
    avatarId: number
    status: string
    chatId: number
    createdAt: string
    updatedAt: string
}

export type EventType = {
    eventId: number
    groupId: number
    title: string
    description: string
    startAt: string
    endAt: string
    location: string
    createdBy: number
    createdAt: string
}

export type NotificationsResponse = {
    limit: number
    notifications: Notification[]
}

export type UnreadCountResponse = {
    unreadCount: number
}