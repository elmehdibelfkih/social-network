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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const media = await fetchMediaClient(String(mediaId));
        if (cancelled) return;
        if (!media) return;
        if ((media as any).mediaEncoded) {
          setSrc(`data:image/png;base64,${(media as any).mediaEncoded}`);
        } else if ((media as any).url) {
          setSrc((media as any).url);
        }
      } catch (err) {
        console.error('Failed to fetch media for', mediaId, err);
      }
    })();
    return () => { cancelled = true; };
  }, [mediaId]);

  if (!src) {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='300' viewBox='0 0 600 300'>` +
      `<rect width='100%' height='100%' fill='%23f3f4f6'/>` +
      `<text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23737474' font-family='Arial, Helvetica, sans-serif' font-size='20'>Test image</text>` +
      `</svg>`;
    const placeholder = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    return <img src={placeholder} alt="Post image placeholder" className={styles.postImage} />;
  }

  return (
    <img
      src={src}
      alt="Post image"
      className={styles.postImage}
      onError={(e) => { console.error('Failed to load post image', mediaId); e.currentTarget.style.display = 'none'; }}
    />
  );
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
        <AvatarHolder 
          avatarId={post.authorAvatarId}
          size={48}
          alt={`${post.authorFirstName} ${post.authorLastName}`}
        />
        <div className={styles.postUserInfo}>
          <h4>{post.authorFirstName} {post.authorLastName}</h4>
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