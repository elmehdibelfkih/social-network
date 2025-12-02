'use client';

import { useState, useEffect } from 'react';
import { Post } from '@/libs/globalTypes';
import { postsService } from './postsService';
import { LikeButton } from '@/components/ui/like-button/like-button';
import { Comments } from '@/components/ui/comments/comments';
import styles from './styles.module.css';

interface PostsClientProps {
  newPost?: Post | null;
  onNewPostDisplayed?: () => void;
}

export function PostsClient({ newPost, onNewPostDisplayed }: PostsClientProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [openComments, setOpenComments] = useState<number | null>(null);

  useEffect(() => {
    postsService.getFeed().then(setPosts);
  }, []);

  useEffect(() => {
    if (newPost) {
      setPosts(prev => [newPost, ...prev]);
      onNewPostDisplayed?.();
    }
  }, [newPost, onNewPostDisplayed]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={styles.postsContainer}>
      {posts.length === 0 ? (
        <div>No posts yet. Create the first one!</div>
      ) : (
        posts.map((post) => (
          <div key={post.postId} className={styles.postCard}>
            <div className={styles.postUserSection}>
              <div className={styles.postUserAvatar}>
                <img src="/users.svg" alt="User Avatar" />
              </div>
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
                  <img
                    key={mediaId}
                    src={`${process.env.NEXT_PUBLIC_GO_API_URL}/api/v1/media/${mediaId}`}
                    alt="Post image"
                    className={styles.postImage}

                    onError={(e) => {
                      console.error('Failed to load image:', mediaId);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ))}
              </div>
            )}

            <div className={styles.postInteraction}>
              <LikeButton
                postId={post.postId}
                isLiked={post.isLikedByUser}
                likeCount={post.stats.reactionCount}
                onLikeChange={(isLiked, newCount) => {
                  setPosts(prev => prev.map(p =>
                    p.postId === post.postId
                      ? { ...p, isLikedByUser: isLiked, stats: { ...p.stats, reactionCount: newCount } }
                      : p
                  ));
                }}
              />
              <button
                className={styles.interactionItem}
                onClick={() => setOpenComments(post.postId)}
              >
                <img src="/icons/comment.svg" alt="comment icon" />
                <span>{post.stats.commentCount} comments</span>
              </button>
              <button className={styles.interactionItem}>
                <img src="/icons/share.svg" alt="share icon" />
                <span>Share</span>
              </button>
            </div>

            <Comments
              postId={post.postId}
              isOpen={openComments === post.postId}
              onClose={() => setOpenComments(null)}
              commentCount={post.stats.commentCount}
              onCommentAdded={() => {
                setPosts(prev => prev.map(p =>
                  p.postId === post.postId
                    ? { ...p, stats: { ...p.stats, commentCount: p.stats.commentCount + 1 } }
                    : p
                ));
              }}
            />
          </div>
        ))
      )}
    </div>
  );
}
