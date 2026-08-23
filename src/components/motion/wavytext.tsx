import { FC } from "react"
import { motion, Variants, HTMLMotionProps } from "motion/react"

interface Props extends HTMLMotionProps<"div"> {
  text: string
  delay?: number
  replay: boolean
  duration?: number
}

const WavyText: FC<Props> = ({
  text,
  delay = 0,
  duration = 0.05,
  replay,
  ...props
}: Props) => {
  const letters = Array.from(text)

  const container: Variants = {
    hidden: {
      opacity: 0,
    },
    visible: (i: number = 1) => ({
      opacity: 1,
      transition: { staggerChildren: duration, delayChildren: i * delay },
    }),
  }

  const child: Variants = {
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        damping: 8,
        stiffness: 120,
      },
    },
    hidden: {
      opacity: 0,
      y: 12,
      filter: "blur(4px)",
      transition: {
        type: "spring",
        damping: 8,
        stiffness: 120,
      },
    },
  }

  return (
    <motion.h1
      style={{ display: "flex", overflow: "hidden" }}
      variants={container}
      initial="hidden"
      animate={replay ? "visible" : "hidden"}
      {...props}
    >
      {letters.map((letter, index) => {
        const isEmoji = /\p{Emoji}/u.test(letter)
        return (
          <motion.span
            key={index}
            variants={child}
            className={isEmoji ? "font-mono" : ""}
          >
            {letter === " " ? "\u2002" : letter === "\n" ? ",\u2002" : letter}
          </motion.span>
        )
      })}
    </motion.h1>
  )
}

export default WavyText
