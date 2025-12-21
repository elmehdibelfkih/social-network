'use client'

import { useState, useEffect } from 'react'
import styles from './styles.module.css'
import { unfollowPerson, followPerson } from './profileSrevice'
import { FollowIcon, GlobeIcon, MessageIcon } from '@/components/ui/icons'
import { FollowStatus, ProfileAPIResponse } from '@/libs/globalTypes'
import { useAuth } from '@/providers/authProvider'
import { useUserStats } from '@/providers/userStatsContext'
import { useProfileStats } from "./profile.provider";

export function FollowButton({ targetUserId, initialStatus, isPrivate = false }: { targetUserId: string, initialStatus: FollowStatus, isPrivate?: boolean }) {
    const [status, setStatus] = useState<FollowStatus>(initialStatus);

    const { dispatch } = useUserStats();
    const { incrementFollowers, decrementFollowers } = useProfileStats();

    const handleFollow = async () => {
        if (status == 'follow' || !status) {
            const previousStatus = status
            const nextState = isPrivate ? 'pending' : 'accepted';
            setStatus(nextState);

            followPerson(targetUserId).catch(() => {
                setStatus(previousStatus)
                return
            })
            if (!isPrivate) {
                dispatch({ type: 'INCREMENT_FOLLOWING' });
                incrementFollowers();
            }
        } else {
            const previousStatus = status
            setStatus('follow');

            unfollowPerson(targetUserId).catch(() => {
                setStatus(previousStatus)
                return
            })
            if (status === 'accepted') {
                dispatch({ type: 'DECREMENT_FOLLOWING' });
                decrementFollowers();
            }
        }
    }

    const getButtonText = () => {
        switch (status) {
            case 'accepted': return 'Following';
            case 'pending': return 'Requested';
            case 'declined': return 'Follow';
            default: return 'Follow';
        }
    };

    return (
        <button className={styles.followButton} onClick={handleFollow} >
            <FollowIcon />
            <span>{getButtonText()}</span>
        </button>
    );
}

export function MessageButton() {
    const handleMessage = () => {
        // TODO: should open the conversation modal
    }
    return (
        <button className={styles.messageButton} onClick={handleMessage} >
            <MessageIcon />
            <span>{"Message"}</span>
        </button>
    )
}

export function ProfileTopActions({ userId, profile }: { userId: string, profile: ProfileAPIResponse }) {
    const { user } = useAuth()
    const [mounted, setMounted] = useState(false)

    useEffect(() => setMounted(true), [])

    if (!mounted || !user) {
        return <div className={styles.topPart}></div>
    }
    const isOwnProfile = user.userId == userId

    return (
        <div className={styles.topPart}>
            {!isOwnProfile && (
                <>
                    <FollowButton
                        targetUserId={userId}
                        initialStatus={profile.status || null}
                        isPrivate={profile.privacy === 'private'}
                    />
                    <MessageButton />
                </>
            )}
        </div>
    )
}

export function Privacy({ userId, privacy }: { userId: number, privacy: string }) {
    const { state } = useUserStats();
    if (state.userId !== userId) {
        return (
            <span className={`${styles.privacy} ${styles[privacy]}`}>
                <GlobeIcon fillColor={privacy === 'public' ? '#01a63f' : '#F7773D'} />
                {privacy} profile
            </span>
        )
    }

    return (
        <span>
            <span className={`${styles.privacy} ${styles[state.privacy]}`}>
                <GlobeIcon fillColor={state.privacy === 'public' ? '#01a63f' : '#F7773D'} />
                {state.privacy} profile
            </span>
        </span>
    )
}


export function Counts({ userId }: { userId: number }) {
    const { state } = useUserStats();
    if (state.userId === userId) {
        return (
            <div className={styles.stats}>
                <span><b>{state.postsCount}</b> Posts</span>
                <span><b>{state.followersCount}</b> Followers</span>
                <span><b>{state.followingCount}</b> Following</span>
            </div>
        )
    }

    const { stats } = useProfileStats();

    return (
        <div className={styles.stats}>
            <span><b>{stats.postsCount || 0}</b> Posts</span>
            <span><b>{stats.followersCount}</b> Followers</span>
            <span><b>{stats.followingCount}</b> Following</span>
        </div>
    )
}