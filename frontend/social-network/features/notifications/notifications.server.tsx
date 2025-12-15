import { Suspense } from 'react'
import { NotificationsClient } from './notifications.client'
import { notificationsService } from './notificationsService'

export async function NotificationsServer() {
  const response = await notificationsService.getNotifications(20)

  return (
    <Suspense fallback={<NotificationsLoading />}>
      <NotificationsClient
        initialNotifications={response.notifications}
        initialLimit={20}
      />
    </Suspense>
  )
}

function NotificationsLoading() {
  return (
    <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
      Loading notifications...
    </div>
  )
}

export default NotificationsServer
