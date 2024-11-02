'use client'
import { motion, Variants } from 'framer-motion'
import React from 'react'

const variants: Variants = {
  hidden: { opacity: 0, x: 0, y: 24 },
  enter: { opacity: 1, x: 0, y: 0 },
  exit: { opacity: 0, x: 0, y: -24 }
}

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.main
      variants={variants}
      initial="hidden"
      exit="exit"
      animate="enter"
      transition={{ type: 'linear', duration: 0.12 }}
      key="LandingPage"
    >
      {children}
    </motion.main>
  )
}