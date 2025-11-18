// app/layout.tsx
'use client';
import './globals.css';
import AuthForm from '../features/auth/auth.client';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header style={{ padding: 12 }}>
          <div>Logo</div>
          {/* <AuthForm /> */}
        </header>

        <main>{children}</main>
      </body>
    </html>
  );
}
