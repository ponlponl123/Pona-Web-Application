"use client"
import React from 'react'
import CountUp from 'react-countup'
import { motion } from 'framer-motion'
import { Chip, Progress } from '@nextui-org/react'
import { Plugs, Warning } from '@phosphor-icons/react/dist/ssr'
import { useLanguageContext } from '@/contexts/languageContext'

function SocketConnecting() {
  const { language } = useLanguageContext();
  const [ timedOut, setTimedOut ] = React.useState<boolean>(false);
  return (
    <motion.div
      className='absolute w-full h-full top-0 left-0 flex flex-col gap-3 items-center justify-center bg-background/20'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.48, delay: 1 }}
    >
      {
        timedOut ? (
          <>
            <motion.div
              className='relative bg-primary/10 border-2 border-primary/10 rounded-3xl p-8 overflow-hidden w-full max-w-96 flex flex-col gap-4 items-center justify-center'
              initial={{ opacity: 0, scale: 1.32 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.48,
                delay: 1.24,
                type: 'spring'
              }}
            >
              <Warning size={32} />
              <h1 className='text-2xl text-center'>{language.data.app.guilds.player.socket.failed.title}</h1>
              <h3 className='text-lg text-center'>{language.data.app.guilds.player.socket.failed.description}</h3>
            </motion.div>
          </>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, scale: 0.64, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                duration: 0.48,
                delay: 1.96,
                type: 'spring'
              }}
            >
              <Chip color="primary" variant="shadow" startContent={<Plugs size={14} weight='fill' className='mx-1' />}> {language.data.app.guilds.player.socket.connecting.chip} (<CountUp start={0} end={300} duration={1000} useEasing={false} onEnd={()=>{setTimedOut(true)}} />{language.data.app.guilds.player.socket.connecting.sec})</Chip>
            </motion.div>
            <motion.div
              className='relative bg-primary/10 border-2 border-primary/10 rounded-3xl p-8 overflow-hidden w-full max-w-96 flex flex-col gap-4 items-center justify-center'
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
              <h1 className='text-2xl text-center'>{language.data.app.guilds.player.socket.connecting.title}</h1>
            </motion.div>
          </>
        )
      }
    </motion.div>
  )
}

export default SocketConnecting