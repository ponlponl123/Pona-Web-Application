import { PatchNoteParser } from "@/lib/parser"
import { NextResponse } from "next/server"
import { Glob } from "bun"
import path from "node:path"

export interface PatchNoteVersion {
  version: string
  title: string
  author: string
  date: number
  banner: string | null
}

export interface PatchNoteGroup {
  tag: string
  versions: PatchNoteVersion[]
}

const BASE_PATH = path.join(process.cwd(), "docs/patches")

export async function GET() {
  try {
    const glob = new Glob("*/*")
    const files = Array.from(glob.scanSync({ cwd: BASE_PATH }))

    const processedNotes = await Promise.all(
      files.map(
        async (
          relativeFileName
        ): Promise<(PatchNoteVersion & { tag: string }) | null> => {
          const [tag, version] = relativeFileName.split(path.sep)
          const filePath = path.join(BASE_PATH, relativeFileName)

          try {
            const file = Bun.file(filePath)
            const content = await file.text()

            return {
              tag,
              version,
              ...PatchNoteParser(content),
            }
          } catch {
            return null
          }
        }
      )
    )

    const validNotes = processedNotes.filter(
      (n): n is PatchNoteVersion & { tag: string } => n !== null
    )

    const grouped = validNotes.reduce<Record<string, PatchNoteVersion[]>>(
      (acc, curr) => {
        if (!acc[curr.tag]) acc[curr.tag] = []
        acc[curr.tag].push({
          version: curr.version,
          title: curr.title,
          author: curr.author,
          date: curr.date,
          banner: curr.banner,
        })
        return acc
      },
      {}
    )

    const available_notes: PatchNoteGroup[] = Object.entries(grouped).map(
      ([tag, versions]) => ({
        tag,
        versions: versions.sort((a, b) => b.date - a.date),
      })
    )

    const res = NextResponse.json({
      message: "OK",
      available_tags: Object.keys(grouped),
      available_notes,
    })

    res.headers.append("Cache-Control", "public, max-age=3600")

    return res
  } catch {
    return Response.json({ message: "Internal Server Error" }, { status: 500 })
  }
}
