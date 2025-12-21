'use client'

import { useEffect, useState } from 'react'
import styles from './styles.module.css'
import MiniProfile from '../mini_profile'
import { useDebounce } from '@/libs/debounce'
import { http } from '@/libs/apiFetch'
import * as types from './types'
import { useAuth } from '@/providers/authProvider'
import type { ProfileAPIResponse } from '@/libs/globalTypes'

export function Search() {
  const [searchResults, setSearchResults] = useState<types.User[] | types.Group[] | types.Post[] >([])

  const handleSearchComplete = (results: types.User[] | types.Group[] | types.Post[]) => {
    setSearchResults(results)
  }

  return (
    <div className={styles.page}>
      <SearchCard onSearched={handleSearchComplete} />

      {searchResults.length > 0 && (
        <div className={styles.resultsContainer}>
          <h3 className={styles.resultsTitle}>Search Results ({searchResults.length})</h3>
          <div className={styles.resultsGrid}>
            {searchResults.map((item) => {
              // Type guard to check if the item is a User
              if ('userId' in item && 'nickname' in item) {
                return <SearchedCard key={`user-${item.userId}`} searchUser={item} />
              }
              // Placeholder for Post results - assuming 'postId'
              if ('postId' in item) {
                return <div key={`post-${item.postId}`}>Post Result (ID: {item.postId})</div>
              }
              // Placeholder for Group results - assuming 'groupId'
              if ('groupId' in item) {
                return <div key={`group-${item.groupId}`}>Group Result (ID: {item.groupId})</div>
              }
              return null
            })}
          </div>
        </div>
      )}

      {searchResults.length === 0 && (
        <div className={styles.emptyContainer}>
          <p className={styles.emptyText}>No results found. Try a different search term.</p>
        </div>
      )}
    </div>
  )
}


type SearchType = 'users' | 'posts' | 'groups'
const SEARCH_FILTERS: { label: string; value: SearchType }[] = [
  { label: 'Users', value: 'users' },
  { label: 'Posts', value: 'posts' },
  { label: 'Groups', value: 'groups' },
]

function SearchCard({ onSearched }: { onSearched: (results: types.User[] | types.Group[] | types.Post[]) => void }) {
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchFilter, setSearchFilter] = useState<SearchType>('users')
  const debouncedValue = useDebounce(searchQuery, 350)

  useEffect(() => {
    const fetchSearch = async () => {
      if (debouncedValue.length === 0) {
        return
      }

      onSearched([])

      try {
        const endpoint = `/api/v1/search?q=${debouncedValue}&type=${searchFilter}`
        const resp = await http.get<types.User[] | types.Group[] | types.Post[]>(endpoint)
        onSearched(resp)
      } catch (error) {
        console.error('Failed to fetch search results:', error)
        onSearched([])
      }
    }
    fetchSearch()
  }, [debouncedValue, searchFilter])

  return (
    <div className={styles.searchCard}>
      <h2 className={styles.title}>Search</h2>
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search by name or username..."
          className={styles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          maxLength={50}
          required
        />
      </div>
      <div className={styles.buttonsContainer}>
        {SEARCH_FILTERS.map((filter) => (
          <button
            key={filter.value}
            className={`${styles.filterButton} ${searchFilter === filter.value ? styles.active : ''}`}
            onClick={() => setSearchFilter(filter.value)}>
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function SearchedCard({ searchUser }: { searchUser: types.User }) {
  const { user } = useAuth()
  const isMyPorfile = user.userId == String(searchUser.userId)

  const profileData: ProfileAPIResponse = {
    userId: searchUser.userId,
    status: searchUser.status,
    nickname: searchUser.nickname,
    firstName: searchUser.firstName,
    lastName: searchUser.lastName,
    avatarId: searchUser.avatarId,
    aboutMe: null,
    dateOfBirth: null,
    privacy: searchUser.privacy || 'public',
    stats: { postsCount: 0, followersCount: 0, followingCount: 0 },
    joinedAt: null,
    chatId: searchUser.chatId,
  }

  return (
    <>
      <MiniProfile data={profileData} isMyprofile={isMyPorfile} />
    </>
  )
}