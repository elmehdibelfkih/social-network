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

export const formatTimeAgo = (createdAt: string) => {
  const date = new Date(createdAt)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}