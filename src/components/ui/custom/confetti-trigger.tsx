/**
 * @experimental This component is still in development.
 */

import React, {
  ReactNode,
  MouseEvent,
  ComponentProps,
} from "react"
import confetti from "canvas-confetti"

export type ConfettiTriggerProps<T extends React.ElementType = "button"> =
  ComponentProps<T> & {
    asChild?: boolean
    children?: ReactNode
    particleCount?: number
    spread?: number
    as?: T
  }

const ConfettiTrigger = <T extends React.ElementType = "button">({
  children,
  asChild = false,
  particleCount = 100,
  spread = 240,
  ...props
}: ConfettiTriggerProps<T>) => {
  const handleConfetti = (event: MouseEvent<HTMLElement>) => {
    const element = event.currentTarget as HTMLElement
    const rect = element.getBoundingClientRect()

    const originX = (rect.left + rect.width * 0.5) / window.innerWidth
    const originY = (rect.top + rect.height * 0.5) / window.innerHeight

    confetti({
      particleCount,
      spread,
      origin: { x: originX, y: originY },
    })
  }

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    handleConfetti(event)

    const rawOnClick = (props as Record<string, unknown>).onClick
    if (typeof rawOnClick === "function") {
      (rawOnClick as (e: MouseEvent<HTMLElement>) => void)(event)
    }
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      onClick: handleClick,
    } as React.HTMLAttributes<HTMLElement>)
  }

  const Component = ((props as Record<string, unknown>).as as React.ElementType) || "button"

  return React.createElement(Component, { ...props, onClick: handleClick }, children)
}

export default ConfettiTrigger
