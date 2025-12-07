'use client'
import { useEffect, useState } from 'react'
import type { Post } from '@/libs/globalTypes'
import { PostsClient } from './posts.client'
import { AvatarHolder } from '@/components/ui/avatar_holder/avatarholder.client'
import styles from './styles.module.css'
import { fetchMediaClient } from '@/libs/apiFetch'
import { useAuth } from '@/providers/authProvider'

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

export function PostCard({ post, avatarId }: { post: Post, avatarId: number}) {
  const [mediaDataList, setMediaDataList] = useState<(string | null)[]>([])
  const [isLoadingMedia, setIsLoadingMedia] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      if (post.mediaIds && post.mediaIds.length > 0) {
        const mediaData = await Promise.all(
          post.mediaIds.map(mediaId => getMediaData(mediaId))
        )
        setMediaDataList(mediaData)
        setIsLoadingMedia(false)
      } else {
        setIsLoadingMedia(false)
      }
    }

    loadData()
  }, [post.mediaIds])



  const authorName = `${post.authorFirstName} ${post.authorLastName}`
  const timeAgo = new Date(post.createdAt).toLocaleDateString()

  return (
    <article className={styles.post}>
      <div className={styles.header}>
        <AvatarHolder avatarId={avatarId} size={40} />
        <div className={styles.authorInfo}>
          <h3 className={styles.authorName}>{authorName}</h3>
          <div className={styles.postMeta}>
            <span className={styles.timeAgo}>{timeAgo}</span>
            <span className={styles.privacy}>🌐 {post.privacy}</span>
          </div>
        </div>
        <button className={styles.menuButton}>⋮</button>
      </div>

      <div className={styles.content}>
        <p>{post.content}</p>
      </div>

      {post?.mediaIds && post.mediaIds.length > 0 && (
        <div className={styles.media}>
          {isLoadingMedia ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
              Loading media...
            </div>
          ) : (
            mediaDataList.map((mediaData, index) =>
              mediaData ? (
                <img
                  key={post.mediaIds![index]}
                  src={mediaData}
                  alt="Post media"
                  className={styles.mediaImage}
                />
              ) : null
            )
          )}
        </div>
      )}

      <div className={styles.stats}>
        <span>{post.stats?.reactionCount} likes</span>
        <span>{post.stats?.commentCount} comment{post.stats?.commentCount !== 1 ? 's' : ''}</span>
      </div>

      <PostsClient post={post} />
    </article>
  )
}
