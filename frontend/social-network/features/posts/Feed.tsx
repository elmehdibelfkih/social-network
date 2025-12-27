'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Post } from '@/libs/globalTypes'
import PostCard from './PostCard'
import { postsService } from './postsService'
import { useDebounce } from '@/libs/debounce'

export function Feed({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const debouncedLoading = useDebounce(loading, 300)
  
  const observer = useRef<IntersectionObserver>()

  const lastPostElementRef = useCallback(node => {
    if (loading) return
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMorePosts()
      }
    })
    if (node) observer.current.observe(node)
  }, [loading, hasMore])

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

  return (
    <div>
      {posts.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '20px', color: '#707070ff', background: '#ffffffff', borderRadius: '10px', border: '5px Dotted #d1d5db'}}> No posts yet. Be the first to create one! </p>
      ) : (
        posts.map((post, index) => {
          if (posts.length === index + 1) {
            return <div ref={lastPostElementRef} key={post.postId}><PostCard post={post} /></div>
          } else {
            return <PostCard key={post.postId} post={post} />
          }
        })
      )}
      {debouncedLoading && (
        <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
          Loading more posts...
        </div>
      )}
      {!hasMore && posts.length > 0 && (
        <div style={{ textAlign: 'center', padding: '20px', color: '#707070ff', background: '#ffffffff', borderRadius: '10px', border: '5px Dotted #d1d5db'}}>
          No more posts to load .
        </div>
      )}
    </div>
  )
}