'use client';
import { ReactNode } from 'react';
import { AuthProvider } from './authProvider';

// This is the primary component you will use in your layout
// Note: NotificationProvider requires UserStatsProvider and should be added separately
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
