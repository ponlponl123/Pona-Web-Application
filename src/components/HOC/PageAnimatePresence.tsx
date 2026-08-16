"use client"

import React from "react"
import { usePathname } from "next/navigation"
import { AnimatePresence, AnimatePresenceProps, motion } from "motion/react"
import FrozenRoute from "./FrozenRoute"

interface AnimationPresence extends AnimatePresenceProps {
  children: React.ReactNode
  customKey?: string
}

const PageAnimatePresence = ({
  children,
  customKey,
  mode = "wait",
  ...props
}: AnimationPresence) => {
  const pathnameFromHook = usePathname() || ""
  const pathname = customKey || pathnameFromHook

  return (
    <AnimatePresence mode={mode} {...props}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
      >
        <FrozenRoute>{children}</FrozenRoute>
      </motion.div>
    </AnimatePresence>
  )
}

export default PageAnimatePresence
