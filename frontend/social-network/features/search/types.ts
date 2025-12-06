export type User = {
  userId: number
  nickname: string
  firstName: string
  lastName: string
  avatarId: number
  status: 'pending' | 'accepted'
  chatId: number | null
  privacy?: 'public' | 'private'
}