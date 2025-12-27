import { ReactNode } from "react";
import { Navbar } from "@/features/navbar";
import { UserStatsProvider } from "@/providers/userStatsContext";
import { getUserId } from "@/libs/helpers";
import { http } from "@/libs/apiFetch";
import { NotificationCount } from "@/libs/globalTypes";
import { ProfileAPIResponse } from "@/libs/globalTypes";
import { AuthProvider } from "@/providers/authProvider";
import SharedWorekerClient from "@/components/ui/worker";
import { UserStatsState } from "@/libs/globalTypes";
import { Counts } from "@/libs/globalTypes";
import { NotificationProvider } from "@/providers/notifsProvider";
import { ChatProvider } from "@/features/chat/global.chat.client";
import { ChatSection } from "@/features/chat";
import { ChatPortals } from "@/features/chat/portals.client";


export default async function AppLayout({ children }: { children: ReactNode }) {
  const userId = await getUserId();

  const [profileRes, notificationsRes, counts] = await Promise.all([
    http.get<ProfileAPIResponse>(`/api/v1/users/${userId}/profile`),
    http.get<NotificationCount>(`/api/v1/notifications/unread-count`),
    http.get<Counts>(`/api/v1/users/${userId}/stats`)
  ]);

  if (!profileRes || !notificationsRes || !counts) {
    return null;
  }
  const stats: UserStatsState = {
    userId: profileRes.userId,
    nickname: profileRes.nickname,
    firstName: profileRes.firstName,
    lastName: profileRes.lastName,
    avatarId: profileRes.avatarId,
    aboutMe: profileRes.aboutMe,
    dateOfBirth: profileRes.dateOfBirth,
    privacy: profileRes.privacy as 'public' | 'private',
    joinedAt: profileRes.joinedAt,
    email: profileRes.email,
    unreadNotifications: notificationsRes.unreadNotifications,
    postsCount: counts.postsCount,
    followersCount: counts.followersCount,
    followingCount: counts.followingCount,
    likesReceived: counts.likesReceived,
    commentsReceived: counts.commentsReceived,
  };

  return (
    <>
      <AuthProvider>
        <UserStatsProvider initialState={stats}>
          <SharedWorekerClient />
          <NotificationProvider>
            <ChatProvider>
              <Navbar />
              <ChatPortals />
              {children}
            </ChatProvider>
          </NotificationProvider>
        </UserStatsProvider>
      </AuthProvider>
    </>
  );
}
