export type ProfileAPIResponse = {
  userId: number
  status: 'pending' | 'accepted' | 'declined' | 'follow' | null
  nickname: string | null
  firstName: string | null
  lastName: string | null
  avatarId: number | null
  aboutMe: string | null
  dateOfBirth: string | null
  privacy: 'public' | 'private' | string
  stats: {
    postsCount: number
    followersCount: number
    followingCount: number
  }
  joinedAt: string | null
  chatId?: number | null
}

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
