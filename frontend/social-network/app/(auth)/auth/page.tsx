'use client';
import Snackbar from '@/components/ui/snackbar/snackbar';
import AuthForm from '@/features/auth/auth.client';
import { AuthProvider } from '@/providers/authProvider';


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
        <main>
          <AuthProvider>
            <Snackbar />
            <AuthForm />
          </AuthProvider>
        </main>
  );
}
