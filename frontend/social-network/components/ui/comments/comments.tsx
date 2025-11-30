'use client';

import { useState, useEffect } from 'react';
import styles from './comments.module.css';

interface Comment {
  commentId: number;
  authorId: number;
  authorNickname: string;
  content: string;
  createdAt: string;
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

  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen, postId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_GO_API_URL}/api/v1/posts/${postId}/comments`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setComments(data.payload?.comments || []);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
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
        fetchComments();
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
          {Array.isArray(comments) && comments.map((comment) => (
            <div key={comment.commentId} className={styles.comment}>
              <div className={styles.commentAvatar}>
                <img src="/users.svg" alt="User Avatar" />
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
              </div>
            </div>
          ))}
          {(!Array.isArray(comments) || comments.length === 0) && (
            <div className={styles.noComments}>No comments yet. Be the first to comment!</div>
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