import { http } from '@/libs/apiFetch'
import type { NotificationsResponse, UnreadCountResponse } from './types'

export const notificationsService = {
  async getNotifications(
    limit: number = 20,
    lastId?: number
  ): Promise<NotificationsResponse> {

    try {
      const url = lastId
        ? `/api/v1/notifications?limit=${limit}&last_id=${lastId}`
        : `/api/v1/notifications?limit=${limit}`

      const response = await http.get<NotificationsResponse>(url)

      return response || { limit, notifications: [] }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      return { limit, notifications: [] }
    }
  },

  async getUnreadCount(): Promise<number> {
    try {
      const response = await http.get<UnreadCountResponse>(
        '/api/v1/notifications/unread-count'
      )
      return response?.unreadCount || 0
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
      return 0
    }
  },

  async markAsRead(notificationId: number): Promise<boolean> {
    try {
      await http.post(`/api/v1/notifications/${notificationId}/mark-read`)
      return true
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
      return false
    }
  },

  async markAllAsRead(): Promise<boolean> {
    try {
      await http.post('/api/v1/notifications/mark-all-read')
      return true
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
      return false
    }
  },
}
