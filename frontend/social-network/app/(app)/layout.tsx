import { ReactNode } from "react";
import { Navbar } from "@/features/navbar";
import { AppProviders } from "@/providers/appProviders";
import { UserStatsProvider } from "@/providers/userStatsContext";
import { getUserId } from "@/libs/helpers";
import { http } from "@/libs/apiFetch";
import { ProfileAPIResponse } from "@/libs/globalTypes";
import { AuthProvider } from "@/providers/authProvider";
import SharedWorekerClient from "@/components/ui/worker";


export default async function AppLayout({ children }: { children: ReactNode }) {
  const userId = await getUserId();

  const [profileRes, notificationsRes] = await Promise.all([
    http.get<ProfileAPIResponse>(`/api/v1/users/${userId}/profile`),
    http.get<{ unreadCount: number }>(`/api/v1/notifications/unread-count`)
  ]);

  const stats = {
    ...profileRes.stats,
    unreadNotifications: notificationsRes.unreadCount,
  };

  console.log("Initial User Stats:", stats);

  return (
    <AppProviders>
      <UserStatsProvider initialState={stats}>
        <SharedWorekerClient />
        <Navbar />
        {children}
      </UserStatsProvider>
    </AppProviders>
  );
}
