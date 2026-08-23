import { Metadata } from "next"
import { Suspense } from "react"
import { notFound } from "next/navigation"
import { readFile, access } from "node:fs/promises"
import path from "node:path"
import { PatchNoteParser } from "@/lib/parser"
import SuspenseFallback from "./suspense-fallback"
import { default as PageClient } from "./page-client"

interface GenerateMetadataProps {
  params: Promise<{
    tag: string
    version: string
  }>
}

async function getPatchNoteContent(tag: string, version: string): Promise<string | null> {
  const safeTag = path.basename(tag)
  const baseVersion = path.basename(version)
  const safeVersion = baseVersion.endsWith(".md") ? baseVersion : `${baseVersion}.md`
  const filePath = path.join(process.cwd(), "docs", "patches", safeTag, safeVersion)

  try {
    await access(filePath)
    return await readFile(filePath, "utf-8")
  } catch {
    return null
  }
}

async function PatchNoteData({
  tag,
  version,
}: {
  tag: string
  version: string
}) {
  "use cache"

  const note = await getPatchNoteContent(tag, version)
  if (!note) {
    notFound()
  }

  return <PageClient tag={tag} version={version} note={note} />
}

export async function generateMetadata({
  params,
}: GenerateMetadataProps): Promise<Metadata> {
  "use cache"

  const { tag, version } = await params
  const note = await getPatchNoteContent(tag, version)

  if (!note) {
    return {
      title: "Patch Note Not Found - Pona!",
    }
  }

  const parsedPatchNote = PatchNoteParser(note, true)

  return {
    title: parsedPatchNote.title + " - Pona! Patch Notes",
    description: parsedPatchNote.author,
    openGraph: {
      images: [
        {
          url: parsedPatchNote.banner || "/static/updates/banner.png",
        },
      ],
    },
  }
}

export default async function Page(props: GenerateMetadataProps) {
  const params = await props.params

  return (
    <main className="min-h-dvh w-full">
      <div className="pointer-events-none absolute top-0 left-0 z-0 h-full w-full bg-[radial-gradient(var(--foreground)_1px,transparent_1px)] bg-size-[16px_16px] opacity-6 dark:opacity-5" />
      <div className="mb-20 flex min-h-dvh grid-rows-[20px_1fr_20px] flex-col items-center gap-3 p-8 pb-20 sm:p-6 md:p-20">
        <div className="mt-6" />
        <Suspense fallback={<SuspenseFallback />}>
          <PatchNoteData tag={params.tag} version={params.version} />
        </Suspense>
      </div>
    </main>
  )
}
