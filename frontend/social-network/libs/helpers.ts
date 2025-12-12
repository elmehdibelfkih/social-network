import { http } from "./apiFetch";
import type {
  MiniProfile,
  UserId
} from '@/libs/globalTypes'


export async function getUserId() {
  const res = await http.get<UserId>('/api/v1/users/id');
  if (!res) {
    return null;
  }
  return res.Id
}

export function displayName(profile: MiniProfile | null) {
  if (!profile) return 'User'
  const full = `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim()

  return full || 'User'
}

export function handleName(profile: MiniProfile | null) {
  if (!profile) return '@user'
  if (profile.nickname && profile.nickname.trim()) return `@${profile.nickname}`
  const raw = `${profile.firstName ?? ''}${profile.lastName ?? ''}`.replace(/\s+/g, '')
  return raw ? `@${raw.toLowerCase()}` : `@${profile.userId ?? 'user'}`
}
