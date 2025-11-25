'use client';

import { useState } from 'react';
import { postsService } from '@/features/posts/services/postsService';
import styles from './like-button.module.css';

interface LikeButtonProps {
  postId: number;
  isLiked: boolean;
  likeCount: number;
  onLikeChange?: (isLiked: boolean, newCount: number) => void;
}

export function LikeButton({ postId, isLiked, likeCount, onLikeChange }: LikeButtonProps) {
  const [liked, setLiked] = useState(isLiked);
  const [count, setCount] = useState(likeCount);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (loading) return;
    
    setLoading(true);
    const success = await postsService.toggleLike(postId, liked);
    
    if (success) {
      const newLiked = !liked;
      const newCount = newLiked ? count + 1 : count - 1;
      
      setLiked(newLiked);
      setCount(newCount);
      onLikeChange?.(newLiked, newCount);
    }
    
    setLoading(false);
  };

  return (
    <button 
      onClick={handleLike}
      disabled={loading}
      className={styles.likeButton}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        strokeWidth="2"
        className={`${styles.likeIcon} ${liked ? styles.liked : styles.unliked} ${loading ? styles.loading : ''}`}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      <span className={`${styles.likeText} ${liked ? styles.liked : styles.unliked}`}>
        {count} {count === 1 ? 'like' : 'likes'}
      </span>
    </button>
  );
}