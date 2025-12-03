'use client'

import { useEffect, useState } from 'react'
import styles from './styles.module.css'
import MiniProfile from '../mini_profile'
import { useDebounce } from '@/libs/debounce'
import { http } from '@/libs/apiFetch'
import { User } from './types'
import { useAuth } from '@/providers/authProvider'

export function Search() {
  const onSearchComplete = (results) => {
    return results
  }
  return (
    <div className={styles.page}>
      <SearchCard onSearched={onSearchComplete} />
    </div>
  )
}



function SearchCard({ onSearched }: { onSearched: Function }) {
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchFilter, setSearchFilter] = useState<string>('All Users')
  const debouncedValue = useDebounce(searchQuery, 350)

  useEffect(() => {
    const fetchSearch = async () => {
      try {
        if (debouncedValue.length == 0) {
          const endpoint = `/api/v1/search?q=${debouncedValue}&type=users`
          const resp = http.get<User[]>(endpoint)
          onSearched(resp)
        }
      } catch (error) {
        console.error('Failed to fetch users:', error)
      }
    }
    fetchSearch()
  }, [debouncedValue])

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
  return (
    <div className={styles.searchedCard}>
      <MiniProfile userId={searchUser.userId} isMyprofile={isMyPorfile} />
    </div>
  )
}