import { http } from "@/libs/apiFetch";
import { Follower, Post } from "@/libs/globalTypes";

export async function getFollowers(userId: string): Promise<Follower[]> {
  const response = await http.get<{ followers: Follower[] }>(`/api/v1/users/${userId}/followers`)
  return response.followers || response as any 
}

export async function getFollowing(userId: string): Promise<Follower[]> {
  const response = await http.get<{ following: Follower[] }>(`/api/v1/users/${userId}/following`)
  return response.following || response as any 
}

export async function getPosts(userId: string, page: number, limit: number): Promise<Post[]> {
  const response = await http.get<{ posts: Post[] }>(`/api/v1/users/${userId}/posts?page=${page}&limit=${limit}`)
  return response?.posts || []
}