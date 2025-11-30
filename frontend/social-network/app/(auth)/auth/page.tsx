'use client';
import AddFriends from '@/components/ui/AddFriends/addFriends';
import AuthForm from '@/features/auth/auth.client';
import { AuthProvider } from '@/providers/authProvider';

export default function AuthPage({ children }: { children: React.ReactNode }) {
  // This is a page-level client component — do not render html/body here.
  // The root `app/layout.tsx` already renders <html> and <body className="app-root">.
  return (
    <main>
      <AuthProvider>
        {children}
        <AddFriends title="" desc="" componentId="" purpose="post" onComplete={() => console.log('Sent group invites.')} />
        <AuthForm />
      </AuthProvider>
    </main>
  );
}
