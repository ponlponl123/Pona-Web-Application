"use client"

import React from "react"
import Markdown from "marked-react"
import { useLanguageContext } from "@/contexts/languageContext"
import {
  BellSimpleIcon,
  CaretLeftIcon,
  WrenchIcon,
} from "@phosphor-icons/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { PatchNoteParser } from "@/lib/parser"
import { Badge } from "@/components/ui/badge"
import { Translations } from "../../page"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import UpdateSubscribeModal from "@/components/modal/update-subscribe"
import Image from "next/image"

function PatchNote({
  tag,
  version,
  note,
}: {
  tag: string
  version: string
  note: string
}) {
  const { language } = useLanguageContext()
  const safeTag = tag?.toLowerCase() || ""
  const normalizedVersion = version.replace(".md", "").replace(/\./g, "-")
  const parsedPatchNote = PatchNoteParser(note, true)
  const [isUpdateSubscribeOpen, setUpdateSubscribeOpen] = React.useState(false)

  return (
    <article className="min-h-screen w-full max-w-3xl">
      <div className="mt-4 mb-4 flex w-full items-center gap-2">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, delay: 0.1 }}
        >
          <Link href="/updates">
            <Button variant="ghost" size="lg" className="rounded-full">
              <CaretLeftIcon />
              {language.data.app.updates.name}
            </Button>
          </Link>
        </motion.div>
        <div
          className="flex items-center gap-2"
          style={{
            viewTransitionName: "metadata-" + safeTag + "-" + normalizedVersion,
          }}
        >
          <h1 className="text-start text-xs">
            {new Date(parsedPatchNote.date).toLocaleDateString(language.key, {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </h1>
          <span className="text-xs text-foreground/20">•</span>
          <Badge
            className={cn(
              "rounded-full text-xs",
              safeTag.toLowerCase() === "pre-release"
                ? "bg-amber-400/10 text-amber-400"
                : safeTag.toLowerCase() === "release" &&
                    "bg-blue-500/10 text-blue-500"
            )}
          >
            {(language.data.app.updates.translate as Translations)[
              safeTag.toLowerCase()
            ]
              ? (language.data.app.updates.translate as Translations)[
                  safeTag.toLowerCase()
                ]
              : safeTag}
          </Badge>
        </div>
        <motion.div className="ml-auto" layoutId="update-subscribe">
          <Button
            size="icon-lg"
            className="rounded-full"
            onClick={() => setUpdateSubscribeOpen(true)}
          >
            <BellSimpleIcon weight="fill" />
          </Button>
        </motion.div>
      </div>
      <div className="flex w-full flex-col items-start justify-start">
        <h1
          className="line-clamp-2 w-full px-2 text-start text-4xl wrap-break-word whitespace-break-spaces"
          style={{
            viewTransitionName: "title-" + safeTag + "-" + normalizedVersion,
          }}
        >
          {parsedPatchNote.title}
        </h1>
        <div
          className="mt-2 flex items-center justify-start gap-2 px-2"
          style={{
            viewTransitionName:
              "publisher-" +
              safeTag +
              "-" +
              normalizedVersion.replace(".md", "").replace(/\./g, "-"),
          }}
        >
          <span className="text-xs text-foreground/40">
            {language.data.app.updates.publish_by}
          </span>{" "}
          <Link
            href={"https://github.com/" + parsedPatchNote.author}
            target="_blank"
            className="hover:opacity-80 active:opacity-50"
          >
            <Badge
              className={cn(
                "text-foregroun rounded-full bg-foreground/10 py-3 pl-1 text-xs"
              )}
            >
              <Avatar className="size-4">
                <AvatarImage
                  src={"https://github.com/" + parsedPatchNote.author + ".png"}
                />
                <AvatarFallback>
                  {parsedPatchNote.author.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {parsedPatchNote.author}
            </Badge>
          </Link>
        </div>
        <div
          className="relative mt-5 aspect-video w-full overflow-hidden rounded-2xl bg-foreground/10"
          style={{
            viewTransitionName:
              "banner-" +
              safeTag +
              "-" +
              normalizedVersion.replace(".md", "").replace(/\./g, "-"),
          }}
        >
          {parsedPatchNote.banner ? (
            <></>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-linear-150 from-purple-300 to-rose-400">
              <WrenchIcon className="size-6 text-white" weight="fill" />
            </div>
          )}
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, delay: 0.1 }}
          className="markdown relative my-6 prose block h-max w-full max-w-full text-foreground dark:prose-invert"
        >
          <Markdown>{parsedPatchNote.content}</Markdown>
        </motion.div>
      </div>
      <UpdateSubscribeModal
        isOpen={isUpdateSubscribeOpen}
        setIsOpen={setUpdateSubscribeOpen}
      />
    </article>
  )
}

export default PatchNote
