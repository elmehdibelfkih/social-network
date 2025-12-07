import { Suspense } from 'react'
import type { Post } from '@/libs/globalTypes'
import { PostsClient } from './posts.client'
import { AvatarHolder } from '@/components/ui/avatar_holder/avatarholder.client'
import styles from './styles.module.css'
import { http, fetchMediaClient } from '@/libs/apiFetch'

async function getAvatarId(userId: number): Promise<number | null> {
  try {
    const profile = await http.get(`/api/v1/users/${userId}/profile`) as any
    return profile?.avatarId || null
  } catch {
    return null
  }
}

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

type Props = {
  post: Post
}

export default async function PostServer({ post }: Props) {
  const authorName = `${post.authorFirstName} ${post.authorLastName}`
  const timeAgo = new Date(post.createdAt).toLocaleDateString()
  const avatarId = await getAvatarId(post.authorId)

  const mediaDataPromises = post.mediaIds?.map(mediaId => getMediaData(mediaId)) || []
  const mediaDataList = await Promise.all(mediaDataPromises)

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

      {post.mediaIds && post.mediaIds.length > 0 && (
        <div className={styles.media}>
          {mediaDataList.map((mediaData, index) =>
            mediaData ? (
              <img
                key={post.mediaIds![index]}
                src={mediaData}
                alt="Post media"
                className={styles.mediaImage}
              />
            ) : null
          )}
        </div>
      )}

      <div className={styles.stats}>
        <span>{post.stats.reactionCount} likes</span>
        <span>{post.stats.commentCount} comment{post.stats.commentCount !== 1 ? 's' : ''}</span>
      </div>

      <Suspense fallback={<div className={styles.actionsLoading}>Loading...</div>}>
        <PostsClient
          postId={post.postId}
          isLiked={post.isLikedByUser}
          authorId={post.authorId}
          initialCommentCount={post.stats.commentCount}
        />
      </Suspense>
    </article>
  )
}