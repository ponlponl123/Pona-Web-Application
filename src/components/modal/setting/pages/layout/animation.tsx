"use client"
import { BirdIcon } from "@phosphor-icons/react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { useAppStore } from "@/store/coreStore"

function Animation() {
  const language = useAppStore((state) => state.language)
  const userSetting = useAppStore((state) => state.userSetting)
  const setUserSetting = useAppStore((state) => state.setUserSetting)

  return (
    <section
      className="mx-auto flex w-full max-w-lg flex-col gap-2 p-6"
      id="layout-player"
      data-section
    >
      <div className="mx-auto flex w-full max-w-lg gap-2 max-md:flex-col-reverse md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="m-0 text-2xl">
            {language.data.app.setting.layout.animation.title}
          </h1>
        </div>
        <BirdIcon weight="fill" className="size-6 translate-y-1.5" />
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
          data-smooth-interaction="true"
          className="group/label rounded-xl! border-2! pl-1 not-data-active:border-border/40 hover:scale-101 hover:bg-foreground/5 active:scale-96"
        >
          <Field orientation="horizontal">
            <FieldContent>
              <FieldTitle>
                {language.data.app.setting.layout.transparency.enabled.title}
              </FieldTitle>
              <FieldDescription>
                {
                  language.data.app.setting.layout.transparency.enabled
                    .description
                }
              </FieldDescription>
            </FieldContent>
            <RadioGroupItem value="true" className="hidden" id="enabled" />
          </Field>
        </FieldLabel>
        <FieldLabel
          htmlFor="disabled"
          data-smooth-interaction="true"
          className="group/label rounded-xl! border-2! pl-1 not-data-active:border-border/40 hover:scale-101 hover:bg-foreground/5 active:scale-96"
        >
          <Field orientation="horizontal">
            <FieldContent>
              <FieldTitle>
                {language.data.app.setting.layout.transparency.disabled.title}
              </FieldTitle>
              <FieldDescription>
                {
                  language.data.app.setting.layout.transparency.disabled
                    .description
                }
              </FieldDescription>
            </FieldContent>
            <RadioGroupItem value="false" className="hidden" id="disabled" />
          </Field>
        </FieldLabel>
      </RadioGroup>
    </section>
  )
}

export default Animation
