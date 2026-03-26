"use client"
import React from "react"
import { useLanguageContext } from "@/contexts/languageContext"
import { PatchNoteGroup, PatchNoteVersion } from "../api/patchnote/s/route"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  BellSimpleIcon,
  SmileyXEyesIcon,
  WrenchIcon,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ClockLoader } from "react-spinners"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import UpdateSubscribeModal from "@/components/modal/update-subscribe"

export interface Translations {
  [key: string]: string
}

function Page() {
  const { language } = useLanguageContext()
  const [data, setData] = React.useState<PatchNoteGroup[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState(false)
  const [isCardHover, setIsCardHover] = React.useState(false)
  const [isUpdateSubscribeOpen, setUpdateSubscribeOpen] = React.useState(false)

  React.useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch("/api/patchnote/s")
        if (!response.ok) {
          throw new Error("HTTP error!")
        }
        const data = await response.json()
        setData(data.available_notes)
        setIsLoading(false)
      } catch {
        setError(true)
        setIsLoading(false)
      }
    }
    setIsCardHover(false)
    fetchNotes()
  }, [])

  return (
    <main className="min-h-screen w-full">
      <div className="mb-20 flex min-h-screen grid-rows-[20px_1fr_20px] flex-col items-center gap-8 p-8 pb-20 max-md:gap-4 sm:p-6 md:p-20">
        <div className="mt-6 max-md:mt-12" />
        <WrenchIcon size={48} weight="fill" />
        <h1 className="text-2xl">{language.data.app.updates.name}</h1>
        <div className="flex items-center justify-between gap-12 lg:flex-wrap">
          <h2 className="flex items-center gap-4 text-center text-5xl max-md:text-3xl">
            {language.data.app.updates.latest}: Pre-Release{" "}
            {process.env.NEXT_PUBLIC_APP_VERSION}
          </h2>
        </div>
        <motion.div layoutId="update-subscribe">
          <Button
            size="lg"
            className="rounded-full max-lg:min-w-max max-lg:p-4"
            onClick={() => setUpdateSubscribeOpen(true)}
          >
            <BellSimpleIcon weight="fill" />
            <span className="text-primary-foreground max-lg:hidden">
              {language.data.app.updates.subscription.title}
            </span>
          </Button>
        </motion.div>
        {isLoading ? (
          <div className="m-auto my-24 flex h-full w-full flex-col items-center justify-center gap-3">
            <ClockLoader
              cssOverride={{
                borderColor: "var(--heroui-color-current) !important",
                color: "var(--heroui-color-current) !important",
              }}
              color="currentColor"
              size={64}
            />
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                repeatType: "mirror",
                repeatDelay: 1,
                ease: "linear",
              }}
            >
              {language.data.app.updates.loading}
            </motion.span>
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.48 }}
            className="m-auto my-24 flex h-full w-full flex-col items-center justify-center gap-3"
          >
            <SmileyXEyesIcon size={48} />
            <h1 className="text-3xl">
              {language.data.app.updates.error.title}
            </h1>
            <span>{language.data.app.updates.error.description}</span>
          </motion.div>
        ) : (
          <div
            className="group/patch-note-list mt-6 flex w-full max-w-5xl flex-col gap-6"
            data-active={isCardHover}
          >
            {data.map((notegroup: PatchNoteGroup, index: number) => (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.64, delay: 0.1 * index }}
                key={`react-note-tag-group` + index}
                className="flex w-full flex-col gap-4"
              >
                <div
                  key={`note-tag-group` + index}
                  className="-mt-1 grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {notegroup.versions.map(
                    (note: PatchNoteVersion, nindex: number) => {
                      return (
                        <motion.div
                          key={`note-version-button-wrapper` + nindex}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 12 }}
                          transition={{ duration: 1, delay: 0.1 * nindex }}
                        >
                          <Link
                            href={
                              "/updates/" +
                              notegroup.tag +
                              "/" +
                              note.version.replace(".md", "")
                            }
                            className="delay-300 duration-700 group-not-data-active/patch-note-list:delay-100 group-data-active/patch-note-list:opacity-40 hover:opacity-100"
                          >
                            <Button
                              key={`note` + nindex}
                              className="group flex h-full min-h-max w-full items-start overflow-hidden bg-background p-1 text-foreground not-dark:shadow-xl hover:bg-foreground/10 dark:bg-foreground/5"
                              style={{ borderRadius: "32px" }}
                              onMouseEnter={() => setIsCardHover(true)}
                              onMouseLeave={() => setIsCardHover(false)}
                            >
                              <div className="flex h-full max-h-none w-full flex-col gap-3 p-2">
                                <div
                                  className="relative aspect-video w-full overflow-hidden rounded-2xl bg-foreground/10"
                                  style={{
                                    viewTransitionName:
                                      "banner-" +
                                      notegroup.tag +
                                      "-" +
                                      note.version
                                        .replace(".md", "")
                                        .replace(/\./g, "-"),
                                  }}
                                >
                                  {note.banner ? (
                                    <></>
                                  ) : (
                                    <div className="flex h-full w-full flex-col items-center justify-center bg-linear-150 from-purple-300 to-rose-400">
                                      <WrenchIcon
                                        className="size-6 text-white"
                                        weight="fill"
                                      />
                                    </div>
                                  )}
                                </div>
                                <div
                                  className="flex items-center justify-start gap-2 px-2"
                                  style={{
                                    viewTransitionName:
                                      "metadata-" +
                                      notegroup.tag +
                                      "-" +
                                      note.version
                                        .replace(".md", "")
                                        .replace(/\./g, "-"),
                                  }}
                                >
                                  <h1 className="text-start text-xs">
                                    {/* {language.data.app.updates.version}{" "}
                                    {note.version.replace(".md", "")} */}
                                    {new Date(note.date).toLocaleDateString(
                                      language.key,
                                      {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                      }
                                    )}
                                  </h1>
                                  <span className="text-xs text-foreground/20">
                                    •
                                  </span>
                                  <Badge
                                    key={`note-tag-chip` + index}
                                    className={cn(
                                      "rounded-full text-xs",
                                      notegroup.tag.toLowerCase() ===
                                        "pre-release"
                                        ? "bg-amber-400/10 text-amber-400"
                                        : notegroup.tag.toLowerCase() ===
                                            "release" &&
                                            "bg-blue-500/10 text-blue-500"
                                    )}
                                  >
                                    {(
                                      language.data.app.updates
                                        .translate as Translations
                                    )[notegroup.tag.toLowerCase()]
                                      ? (
                                          language.data.app.updates
                                            .translate as Translations
                                        )[notegroup.tag.toLowerCase()]
                                      : notegroup.tag}
                                  </Badge>
                                </div>
                                <h1
                                  className="line-clamp-2 w-full px-2 text-start text-xl wrap-break-word whitespace-break-spaces"
                                  style={{
                                    viewTransitionName:
                                      "title-" +
                                      notegroup.tag +
                                      "-" +
                                      note.version
                                        .replace(".md", "")
                                        .replace(/\./g, "-"),
                                  }}
                                >
                                  {note.title}
                                </h1>
                                <div className="h-full min-h-0 flex-1" />
                                <div className="mt-2 flex items-center justify-start gap-2 px-2">
                                  <span
                                    className="text-xs text-foreground/40"
                                    style={{
                                      viewTransitionName:
                                        "publisher-" +
                                        notegroup.tag +
                                        "-" +
                                        note.version
                                          .replace(".md", "")
                                          .replace(/\./g, "-"),
                                    }}
                                  >
                                    {language.data.app.updates.publish_by}
                                  </span>{" "}
                                  <Badge
                                    key={`note-tag-chip` + index}
                                    className={cn(
                                      "text-foregroun rounded-full bg-foreground/10 py-3 pl-1 text-xs"
                                    )}
                                  >
                                    <Avatar className="size-4">
                                      <AvatarImage
                                        src={
                                          "https://github.com/" +
                                          note.author +
                                          ".png"
                                        }
                                      />
                                      <AvatarFallback>
                                        {note.author.charAt(0).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    {note.author}
                                  </Badge>
                                </div>
                              </div>
                            </Button>
                          </Link>
                        </motion.div>
                      )
                    }
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <UpdateSubscribeModal
        isOpen={isUpdateSubscribeOpen}
        setIsOpen={setUpdateSubscribeOpen}
      />
    </main>
  )
}

export default Page
