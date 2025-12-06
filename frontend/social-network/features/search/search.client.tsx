'use client'

import { useEffect, useState } from 'react'
import styles from './styles.module.css'
import MiniProfile from '../mini_profile'
import { useDebounce } from '@/libs/debounce'
import { http } from '@/libs/apiFetch'
import { User } from './types'
import { useAuth } from '@/providers/authProvider'
import type { ProfileAPIResponse } from '@/libs/globalTypes'

export function Search() {
  const [searchResults, setSearchResults] = useState<User[]>([])

  const handleSearchComplete = (results: User[]) => {
    setSearchResults(results)
  }

  return (
    <div className={styles.page}>
      <SearchCard onSearched={handleSearchComplete} />

      {searchResults.length > 0 && (
        <div className={styles.resultsContainer}>
          <h3 className={styles.resultsTitle}>Search Results ({searchResults.length})</h3>
          <div className={styles.resultsGrid}>
            {searchResults.map((user) => (
              <SearchedCard key={user.userId} searchUser={user} />
            ))}
          </div>
        </div>
      )}

      {searchResults.length === 0 && (
        <div className={styles.emptyContainer}>
          <p className={styles.emptyText}>No users found. Try a different search term.</p>
        </div>
      )}
    </div>
  )
}



function SearchCard({ onSearched }: { onSearched: (results: User[]) => void }) {
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchFilter, setSearchFilter] = useState<string>('All Users')
  const debouncedValue = useDebounce(searchQuery, 350)

  useEffect(() => {
    const fetchSearch = async () => {
      if (debouncedValue.length === 0) {
        return
      }

      onSearched([])

      try {
        const endpoint = `/api/v1/search?q=${debouncedValue}&type=users`
        const resp = await http.get<User[]>(endpoint)

        let filteredResults = resp
        if (searchFilter === 'Public Profiles') {
          filteredResults = resp.filter(user => user.privacy === 'public')
        } else if (searchFilter === 'Private Profiles') {
          filteredResults = resp.filter(user => user.privacy === 'private')
        }

        onSearched(filteredResults)
      } catch (error) {
        console.error('Failed to fetch users:', error)
        onSearched([])
      }
    }
    fetchSearch()
  }, [debouncedValue, searchFilter])

  return (
    <div className={styles.searchCard}>
      <h2 className={styles.title}>Search Users</h2>
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search by name or username..."
          className={styles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className={styles.buttonsContainer}>
        <button
          className={`${styles.filterButton} ${searchFilter === 'All Users' ? styles.active : ''}`}
          onClick={() => setSearchFilter('All Users')}>
          All Users
        </button>
        <button
          className={`${styles.filterButton} ${searchFilter === 'Public Profiles' ? styles.active : ''}`}
          onClick={() => setSearchFilter('Public Profiles')}>
          Public Profiles
        </button>
        <button
          className={`${styles.filterButton} ${searchFilter === 'Private Profiles' ? styles.active : ''}`}
          onClick={() => setSearchFilter('Private Profiles')}>
          Private Profiles
        </button>
      </div>
    </div>
  )
}

function SearchedCard({ searchUser }: { searchUser: User }) {
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