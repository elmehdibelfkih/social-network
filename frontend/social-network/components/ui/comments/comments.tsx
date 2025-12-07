'use client';

import { useState, useEffect } from 'react';
import styles from './comments.module.css';
import AvatarHolder from '@/components/ui/avatar_holder/avatarholder.client';
import { http } from '@/libs/apiFetch';


interface Comment {
  commentId: number;
  authorId: number;
  authorNickname: string;
  content: string;
  createdAt: string;
  isLikedByUser: boolean;
  likeCount: number;
}

interface CommentsProps {
  postId: number;
  isOpen: boolean;
  onClose: () => void;
  commentCount: number;
  onCommentAdded: () => void;
}

export function Comments({ postId, isOpen, onClose, commentCount, onCommentAdded }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [userProfiles, setUserProfiles] = useState<{[key: number]: {avatarId: number | null}}>({});
  const [likingComments, setLikingComments] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPage(1);
      setComments([]);
      setHasMore(true);
      fetchComments(1);
    }
  }, [isOpen, postId]);

  const fetchComments = async (pageNum: number) => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const data = await http.get<any>(`/api/v1/posts/${postId}/comments?page=${pageNum}&limit=10`);
      const commentsData = (data?.comments || []).map((c: any) => ({
        commentId: c.commentId,
        authorId: c.authorId,
        authorNickname: c.authorNickname,
        content: c.content,
        createdAt: c.createdAt,
        isLikedByUser: Boolean(c.isLikedByUser),
        likeCount: Number(c.likeCount) || 0
      }));
      
      if (commentsData.length < 10) setHasMore(false);
      setComments(prev => pageNum === 1 ? commentsData : [...prev, ...commentsData]);
      
      // Fetch user profiles for avatars
      const uniqueUserIds = [...new Set(commentsData.map((c: Comment) => c.authorId))];
      const profiles: {[key: number]: {avatarId: number | null}} = {};
      
      await Promise.all(uniqueUserIds.map(async (userId: number) => {
        try {
          const profileData = await http.get<any>(`/api/v1/users/${userId}/profile`);
          profiles[userId] = { avatarId: profileData?.avatarId || null };
        } catch (error) {
          profiles[userId] = { avatarId: null };
        }
      }));
      
      setUserProfiles(profiles);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const commentsList = document.querySelector(`.${styles.commentsList}`);
    if (!commentsList || !isOpen) return;

    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (commentsList.scrollHeight - commentsList.scrollTop <= commentsList.clientHeight + 50) {
          if (hasMore && !loadingMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchComments(nextPage);
          }
        }
      }, 200);
    };

    commentsList.addEventListener('scroll', handleScroll);
    return () => {
      clearTimeout(scrollTimeout);
      commentsList.removeEventListener('scroll', handleScroll);
    };
  }, [isOpen, hasMore, loadingMore, page]);

  const handleCommentLike = async (commentId: number, isLiked: boolean) => {
    setLikingComments(prev => new Set(prev).add(commentId));
    
    try {
      const success = await http.post(`/api/v1/comments/${commentId}/like`);

      if (success !== null) {
        setComments(prev => prev.map(comment => 
          comment.commentId === commentId
            ? {
                ...comment,
                isLikedByUser: !isLiked,
                likeCount: comment.likeCount + (isLiked ? -1 : 1)
              }
            : comment
        ));
      }
    } catch (error) {
      console.error('Failed to like comment:', error);
    } finally {
      setLikingComments(prev => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_GO_API_URL}/api/v1/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ content: newComment.trim() })
      });

      if (response.ok) {
        setNewComment('');
        setPage(1);
        setComments([]);
        setHasMore(true);
        fetchComments(1);
        onCommentAdded();
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Comments ({commentCount})</h3>
          <button onClick={onClose} className={styles.closeButton}>×</button>
        </div>
        
        <div className={styles.commentsList}>
          {Array.isArray(comments) && comments.map((comment, index) => {
            const isLiked = comment.isLikedByUser === true;
            return (
            <div key={`${comment.commentId}-${index}`} className={styles.comment}>
              <div className={styles.commentAvatar}>
        <AvatarHolder avatarId={userProfiles[comment.authorId]?.avatarId ?? null} size={25} />
              </div>
              <div className={styles.commentContent}>
                <div className={styles.commentHeader}>
                  <span className={styles.commentAuthor}>
                    {comment.authorNickname}
                  </span>
                  <span className={styles.commentTime}>
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <p className={styles.commentText}>{comment.content}</p>
                <button
                  className={`${styles.likeButton} ${isLiked ? styles.liked : ''}`}
                  onClick={() => handleCommentLike(comment.commentId, isLiked)}
                  disabled={likingComments.has(comment.commentId)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={isLiked ? "#8a63d2" : "none"} stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  {comment.likeCount > 0 && <span>{comment.likeCount}</span>}
                </button>
              </div>
            </div>
          );})}
          {(!Array.isArray(comments) || comments.length === 0) && (
            <div className={styles.noComments}>No comments yet. Be the first to comment!</div>
          )}
          {loadingMore && comments.length > 0 && (
            <div className={styles.loadingMore}>Loading more...</div>
          )}
        </div>

        <form onSubmit={handleSubmit} className={styles.commentForm}>
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className={styles.commentInput}
            disabled={loading}
          />
          <button 
            type="submit" 
            disabled={loading || !newComment.trim()}
            className={styles.submitButton}
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
        </form>
      </div>
    </div>
  );
}