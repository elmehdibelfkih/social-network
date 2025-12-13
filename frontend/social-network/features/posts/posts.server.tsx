'use client'
import { Suspense, useState, useEffect } from 'react'
import type { Post } from '@/libs/globalTypes'
import { PostsClient } from './posts.client'
import { AvatarHolder } from '@/components/ui/avatar_holder/avatarholder.client'
import styles from './styles.module.css'
import { http, fetchMediaClient } from '@/libs/apiFetch'
import { UpdatePost } from '@/components/ui/UpdatePost/UpdatePost'
import { ConfirmDelete } from '@/components/ui/ConfirmDelete/ConfirmDelete'
import { useAuth } from '@/providers/authProvider'
import { GlobeIcon, LockIcon, UsersIcon } from '@/components/ui/icons'

function MediaCarousel({ mediaDataList }: { mediaDataList: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (mediaDataList.length === 0) return null

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % mediaDataList.length)
  }

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + mediaDataList.length) % mediaDataList.length)
  }

  return (
    <div className={styles.mediaCarousel}>
      <img
        src={mediaDataList[currentIndex]}
        alt="Post media"
        className={styles.mediaImage}
      />
      {mediaDataList.length > 1 && (
        <>
          <button className={styles.carouselBtnPrev} onClick={goToPrev}>
            ‹
          </button>
          <button className={styles.carouselBtnNext} onClick={goToNext}>
            ›
          </button>
          <div className={styles.carouselDots}>
            {mediaDataList.map((_, index) => (
              <span
                key={index}
                className={`${styles.dot} ${index === currentIndex ? styles.dotActive : ''}`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

async function getAvatarId(userId: number): Promise<number | null> {
  try {
    const profile = await http.get(`/api/v1/users/${userId}/profile`) as any
    return profile?.avatarId || null
  } catch {
    return null
  }
}

async function getMediaData(mediaId: number): Promise<string | null> {
  try {
    const media = await fetchMediaClient(String(mediaId))
    if (media?.mediaEncoded) {
      return `data:image/jpeg;base64,${media.mediaEncoded}`
    }
    return null
  } catch {
    return null
  }
}

export default function PostServer({ post }: { post: Post }) {
  const { user } = useAuth()
  const [avatarId, setAvatarId] = useState<number | null>(null)
  const [mediaDataList, setMediaDataList] = useState<(string | null)[]>([])
  const [showMenu, setShowMenu] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [stats, setStats] = useState({ 
    reactionCount: post.stats?.reactionCount || 0, 
    commentCount: post.stats?.commentCount || 0 
  })
  const isAuthor = mounted && user && Number(user.userId) === post.authorId

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    getAvatarId(post.authorId).then(setAvatarId)

    if (post.mediaIds && post.mediaIds.length > 0) {
      Promise.all(post.mediaIds.map(getMediaData)).then(setMediaDataList)
    }
  }, [post.authorId, post.mediaIds])

  useEffect(() => {
    if (!post.stats) {
      http.get<any>(`/api/v1/posts/${post.postId}/comments?page=1&limit=1`)
        .then(data => setStats(prev => ({ ...prev, commentCount: data?.totalComments || 0 })))
        .catch(() => {})
    }
  }, [post.postId, post.stats])

  const authorName = `${post.authorFirstName} ${post.authorLastName}`
  const timeAgo = new Date(post.createdAt).toLocaleDateString()
  
  const getPrivacyIcon = (privacy: string) => {
    switch (privacy) {
      case 'public': return <GlobeIcon fillColor="currentColor" />
      case 'followers': return <UsersIcon />
      case 'private': return <LockIcon />
      case 'restricted': return <UsersIcon />
      default: return <GlobeIcon fillColor="currentColor" />
    }
  }

  return (
    <article className={styles.post}>
      <div className={styles.header}>
        <AvatarHolder avatarId={avatarId} size={40} />
        <div className={styles.authorInfo}>
          <h3 className={styles.authorName} onClick={() => window.location.href = `/profile/${post.authorId}`}>{authorName}</h3>
          <div className={styles.postMeta}>
            <span className={styles.timeAgo}>{timeAgo}</span>
            <span className={styles.privacy}>
              {getPrivacyIcon(post.privacy)}
              {post.privacy}
            </span>
          </div>
        </div>
        {isAuthor && (
          <div className={styles.menuContainer}>
            <button className={styles.menuButton} onClick={() => setShowMenu(!showMenu)}>⋮</button>
            {showMenu && (
              <>
                <div className={styles.menuBackdrop} onClick={() => setShowMenu(false)} />
                <div className={styles.menuDropdown}>
                  <button onClick={() => { setShowUpdateModal(true); setShowMenu(false); }}>
                    Edit Post
                  </button>
                  <button onClick={() => { setShowDeleteConfirm(true); setShowMenu(false); }}>
                    Delete Post
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className={styles.content}>
        <p>{post.content}</p>
      </div>

      {post.mediaIds && post.mediaIds.length > 0 && (
        <MediaCarousel mediaDataList={mediaDataList.filter(Boolean) as string[]} />
      )}

      <div className={styles.stats}>
        <span>{stats.reactionCount} like{stats.reactionCount !== 1 ? 's' : ''}</span>
        <span>{stats.commentCount} comment{stats.commentCount !== 1 ? 's' : ''}</span>
      </div>

      <Suspense fallback={<div className={styles.actionsLoading}>Loading...</div>}>
        <PostsClient post={{ ...post, stats }} onStatsUpdate={setStats} />
      </Suspense>

      {showUpdateModal && (
        <UpdatePost
          postId={post.postId}
          initialContent={post.content}
          initialPrivacy={post.privacy}
          initialMediaIds={post.mediaIds || []}
          onClose={() => setShowUpdateModal(false)}
          onUpdate={() => window.location.reload()}
        />
      )}

      {showDeleteConfirm && (
        <ConfirmDelete
          onConfirm={async () => {
            await http.delete(`/api/v1/posts/${post.postId}`);
            window.location.reload();
          }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </article>
  )
}