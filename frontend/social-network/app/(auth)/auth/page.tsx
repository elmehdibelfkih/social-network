'use client';
import AddFriends from '@/components/ui/AddFriends/addFriends';
import AuthForm from '@/features/auth/auth.client';
import { AuthProvider } from '@/providers/authProvider';


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main>
          <AuthProvider>
            {children}
            <AuthForm />
          </AuthProvider>
        </main>
      </body>
    </html>
  );
}
