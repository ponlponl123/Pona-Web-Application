"use client"
import { cn } from "@/lib/utils"
import type { Icon as IconType } from "@phosphor-icons/react"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { motion } from "motion/react"
import Link from "next/link"

interface ActivationLinkProps {
  href?: string
  children?: React.ReactNode
  icon?: IconType
  iconSize?: number
  onClick?: () => void
  className?: string
  isActive?: boolean
  iconOnly?: boolean
  isDisabled?: boolean
  layoutId?: string
}

function ActivationLink({
  href,
  children,
  icon: Icon,
  iconSize = 16,
  onClick,
  className = "",
  isActive = false,
  iconOnly = false,
  isDisabled = false,
  layoutId,
}: ActivationLinkProps) {
  const pathname = usePathname() || ""
  const buttonRef = useRef<HTMLButtonElement | null>(null)

  let isHere = href && pathname === href

  const Button = () => (
    <motion.button
      onClick={onClick}
      ref={buttonRef}
      className={cn(
        `flex h-9 w-full items-center justify-start gap-2 rounded-lg px-3 py-1.5 text-sm opacity-100 select-none hover:bg-foreground/10 max-md:my-1 max-md:h-12 max-md:px-6 dark:hover:bg-foreground/5`,
        isHere &&
          "bg-primary text-primary-foreground hover:bg-primary/80 dark:hover:bg-primary/80",
        iconOnly && "size-10",
        isDisabled && "pointer-events-none opacity-40",
        className
      )}
      disabled={isDisabled}
      data-smooth-interaction="true"
      layoutId={layoutId}
    >
      {iconOnly && Icon ? (
        <div className="m-auto">
          <Icon weight={isHere ? "fill" : "bold"} size={iconSize} />
        </div>
      ) : (
        <>
          {Icon && (
            <Icon
              weight={isHere ? "fill" : "bold"}
              className="mr-2"
              size={iconSize}
            />
          )}
          <div className="flex min-w-0 flex-1 items-center justify-start">
            {children}
          </div>
        </>
      )}
    </motion.button>
  )

  if (href && !isDisabled)
    return (
      <motion.div className="block w-full rounded-lg duration-0">
        <Link href={href}>
          <Button />
        </Link>
      </motion.div>
    )

  return (
    <motion.div className="block w-full rounded-lg duration-0">
      <Button />
    </motion.div>
  )
}

export default ActivationLink
