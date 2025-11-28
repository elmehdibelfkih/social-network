'use client'

import { useEffect, useState } from "react"
import { Follower } from "@/libs/globalTypes"
import { getFollowers, getFollowing } from "./profile_feed.services"
import MiniProfile from "../mini_profile"
import type { ProfileAPIResponse } from "../mini_profile/types"

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
        privacy: 'public',
        stats: {
            postsCount: 0,
            followersCount: 0,
            followingCount: 0
        },
        joinedAt: follower.followedAt ?? null,
        chatId: follower.chatId
    }
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

    if (followers.length === 0 && !isLoading) {
        return (
            <div>
                {type === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
            </div>
        )
    }

    return (
        <>
            {followers.map((follower) => (
                <MiniProfile key={follower.userId} data={followerToProfile(follower)} />
            ))}
        </>
    )
}
