"use client"
import {
  CursorIcon,
} from "@phosphor-icons/react"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { useAppStore } from "@/store/coreStore"
import { Switch } from "@/components/ui/switch"
import { useThemeContext } from "@/components/theme-provider"
import { CursorClickIcon, CursorClickIconHandle } from "@/components/ui/cursor-click"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { useRef } from "react"

function Pointer() {
  const language = useAppStore((state) => state.language)
  const { isPointerClickSpark, setIsPointerClickSpark } =
    useThemeContext()

  const CursorIconRef = useRef<CursorClickIconHandle>(null)

  return (
    <section
      className="mx-auto flex w-full max-w-lg flex-col gap-2 p-6"
      id="layout-pointer"
      data-section
    >
      <div className="mx-auto flex w-full max-w-lg gap-2 max-md:flex-col-reverse md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <h1 className="m-0 text-2xl">
              {language.data.app.setting.layout.pointer.title}
            </h1>
          </div>
        </div>
        <CursorIcon weight="fill" className="size-6 little-font:translate-y-1.5" />
      </div>
      <FieldGroup className="mx-auto w-full max-w-lg gap-2">
        <FieldLabel
          htmlFor="pointer-click-spark-switch"
          className="group/label rounded-xl! border-2! pl-1 not-data-active:border-border/40 hover:scale-101 hover:bg-foreground/5 active:scale-96"
          data-smooth-interaction="true"
        >
          <Field orientation="horizontal">
            <FieldContent>
              <FieldTitle className="text-base">
                <div className="flex flex-wrap items-center gap-x-2">
                  <CursorClickIcon
                    size={16}
                    ref={CursorIconRef}
                    className="-mr-0.5 size-4 little-font:translate-y-0.5"
                  />
                  <h1>
                    {language.data.app.setting.layout.pointer.click_spark.title}
                  </h1>
                  <Tooltip>
                    <TooltipTrigger delay={0}>
                      <Badge className="rounded-full bg-foreground/10 text-foreground">
                        {isPointerClickSpark
                          ? language.data.common.enabled
                          : language.data.common.disabled}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isPointerClickSpark
                        ? language.data.common.enabled_description
                        : language.data.common.disabled_description}
                    </TooltipContent>
                  </Tooltip>
                </div>
              </FieldTitle>
              <FieldDescription className="pt-1">
                {language.data.app.setting.layout.pointer.click_spark.description}
              </FieldDescription>
            </FieldContent>
            <Switch
              id="pointer-click-spark-switch"
              data-smooth-interaction="true"
              className="group-active/label:scale-80"
              onCheckedChange={(v) => {
                setIsPointerClickSpark(v)
                if (v) CursorIconRef.current?.startAnimation()
              }}
              checked={isPointerClickSpark}
            />
          </Field>
        </FieldLabel>
      </FieldGroup>
    </section>
  )
}

export default Pointer
