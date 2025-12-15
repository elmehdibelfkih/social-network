'use client'

import { useState, useEffect } from 'react'
import { Post } from '@/libs/globalTypes'
import PostServer from './posts.server'

export function FeedClient({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)

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
          ? { ...post, ...updatedData }
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

  return (
    <div>
      {posts.length === 0 ? (
        <p>No posts yet. Be the first to create one!</p>
      ) : (
        posts.map((post) => (
          <PostServer key={post.postId} post={post} />
        ))
      )}
    </div>
  )
}