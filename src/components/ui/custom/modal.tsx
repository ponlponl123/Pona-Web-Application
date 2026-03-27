"use client"
import React from "react"
import { Button } from "../button"
import { AnimatePresence, motion } from "motion/react"
import CustomScrollArea from "./scroll-area"
import { cn } from "@/lib/utils"

function Modal({
  children,
  className,
  classNames,
  layoutId,
  isOpen,
  setIsOpen,
}: {
  children: React.ReactNode
  className?: string
  classNames?: {
    root?: string
    base?: string
  }
  layoutId?: string
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className={cn(
            "fixed inset-0 z-1000 flex overflow-hidden overflow-y-auto bg-black/40 p-2 backdrop-blur-md",
            classNames?.root
          )}
        >
          <motion.div
            layoutId={layoutId}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "m-auto flex max-h-[calc(100vh-2rem)] min-h-96 w-full max-w-md flex-col overflow-hidden rounded-4xl border-2 border-foreground/10 bg-card/90 shadow-xl",
              classNames?.base,
              className
            )}
            tabIndex={-1}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function ModalHeader({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex h-max flex-none flex-col p-6 pb-0", className)}>
      {children}
    </div>
  )
}

function ModalTitle({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <h1 className={cn("mb-2 text-3xl font-bold text-foreground", className)}>
      {children}
    </h1>
  )
}

function ModalDescription({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <p className={cn("text-sm text-foreground", className)}>{children}</p>
}

function ModalBody({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <CustomScrollArea
      className={cn("mt-6 flex min-h-0 flex-1 flex-col", className)}
    >
      {children}
    </CustomScrollArea>
  )
}

function ModalFooter({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "mt-6 flex h-max w-full flex-none justify-end gap-2 p-6 pt-0",
        className
      )}
    >
      {children}
    </div>
  )
}

Modal.Header = ModalHeader
Modal.Title = ModalTitle
Modal.Description = ModalDescription
Modal.Body = ModalBody
Modal.Footer = ModalFooter

export default Modal
export { Modal }

export { ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter }
