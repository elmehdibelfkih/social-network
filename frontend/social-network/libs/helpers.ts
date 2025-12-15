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

export function timeAgo(dateString: string): string {
  if (!dateString) return 'now'
  
  const now = new Date()
  const date = new Date(dateString)
  
  if (isNaN(date.getTime())) return 'now'
  
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  const diffWeek = Math.floor(diffDay / 7)

  if (diffSec < 60) return 'now'
  if (diffMin < 60) return `${diffMin}m`
  if (diffHour < 24) return `${diffHour}h`
  if (diffDay < 7) return `${diffDay}d`
  if (diffWeek < 4) return `${diffWeek}w`
  return date.toLocaleDateString()
}
