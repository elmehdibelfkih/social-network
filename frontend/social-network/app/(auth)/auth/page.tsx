// 'use client';
import AuthForm from '@/features/auth/auth.client';
import { AppProviders } from '@/providers/appProviders';
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
