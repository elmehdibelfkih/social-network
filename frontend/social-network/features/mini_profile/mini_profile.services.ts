import { http } from '@/libs/apiFetch'
import type { MiniProfile, ProfileAPIResponse } from '@/libs/globalTypes'

export async function getMiniProfileServer(userId: string | number): Promise<MiniProfile | null> {
  try {
    const res = await http.get(`/api/v1/users/${encodeURIComponent(String(userId))}/profile`)
    const profile = (res ?? null) as ProfileAPIResponse | null

    if (!profile) {
      return null
    }

    return {
      userId: profile.userId,
      status: profile.status,
      nickname: profile.nickname ?? '',
      firstName: profile.firstName,
      lastName: profile.lastName,
      avatarId: profile.avatarId,
      privacy: profile.privacy as 'public' | 'private',
      chatId: profile.chatId ?? null,
      stats: profile.stats,
      joinedAt: profile.joinedAt
    }
  } catch (err) {
    console.error('getProfileServer error:', err)
    return null
  }
}
