"use client"
import React from 'react'
import Providers from './providers'
import { PonaMusicProvider, usePonaMusicContext } from '@/contexts/ponaMusicContext'

function PlayerLayout({ children }: { children: React.ReactNode }) {
  const {
    isConnected
  } = usePonaMusicContext();

  console.log('isConnected', window.location.pathname, isConnected);

  return (
    <PonaMusicProvider>
      <Providers>
        {children}
      </Providers>
    </PonaMusicProvider>
  )
}

export default PlayerLayout