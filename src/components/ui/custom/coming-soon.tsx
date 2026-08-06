"use client"

import React, { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeftIcon, SparkleIcon } from "@phosphor-icons/react/dist/ssr"
import { Button } from "../button"
import confetti from "canvas-confetti"
import { AnimateIcon } from "@/components/animate-ui/icons/icon"
import { Forklift } from "@/components/animate-ui/icons/forklift"

import { useAppStore } from "@/store/coreStore"

export interface ComingSoonProps {
  title?: string
  subtitle?: string
  badgeText?: string
  estimatedRelease?: string
  icon?: React.ReactNode
  backUrl?: string
  backText?: string
  targetDate?: Date
  onNotifySubmit?: (email: string) => Promise<void> | void
}

export function ComingSoon({
  title,
  subtitle,
  badgeText,
  estimatedRelease = "Q3 2026",
  backUrl = "/app",
  backText,
  onNotifySubmit,
}: ComingSoonProps): React.ReactElement {
  const language = useAppStore((state) => state.language)

  const resolvedTitle = title || language?.data?.app?.guilds?.comingsoon?.badge || "Coming Soon"
  const resolvedBadgeText = badgeText || language?.data?.app?.guilds?.comingsoon?.badge || "Coming Soon"
  const resolvedSubtitle = subtitle || language?.data?.app?.guilds?.comingsoon?.subtitle || "Something awesome is in the works"
  const resolvedBackText = backText || language?.data?.app?.guilds?.comingsoon?.back || "Back to Workspace"
  const targetLaunchText = language?.data?.app?.guilds?.comingsoon?.target_launch || "Target Launch:"

  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes("@")) return

    setLoading(true)
    try {
      if (onNotifySubmit) {
        await onNotifySubmit(email)
      }
      setIsSubmitted(true)
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-[calc(100vh-6rem)] w-full items-center justify-center overflow-hidden px-4 py-12 sm:px-6 lg:px-8">
      <div className="relative z-10 mx-auto w-full max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-8 flex justify-center"
        >
          <Link href={backUrl}>
            <Button
              variant="ghost"
              size="sm"
              className="group inline-flex items-center gap-2 rounded-full bg-foreground/5 p-2 text-xs font-semibold text-foreground/80 backdrop-blur-md transition-all duration-300 hover:border-primary/40 hover:bg-foreground/10 hover:text-foreground"
            >
              <ArrowLeftIcon
                size={14}
                weight="bold"
                className="transition-transform duration-300 group-hover:-translate-x-1"
              />
              <span>{resolvedBackText}</span>
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative mx-auto mb-6 flex items-center justify-center"
        >
          <AnimateIcon animate={"default-loop"} loop loopDelay={640}>
            <Forklift className={"size-24"} />
          </AnimateIcon>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="inline-flex items-center gap-2 rounded-full border-2 border-dashed border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur-md"
        >
          <SparkleIcon size={14} weight="fill" />
          <span>{resolvedBadgeText.toUpperCase()}</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="mt-4"
        >
          <h1 className="bg-linear-to-b from-foreground via-foreground/90 to-foreground/60 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl lg:text-6xl">
            {resolvedTitle}
          </h1>
          <p className="mt-3 text-lg font-medium text-foreground/70 sm:text-xl">
            {resolvedSubtitle}
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.38 }}
          className="mt-6 text-xs text-foreground/40"
        >
          {targetLaunchText} <strong className="text-foreground/70">{estimatedRelease}</strong> • No spam, unsubscribe anytime.
        </motion.p>
      </div>
    </div>
  )
}
