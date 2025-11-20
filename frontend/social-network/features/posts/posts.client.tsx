'use client';

import styles from './styles.module.css';
import { usePosts } from './hooks/usePosts';

export function PostsClient() {
  const { posts, handleLike, formatTimeAgo } = usePosts();

  return (
    <div className={styles.postsContainer}>
      {posts.map(post => (
        <div key={post.postId} className={styles.postCard}>
          <div className={styles.postUserSection}>
            <div className={styles.postUserAvatar}>
              <img src="/users.svg" alt="User Avatar" />
            </div>
            <div className={styles.postUserInfo}>
              <h4>
                {post.authorNickname || `${post.authorFirstName} ${post.authorLastName}`}
              </h4>
              <span>{formatTimeAgo(post.createdAt)} · {post.privacy}</span>
            </div>
          </div>

          <div className={styles.postCaption}>
            <p>{post.content}</p>
          </div>

          {post.mediaIds && post.mediaIds.length > 0 && (
            <div className={styles.postImg}>
              <img src="/pic.png" alt="Post media" />
            </div>
          )}

          <div className={styles.postInteraction}>
            <button 
              onClick={() => handleLike(post.postId, post.isLikedByUser)}
              className={`${styles.interactionItem} ${post.isLikedByUser ? styles.liked : ''}`}
            >
              <img src="/icons/like.svg" alt="like icon" />
              <span>{post.stats.reactionCount} likes</span>
            </button>

            <button className={styles.interactionItem}>
              <img src="/icons/comment.svg" alt="comment icon" />
              <span>{post.stats.commentCount} comments</span>
            </button>

            <button className={styles.interactionItem}>
              <img src="/icons/share.svg" alt="share icon" />
              <span>Share</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}