"use client"

import { useContext, useState, ReactNode } from "react"
import { LayoutRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime"

const FrozenRoute = ({ children }: { children: ReactNode }) => {
  const context = useContext(LayoutRouterContext)
  const [frozen] = useState(context)

  return (
    <LayoutRouterContext.Provider value={frozen}>
      {children}
    </LayoutRouterContext.Provider>
  )
}

export default FrozenRoute
