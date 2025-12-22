'use client'

import { useEffect, useState } from 'react'
import styles from './styles.module.css'
import MiniProfile from '../mini_profile'
import { useDebounce } from '@/libs/debounce'
import { http } from '@/libs/apiFetch'
import * as types from './types'
import type { Post } from '@/libs/globalTypes'
import PostCard from '../posts/PostCard'
import { AvatarHolder } from '@/components/ui/avatar_holder/avatarholder.client'
import { useAuth } from '@/providers/authProvider'

export function Search() {
  const { user } = useAuth()
  const [allUsers, setAllUsers] = useState<types.User[]>([])
  const [allGroups, setAllGroups] = useState<types.Group[]>([])
  const [allPosts, setAllPosts] = useState<Post[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'users' | 'groups' | 'posts'>('users')
  const debouncedQuery = useDebounce(searchQuery, 200)

  // Load all data on mount
  useEffect(() => {
    const loadAllData = async () => {
      try {
        const [usersRes, groupsRes, postsRes] = await Promise.all([
          http.get<types.User[]>('/api/v1/search?q=&type=users'),
          http.get<types.Group[]>('/api/v1/search?q=&type=groups'), 
          http.get<Post[]>('/api/v1/search?q=&type=posts')
        ])
        setAllUsers(usersRes || [])
        setAllGroups(groupsRes || [])
        setAllPosts(postsRes || [])
      } catch (error) {
        console.error('Failed to load data:', error)
      }
    }
    loadAllData()

    // Listen for post updates and deletions
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

  // Filter data based on search query
  const filteredUsers = allUsers.filter(searchUser => {
    // Exclude current user
    if (user && searchUser.userId === Number(user.userId)) return false
    
    if (!debouncedQuery) return true
    const query = debouncedQuery.toLowerCase()
    return (
      searchUser.firstName?.toLowerCase().includes(query) ||
      searchUser.lastName?.toLowerCase().includes(query) ||
      searchUser.nickname?.toLowerCase().includes(query)
    )
  })

  const filteredGroups = allGroups.filter(group => {
    if (!debouncedQuery) return true
    const query = debouncedQuery.toLowerCase()
    return (
      group.title?.toLowerCase().includes(query) ||
      group.description?.toLowerCase().includes(query)
    )
  })

  const filteredPosts = allPosts.filter(post => {
    if (!debouncedQuery) return true
    const query = debouncedQuery.toLowerCase()
    return (
      post.content?.toLowerCase().includes(query) ||
      post.authorFirstName?.toLowerCase().includes(query) ||
      post.authorLastName?.toLowerCase().includes(query) ||
      post.authorNickname?.toLowerCase().includes(query)
    )
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
            Groups ({filteredGroups.length})
          </button>
          <button 
            className={`${styles.filterButton} ${activeTab === 'posts' ? styles.active : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            Posts ({filteredPosts.length})
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
            {filteredGroups.map(group => (
              <GroupCard key={group.groupId} group={group} />
            ))}
          </div>
        )}
        {activeTab === 'posts' && (
          <div className={styles.resultsGrid}>
            {filteredPosts.map(post => (
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
      aboutMe: null,
      dateOfBirth: null,
      privacy: user.privacy || 'public',
      stats: { postsCount: 0, followersCount: 0, followingCount: 0 },
      joinedAt: null,
      chatId: null,
      email: null
    }} />
  )
}

function GroupCard({ group }: { group: types.Group }) {
  return (
    <div className={styles.groupCard}>
      <AvatarHolder avatarId={group.avatarId} size={60} />
      <div className={styles.groupInfo}>
        <h3>{group.title}</h3>
        <p>{group.description}</p>
        <span>{group.memberCount} members</span>
      </div>
    </div>
  )
}