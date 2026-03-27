import React, { JSX, ReactElement } from "react"
import confetti from "canvas-confetti"

interface ConfettiButtonProps {
  children?: React.ReactNode
}

function ConfettiButtonTrigger({ children }: ConfettiButtonProps) {
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const element = event.currentTarget
    const boundingClientRect = element.getBoundingClientRect()
    const originX =
      (boundingClientRect.left + 0.5 * boundingClientRect.width) /
      window.innerWidth
    const originY =
      (boundingClientRect.top + 0.5 * boundingClientRect.height) /
      window.innerHeight

    confetti({
      particleCount: 100,
      spread: 240,
      origin: {
        y: originY,
        x: originX,
      },
    })
  }

  return <div onClick={handleClick}>{children}</div>
}

export default ConfettiButtonTrigger
