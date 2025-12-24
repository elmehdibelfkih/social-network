'use client'

import { useState } from 'react'
import styles from './styles.module.css'
import { http } from '@/libs/apiFetch'
import { FollowApiResponse } from './types'
import { useUserStats } from '@/providers/userStatsContext'
import { MiniProfile } from '@/libs/globalTypes'
import { User } from '../chat/types'
import FloatingChat from '../chat/chat.popup.client'


type Props = {
  data?: MiniProfile
}

export function MiniProfileActions({ data }: Props) {
  const { state, dispatch } = useUserStats();
  const isCurrentUser = state.userId != null && data?.userId != null && state.userId === data.userId;

  const [status, setStatus] = useState<string | null>(data?.status ?? null)
  const [followersCount, setFollowersCount] = useState(data?.stats?.followersCount ?? 0)
  const [currentChat, setCurrentChat] = useState<Map<number, User>>(new Map());
  const [chatId, setChatId] = useState<number | null | undefined>(
    data?.chatId ?? null
  )
  const [busy, setBusy] = useState(false)

  async function doFollow() {
    if (busy || !data?.userId) return
    setBusy(true)
    try {
      const res = await http.post<FollowApiResponse>(
        `/api/v1/users/${encodeURIComponent(String(data.userId))}/follow`
      )
      const payload = res
      const newStatus = payload?.status ?? null
      const newChatId = payload?.chatId ?? null
      setStatus(newStatus)
      setChatId(newChatId)
      if (newStatus === 'accepted') {
        setFollowersCount(followersCount + 1)
        dispatch({ type: 'INCREMENT_FOLLOWING' });
      }
    } catch (err) {
      console.error('follow error', err)
    } finally {
      setBusy(false)
    }
  }

  const handleCloseChat = (chatId: number) => {
    setCurrentChat(prev => {
      const next = new Map(prev);
      next.delete(chatId);
      return next;
    });
  };

  async function doUnfollow() {
    if (busy || !data?.userId) return
    setBusy(true)
    try {
      await http.post(
        `/api/v1/users/${encodeURIComponent(String(data.userId))}/unfollow`
      )
      setStatus(null)
      if (status !== 'pending') {
        setFollowersCount(followersCount - 1)
        dispatch({ type: 'DECREMENT_FOLLOWING' });
      }
    } catch (err) {
      console.error('unfollow error', err)
    } finally {
      setBusy(false)
    }
  }

  function onMessage() {
    if (!chatId) return
    // window.location.href = `/chat/${chatId}`
    const user = {
      chatId: data.chatId,
      role: "member",
      unreadCount: 0,
      userId: data.userId,
      email: "",
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: "",
      nickname: data.nickname,
      aboutMe: "",
      avatarId: data.avatarId,
      online: true,
    }
    setCurrentChat(prev => {
      const next = new Map(prev);
      next.set(chatId, user);
      return next;
    });
  }

  if (!data) return null

  const displayStats = {
    postsCount: isCurrentUser ? state.postsCount : data?.stats?.postsCount ?? 0,
    followersCount: isCurrentUser ? state.followersCount : followersCount,
    followingCount: isCurrentUser ? state.followingCount : data?.stats?.followingCount ?? 0,
  };

  return (
    <>
      <div className={styles.miniStatsLarge}>
        <div className={styles.miniStat}>
          <div className={styles.miniStatValue}>
            {displayStats.postsCount}
          </div>
          <div className={styles.miniStatLabel}>posts</div>
        </div>

        <div className={styles.miniStat}>
          <div className={styles.miniStatValue}>{displayStats.followersCount}</div>
          <div className={styles.miniStatLabel}>followers</div>
        </div>

        <div className={styles.miniStat}>
          <div className={styles.miniStatValue}>
            {displayStats.followingCount}
          </div>
          <div className={styles.miniStatLabel}>following</div>
        </div>
      </div>

      <div className={styles.miniActionsLarge}>
        <a
          className={styles.viewProfileBtnLarge}
          href={`/profile/${state.userId === data.userId ? '' : data.userId}`}
        >
          View Profile
        </a>
        <div className={styles.actionIcons}>
          {chatId != null && !isCurrentUser ? (
            <button
              type="button"
              className={styles.iconBtn}
              aria-label="Message"
              onClick={onMessage}
              disabled={!chatId}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <path
                  d="M21 15a2 2 0 01-2 2H8l-5 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ) : null}

          {!isCurrentUser && (
            <>
              {status === 'accepted' ? (
                <button
                  type="button"
                  className={`${styles.followBtn} ${styles.followOutline}`}
                  onClick={doUnfollow}
                  disabled={busy}
                  title="Following — click to unfollow"
                >
                  ✓
                </button>
              ) : status === 'pending' ? (
                <button
                  type="button"
                  className={`${styles.followBtn}`}
                  onClick={doUnfollow}
                  disabled={busy}
                  title="Request pending - — click to unfollow"
                >
                  …
                </button>
              ) : (
                <button
                  type="button"
                  className={`${styles.followBtn} ${styles.followPrimary}`}
                  onClick={doFollow}
                  disabled={busy}
                  title="Follow"
                >
                  +
                </button>
              )}
            </>
          )}
        </div>
      </div>
      {Array.from(currentChat.entries()).map(([chatId, user]) => (
        <FloatingChat
          key={chatId}
          chatId={chatId}
          user={user}
          onClose={() => handleCloseChat(chatId)}
        />
      ))}
    </>
  )
}
