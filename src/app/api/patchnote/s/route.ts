import { PatchNoteParser } from "@/lib/parser"
import { NextResponse } from "next/server"
import { readdir, readFile } from "node:fs/promises"
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

const BASE_PATH = path.join(process.cwd(), "docs", "patches")

/**
 * Next.js API Route Handler to fetch and group available patch notes.
 * Uses standard Node.js fs/promises for cross-platform runtime compatibility.
 */
export async function GET(): Promise<NextResponse> {
  try {
    let tagDirs: string[] = []
    try {
      const entries = await readdir(BASE_PATH, { withFileTypes: true })
      tagDirs = entries.filter((e) => e.isDirectory()).map((e) => e.name)
    } catch {
      return NextResponse.json({
        message: "OK",
        available_tags: [],
        available_notes: [],
      })
    }

    const processedNotesNested = await Promise.all(
      tagDirs.map(async (tag) => {
        const tagPath = path.join(BASE_PATH, tag)
        try {
          const files = await readdir(tagPath, { withFileTypes: true })
          const versionFiles = files.filter((f) => f.isFile()).map((f) => f.name)

          return Promise.all(
            versionFiles.map(async (version) => {
              const filePath = path.join(tagPath, version)
              try {
                const content = await readFile(filePath, "utf-8")
                return {
                  tag,
                  version,
                  ...PatchNoteParser(content),
                } as PatchNoteVersion & { tag: string }
              } catch {
                return null
              }
            })
          )
        } catch {
          return []
        }
      })
    )

    const flatNotes = processedNotesNested
      .flat()
      .filter((n): n is PatchNoteVersion & { tag: string } => n !== null)

    const grouped = flatNotes.reduce<Record<string, PatchNoteVersion[]>>(
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

    res.headers.set("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400")

    return res
  } catch (err) {
    console.error("Failed to list patch notes:", err)
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
  }
}

