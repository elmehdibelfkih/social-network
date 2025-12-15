// 'use client';
import Snackbar from '@/components/ui/snackbar/snackbar';
import AuthForm from '@/features/auth/auth.client';
import { Navbar } from '@/features/navbar';
import { ProfileAPIResponse } from '@/features/profile_summary';
import { http } from '@/libs/apiFetch';
import { NotificationCount } from '@/libs/globalTypes';
import { getUserId } from '@/libs/helpers';
import { AppProviders } from '@/providers/appProviders';
import { AuthProvider } from '@/providers/authProvider';
import { UserStatsProvider } from '@/providers/userStatsContext';


export default async function RootLayout({ children }: { children: React.ReactNode }) {


  return (
    <main>
      {/* <AuthProvider>
        <Snackbar />
      </AuthProvider> */}

      <AppProviders>
        <UserStatsProvider>
          <AuthForm />
          {children}
        </UserStatsProvider>
      </AppProviders>
    </main>
  );
}
