'use client'
import { useState, useEffect } from 'react'
import { fetchMediaClient } from '@/libs/apiFetch'
import { MediaCarousel } from './media-carousel.client'

async function getMediaData(mediaId: number): Promise<string | null> {
  try {
    const media = await fetchMediaClient(String(mediaId))
    if (media?.mediaEncoded) {
      return `data:image/jpeg;base64,${media.mediaEncoded}`
    }
    return null
  } catch {
    return null
  }
}

export function PostMedia({ mediaIds }: { mediaIds: number[] }) {
  const [mediaDataList, setMediaDataList] = useState<(string | null)[]>([])
  const [isLoadingMedia, setIsLoadingMedia] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      if (mediaIds && mediaIds.length > 0) {
        const mediaData = await Promise.all(
          mediaIds.map(mediaId => getMediaData(mediaId))
        )
        setMediaDataList(mediaData)
        setIsLoadingMedia(false)
      } else {
        setIsLoadingMedia(false)
      }
    }

    loadData()
  }, [mediaIds])

  if (!mediaIds || mediaIds.length === 0) return null

  if (isLoadingMedia) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
        Loading media...
      </div>
    )
  }

  return <MediaCarousel mediaDataList={mediaDataList.filter(Boolean) as string[]} />
}
