'use client';

import React from 'react';
import { PonaMusicProvider } from '@/contexts/ponaMusicContext';
import Providers from './providers';

export default function PlayerLayout({ children }: { children: React.ReactNode }) {
  return (
    <PonaMusicProvider>
      <Providers>{children}</Providers>
    </PonaMusicProvider>
  );
}

