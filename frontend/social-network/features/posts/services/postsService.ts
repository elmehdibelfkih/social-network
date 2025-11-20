import { Post } from '../types';

export const postsService = {
  async getFeed(page = 1, limit = 20): Promise<Post[]> {
    // TODO: Implement API call
    // const response = await fetch(`/api/v1/feed?page=${page}&limit=${limit}`, { credentials: 'include' });
    // const data = await response.json();
    // return data.success ? data.payload : [];
    return [];
  },

  async toggleLike(postId: number, isLiked: boolean): Promise<boolean> {
    // TODO: Implement API call
    // const method = isLiked ? 'DELETE' : 'POST';
    // const response = await fetch(`/api/v1/posts/${postId}/like`, {
    //   method,
    //   credentials: 'include'
    // });
    // return response.ok;
    return true;
  }
};