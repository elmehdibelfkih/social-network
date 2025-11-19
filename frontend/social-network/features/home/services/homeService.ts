import { Post, User } from '../types';

export const homeService = {
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await fetch('/api/v1/auth/session', { credentials: 'include' });
      const data = await response.json();
      return data.success ? data.payload : null;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      return null;
    }
  },

  async getNotificationCount(): Promise<number> {
    try {
      const response = await fetch('/api/v1/notifications/unread-count', { credentials: 'include' });
      const data = await response.json();
      return data.success ? data.payload.unreadCount : 0;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      return 0;
    }
  },

  async getFeed(page = 1, limit = 20): Promise<Post[]> {
    try {
      const response = await fetch(`/api/v1/feed?page=${page}&limit=${limit}`, { credentials: 'include' });
      const data = await response.json();
      return data.success ? data.payload : [];
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      return [];
    }
  },

  async toggleLike(postId: number, isLiked: boolean): Promise<boolean> {
    try {
      const method = isLiked ? 'DELETE' : 'POST';
      const response = await fetch(`/api/v1/posts/${postId}/like`, {
        method,
        credentials: 'include'
      });
      return response.ok;
    } catch (error) {
      console.error('Failed to toggle like:', error);
      return false;
    }
  }
};