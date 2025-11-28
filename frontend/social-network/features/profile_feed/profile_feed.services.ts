import { http } from "@/libs/apiFetch";
import { Follower, Post } from "@/libs/globalTypes";

export async function getFollowers(userId: string): Promise<Follower[]> {
  return http.get(`/api/v1/users/${userId}/followers`)
}

export async function getFollowing(userId: string): Promise<Follower[]> {
  return http.get(`/api/v1/users/${userId}/following`)
}

export async function getPosts(userId: string, page: number, limit: number): Promise<Post[]> {
  const response = await http.get<{ posts: Post[] }>(`/api/v1/users/${userId}/posts?page=${page}&limit=${limit}`)
  return response.posts
}