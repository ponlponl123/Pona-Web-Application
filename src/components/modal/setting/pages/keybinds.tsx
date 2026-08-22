"use client"
import { InfoIcon, KeyboardIcon } from "@phosphor-icons/react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { Badge } from "@/components/ui/badge"
import { motion } from "motion/react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useAppStore } from "@/store/coreStore"

interface Keybind {
  key: string
  title: string
  description?: string
  defaultKeys: string[]
  isReadonly: boolean
  isDisabled: boolean
}

interface Keybinds {
  category: string
  key: string
  keys: Keybind[]
}

type DelayData = {
  categoryDelay: number
  keyDelays: number[]
}

function KeyBinds() {
  const language = useAppStore((state) => state.language)

  const keybinds: Keybinds[] = [
    {
      category: language.data.app.setting.keybinds.category.appearance,
      key: "appearance",
      keys: [
        {
          key: "dark-light-toggle",
          title:
            language.data.app.setting.keybinds.keys.dark_light_toggle.title,
          description:
            language.data.app.setting.keybinds.keys.dark_light_toggle
              .description,
          defaultKeys: ["D"],
          isReadonly: true,
          isDisabled: false,
        },
      ],
    },
  ]

  const animationData = keybinds.reduce(
    (acc, category) => {
      acc.time += 0.024
      const categoryDelay = Number(acc.time.toFixed(3))

      const keyDelays = (category.keys || []).map(() => {
        acc.time += 0.032
        return Number(acc.time.toFixed(3))
      })

      acc.result.push({ categoryDelay, keyDelays })

      return acc
    },
    { time: 0, result: [] as DelayData[] }
  )

  const PreCalcCategoryDelays = animationData.result
  const TOTAL_ANIMATION_DELAY = Number((animationData.time + 0.08).toFixed(3))

  return (
    <section
      className="mx-auto flex min-h-full w-full max-w-lg flex-col gap-2 p-6"
      id="keybinds"
      data-section
    >
      <div className="flex w-full gap-2 max-md:flex-col-reverse md:items-center md:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h1 className="m-0 text-2xl">
            {language.data.app.setting.keybinds.title}
          </h1>
          <p className="text-foreground/40">
            {language.data.app.setting.keybinds.description}
          </p>
        </div>
        <KeyboardIcon weight="fill" className="size-12 little-font:translate-y-1.5" />
      </div>
      <Alert className="mt-4 rounded-xl">
        <InfoIcon weight="fill" className="mt-0.5" />
        <AlertDescription className="tracking-wider">
          {language.data.app.setting.keybinds.announcement}
        </AlertDescription>
      </Alert>
      <div className="flex flex-col gap-4" id="keybinds-list" data-section>
        {keybinds.map((keybind_category, i) => (
          <motion.div
            initial={{ opacity: 0, y: 6, filter: "blur(3px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 6, filter: "blur(3px)" }}
            transition={{
              delay: PreCalcCategoryDelays[i].categoryDelay,
              duration: 0.25,
              ease: "easeOut",
            }}
            id={keybind_category.key}
            data-section
            className="mt-6"
            key={"keybind-" + i}
          >
            <h1 className="text-foreground/40">{keybind_category.category}</h1>
            {keybind_category.keys.map((keybind, index) => (
              <motion.div
                initial={{ opacity: 0, y: 6, filter: "blur(3px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: 6, filter: "blur(3px)" }}
                transition={{
                  delay: PreCalcCategoryDelays[i].keyDelays[index],
                  duration: 0.25,
                  ease: "easeOut",
                }}
                className="my-2 flex items-center justify-between gap-2 rounded-lg px-3 py-2 hover:bg-foreground/5 dark:hover:bg-foreground/10"
                key={"keybind-" + i + "-key-" + index}
              >
                <div>
                  <div className="flex flex-wrap gap-x-2">
                    <h1>{keybind.title}</h1>
                    {keybind.isReadonly && (
                      <Tooltip>
                        <TooltipTrigger delay={0}>
                          <Badge className="rounded-full bg-foreground/10 text-foreground">
                            {language.data.app.setting.keybinds.readonly}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          {
                            language.data.app.setting.keybinds
                              .readonly_description
                          }
                        </TooltipContent>
                      </Tooltip>
                    )}
                    {keybind.isDisabled && (
                      <Tooltip>
                        <TooltipTrigger delay={0}>
                          <Badge className="rounded-full bg-foreground/10 text-foreground">
                            {language.data.app.setting.keybinds.disabled}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          {
                            language.data.app.setting.keybinds
                              .disabled_description
                          }
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  {keybind.description && (
                    <span className="text-sm text-foreground/40">
                      {keybind.description}
                    </span>
                  )}
                </div>
                <div>
                  <KbdGroup>
                    {keybind.defaultKeys
                      .join(" + ")
                      .split(" ")
                      .map((key, keyindex) =>
                        key === "+" ? (
                          <span
                            key={
                              "keybind-" +
                              i +
                              "-key-" +
                              index +
                              "-kbd-" +
                              keyindex
                            }
                          >
                            +
                          </span>
                        ) : (
                          <Kbd
                            key={
                              "keybind-" +
                              i +
                              "-key-" +
                              index +
                              "-kbd-" +
                              keyindex
                            }
                            className="rounded-sm bg-muted p-1"
                          >
                            {key}
                          </Kbd>
                        )
                      )}
                  </KbdGroup>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ))}
      </div>
    </section>
  )
}

export default KeyBinds
