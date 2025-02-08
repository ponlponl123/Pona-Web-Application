"use client"
import React from 'react'
import Providers from './providers'
import { PonaMusicProvider } from '@/contexts/ponaMusicContext'

function PlayerLayout({ children }: { children: React.ReactNode }) {
  return (
    <React.StrictMode>
      <PonaMusicProvider>
        <Providers>
          {children}
        </Providers>
      </PonaMusicProvider>
    </React.StrictMode>
  )
}

export default PlayerLayout