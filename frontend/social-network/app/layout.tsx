// app/layout.tsx
'use client';
// import './globals.css';
import AuthForm from '../features/auth/auth.client';
import { NewPost } from '../features/newPost/newPost.client';
import { Profile } from '../features/profile';
import Snackbar from '../components/ui/snackbar';
import { NavbarClient } from '../features/navbar';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header style={{ padding: 12 }}>
        </header>

        <main>
          {children}
          <Snackbar />
        </main>

      </body>
    </html>
  );
}
