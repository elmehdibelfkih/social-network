'use client';
import AuthForm from '../../features/auth/auth.client';
import { AuthProvider } from '../../providers/authProvider';


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main>
          <AuthProvider>
            <AuthForm />
          </AuthProvider>
        </main>
      </body>
    </html>
  );
}
