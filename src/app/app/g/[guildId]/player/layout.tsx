"use client"
import React from 'react'
import Providers from './providers'
import { PonaMusicProvider } from '@/contexts/ponaMusicContext'
import { PlaybackProvider } from '@/contexts/playbackContext'

function PlayerLayout({ children }: { children: React.ReactNode }) {
  return (
    <PlaybackProvider>
      <PonaMusicProvider>
        <Providers>
          {children}
        </Providers>
      </PonaMusicProvider>
    </PlaybackProvider>
  )
}

export default PlayerLayout