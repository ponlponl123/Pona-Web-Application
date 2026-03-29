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
          `theme-dot interactive hover:scale-105 active:scale-90`,
          isDark ? "dark" : "light",
          active ? "active" : "scale-90"
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
        <div className="tp-chip tp-chip-2-10"></div>
        <div className="tp-chip tp-chip-2-10"></div>
        <div className="tp-chip tp-chip-2-10"></div>
      </div>
      <div className="tp-body">
        <div className="flex flex-row justify-between">
          <div className="tp-chip tp-chip-3-10"></div>
          <div className="flex flex-row gap-2">
            <div className="tp-dot tp-dot-primary"></div>
            <div className="tp-dot tp-dot-success"></div>
            <div className="tp-dot tp-dot-danger"></div>
          </div>
        </div>
        <div className="tp-chip tp-chip-6-10 tp-foreground tp-sm"></div>
        <div className="flex flex-row gap-2">
          <div className="tp-chip tp-secondary tp-xs"></div>
          <div className="tp-chip tp-warning tp-xs"></div>
        </div>
        <div className="flex h-14 w-full flex-row gap-2">
          <div
            className="tp-chip tp-foreground flex rounded-lg"
            style={{ width: "24%", height: "100%", borderRadius: "6px" }}
          ></div>
          <div
            className="tp-chip flex rounded-lg"
            style={{ width: "86%", height: "100%", borderRadius: "6px" }}
          ></div>
        </div>
      </div>
      <div className="tp-footer">
        <div className="tp-chip tp-chip-2-10 tp-sm"></div>
        <div className="tp-chip tp-chip-3-10 tp-xs tp-foreground"></div>
      </div>
    </div>
  )
}
