// app/layout.tsx
'use client';
// import '../styles/global.css';
import AuthForm from '../features/auth/auth.client';
import { NewPost } from '../features/newPost/newPost.client';
import { Profile } from '../features/profile';
import Snackbar from '../components/ui/snackbar';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header >
          {/* <NewPost userAvatar='https://placehold.co/140x140/8b4fc9/ffffff?text=ABDNOUR' /> */}
          {/* <Profile userId='948590438590' /> */}
          {/* <Snackbar /> */}
          {/* <AuthForm /> */}
        </header>

        <main>{children}</main>
      </body>
    </html>
  );
}
