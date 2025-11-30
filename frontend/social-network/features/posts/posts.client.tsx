'use client';

import { useState, useEffect } from 'react';
import { Post as PostType } from './types';
import { postsService } from './postsService';
import { Post } from './Post';
import styles from './styles.module.css';

interface PostsProps {
  userId?: number;
  groupId?: number;
  following?: boolean;
  newPost?: PostType | null;
  onNewPostDisplayed?: () => void;
  limit?: number;
  showCreatePost?: boolean;
  emptyMessage?: string;
}

export function Posts({
  userId,
  groupId,
  following = false,
  newPost,
  onNewPostDisplayed,
  limit,
  showCreatePost = false,
  emptyMessage = 'No posts yet.'
}: PostsProps) {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, [userId, groupId, following]);

  useEffect(() => {
    if (newPost) {
      setPosts(prev => [newPost, ...prev]);
      onNewPostDisplayed?.();
    }
  }, [newPost, onNewPostDisplayed]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const fetched = await postsService.getPosts({ userId, groupId, following });
      setPosts(fetched || []);
    } catch (err) {
      console.error('Error loading posts:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.postsContainer}>
        <div className={styles.loadingIndicator}>Loading posts...</div>
      </div>
    );
  }

  const displayPosts = limit ? posts.slice(0, limit) : posts;

  return (
    <div className={styles.postsContainer}>
      {displayPosts.length === 0 ? (
        <div className={styles.emptyState}>{emptyMessage}</div>
      ) : (
        displayPosts.map(post => (
          <Post key={post.postId} post={post} />
        ))
      )}
    </div>
  );
}