// app/layout.tsx
'use client';
import './globals.css';
import Snackbar from '../components/ui/snackbar';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Snackbar />
      </body>
    </html>
  );
}
