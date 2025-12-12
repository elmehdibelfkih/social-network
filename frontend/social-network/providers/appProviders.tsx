'use client';

import { ReactNode } from 'react';
import { AuthProvider } from './authProvider';

// This is the primary component you will use in your layout
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
