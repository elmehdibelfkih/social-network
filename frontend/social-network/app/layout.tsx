'use client';
import { AuthProvider } from '../providers/authProvider';
import Snackbar from '../components/ui/snackbar';
import AuthForm from '../features/auth/auth.client';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header style={{ padding: 12 }}>
          <h1>Logo</h1>
        </header>

        <main>
          {children}
          <Snackbar />
        </main>

      </body>
    </html>
  );
}
