import { Metadata } from "next"
import { Suspense } from "react"
import { PatchNoteParser } from "@/lib/parser"
import SuspenseFallback from "./suspense-fallback"
import { default as PageClient } from "./page-client"

interface GenerateMetadataProps {
  params: Promise<{
    tag: string
    version: string
  }>
}

async function PatchNoteData({
  tag,
  version,
}: {
  tag: string
  version: string
}) {
  "use cache"

  const fetchnote = await fetch(
    `http://localhost:3000/api/patchnote/${tag}/${version}.md`
  )
  const note = await fetchnote.text()

  return <PageClient tag={tag} version={version} note={note} />
}

export async function generateMetadata({
  params,
}: GenerateMetadataProps): Promise<Metadata> {
  "use cache"

  const { tag, version } = await params

  const fetchnote = await fetch(
    `http://localhost:3000/api/patchnote/${tag}/${version}.md`
  )
  const note = await fetchnote.text()
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
    <main className="min-h-screen w-full">
      <div className="mb-20 flex min-h-screen grid-rows-[20px_1fr_20px] flex-col items-center gap-3 p-8 pb-20 sm:p-6 md:p-20">
        <div className="mt-6" />
        <Suspense fallback={<SuspenseFallback />}>
          <PatchNoteData tag={params.tag} version={params.version} />
        </Suspense>
      </div>
    </main>
  )
}
