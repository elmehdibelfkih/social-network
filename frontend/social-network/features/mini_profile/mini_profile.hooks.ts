import type { ProfileAPIResponse } from './types'

export function displayName(profile: Partial<ProfileAPIResponse> | null) {
  if (!profile) return 'User'
  if (profile.nickname && profile.nickname.trim()) return profile.nickname
  const full = `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim()
  return full || 'User'
}

export function handleName(profile: Partial<ProfileAPIResponse> | null) {
  if (!profile) return '@user'
  if (profile.nickname && profile.nickname.trim()) return `@${profile.nickname}`
  const raw = `${profile.firstName ?? ''}${profile.lastName ?? ''}`.replace(/\s+/g, '')
  return raw ? `@${raw.toLowerCase()}` : `@${profile.userId ?? 'user'}`
}
