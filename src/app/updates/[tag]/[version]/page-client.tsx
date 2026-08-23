"use client"

import React from "react"
import Markdown from "marked-react"
import {
  BellSimpleIcon,
  CaretLeftIcon,
  WrenchIcon,
} from "@phosphor-icons/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import UpdateSubscribeModal from "@/components/modal/update-subscribe"
import ImageWithSkeleton from "@/components/ui/custom/image"
import { Button } from "@/components/ui/button"
import { PatchNoteParser } from "@/lib/parser"
import { Badge } from "@/components/ui/badge"
import { Translations } from "../../page"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useAppStore } from "@/store/coreStore"

function PatchNote({
  tag,
  version,
  note,
}: {
  tag: string
  version: string
  note: string
}) {
  const language = useAppStore((state) => state.language)
  const safeTag = tag?.toLowerCase() || ""
  const normalizedVersion = version.replace(".md", "").replace(/\./g, "-")
  const parsedPatchNote = PatchNoteParser(note, true)
  const [isUpdateSubscribeOpen, setUpdateSubscribeOpen] = React.useState(false)

  return (
    <article className="min-h-dvh w-full max-w-3xl">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ delay: 1, duration: 1 }}
        className="pointer-events-none absolute top-0 left-0 flex w-full justify-center overflow-hidden"
      >
        <div className="aspect-video max-h-128 w-full -translate-y-1/2 overflow-hidden rounded-full opacity-80 blur-[96px]">
          {parsedPatchNote.banner ? (
            <ImageWithSkeleton
              src={parsedPatchNote.banner}
              alt={parsedPatchNote.title}
              classNames={{
                wrapper: "w-full h-full",
                image: "w-full h-full object-cover saturate-200",
              }}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-linear-150 from-purple-300 to-rose-400">
              <WrenchIcon className="size-6 text-white" weight="fill" />
            </div>
          )}
        </div>
      </motion.div>
      <div className="z-10 mt-4 mb-4 flex w-full items-center gap-2">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, delay: 0.1 }}
          data-smooth-interaction="true"
          className="z-10"
        >
          <Link href="/updates" tabIndex={-1}>
            <Button variant="ghost" size="lg" className="rounded-full">
              <CaretLeftIcon />
              {language.data.app.updates.name}
            </Button>
          </Link>
        </motion.div>
        <div
          className="flex items-center gap-2"
          style={{
            viewTransitionName: "date-" + safeTag + "-" + normalizedVersion,
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
            style={{
              viewTransitionName: "tag-" + safeTag + "-" + normalizedVersion,
            }}
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
            data-smooth-interaction="true"
          >
            <BellSimpleIcon weight="fill" />
          </Button>
        </motion.div>
      </div>
      <div className="z-10 flex w-full flex-col items-start justify-start">
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
            data-smooth-interaction="true"
          >
            <Badge
              style={{
                viewTransitionName:
                  "author-" + safeTag + "-" + normalizedVersion,
              }}
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
            <ImageWithSkeleton
              src={parsedPatchNote.banner}
              alt={parsedPatchNote.title}
              classNames={{
                wrapper: "w-full h-full",
                image: "w-full h-full object-cover",
              }}
            />
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
