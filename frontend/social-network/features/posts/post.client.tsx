import type { Post as PostType } from '@/libs/globalTypes'
import styles from './styles.module.css'
import { PostHeader } from './post-header.client'
import { PostMedia } from './post-media.client'
import { PostInteractions } from './post-interactions.client'

export function PostClient({
  post,
  avatarId
}: {
  post: PostType
  avatarId: number
}) {
  return (
    <article className={styles.post}>
      <PostHeader
        authorId={post.authorId}
        authorName={`${post.authorFirstName} ${post.authorLastName}`}
        timeAgo={new Date(post.createdAt).toLocaleDateString()}
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

// Alias for backwards compatibility
export const PostCard = PostClient
