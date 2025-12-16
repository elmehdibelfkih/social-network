import { ReactNode } from "react";
import { Navbar } from "@/features/navbar";
import { AppProviders } from "@/providers/appProviders";
import { UserStatsProvider } from "@/providers/userStatsContext";
import { getUserId } from "@/libs/helpers";
import { http } from "@/libs/apiFetch";
import { NotificationCount } from "@/libs/globalTypes";
import { ProfileAPIResponse } from "@/libs/globalTypes";
import { UserStatsState } from "@/libs/globalTypes";
import { Counts } from "@/libs/globalTypes";


export default async function AppLayout({ children }: { children: ReactNode }) {
  const userId = await getUserId();

  const [profileRes, notificationsRes, counts] = await Promise.all([
    http.get<ProfileAPIResponse>(`/api/v1/users/${userId}/profile`),
    http.get<NotificationCount>(`/api/v1/notifications/unread-count`),
    http.get<Counts>(`/api/v1/users/${userId}/stats`)
  ]);

  if (!profileRes || !notificationsRes) {
    return null;
  }
  const { stats: profileStats, ...profileRest } = profileRes;

  const stats: UserStatsState = {
    ...profileStats,
    ...profileRest,
    unreadNotifications: notificationsRes.unreadNotifications,
    ...counts
  };

  console.log(profileRes);
  
  return (
    <AppProviders>
      <UserStatsProvider initialState={stats}>
        <Navbar />
        {children}
      </UserStatsProvider>
    </AppProviders>
  );
}
