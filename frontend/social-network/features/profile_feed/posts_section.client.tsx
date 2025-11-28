'use client'

import { useRouter, useSearchParams } from "next/navigation"
import { getPosts } from "./profile_feed.services"
import { useEffect, useState } from "react"
import { Post } from "@/libs/globalTypes"
import { PostsClient } from "../posts"

export function PostsSection({ userId }: { userId: string }) {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [page, setPage] = useState(1)
    const [posts, setPosts] = useState<Post[]>([])
    const [hasMore, setHasMore] = useState(true)
    const [isLoading, setIsLoading] = useState(false)


    const loadPosts = async (page: number) => {
        if (isLoading || !hasMore) return
        setIsLoading(true)
        try {
            const limit = 20
            const newPosts = await getPosts(userId, page, limit)
            if (newPosts.length == 0 || newPosts.length < limit) setHasMore(false)

            setPosts(prev => page === 1 ? newPosts : [...prev, ...newPosts])

            const params = new URLSearchParams(searchParams.toString())
            params.set('page', page.toString())
            router.replace(`?${params.toString()}`, { scroll: false })
        } catch (error) {
            console.log("Erorr loading posts: ", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadPosts(1)
    }, [userId])

    useEffect(() => {
        const handleScroll = () => {
            if (hasMore && !isLoading && window.innerHeight + document.documentElement.scrollTop >=
                document.documentElement.offsetHeight - 200) {
                setPage(prev => {
                    const nextPage = prev + 1
                    loadPosts(nextPage)
                    return nextPage
                })
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [hasMore, page])

    if (posts.length === 0 && !isLoading) {
        return <div>No posts yet</div>
    }

    console.log("posts.length", posts.length)

    return (
        <>
            {
                posts.map((post) => (
                    <PostsClient key={post.postId} newPost={post} />
                ))
            }
            {isLoading && <div>Loading...</div>}
        </>
    )
}