import type { Post as PostType } from '@/libs/globalTypes'
import { http } from '@/libs/apiFetch'
import styles from './styles.module.css'
import { PostHeader } from './post-header.client'
import { PostMedia } from './post-media.client'
import { PostInteractions } from './post-interactions.client'

async function getAvatarId(userId: number): Promise<number | null> {
  try {
    const profile = await http.get(`/api/v1/users/${userId}/profile`) as any
    return profile?.avatarId || null
  } catch {
    return null
  }
}

export async function Post({
  post,
  avatarId: providedAvatarId
}: {
  post: PostType
  avatarId?: number
}) {
  // Fetch avatarId on server if not provided
  const avatarId = providedAvatarId ?? await getAvatarId(post.authorId)

  const authorName = `${post.authorFirstName} ${post.authorLastName}`
  const timeAgo = new Date(post.createdAt).toLocaleDateString()

  return (
    <article className={styles.post}>
      <PostHeader
        authorId={post.authorId}
        authorName={authorName}
        timeAgo={timeAgo}
        privacy={post.privacy}
        avatarId={avatarId}
        postId={post.postId}
        postContent={post.content}
        postPrivacy={post.privacy}
        mediaIds={post.mediaIds}
      />

      <div className={styles.content}>
        <p>{post.content}</p>
      </div>

      {post?.mediaIds && post.mediaIds.length > 0 && (
        <PostMedia mediaIds={post.mediaIds} />
      )}

      <PostInteractions
        post={post}
        initialReactionCount={post.stats?.reactionCount || 0}
        initialCommentCount={post.stats?.commentCount || 0}
      />
    </article>
  )
}

// Export with alias for backwards compatibility
export const PostServer = Post
export default Post
