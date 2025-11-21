'use client';
import AuthForm from '../../../features/auth/auth.client';
import { Profile } from '../../../features/profile';
import { AuthProvider } from '../../../providers/authProvider';


export default function RootLayout({ params }: { params: { user_id: string } }) {
  return (
    <html lang="en">
      <body>
        <main>
          <AuthProvider>
            <Profile userId={6153903284555776} />
          </AuthProvider>
        </main>
      </body>
    </html>
  );
}
