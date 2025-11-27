'use client'

import { useEffect, useState } from 'react'
import styles from './styles.module.css'
import type { MediaResponse } from './types'
import { http } from '@/libs/apiFetch'

export async function fetchMediaClient(mediaId: string): Promise<MediaResponse> {
  const res = await http.get(`/api/v1/media/${encodeURIComponent(mediaId)}`)
  const payload = res
  return payload as MediaResponse
}

export function AvatarHolder({ avatarId }: { avatarId: number | null }) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setUrl(null)
    if (!avatarId) return () => (mounted = false)

    fetchMediaClient(String(avatarId))
      .then((r) => {
        if (!mounted) return
        const payload = r ?? null
        if (payload?.mediaEncoded) {
          setUrl(`data:image/png;base64,${payload.mediaEncoded}`)
        } else {
          setUrl(null)
        }
      })
      .catch(() => {
        if (!mounted) return
        setUrl(null)
      })

    return () => {
      mounted = false
    }
  }, [avatarId])

  return (
    <div className={styles.avatarWrap} aria-hidden={url ? 'false' : 'true'}>
      {url ? (
        <img src={url} alt="Your avatar" className={styles.avatar} />
      ) : (
        <div className={styles.placeholder} aria-hidden>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 12a4 4 0 100-8 4 4 0 000 8z" fill="#D1D5DB" />
            <path d="M4 20a8 8 0 0116 0H4z" fill="#E5E7EB" />
          </svg>
        </div>
      )}
    </div>
  )
}
