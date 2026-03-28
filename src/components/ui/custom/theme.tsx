import { Themes } from "@/types/theme"
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip"
import { MouseEventHandler } from "react"

export function ThemeDot({
  theme,
  active,
  onClick,
  className,
}: {
  theme: string
  active?: boolean
  onClick?: MouseEventHandler<HTMLButtonElement>
  className?: string
}) {
  return (
    <Tooltip data-theme={theme}>
      <TooltipTrigger>
        <button
          onClick={onClick}
          data-theme={theme}
          className={`theme-dot interactive ${theme} ${active ? "active" : ""}`}
        >
          <div>
            <div></div>
            <div></div>
          </div>
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className={`z-10 capitalize ${className}`}>
        {theme.replaceAll(/[-_]/g, " ")}
      </TooltipContent>
    </Tooltip>
  )
}

export function ThemePreview({ theme }: { theme: string }) {
  return (
    <div className={`theme-preview bg-background ${theme}`} data-theme={theme}>
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
