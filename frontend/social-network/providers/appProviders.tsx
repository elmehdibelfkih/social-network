'use client';
import { ReactNode } from 'react';
import { AuthProvider } from './authProvider';
import { NotificationProvider } from './notifsProvider';

// This is the primary component you will use in your layout
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <NotificationProvider>
        {children}
      </NotificationProvider>
    </AuthProvider>
  );
}
