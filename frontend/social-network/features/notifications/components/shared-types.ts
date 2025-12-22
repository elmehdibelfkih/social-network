import type { Notification } from '../types'

export type NotificationProps = {
  notification: Notification
  onMarkAsRead?: (id: number) => void
}
