/**
 * @experimental This component is still in development.
 */
// @ts-nocheck
// @ts-ignore
import React, {
  ReactNode,
  ReactElement,
  MouseEvent,
  ComponentProps,
  ElementType,
} from "react"
import confetti from "canvas-confetti"

type AsChildProps<T extends React.ElementType> = {
  asChild?: boolean
  children?: ReactElement | ((props: ComponentProps<T>) => ReactElement)
}

interface ConfettiTriggerProps<T extends React.ElementType = "button">
  extends Omit<ComponentProps<T>, "children">, AsChildProps<T> {
  children?: ReactNode
  particleCount?: number
  spread?: number
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

    if (typeof props.onClick === "function") {
      props.onClick(event)
    }
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      onClick: handleClick,
    } as any)
  }

  const Component = (props.as as T) || "button"

  return (
    <Component {...props} onClick={handleClick}>
      {children}
    </Component>
  )
}

export default ConfettiTrigger
