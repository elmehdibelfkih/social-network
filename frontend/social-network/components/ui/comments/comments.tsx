'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './comments.module.css';
import AvatarHolder from '@/components/ui/avatar_holder/avatarholder.client';
import { http } from '@/libs/apiFetch';
import { ImageIcon } from '@/components/ui/icons';
import { fetchMediaClient } from '@/libs/apiFetch';
import { timeAgo } from '@/libs/helpers';
import Link from 'next/link';
import { ConfirmDelete } from '../ConfirmDelete/ConfirmDelete';
import { useAuth } from '@/providers/authProvider';

function CommentImage({ mediaId }: { mediaId: number }) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const media = await fetchMediaClient(String(mediaId));
        if (media?.mediaEncoded) {
          setImgSrc(`data:image/png;base64,${media.mediaEncoded}`);
        }
      } catch (error) {
        console.error('Failed to fetch image:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, [mediaId]);

  if (loading) {
    return <div className={styles.imageLoading}>Loading...</div>;
  }

  if (!imgSrc) {
    return <div className={styles.imageError}>Image not available</div>;
  }

  return (
    <img
      src={imgSrc}
      alt="Comment media"
      className={styles.commentImage}
    />
  );
}

const COMMENT_PREVIEW_LENGTH = 200;

interface Comment {
  commentId: number;
  authorId: number;
  authorNickname: string;
  content: string;
  mediaIds?: number[];
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
  onCommentDeleted: () => void;
}

export function Comments({
  postId,
  isOpen,
  onClose,
  commentCount,
  onCommentAdded,
  onCommentDeleted,
}: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(
    null
  );
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);


  const [userProfiles, setUserProfiles] = useState<{
    [key: number]: { avatarId: number | null };
  }>({});

  const [likingComments, setLikingComments] = useState<Set<number>>(new Set());

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());

  /* -------------------- FETCH COMMENTS -------------------- */

  const fetchComments = async (pageNum: number) => {
    setLoadingMore(true);

    try {
      const data = await http.get<any>(
        `/api/v1/posts/${postId}/comments?page=${pageNum}&limit=10`
      );

      const commentsData: Comment[] = (data?.comments || []).map((c: any) => ({
        commentId: c.commentId,
        authorId: c.authorId,
        authorNickname: c.authorNickname,
        content: c.content,
        mediaIds: c.mediaIds || [],
        createdAt: c.createdAt,
        isLikedByUser: Boolean(c.isLikedByUser),
        likeCount: Number(c.likeCount) || 0,
      }));

      setComments(prev =>
        pageNum === 1 ? commentsData : [...prev, ...commentsData]
      );

      if (commentsData.length < 10) {
        setHasMore(false);
      }

      // Fetch avatars (merge, do NOT overwrite)
      const profiles: { [key: number]: { avatarId: number | null } } = {};
      const uniqueUserIds = [...new Set(commentsData.map(c => c.authorId))];

      await Promise.all(
        uniqueUserIds.map(async userId => {
          try {
            const profile = await http.get<any>(
              `/api/v1/users/${userId}/profile`
            );
            profiles[userId] = { avatarId: profile?.avatarId ?? null };
          } catch {
            profiles[userId] = { avatarId: null };
          }
        })
      );

      setUserProfiles(prev => ({ ...prev, ...profiles }));
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  /* -------------------- OPEN / CLOSE -------------------- */

  useEffect(() => {
    if (!isOpen) return;

    setComments([]);
    setUserProfiles({});
    setPage(1);
    setHasMore(true);

    fetchComments(1);
  }, [isOpen, postId]);

  /* -------------------- INFINITE SCROLL -------------------- */

  useEffect(() => {
    if (!isOpen) return;

    const list = document.querySelector(`.${styles.commentsList}`);
    if (!list) return;

    const handleScroll = () => {
      if (
        list.scrollHeight - list.scrollTop <= list.clientHeight + 50 &&
        hasMore &&
        !loadingMore
      ) {
        setPage(p => {
          const next = p + 1;
          fetchComments(next);
          return next;
        });
      }
    };

    list.addEventListener('scroll', handleScroll);
    return () => list.removeEventListener('scroll', handleScroll);
  }, [isOpen, hasMore, loadingMore]);

    /* -------------------- outside click -------------------- */

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
          setOpenMenuId(null);
        }
      };
  
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

  /* -------------------- TOGGLE COMMENT EXPANSION -------------------- */

  const toggleCommentExpansion = (commentId: number) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  /* -------------------- LIKE COMMENT -------------------- */

  const handleCommentLike = async (commentId: number, isLiked: boolean) => {
    setLikingComments(prev => new Set(prev).add(commentId));

    try {
      await http.post(`/api/v1/comments/${commentId}/like`);

      setComments(prev =>
        prev.map(c =>
          c.commentId === commentId
            ? {
                ...c,
                isLikedByUser: !isLiked,
                likeCount: c.likeCount + (isLiked ? -1 : 1),
              }
            : c
        )
      );
    } catch (error) {
      console.error('Failed to like comment:', error);
    } finally {
      setLikingComments(prev => {
        const s = new Set(prev);
        s.delete(commentId);
        return s;
      });
    }
  };

  /* -------------------- DELETE COMMENT -------------------- */

  const handleCommentDelete = async () => {
    if (deletingCommentId === null) return;

    try {
      await http.delete(`/api/v1/comments/${deletingCommentId}`);
      setComments(prev =>
        prev.filter(c => c.commentId !== deletingCommentId)
      );
      onCommentDeleted();
    } catch (error) {
      console.error('Failed to delete comment:', error);
      alert('Failed to delete comment. Please try again.');
    } finally {
      setDeletingCommentId(null);
      setShowDeleteConfirm(false);
    }
  };
  
  const openDeleteConfirm = (commentId: number) => {
    setDeletingCommentId(commentId);
    setShowDeleteConfirm(true);
    setOpenMenuId(null);
  };
  
  const cancelDelete = () => {
    setDeletingCommentId(null);
    setShowDeleteConfirm(false);
  };

  /* -------------------- MEDIA UPLOAD -------------------- */

  const uploadMedia = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(arrayBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ''
      )
    );

    const payload = {
      fileName: file.name,
      fileType: file.type || 'application/octet-stream',
      fileData: base64,
      purpose: 'comment',
    };

    return await http.post('/api/v1/media/upload', payload);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB

    if (files[0] && files[0].size > MAX_SIZE) {
      alert("File is too large. Maximum size is 10MB.");
      return;
    }
    setSelectedFiles(files.slice(0, 1)); // Max 1 photo for comments
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  /* -------------------- ADD COMMENT -------------------- */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() && selectedFiles.length === 0) return;

    setLoading(true);

    try {
      let mediaIds: number[] = [];

      if (selectedFiles.length > 0) {
        const uploaded = await Promise.all(selectedFiles.map(uploadMedia));
        mediaIds = uploaded.map((r: any) => r.mediaId);
      }

      const payload: any = { content: newComment.trim() };
      if (mediaIds.length > 0) payload.mediaIds = mediaIds;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_GO_API_URL}/api/v1/posts/${postId}/comments`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        }
      );

      if (res.ok) {
        setNewComment('');
        setSelectedFiles([]);
        setComments([]);
        setUserProfiles({});
        setPage(1);
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

  if (!isOpen) return null;

  /* -------------------- RENDER -------------------- */

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Comments ({commentCount})</h3>
          <button onClick={onClose} className={styles.closeButton}>
            ×
          </button>
        </div>

        <div className={styles.commentsList}>
          {comments.map(comment => {
            const isLiked = comment.isLikedByUser === true;
            const isAuthor = user?.userId === String(comment.authorId);
            const isExpanded = expandedComments.has(comment.commentId);
            const isLongContent = comment.content.length > COMMENT_PREVIEW_LENGTH;

            return (
              <div key={comment.commentId} className={styles.comment}>
                <div className={styles.commentAvatar}>
                  <AvatarHolder
                    avatarId={
                      userProfiles[comment.authorId]?.avatarId ?? null
                    }
                    size={32}
                  />
                </div>

                <div className={styles.commentContent}>
                  <div className={styles.commentHeader}>
                    <Link href={`/profile/${comment.authorId}`} passHref>
                      <span className={styles.commentAuthor}>
                        {comment.authorNickname}
                      </span>
                    </Link>
                    <span className={styles.commentTime}>
                      {timeAgo(comment.createdAt)}
                    </span>
                  </div>

                  <div className={styles.commentTextContainer}>
                    <p className={styles.commentText}>
                      {isLongContent && !isExpanded
                        ? `${comment.content.substring(0, COMMENT_PREVIEW_LENGTH)}...`
                        : comment.content}
                    </p>
                    {isLongContent && (
                      <button
                        className={styles.readMoreButton}
                        onClick={() => toggleCommentExpansion(comment.commentId)}
                      >
                        {isExpanded ? 'Show less' : 'Read more'}
                      </button>
                    )}
                  </div>

                  {comment.mediaIds && comment.mediaIds.length > 0 && (
                    <div className={styles.commentMedia}>
                      {comment.mediaIds.map((mediaId, index) => (
                        <CommentImage key={index} mediaId={mediaId} />
                      ))}
                    </div>
                  )}
                  <div className={styles.commentActions}>
                    <button
                      className={`${styles.likeButton} ${
                        isLiked ? styles.liked : ''
                      }`}
                      onClick={() =>
                        handleCommentLike(comment.commentId, isLiked)
                      }
                      disabled={likingComments.has(comment.commentId)}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill={isLiked ? '#8a63d2' : 'none'}
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                      {comment.likeCount > 0 && (
                        <span>{comment.likeCount}</span>
                      )}
                    </button>
                  </div>
                </div>
                {isAuthor && (
                  <div className={styles.menuContainer} ref={menuRef}>
                    <button
                      className={styles.menuButton}
                      onClick={() => setOpenMenuId(openMenuId === comment.commentId ? null : comment.commentId)}
                    >
                      ⋮
                    </button>
                    {openMenuId === comment.commentId && (
                      <div className={styles.dropdownMenu}>
                        <button onClick={() => openDeleteConfirm(comment.commentId)}>Delete</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {comments.length === 0 && !loadingMore && (
            <div className={styles.noComments}>
              No comments yet. Be the first to comment!
            </div>
          )}

          {loadingMore && comments.length > 0 && (
            <div className={styles.loadingMore}>Loading more...</div>
          )}
        </div>

        <form onSubmit={handleSubmit} className={styles.commentForm}>
          {selectedFiles.length > 0 && (
            <div className={styles.selectedFiles}>
              {selectedFiles.map((file, index) => (
                <div key={index} className={styles.fileItem}>
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className={styles.previewImage}
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className={styles.removeFile}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className={styles.inputRow}>
            <input
              type="text"
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className={styles.commentInput}
              disabled={loading}
              maxLength={200}
              required
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={styles.imageButton}
              disabled={loading || selectedFiles.length >= 1}
              title={
                selectedFiles.length >= 1
                  ? 'Maximum 1 photo allowed'
                  : 'Add photo'
              }
            >
              <ImageIcon />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleFileSelect}
            />
            <button
              type="submit"
              disabled={
                loading || (!newComment.trim() && selectedFiles.length === 0)
              }
              className={styles.submitButton}
            >
              {loading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
      {showDeleteConfirm && (
        <ConfirmDelete onConfirm={handleCommentDelete} onCancel={cancelDelete} />
      )}
    </div>
  );
}
