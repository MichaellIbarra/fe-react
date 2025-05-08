
"use client";

import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { StudentProvider } from '@/contexts/StudentContext'; // New import

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <StudentProvider> {/* Wrap children with StudentProvider */}
        {children}
      </StudentProvider>
    </QueryClientProvider>
  );
}
