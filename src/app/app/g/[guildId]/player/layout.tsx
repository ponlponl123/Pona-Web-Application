"use client"
import React from 'react'
import Providers from './providers'
import { PonaMusicProvider } from '@/contexts/ponaMusicContext'
import { PlaybackProvider } from '@/contexts/playbackContext'
import { PonaMusicCacheContextProvider } from '@/contexts/ponaMusicCacheContext'

function PlayerLayout({ children }: { children: React.ReactNode }) {
  return (
    <PlaybackProvider>
      <PonaMusicCacheContextProvider>
        <PonaMusicProvider>
          <Providers>
            {children}
          </Providers>
        </PonaMusicProvider>
      </PonaMusicCacheContextProvider>
    </PlaybackProvider>
  )
}

export default PlayerLayout