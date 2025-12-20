import Footer from '@/features/footer/footer.server';
import Snackbar from '@/components/ui/snackbar/snackbar';
import '@/styles/globals.css';
import '@/styles/globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Sonet',
  description: 'A modern social media platform for communication and sharing content.',
  applicationName: 'Social Network',
  generator: 'Next.js',
  keywords: ['social network', 'friends', 'messages', 'posts', 'community'],
  authors: [{ name: '101 team' }],
  creator: '101 team',
  publisher: 'SocialNetwork Inc',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body className="app-root">
        {/* {children} */}
        <div id="chat-portals"></div>
        <main className="main-content">{children}</main>
        <Snackbar />
        <Footer />
      </body>
    </html>
  );
}
