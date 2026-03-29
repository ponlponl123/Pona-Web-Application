import { CollectedTheme, Themes } from "@/types/theme"
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip"
import { MouseEventHandler } from "react"
import { cn } from "@/lib/utils"

export function ThemeDot({
  theme,
  isDark,
  active,
  onClick,
  className,
}: {
  theme: CollectedTheme
  isDark: boolean
  active?: boolean
  onClick?: MouseEventHandler<HTMLButtonElement>
  className?: string
}) {
  return (
    <Tooltip data-theme={theme.name}>
      <TooltipTrigger
        onClick={onClick}
        data-theme={theme.name}
        className={cn(
          `theme-dot interactive hover:opacity-100 active:scale-90`,
          isDark ? "dark" : "light",
          active
            ? "active"
            : "scale-90 opacity-60 hover:scale-95 active:scale-80"
        )}
        delay={0}
        data-smooth-interaction="true"
      >
        <div>
          <div></div>
          <div></div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className={`z-10 capitalize ${className}`}>
        {theme.value.replaceAll(/[-_]/g, " ")}
      </TooltipContent>
    </Tooltip>
  )
}

export function ThemePreview({
  theme,
  className,
}: {
  theme: string
  className?: string
}) {
  return (
    <div
      className={cn(`theme-preview bg-background`, theme, className)}
      data-theme={theme}
    >
      <div className="tp-header">
        <div className="tp-chip tp-chip-2-10 bg-foreground/20"></div>
        <div className="tp-chip tp-chip-2-10 bg-foreground/20"></div>
        <div className="tp-chip tp-chip-2-10 bg-foreground/20"></div>
      </div>
      <div className="tp-body">
        <div className="flex flex-row justify-between">
          <div className="tp-chip tp-chip-3-10 bg-foreground/40"></div>
          <div className="flex flex-row gap-2">
            <div className="tp-dot tp-dot-primary"></div>
            <div className="tp-dot tp-dot-success"></div>
            <div className="tp-dot tp-dot-danger"></div>
          </div>
        </div>
        <div className="tp-chip tp-chip-6-10 tp-foreground tp-sm bg-foreground/20"></div>
        <div className="flex flex-row gap-2">
          <div className="tp-chip tp-secondary tp-xs"></div>
          <div className="tp-chip tp-warning tp-xs"></div>
        </div>
        <div className="flex h-14 w-full flex-row gap-2">
          <div
            className="tp-chip tp-foreground flex rounded-lg bg-foreground/20"
            style={{ width: "24%", height: "100%", borderRadius: "6px" }}
          ></div>
          <div
            className="tp-chip flex rounded-lg bg-foreground/20"
            style={{ width: "86%", height: "100%", borderRadius: "6px" }}
          ></div>
        </div>
      </div>
      <div className="tp-footer">
        <div className="tp-chip tp-chip-2-10 tp-sm bg-foreground/40"></div>
        <div className="tp-chip tp-chip-3-10 tp-xs tp-foreground bg-foreground/20"></div>
      </div>
    </div>
  )
}
