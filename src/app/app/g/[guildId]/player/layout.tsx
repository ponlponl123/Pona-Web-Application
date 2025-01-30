import React from 'react'
import Providers from './providers'

function PlayerLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      {children}
    </Providers>
  )
}

export default PlayerLayout