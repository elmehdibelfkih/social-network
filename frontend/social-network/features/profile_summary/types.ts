export type ProfileAPIResponse = {
  userId: number
  status: null | string
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
}

export type MediaResponse = { mediaEncoded?: string }
