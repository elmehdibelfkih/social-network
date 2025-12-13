'use client'
import { useEffect, useState } from 'react'
import type { Post } from '@/libs/globalTypes'
import { PostsClient } from './posts.client'
import { AvatarHolder } from '@/components/ui/avatar_holder/avatarholder.client'
import styles from './styles.module.css'
import { fetchMediaClient, http } from '@/libs/apiFetch'
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

export function PostCard({ post, avatarId }: { post: Post, avatarId: number}) {
  const { user } = useAuth()
  const [mediaDataList, setMediaDataList] = useState<(string | null)[]>([])
  const [isLoadingMedia, setIsLoadingMedia] = useState(true)
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
    const loadData = async () => {
      if (post.mediaIds && post.mediaIds.length > 0) {
        const mediaData = await Promise.all(
          post.mediaIds.map(mediaId => getMediaData(mediaId))
        )
        setMediaDataList(mediaData)
        setIsLoadingMedia(false)
      } else {
        setIsLoadingMedia(false)
      }
    }

    loadData()
  }, [post.mediaIds])

  // useEffect(() => {
  //   const fetchStats = async () => {
  //     try {
  //       const commentsData = await http.get<any>(`/api/v1/posts/${post.postId}/comments?page=1&limit=1`)
  //       setStats(prev => ({
  //         ...prev,
  //         commentCount: commentsData?.totalComments || 0
  //       }))
  //     } catch (error) {
  //       console.error('Failed to fetch stats:', error)
  //     }
  //   }
  //   fetchStats()
  // }, [post.postId])
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

      {post?.mediaIds && post.mediaIds.length > 0 && (
        isLoadingMedia ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
            Loading media...
          </div>
        ) : (
          <MediaCarousel mediaDataList={mediaDataList.filter(Boolean) as string[]} />
        )
      )}

      <div className={styles.stats}>
        <span>{stats.reactionCount} likes</span>
        <span>{stats.commentCount} comment{stats.commentCount !== 1 ? 's' : ''}</span>
      </div>
      <PostsClient post={{ ...post, stats }} onStatsUpdate={setStats} />

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
