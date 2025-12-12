'use client'
import { useEffect, useState } from "react"
import { Follower, ProfileAPIResponse } from "@/libs/globalTypes"
import { getFollowers, getFollowing } from "./profile_feed.services"
import MiniProfile from "../mini_profile"
import styles from "./styles.module.css"
import { useAuth } from "@/providers/authProvider"

interface FollowersListProps {
    userId: string
    type: 'followers' | 'following'
}

function followerToProfile(follower: Follower): ProfileAPIResponse {
    return {
        userId: follower.userId,
        status: follower.status === 'accepted' ? 'accepted' :
            follower.status === 'pending' ? 'pending' :
                follower.status === 'follow' ? 'follow' : null,
        nickname: follower.nickname,
        firstName: follower.firstName,
        lastName: follower.lastName,
        avatarId: follower.avatarId,
        aboutMe: null,
        dateOfBirth: null,
        privacy: follower.privacy,
        stats: follower.stats,
        joinedAt: follower.followedAt ?? null,
        chatId: follower.chatId
    }
}

export function FollowersList({ userId, type }: FollowersListProps) {
    const [followers, setFollowers] = useState<Follower[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const { user } = useAuth()


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
    
    { followers?.map((follower) => { console.log(follower) }) } // debaggin

    return (
        <div className={styles.followersGrid}>
            {followers?.length === 0 && !isLoading ?
                <EmptyContent type={type} />
                : followers?.map((follower) => (

                    <MiniProfile key={follower.userId} data={followerToProfile(follower)} isMyprofile={String(follower.userId) !== user?.userId}  />
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