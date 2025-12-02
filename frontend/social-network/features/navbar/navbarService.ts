import { User } from './types';

export const navbarService = {
  async getCurrentUser(): Promise<User | null> {
    // TODO: Implement API call
    // const response = await fetch('/api/v1/auth/session', { credentials: 'include' });
    // const data = await response.json();
    // return data.success ? data.payload : null;
    return null;
  },

  async getNotificationCount(): Promise<number> {
    // TODO: Implement API call
    // const response = await fetch('/api/v1/notifications/unread-count', { credentials: 'include' });
    // const data = await response.json();
    // return data.success ? data.payload.unreadCount : 0;
    return 0;
  }
};