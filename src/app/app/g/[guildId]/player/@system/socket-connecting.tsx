"use client"
import React from 'react'
import { motion } from 'framer-motion'
import { Chip, Progress } from '@nextui-org/react';

function SocketConnecting() {
  return (
    <motion.div
      className='absolute w-full h-full top-0 left-0 flex flex-col gap-3 items-center justify-center bg-foreground/20'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.48, delay: 1 }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.64, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          duration: 0.48,
          delay: 1.96,
          type: 'spring'
        }}
      >
        <Chip color="default" variant="shadow">✨ Pona! Music</Chip>
      </motion.div>
      <motion.div
        className='relative bg-foreground/10 border-2 border-foreground/10 rounded-3xl p-8 overflow-hidden w-full max-w-96 flex flex-col gap-4 items-center justify-center'
        initial={{ opacity: 0, scale: 1.32 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.48,
          delay: 1.24,
          type: 'spring'
        }}
      >
        <Progress isIndeterminate aria-label="Loading..." className="w-full absolute top-0 left-0" size="sm" radius='full'
          classNames={{
            track:'bg-transparent'
          }}/>
        <h1 className='text-2xl text-center'>Trying to connect to socket service..</h1>
      </motion.div>
    </motion.div>
  )
}

export default SocketConnecting