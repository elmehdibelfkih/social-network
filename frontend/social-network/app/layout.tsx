'use client';
import { AuthProvider } from '../providers/authProvider';
import Snackbar from '../components/ui/snackbar';
import AuthForm from '../features/auth/auth.client';
import SharedWorekerClient from '../components/ui/worker';

export default function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <html lang="en">
      <body>
        <header style={{ padding: 12 }}>
          <h1>Logo</h1>
        </header>

        <main>
           <SharedWorekerClient/>
          {children}
          <Snackbar />
        </main>

      </body>
    </html>
  );
}
