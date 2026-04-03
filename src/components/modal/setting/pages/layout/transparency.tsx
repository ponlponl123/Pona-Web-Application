"use client"
import { useLanguageContext } from "@/contexts/languageContext"
import {
  CubeTransparentIcon,
  ShapesIcon,
  WarningIcon,
} from "@phosphor-icons/react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { useUserSettingContext } from "@/contexts/userSettingContext"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

function Transparency() {
  const { language } = useLanguageContext()
  const { userSetting, setUserSetting } = useUserSettingContext()

  return (
    <section
      className="mx-auto flex w-full max-w-lg flex-col gap-2 p-6"
      id="layout-transparency"
      data-section
    >
      <div className="mx-auto flex w-full max-w-lg gap-2 max-md:flex-col-reverse md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <h1 className="m-0 text-2xl">
              {language.data.app.setting.layout.transparency.title}
            </h1>
            <Tooltip>
              <TooltipTrigger delay={0}>
                <WarningIcon weight="bold" className="mt-1 text-amber-400" />
              </TooltipTrigger>
              <TooltipContent>
                {language.data.app.setting.layout.locked}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        <CubeTransparentIcon weight="fill" className="size-6 translate-y-1.5" />
      </div>
      <RadioGroup
        className="mx-auto mt-2 w-full max-w-lg"
        value={String(userSetting.transparency) || "true"}
        onValueChange={(value) =>
          setUserSetting({ ...userSetting, transparency: value === "true" })
        }
      >
        <FieldLabel
          htmlFor="enabled"
          data-disabled
          data-smooth-interaction="true"
          className="group/label rounded-xl! border-2! pl-1 not-data-active:border-border/40 hover:scale-101 hover:bg-foreground/5 active:scale-96 data-disabled:pointer-events-none! data-disabled:opacity-40!"
        >
          <Field orientation="horizontal">
            <FieldContent>
              <FieldTitle className="text-base">
                <ShapesIcon weight="bold" className="size-4 translate-y-0.5" />
                {language.data.app.setting.layout.transparency.enabled.title}
              </FieldTitle>
              <FieldDescription>
                {
                  language.data.app.setting.layout.transparency.enabled
                    .description
                }
              </FieldDescription>
            </FieldContent>
            <RadioGroupItem
              disabled
              value="true"
              className="hidden"
              id="enabled"
            />
          </Field>
        </FieldLabel>
        <FieldLabel
          htmlFor="disabled"
          data-disabled
          data-smooth-interaction="true"
          className="group/label rounded-xl! border-2! pl-1 not-data-active:border-border/40 hover:scale-101 hover:bg-foreground/5 active:scale-96 data-disabled:pointer-events-none! data-disabled:opacity-40!"
        >
          <Field orientation="horizontal">
            <FieldContent>
              <FieldTitle className="text-base">
                <ShapesIcon weight="fill" className="size-4 translate-y-0.5" />
                {language.data.app.setting.layout.transparency.disabled.title}
              </FieldTitle>
              <FieldDescription>
                {
                  language.data.app.setting.layout.transparency.disabled
                    .description
                }
              </FieldDescription>
            </FieldContent>
            <RadioGroupItem
              disabled
              value="false"
              className="hidden"
              id="disabled"
            />
          </Field>
        </FieldLabel>
      </RadioGroup>
    </section>
  )
}

export default Transparency
