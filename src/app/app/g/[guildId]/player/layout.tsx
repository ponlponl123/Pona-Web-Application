"use client"
import React from 'react'
import Providers from './providers'
import { PonaMusicProvider } from '@/contexts/ponaMusicContext'

function PlayerLayout({ children }: { children: React.ReactNode }) {
  return (
    <PonaMusicProvider>
      <Providers>
        {children}
      </Providers>
    </PonaMusicProvider>
  )
}

export default PlayerLayout