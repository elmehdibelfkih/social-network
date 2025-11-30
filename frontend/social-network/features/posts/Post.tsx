"use client";

import { useEffect, useState } from 'react';
import { Post as PostType } from './types';
import { AvatarHolder } from '@/components/ui/avatar_holder/avatarholder.client';
import { fetchMediaClient } from '@/libs/apiFetch';
import styles from './styles.module.css';

interface PostProps {
  post: PostType;
}

function PostMedia({ mediaId }: { mediaId: number }) {
  const [src, setSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    
    const loadMedia = async () => {
      try {
        setLoading(true);
        setError(false);
        
        console.log('Fetching media:', mediaId);
        
        // Fetch media without triggering auth redirects
        const media = await fetchMediaClient(String(mediaId));
        
        if (cancelled) return;
        
        if (!media) {
          console.warn('No media data returned for:', mediaId);
          setError(true);
          setLoading(false);
          return;
        }

        console.log('Media response:', media);

        // Handle different response formats
        if (media.mediaEncoded) {
          setSrc(`data:image/png;base64,${media.mediaEncoded}`);
        } else if ((media as any).url) {
          setSrc((media as any).url);
        } else if ((media as any).mediaPath) {
          setSrc((media as any).mediaPath);
        } else {
          console.warn('Media object has no recognizable image property:', media);
          setError(true);
        }
        
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to fetch media for', mediaId, '- Continuing without image:', err);
        setError(true);
        setLoading(false);
      }
    };

    loadMedia();
    
    return () => { 
      cancelled = true; 
    };
  }, [mediaId]);

  // Placeholder SVG
  const placeholderSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='300' viewBox='0 0 600 300'>` +
    `<rect width='100%' height='100%' fill='%23f3f4f6'/>` +
    `<text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23737474' font-family='Arial, Helvetica, sans-serif' font-size='20'>` +
    (loading ? 'Loading...' : error ? 'Image unavailable' : 'Image') +
    `</text>` +
    `</svg>`;
  const placeholder = `data:image/svg+xml;utf8,${encodeURIComponent(placeholderSvg)}`;

  if (!src) {
    return (
      <div className={styles.postImageContainer}>
        <img 
          src={placeholder} 
          alt={loading ? "Loading image..." : "Post image placeholder"} 
          className={styles.postImage}
        />
        {error && (
          <div className={styles.imageError}>
            Media ID: {mediaId}
          </div>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt="Post image"
      className={styles.postImage}
      onError={(e) => { 
        console.error('Failed to load post image', mediaId, '- Showing placeholder');
        setError(true);
        setSrc(null);
      }}
    />
  );
}

export function Post({ post }: PostProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const diffHours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
      
      if (diffHours < 1) return 'Just now';
      if (diffHours < 24) return `${diffHours} hours ago`;
      if (diffHours < 48) return 'Yesterday';
      return date.toLocaleDateString();
    } catch (err) {
      return 'Recently';
    }
  };

  return (
    <div className={styles.postCard}>
      <div className={styles.postUserSection}>
        <AvatarHolder 
          avatarId={post.authorAvatarId}
          size={48}
          alt={`${post.authorFirstName} ${post.authorLastName}`}
        />
        <div className={styles.postUserInfo}>
          <h4>
            {post.authorFirstName} {post.authorLastName}
            {post.authorNickname && <span className={styles.nickname}> (@{post.authorNickname})</span>}
          </h4>
          <span>{formatDate(post.createdAt)} · {post.privacy}</span>
        </div>
      </div>

      <div className={styles.postCaption}>
        <p>{post.content}</p>
      </div>

      {post.mediaIds && post.mediaIds.length > 0 && (
        <div className={styles.postImages}>
          {post.mediaIds.map((mediaId) => (
            <PostMedia key={mediaId} mediaId={mediaId} />
          ))}
        </div>
      )}

      <div className={styles.postInteraction}>
        <button className={`${styles.interactionItem} ${post.isLikedByUser ? styles.liked : ''}`}>
          <img src="/icons/like.svg" alt="like icon" />
          <span>{post.stats.reactionCount} {post.stats.reactionCount === 1 ? 'like' : 'likes'}</span>
        </button>
        <button className={styles.interactionItem}>
          <img src="/icons/comment.svg" alt="comment icon" />
          <span>{post.stats.commentCount} {post.stats.commentCount === 1 ? 'comment' : 'comments'}</span>
        </button>
        <button className={styles.interactionItem}>
          <img src="/icons/share.svg" alt="share icon" />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
}