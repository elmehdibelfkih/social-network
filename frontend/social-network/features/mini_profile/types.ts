export type MediaResponse = { mediaEncoded?: string }

export type FollowApiResponse = {
  message: string
  status: 'pending' | 'accepted' | string
  targetUserId?: number
  followerId?: number
  chatId?: number | null
}

export type UnfollowApiResponse = {
  message: string
  targetUserId?: number
  followerrId?: number
}
