"use client"
import { Suspense } from "react"
import Authorize from "./authorize"
import { Spinner } from "@/components/ui/spinner"

// export const dynamic = "force-dynamic"

function Page() {
  return (
    <div className="flex h-full min-h-dvh w-full">
      <div className="m-auto flex flex-col items-center gap-2 text-center">
        <Suspense fallback={<Spinner />}>
          <Authorize />
        </Suspense>
      </div>
    </div>
  )
}

export default Page
