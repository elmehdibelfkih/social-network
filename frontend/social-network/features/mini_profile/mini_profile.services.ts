import { http } from '@/libs/apiFetch'
import type { ProfileAPIResponse } from '@/libs/globalTypes'

export async function getProfileServer(userId: string | number): Promise<ProfileAPIResponse | null> {
  try {
    const res = await http.get(`/api/v1/users/${encodeURIComponent(String(userId))}/profile`)
    return (res ?? null) as ProfileAPIResponse | null
  } catch (err) {
    console.error('getProfileServer error:', err)
    return null
  }
}
