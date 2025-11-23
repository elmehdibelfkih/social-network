'use client';

import Snackbar from '@/components/ui/snackbar';
import { NavbarClient } from '@/features/navbar';
import { AuthProvider } from '@/providers/authProvider';

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
