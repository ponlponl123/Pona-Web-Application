"use client"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  ClockUserIcon,
  GlobeStandIcon,
  HandWavingIcon,
  SmileySadIcon,
} from "@phosphor-icons/react"
import React from "react"
import { Input } from "react-smooth-input"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { motion } from "motion/react"
import { langs } from "@/lib/i18n"
import { useAppStore } from "@/store/coreStore"
import { TimeFormat } from "@/types/settings"

function LanguageAndTime() {
  const language = useAppStore((state) => state.language)
  const setLanguage = useAppStore((state) => state.setLanguage)
  const userSetting = useAppStore((state) => state.userSetting)
  const setUserSetting = useAppStore((state) => state.setUserSetting)
  const [filterLangs, setFilterLangs] = React.useState("")
  const debounceRef = React.useRef<NodeJS.Timeout | null>(null)

  const timeFormatValue = String(userSetting.timeformat)

  React.useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    debounceRef.current = setTimeout(() => { }, 300)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [filterLangs])

  const AvailableLangs = React.useMemo(() => {
    if (!filterLangs.trim()) return langs

    const searchQuery = filterLangs.toLowerCase().trim()

    return langs.filter((lang) => {
      const labelMatch = lang.label.toLowerCase().includes(searchQuery)
      const keyMatch = lang.key.toLowerCase().includes(searchQuery)
      const countryMatch = lang.country.toLowerCase().includes(searchQuery)

      const words = searchQuery.split(/\s+/)
      const partialMatch = words.some((word) =>
        lang.label.toLowerCase().includes(word)
      )

      return labelMatch || keyMatch || countryMatch || partialMatch
    })
  }, [filterLangs])

  return (
    <div>
      <section
        className="mx-auto flex min-h-full w-full max-w-lg flex-col gap-2 p-6"
        id="time-format"
        data-section
      >
        <div className="flex w-full gap-2 max-md:flex-col-reverse md:items-center md:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <h1 className="m-0 text-2xl">
              {language.data.app.setting.language_time.time.title}
            </h1>
            <p className="text-foreground/40">
              {language.data.app.setting.language_time.time.description}
            </p>
          </div>
          <ClockUserIcon weight="fill" className="size-12 little-font:translate-y-1.5" />
        </div>

        <RadioGroup
          value={timeFormatValue}
          className="w-fit gap-3 p-2"
          onValueChange={(v) => {
            let target: TimeFormat = "auto"
            switch (v) {
              case "auto":
                target = "auto"
                break
              case "12":
                target = 12
                break
              case "24":
                target = 24
                break
            }
            setUserSetting({
              ...userSetting,
              timeformat: target,
            })
          }}
        >
          <Field orientation="horizontal">
            <RadioGroupItem value="auto" id="desc-r1" />
            <FieldContent>
              <FieldLabel htmlFor="desc-r1" className="tracking-wider">
                {language.data.app.setting.language_time.time.options.auto}
              </FieldLabel>
            </FieldContent>
          </Field>
          <Field orientation="horizontal">
            <RadioGroupItem value="12" id="desc-r2" />
            <FieldContent>
              <FieldLabel htmlFor="desc-r2" className="tracking-wider">
                {language.data.app.setting.language_time.time.options["12"]}
              </FieldLabel>
            </FieldContent>
          </Field>
          <Field orientation="horizontal">
            <RadioGroupItem value="24" id="desc-r3" />
            <FieldContent>
              <FieldLabel htmlFor="desc-r3" className="tracking-wider">
                {language.data.app.setting.language_time.time.options["24"]}
              </FieldLabel>
            </FieldContent>
          </Field>
        </RadioGroup>
      </section>
      <section
        className="mx-auto flex min-h-full w-full max-w-lg flex-col gap-2 p-6"
        id="language"
        data-section
      >
        <div className="flex w-full gap-2 max-md:flex-col-reverse md:items-center md:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="m-0 text-2xl">
              {language.data.app.setting.language_time.language.title}
            </h1>
            <p className="text-foreground/40">
              {language.data.app.setting.language_time.language.description}
            </p>
          </div>
          <GlobeStandIcon weight="fill" className="size-12 little-font:translate-y-1.5" />
        </div>
        <Input
          type="text"
          className="font-sans"
          defaultValue={filterLangs}
          placeholder={language.data.modal["language-selector"].filter}
          fontStyle={{
            fontFamily:
              "var(--font-app), sans-serif",
            fontWeight: "bold",
            fontSize: "14px",
            letterSpacing: "1px",
          }}
          onChange={(e) => setFilterLangs(e.target.value)}
        />
        <div
          className={cn(
            "pb-16",
            AvailableLangs.length > 0
              ? "grid grid-cols-2 gap-2 max-sm:grid-cols-1"
              : "w-full"
          )}
        >
          {AvailableLangs.length > 0 ? (
            AvailableLangs.map((lang, i) => (
              <motion.div
                initial={{ opacity: 0, y: 6, filter: "blur(3px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: 6, filter: "blur(3px)" }}
                transition={{
                  delay: i * 0.05,
                  duration: 0.25,
                  ease: "easeOut",
                }}
                key={"lang-select-" + i}
              >
                <Button
                  variant={language.key === lang.key ? "default" : "ghost"}
                  data-smooth-interaction="true"
                  className={cn(
                    "flex w-full justify-start gap-3 rounded-xl border-2 border-transparent px-4 py-6 not-dark:hover:bg-foreground/5",
                    language.key === lang.key &&
                    "border-foreground/40 bg-foreground/10 text-foreground"
                  )}
                  onClick={() => setLanguage(lang.key)}
                >
                  <Avatar className={"h-6 w-6"}>
                    <AvatarImage
                      src={"https://flagcdn.com/" + lang.country + ".svg"}
                      alt={lang.label}
                    />
                    <AvatarFallback>{lang.key.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-wrap gap-x-1">
                    {lang.label}
                    {lang.looking_for_translator && (
                      <Badge
                        variant={"secondary"}
                        className="rounded-full bg-amber-400/20 text-amber-400"
                      >
                        <HandWavingIcon size={32} weight="fill" />
                        {
                          language.data.modal["language-selector"]
                            .looking_for_translator
                        }
                      </Badge>
                    )}
                  </div>
                </Button>
              </motion.div>
            ))
          ) : (
            <div className="flex w-full flex-col items-center justify-center gap-2 p-6">
              <SmileySadIcon size={32} />
              <h1>{language.data.modal["language-selector"].not_found}</h1>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default LanguageAndTime
