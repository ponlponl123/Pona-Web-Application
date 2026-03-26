import { Suspense } from "react"
import { default as PageClient } from "./page-client"

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

export default async function Page(props: {
  params: Promise<{ tag: string; version: string }>
}) {
  const params = await props.params

  return (
    <main className="min-h-screen w-full">
      <div className="mb-20 flex min-h-screen grid-rows-[20px_1fr_20px] flex-col items-center gap-3 p-8 pb-20 sm:p-6 md:p-20">
        <div className="mt-6" />
        <Suspense
          fallback={
            <div className="animate-pulse text-muted-foreground">
              กำลังโหลดข้อมูลแพตช์...
            </div>
          }
        >
          <PatchNoteData tag={params.tag} version={params.version} />
        </Suspense>
      </div>
    </main>
  )
}
