import { http } from '@/libs/apiFetch'
import type { Post, PaginationParams } from '@/libs/globalTypes'

export const postsService = {
  // Get feed posts
  async getFeed(params?: PaginationParams): Promise<Post[]> {
    try {
      const queryParams = new URLSearchParams()
      if (params?.page) queryParams.set('page', params.page.toString())
      if (params?.limit) queryParams.set('limit', params.limit.toString())
      
      const query = queryParams.toString()
      const url = `/api/v1/feed${query ? `?${query}` : ''}`
      
      return await http.get<Post[]>(url) || []
    } catch (error) {
      console.error('Failed to fetch feed:', error)
      return []
    }
  },

  async getGroupFeed(groupId: number, params?: PaginationParams): Promise<Post[]> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    const query = queryParams.toString();
    const url = `/api/v1/groups/${groupId}/feed${query ? `?${query}` : ''}`;
    return await http.get<Post[]>(url) || [];
  } catch (error) {
    console.error('Failed to fetch group feed:', error);
    return [];
  }
},

  // Get user posts
  async getUserPosts(userId: string | number, params?: PaginationParams): Promise<Post[]> {
    try {
      const queryParams = new URLSearchParams()
      if (params?.page) queryParams.set('page', params.page.toString())
      if (params?.limit) queryParams.set('limit', params.limit.toString())
      
      const query = queryParams.toString()
      const url = `/api/v1/users/${userId}/posts${query ? `?${query}` : ''}`
      
      return await http.get<Post[]>(url) || []
    } catch (error) {
      console.error('Failed to fetch user posts:', error)
      return []
    }
  },

  // Get single post
  async getPost(postId: string | number): Promise<Post | null> {
    try {
      return await http.get<Post>(`/api/v1/posts/${postId}`)
    } catch (error) {
      console.error('Failed to fetch post:', error)
      return null
    }
  },

  // Like post
  async likePost(postId: string | number): Promise<boolean> {
    try {
      await http.post(`/api/v1/posts/${postId}/like`)
      return true
    } catch (error) {
      console.error('Failed to like post:', error)
      return false
    }
  },

  // Unlike post
  async unlikePost(postId: string | number): Promise<boolean> {
    try {
      await http.delete(`/api/v1/posts/${postId}/like`)
      return true
    } catch (error) {
      console.error('Failed to unlike post:', error)
      return false
    }
  },

  // Delete post
  async deletePost(postId: string | number): Promise<boolean> {
    try {
      await http.delete(`/api/v1/posts/${postId}`)
      return true
    } catch (error) {
      console.error('Failed to delete post:', error)
      return false
    }
  },

  // Get author avatar ID
  async getAuthorAvatar(authorId: string | number): Promise<number | null> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_GO_API_URL}/api/v1/users/${authorId}/profile`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        return null
      }
      
      const profile = await response.json()
      return profile?.avatarId || null
    } catch (error) {
      console.error('Failed to fetch author avatar:', error)
      return null
    }
  }
}