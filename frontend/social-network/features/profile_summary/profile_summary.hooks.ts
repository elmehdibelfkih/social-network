import type { ProfileAPIResponse } from './types'

export function formatDisplayName(profile: Partial<ProfileAPIResponse> | null): string {
  if (!profile) return 'You'
  if (profile.nickname && profile.nickname.trim()) return profile.nickname
  const fn = profile.firstName ?? ''
  const ln = profile.lastName ?? ''
  const combined = `${fn} ${ln}`.trim()
  return combined || 'You'
}

export function formatHandle(profile: Partial<ProfileAPIResponse> | null): string {
  if (!profile) return '@you'
  if (profile.nickname && profile.nickname.trim()) return `@${profile.nickname}`
  const handleRaw = `${profile.firstName ?? ''}${profile.lastName ?? ''}`.replace(/\s+/g, '')
  return handleRaw ? `@${handleRaw.toLowerCase()}` : `@${profile.userId ?? 'you'}`
}
