'use client'

import { useState } from 'react'
import styles from './styles.module.css'
import { useRouter } from 'next/navigation'
import { http } from '@/libs/apiFetch'
import { FollowApiResponse } from './types'


type Props = {
  userId: number
  initialStatus: string | null
  initialChatId?: number | null
}


export function MiniProfileActions({ userId, initialStatus, initialChatId }: Props) {
  const [status, setStatus] = useState<string | null>(initialStatus ?? null)
  const [chatId, setChatId] = useState<number | null | undefined>(initialChatId)
  const [busy, setBusy] = useState(false)
  const router = typeof window !== 'undefined' ? useRouter() : (null as any)

  async function doFollow() {
    if (busy) return
    setBusy(true)
    try {
      const res = await http.post<FollowApiResponse>(`/api/v1/users/${encodeURIComponent(String(userId))}/follow`)
      const payload =  res
      const newStatus = payload?.status ?? null
      const newChatId = payload?.chatId ?? null
      setStatus(newStatus)
      setChatId(newChatId)
      if (router?.refresh) router.refresh()
    } catch (err) {
      console.error('follow error', err)
    } finally {
      setBusy(false)
    }
  }

  async function doUnfollow() {
    if (busy) return
    setBusy(true)
    try {
      await http.post(`/api/v1/users/${encodeURIComponent(String(userId))}/unfollow`)
      setStatus(null)
      if (router?.refresh) router.refresh()
    } catch (err) {
      console.error('unfollow error', err)
    } finally {
      setBusy(false)
    }
  }

  function onMessage() {
    if (!chatId) return
    window.location.href = `/chat/${chatId}`
  }

  return (
    <div className={styles.actionIcons}>
      {chatId != null ? (
        <button
          type="button"
          className={styles.iconBtn}
          aria-label="Message"
          onClick={onMessage}
          disabled={!chatId}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M21 15a2 2 0 01-2 2H8l-5 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      ) : null}

      {status === 'accepted' ? (
        <button
          type="button"
          className={`${styles.followBtn} ${styles.followOutline}`}
          onClick={doUnfollow}
          disabled={busy}
          title="Following — click to unfollow"
        >
          ✓
        </button>
      ) : status === 'pending' ? (
        <button
          type="button"
          className={`${styles.followBtn} ${styles.followDisabled}`}
          disabled
          title="Request pending"
        >
          …
        </button>
      ) : (
        <button
          type="button"
          className={`${styles.followBtn} ${styles.followPrimary}`}
          onClick={doFollow}
          disabled={busy}
          title="Follow"
        >
          +
        </button>
      )}
    </div>
  )
}
