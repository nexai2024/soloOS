'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { ToastContainer } from '@/components/ToastContainer';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>{children}</AuthProvider>
          <ToastContainer />
        </ToastProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
}
