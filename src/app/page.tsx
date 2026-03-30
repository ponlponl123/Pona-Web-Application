"use client"
import { useLanguageContext } from "@/contexts/languageContext"
import MyButton from "@/components/ui/custom/button"
import { ConfettiIcon, CookieIcon } from "@phosphor-icons/react/dist/ssr"
import { AnimatePresence, motion } from "framer-motion"
import Link from "next/link"
import React from "react"

import WavyText from "@/components/motion/wavytext"
import confetti from "canvas-confetti"
import { usePathname } from "next/navigation"

const TextVariants = {
  before: { y: 24, opacity: 0 },
  visible: { y: 0, opacity: 1 },
  hidden: { y: -24, opacity: 0 },
}

export default function Home() {
  const { language } = useLanguageContext()
  const pathname = usePathname() || ""
  const date = new Date()
  const hours = date.getHours()

  const TEXTS = language.data.home.features.before
  const TEXTS1 = language.data.home.features.after
  const [index, setIndex] = React.useState(0)

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      setIndex((prev) => prev + 1)
    }, 3200)

    return () => clearInterval(intervalId)
  }, [])

  React.useEffect(() => {
    const leaf = confetti.shapeFromPath({
      path: "M223.45,40.07a8,8,0,0,0-7.52-7.52C139.8,28.08,78.82,51,52.82,94a87.09,87.09,0,0,0-12.76,49A101.72,101.72,0,0,0,46.7,175.2a4,4,0,0,0,6.61,1.43l85-86.3a8,8,0,0,1,11.32,11.32L56.74,195.94,42.55,210.13a8.2,8.2,0,0,0-.6,11.1,8,8,0,0,0,11.71.43l16.79-16.79c14.14,6.84,28.41,10.57,42.56,11.07q1.67.06,3.33.06A86.93,86.93,0,0,0,162,203.18C205,177.18,227.93,116.21,223.45,40.07Z",
    })

    const duration = 4 * 1000
    const animationEnd = Date.now() + duration
    let skew = 24

    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min

    ;(function frame() {
      if (pathname !== "/") return
      const timeLeft = animationEnd - Date.now()
      const ticks = Math.max(64, 256 * (timeLeft / duration))
      skew = Math.max(0.8, skew - 0.001)

      confetti({
        particleCount: 1,
        startVelocity: 0,
        ticks: ticks,
        origin: {
          x: Math.random(),
          y: Math.random() * skew - 0.2,
        },
        colors: ["#FFB8E0"],
        shapes: [leaf],
        gravity: randomInRange(0.2, 0.6),
        scalar: randomInRange(0.4, 2.4),
        drift: randomInRange(-0.6, 0.6),
      })

      if (timeLeft > 0) {
        requestAnimationFrame(frame)
      }
    })()
  }, [pathname])

  return (
    <main className="relative mb-24 min-h-screen w-full">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          delay: 1,
          duration: 5,
          ease: "easeOut",
        }}
        className="pointer-events-none absolute top-0 left-0 h-full w-full overflow-hidden"
      >
        <motion.div
          initial={{ scale: 1.4 }}
          animate={{ scale: 1 }}
          transition={{
            duration: 5,
            ease: "easeOut",
          }}
          className="main-bg-2 pointer-events-none absolute top-0 left-0 h-full w-full"
        />
      </motion.div>
      <div className="relative flex min-h-screen items-center justify-center p-12 sm:p-20">
        <main className="relative row-start-2 flex h-[calc(100vh-6rem)] w-full flex-col items-center gap-8 sm:h-[calc(100vh-10rem)]">
          <motion.span
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 5 }}
            className="z-10 mt-6 flex items-center gap-2 rounded-xl border-2 border-white/30 bg-white/20 px-3 py-1 text-sm tracking-wider backdrop-blur backdrop-saturate-200"
          >
            <CookieIcon weight="fill" /> {language.data.cookie.description}
          </motion.span>
          <motion.div
            initial={{ scale: 1.12 }}
            animate={{ scale: 1 }}
            transition={{ delay: 2.86, duration: 3, type: "spring" }}
            className="m-auto flex flex-col"
          >
            <h3 className="-mt-12"></h3>
            <motion.div
              initial={{ opacity: 0, scale: 1.2 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.32, duration: 2 }}
              className="max-miniscreen:text-2xl m-0 flex flex-row justify-center text-center text-7xl leading-relaxed max-lg:text-6xl max-sm:text-4xl max-sm:leading-10"
            >
              <AnimatePresence presenceAffectsLayout mode="popLayout">
                {TEXTS.map(
                  (text, i) =>
                    index % TEXTS.length === i && (
                      <motion.div
                        key={"text1-" + i}
                        layout
                        initial="before"
                        animate="visible"
                        exit="hidden"
                        variants={TextVariants}
                      >
                        <WavyText
                          text={TEXTS[index % TEXTS.length]}
                          duration={0.12}
                          replay={true}
                        />
                      </motion.div>
                    )
                )}
                <motion.div
                  layout
                  key="text2"
                  initial="before"
                  animate="visible"
                  exit="hidden"
                  variants={TextVariants}
                >
                  <WavyText
                    text={
                      TEXTS[index % TEXTS.length] !== "" ? "Pona!" : "Pona! "
                    }
                    delay={1.32}
                    duration={0.12}
                    replay={true}
                  />
                </motion.div>
                {TEXTS1.map(
                  (text, i) =>
                    index % TEXTS1.length === i && (
                      <motion.div
                        key={"text2-" + i}
                        layout
                        initial="before"
                        animate="visible"
                        exit="hidden"
                        variants={TextVariants}
                      >
                        <WavyText
                          text={TEXTS1[index % TEXTS1.length]}
                          duration={0.12}
                          replay={true}
                        />
                      </motion.div>
                    )
                )}
              </AnimatePresence>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -6, marginTop: -82 }}
              animate={{ opacity: 1, x: 0, marginTop: 0 }}
              transition={{ delay: 4.86 }}
              className="text-primary-700 dark:text-primary-200 max-miniscreen:text-xl -mb-2 w-full items-center justify-center text-center text-xl leading-relaxed max-lg:mt-3 max-lg:text-lg max-sm:text-sm max-sm:leading-10"
            >
              <WavyText
                className="flex flex-wrap justify-center text-center"
                duration={0.04}
                delay={4.64}
                text={
                  hours > 4 && hours < 10
                    ? language.data.home.welcome_message.morning
                    : hours > 9 && hours < 16
                      ? language.data.home.welcome_message.afternoon
                      : hours > 15 && hours < 20
                        ? language.data.home.welcome_message.evening
                        : language.data.home.welcome_message.night
                }
                replay={true}
              />
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 5 }}
            className="flex flex-row items-center gap-4 max-sm:flex-col"
          >
            <Link
              href="/invite"
              rel="noopener noreferrer"
              className="max-sm:mx-auto"
            >
              <MyButton
                variant="normal"
                style="rounded"
                size="medium"
                effect="confetti"
                className="btn-responsive max-sm:scale-90"
              >
                <ConfettiIcon weight="fill" alt="Confetti" />
                {language.data.home.actions.invite}
              </MyButton>
            </Link>
            <div className="flex gap-4 sm:contents">
              <motion.span
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 5.06 }}
              >
                {language.data.home.actions.or}
              </motion.span>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 5.12 }}
              >
                <Link
                  href="/app"
                  rel="noopener noreferrer"
                  className="block rounded-lg px-2 py-1 tracking-wider hover:bg-foreground/5 hover:text-foreground/80 active:text-foreground/50"
                  data-smooth-interaction="true"
                >
                  {language.data.home.actions.login}
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </main>
      </div>
    </main>
  )
}
