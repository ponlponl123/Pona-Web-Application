'use client'
import { motion, Variants } from 'framer-motion'
import { usePathname } from 'next/navigation'
import React from 'react'

const variants: Variants = {
  hidden: { opacity: 0, x: 0, y: 24 },
  enter: { opacity: 1, x: 0, y: 0 },
  exit: { opacity: 0, x: 0, y: -24 }
}

const variants2: Variants = {
  hidden: { opacity: 0, x: 0, y: 0 },
  enter: { opacity: 1, x: 0, y: 0 },
  exit: { opacity: 0, x: 0, y: 0 }
}

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const apppath = pathname.includes('player');
  return (
    <motion.main
      variants={apppath ? variants2 : variants}
      initial="hidden"
      exit="exit"
      animate="enter"
      transition={{ type: 'linear', duration: apppath ? 0.32 : 0.12 }}
      key="LandingPage"
    >
      {children}
    </motion.main>
  )
}