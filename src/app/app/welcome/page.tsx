"use client"
import React from "react"
import confetti from "canvas-confetti"
import MyButton from "@/components/ui/custom/button"
import { useDiscordUserInfo } from "@/contexts/discordUserInfo"
import Link from "next/link"
import { randomInRange } from "@/lib/utils"

function Page() {
  const { userInfo } = useDiscordUserInfo()

  React.useEffect(() => {
    const duration = 5 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      })
    }, 250)
  }, [])

  return (
    <main id="app-panel">
      <div className="h-screen max-h-96 min-h-36 w-full">
        <div className="welcome-banner absolute top-0 left-0 h-screen max-h-96 min-h-36 w-full mask-linear-to-black" />
      </div>
      <main
        id="app-workspace"
        className="mx-auto flex max-w-7xl flex-col items-center"
      >
        <h1 className="-mt-12 text-center text-5xl max-lg:text-3xl max-md:text-2xl max-sm:text-xl">
          👋 Hello {userInfo?.global_name}!,
        </h1>
        <span className="text-center text-3xl max-lg:text-2xl max-md:text-xl max-sm:text-lg">
          Welcome to the Pona Web Application!
        </span>
        <br />
        <Link href={"/app"}>
          <MyButton className="m-auto">Get started</MyButton>
        </Link>
      </main>
    </main>
  )
}

export default Page
