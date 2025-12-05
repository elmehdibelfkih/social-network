import { http } from "./apiFetch";
import type {
    MediaResponse,
    ProfileAPIResponse,
    UserId
} from '@/libs/globalTypes'


export async function getUserId() {
    const res = await http.get<UserId>('/api/v1/users/id');
    if (!res) {
        throw new Error('Failed to fetch user ID');
    }
    return res.Id
}

export function displayName(profile: Partial<ProfileAPIResponse> | null) {
  if (!profile) return 'User'
  const full = `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim()

  return full || 'User'
}

export function handleName(profile: Partial<ProfileAPIResponse> | null) {
  if (!profile) return '@user'
  if (profile.nickname && profile.nickname.trim()) return `@${profile.nickname}`
  const raw = `${profile.firstName ?? ''}${profile.lastName ?? ''}`.replace(/\s+/g, '')
  return raw ? `@${raw.toLowerCase()}` : `@${profile.userId ?? 'user'}`
}
