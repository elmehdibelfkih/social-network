'use client';

import { useState, useEffect } from 'react';
import styles from './styles.module.css';
import { homeService } from './services/homeService';
import { Post } from './types';

const mockPosts: Post[] = [
  {
    postId: 1,
    authorId: 1,
    authorFirstName: "Sarah",
    authorLastName: "Johnson",
    content: "Just deployed my new React app! Excited to share it with everyone. 🚀",
    mediaIds: [1],
    privacy: "public",
    isLikedByUser: false,
    stats: { reactionCount: 24, commentCount: 8 },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    postId: 2,
    authorId: 2,
    authorFirstName: "Mike",
    authorLastName: "Chen",
    content: "Beautiful sunset today! Nature never fails to amaze me.",
    privacy: "followers",
    isLikedByUser: true,
    stats: { reactionCount: 156, commentCount: 23 },
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
  },
  {
    postId: 3,
    authorId: 3,
    authorFirstName: "Emma",
    authorLastName: "Wilson",
    content: "Coffee and code - the perfect combination for a productive morning! ☕💻",
    mediaIds: [2],
    privacy: "public",
    isLikedByUser: false,
    stats: { reactionCount: 89, commentCount: 12 },
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
  }
];

export default function Posts() {
  const [posts, setPosts] = useState<Post[]>(mockPosts);

  const handleLike = async (postId: number, isLiked: boolean) => {
    // const success = await homeService.toggleLike(postId, isLiked);
    // if (success) {
      setPosts(prev => prev.map(post => 
        post.postId === postId 
          ? {
              ...post,
              isLikedByUser: !isLiked,
              stats: {
                ...post.stats,
                reactionCount: post.stats.reactionCount + (isLiked ? -1 : 1)
              }
            }
          : post
      ));
    // }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

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