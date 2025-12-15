'use client'

import { useState, useEffect, useCallback } from 'react'
import { Post } from '@/libs/globalTypes'
import PostServer from './posts.server'
import { postsService } from './postsService'
import { useDebounce } from '@/libs/debounce'

export function FeedClient({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const debouncedLoading = useDebounce(loading, 300)

  useEffect(() => {
    const handleNewPost = (event: CustomEvent) => {
      const newPost = event.detail as Post
      setPosts(prev => [newPost, ...prev])
    }

    const handleUpdatePost = (event: CustomEvent) => {
      const updatedData = event.detail
      if (!updatedData?.postId) return
      
      setPosts(prev => prev.map(post => 
        post.postId === updatedData.postId 
          ? { 
              ...post, 
              content: updatedData.content ?? post.content,
              privacy: updatedData.privacy ?? post.privacy,
              mediaIds: updatedData.mediaIds ?? post.mediaIds
            }
          : post
      ))
    }

    const handleDeletePost = (event: CustomEvent) => {
      const { postId } = event.detail
      setPosts(prev => prev.filter(post => post.postId !== postId))
    }

    window.addEventListener('newPost', handleNewPost as EventListener)
    window.addEventListener('updatePost', handleUpdatePost as EventListener)
    window.addEventListener('deletePost', handleDeletePost as EventListener)
    
    return () => {
      window.removeEventListener('newPost', handleNewPost as EventListener)
      window.removeEventListener('updatePost', handleUpdatePost as EventListener)
      window.removeEventListener('deletePost', handleDeletePost as EventListener)
    }
  }, [])

  const loadMorePosts = useCallback(async () => {
    if (loading || !hasMore) return
    
    setLoading(true)
    try {
      const newPosts = await postsService.getFeed({ page: page + 1, limit: 10 })
      if (newPosts.length === 0) {
        setHasMore(false)
      } else {
        setPosts(prev => {
          const existingIds = new Set(prev.map(p => p.postId))
          const uniqueNewPosts = newPosts.filter(p => !existingIds.has(p.postId))
          return [...prev, ...uniqueNewPosts]
        })
        setPage(prev => prev + 1)
      }
    } catch (error) {
      console.error('Failed to load more posts:', error)
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, page])

  const throttledScroll = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout | null = null
      return () => {
        if (timeoutId) return
        timeoutId = setTimeout(() => {
          const { scrollTop, scrollHeight, clientHeight } = document.documentElement
          if (scrollTop + clientHeight >= scrollHeight - 1000) {
            loadMorePosts()
          }
          timeoutId = null
        }, 200)
      }
    })()
  , [loadMorePosts])

  useEffect(() => {
    window.addEventListener('scroll', throttledScroll)
    return () => window.removeEventListener('scroll', throttledScroll)
  }, [throttledScroll])

  return (
    <div>
      {posts.length === 0 ? (
        <p>No posts yet. Be the first to create one!</p>
      ) : (
        posts.map((post, index) => (
          <PostServer key={`${post.postId}-${index}`} post={post} />
        ))
      )}
      {debouncedLoading && (
        <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
          Loading more posts...
        </div>
      )}
      {!hasMore && posts.length > 0 && (
        <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af' }}>
          No more posts to load
        </div>
      )}
    </div>
  )
}