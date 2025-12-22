'use client'
import { useEffect, useState } from "react"
import { Follower, ProfileAPIResponse } from "@/libs/globalTypes"
import { getFollowers, getFollowing } from "./profile_feed.services"
import MiniProfile from "../mini_profile"
import styles from "./styles.module.css"

interface FollowersListProps {
    userId: string
    type: 'followers' | 'following'
}

export function FollowersList({ userId, type }: FollowersListProps) {
    const [followers, setFollowers] = useState<Follower[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const loadFollowers = async () => {
        setIsLoading(true)
        try {
            const data = type === 'followers'
                ? await getFollowers(userId)
                : await getFollowing(userId)                
            setFollowers(data)
        } catch (err) {
            console.error("Error loading followers:", err)
        } finally {
            setIsLoading(false)
        }

    }

    useEffect(() => {
        loadFollowers()
    }, [userId, type])

    if (isLoading) {
        return <div>Loading...</div>
    }

    return (
        <div className={styles.followersGrid}>
            {followers?.length === 0 && !isLoading ?
                <EmptyContent type={type} />
                : followers.map((follower) => (
                    <MiniProfile key={follower.userId} data={follower} />
                ))}
        </div>
    )
}

function EmptyContent({ type }: { type: 'followers' | 'following' }) {
    return (
        <div className={styles.emptyContent}>
            {type === 'followers' ? (
                <>
                    <h3>No followers</h3>
                    <p>You'll see your followers here</p>
                </>
            ) : (
                <>
                    <h3>No following</h3>
                    <p>You'll see your following here</p>
                </>
            )}
        </div>
    )
}