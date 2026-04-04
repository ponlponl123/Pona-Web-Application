import { cn } from "@/lib/utils"
import { CircleNotchIcon, IconProps } from "@phosphor-icons/react"

function Spinner({ className, ...props }: IconProps) {
  return (
    <CircleNotchIcon
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  )
}

export { Spinner }
