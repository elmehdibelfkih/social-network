'use client';
import { AuthProvider } from '../providers/authProvider';
import Snackbar from '../components/ui/snackbar';
import AuthForm from '../features/auth/auth.client';
import { NavbarClient } from '../features/navbar';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header style={{ padding: 12 }}>
          <NavbarClient />
        </header>

        <main>
          <AuthProvider>
            {children}
          </AuthProvider>
          <Snackbar />
        </main>

      </body>
    </html>
  );
}
