'use client'

import { useEffect, useState } from 'react'
import styles from './styles.module.css'
import MiniProfile from '../mini_profile'
import { useDebounce } from '@/libs/debounce'
import { http } from '@/libs/apiFetch'
import * as types from './types'
import type { Post } from '@/libs/globalTypes'
import PostCard from '../posts/PostCard'
import { useAuth } from '@/providers/authProvider'
import { useRouter } from 'next/navigation'
import { GroupCard } from '@/components/ui/group-card/group-card'

export function Search() {
  const { user } = useAuth()
  const [allUsers, setAllUsers] = useState<types.User[]>([])
  const [allGroups, setAllGroups] = useState<types.Group[]>([])
  const [allPosts, setAllPosts] = useState<Post[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'users' | 'groups' | 'posts'>('users')
  const debouncedQuery = useDebounce(searchQuery, 200)
  const router = useRouter()

  const handleJoinGroup = async (groupId: number) => {
    try {
      await http.post(`/api/v1/groups/${groupId}/join`, {})
      setAllGroups(prev => prev.map(group =>
        group.groupId === groupId ? { ...group, status: 'pending' } : group
      ))
    } catch (error) {
      console.error('Failed to join group:', error)
    }
  }

  const handleViewGroup = (groupId: number) => {
    router.push(`/groups/${groupId}`)
  }

  const handleInviteUsers = (groupId: number) => {
    router.push(`/groups/${groupId}/invite`)
  }

  useEffect(() => {
    const loadAllData = async () => {
      try {
        const searchParam = debouncedQuery ? `?q=${encodeURIComponent(debouncedQuery)}` : '?q='
        
        const [usersRes, groupsRes, postsRes] = await Promise.all([
          http.get<types.User[]>(`/api/v1/search${searchParam}&type=users`),
          http.get<types.Group[]>(`/api/v1/search${searchParam}&type=groups`),
          http.get<Post[]>(`/api/v1/search${searchParam}&type=posts`)
        ])
        
        setAllUsers(usersRes || [])
        setAllGroups(groupsRes || [])
        setAllPosts(postsRes || [])
      } catch (error) {
        console.error('Failed to load data:', error)
      }
    }
    
    loadAllData()
  }, [debouncedQuery])

  useEffect(() => {
    const handleUpdatePost = (event: CustomEvent) => {
      const { postId, ...updates } = event.detail
      setAllPosts(prev => prev.map(post =>
        post.postId === postId ? { ...post, ...updates } : post
      ))
    }

    const handleDeletePost = (event: CustomEvent) => {
      const { postId } = event.detail
      setAllPosts(prev => prev.filter(post => post.postId !== postId))
    }

    window.addEventListener('updatePost', handleUpdatePost as EventListener)
    window.addEventListener('deletePost', handleDeletePost as EventListener)

    return () => {
      window.removeEventListener('updatePost', handleUpdatePost as EventListener)
      window.removeEventListener('deletePost', handleDeletePost as EventListener)
    }
  }, [])

  const filteredUsers = allUsers.filter(searchUser => {
    if (user && searchUser.userId === Number(user.userId)) return false
    return true
  })

  return (
    <div className={styles.page}>
      <div className={styles.searchCard}>
        <h2 className={styles.title}>Search</h2>
        <input
          type="text"
          placeholder="Search users, groups, or posts..."
          className={styles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          maxLength={50}
          required
        />
        <div className={styles.buttonsContainer}>
          <button
            className={`${styles.filterButton} ${activeTab === 'users' ? styles.active : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users ({filteredUsers.length})
          </button>
          <button
            className={`${styles.filterButton} ${activeTab === 'groups' ? styles.active : ''}`}
            onClick={() => setActiveTab('groups')}
          >
            Groups ({allGroups.length})
          </button>
          <button
            className={`${styles.filterButton} ${activeTab === 'posts' ? styles.active : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            Posts ({allPosts.length})
          </button>
        </div>
      </div>

      <div className={styles.resultsContainer}>
        {activeTab === 'users' && (
          <div className={styles.resultsGrid}>
            {filteredUsers.map(user => (
              <UserCard key={user.userId} user={user} />
            ))}
          </div>
        )}
        {activeTab === 'groups' && (
          <div className={styles.resultsGrid}>
            {allGroups.map(group => (
              <GroupCard
                key={group.groupId}
                group={group}
                onJoinGroup={handleJoinGroup}
                onViewGroup={handleViewGroup}
                onInviteUsers={handleInviteUsers}
              />
            ))}
          </div>
        )}
        {activeTab === 'posts' && (
          <div className={styles.resultsGrid}>
            {allPosts.map(post => (
              <PostCard key={post.postId} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function UserCard({ user }: { user: types.User }) {
  return (
    <MiniProfile data={{
      userId: user.userId,
      status: null,
      nickname: user.nickname || '',
      firstName: user.firstName,
      lastName: user.lastName,
      avatarId: user.avatarId,
      privacy: (user.privacy || 'public') as 'public' | 'private',
      stats: { postsCount: 0, followersCount: 0, followingCount: 0 },
      joinedAt: null,
      chatId: null
    }} />
  )
}