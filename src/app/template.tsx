'use client';
import { motion } from 'framer-motion';
import React from 'react';

const variants = {
  hidden: { opacity: 0, x: 0, y: 0 },
  enter: { opacity: 1, x: 0, y: 0 },
};

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.main
      variants={variants}
      initial='hidden'
      exit='hidden'
      animate='enter'
      transition={{ type: 'linear', duration: 0.25 }}
      key='LandingPage'
    >
      {children}
    </motion.main>
  );
}
