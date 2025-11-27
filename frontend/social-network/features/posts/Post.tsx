'use client';

import { Post as PostType } from './types';
import styles from './Post.module.css';

interface PostProps {
  post: PostType;
}

export function Post({ post }: PostProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const diffHours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={styles.postCard}>
      <div className={styles.postUserSection}>
        <div className={styles.postUserAvatar}>
          <img 
            src={post.authorAvatarId 
              ? `${process.env.NEXT_PUBLIC_GO_API_URL}/api/v1/media/${post.authorAvatarId}` 
              : "/users.svg"
            } 
            alt="User Avatar" 
          />
        </div>
        <div className={styles.postUserInfo}>
          <h4>{post.authorFirstName} {post.authorLastName}</h4>
          <span>{formatDate(post.createdAt)} · {post.privacy}</span>
        </div>
      </div>

      <div className={styles.postCaption}>
        <p>{post.content}</p>
      </div>

      <div className={styles.postInteraction}>
        <button className={styles.interactionItem}>
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
  );
}