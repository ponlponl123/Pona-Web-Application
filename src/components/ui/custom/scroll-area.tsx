import { cn } from "@/lib/utils"
import { ScrollArea } from "@base-ui/react/scroll-area"
import { forwardRef } from "react"

const CustomScrollArea = forwardRef<
  HTMLDivElement,
  {
    children: React.ReactNode
    className?: string
    classNames?: {
      root?: string
      viewport?: string
      scrollbar?: string
      thumb?: string
      render?: string
    }
  }
>(({ children, className, classNames }, forwardedRef) => {
  return (
    <ScrollArea.Root className={cn(className, classNames?.root)}>
      <ScrollArea.Viewport
        ref={forwardedRef}
        render={<div className={cn("overflow-auto", classNames?.render)} />}
        className={cn("h-full rounded-md", classNames?.viewport)}
      >
        {children}
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar
        className={cn(
          "pointer-events-none m-2 flex w-1 justify-center rounded-sm bg-transparent opacity-0 transition-opacity data-hovering:pointer-events-auto data-hovering:opacity-100 data-hovering:delay-0 data-scrolling:pointer-events-auto data-scrolling:opacity-100 data-scrolling:duration-0",
          classNames?.scrollbar
        )}
      >
        <ScrollArea.Thumb
          className={cn(
            "w-full rounded-sm bg-foreground/20",
            classNames?.thumb
          )}
        />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  )
})

CustomScrollArea.displayName = "CustomScrollArea"

export default CustomScrollArea
