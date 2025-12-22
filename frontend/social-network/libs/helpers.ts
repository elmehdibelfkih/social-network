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

export function formatMessageDate(dateStr: string): string {
    const d = new Date(dateStr.replace(" ", "T") + "Z");

    if (isNaN(d.getTime())) {
        console.warn("Invalid date:", dateStr);
        return "";
    }

    const now = new Date();

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const msgDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());

    const diffMs = today.getTime() - msgDay.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    const time = d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });

    if (diffDays === 0) return time;
    if (diffDays === 1) return `Yesterday ${time}`;

    return d.toLocaleDateString("en-GB");
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

export function formattedDate(date: string | Date | null): string {
  if (!date) return "";

  return new Date(date)
    .toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .replace(",", "");
  }

  
export function timeAgo(dateString: string): string {
  if (!dateString) return 'just now'
  
  const now = new Date()
  const date = new Date(dateString)
  
  if (isNaN(date.getTime())) return 'just now'
  
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  const diffWeek = Math.floor(diffDay / 7)

  if (diffSec < 60) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHour < 24) return `${diffHour}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  if (diffWeek < 4) return `${diffWeek}w ago`
  return date.toLocaleDateString()
}
