export type FollowResponse = {
    message: string
    status: string
    targetUserId: number
    followerId: number
    chatId: number | null
}

export type PrivacyToggleResponse = {
    message: string
    privacy: string
}