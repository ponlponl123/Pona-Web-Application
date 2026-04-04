import { TimeFormat } from "@/types/settings"

export function PatchNoteParser(content: string, needContent = false) {
  const lines = content.split("\n").map((l) => l.trim())

  let title = "Untitled"
  let author = "Unknown"
  let banner: string | null = null
  let timestamp = 0
  let foundTitle = false

  const cleanContent: string[] = []

  for (const line of lines) {
    if (!line) {
      if (foundTitle) cleanContent.push("")
      continue
    }

    if (!banner) {
      const bannerMatch = line.match(/!\[.*?\]\((.*?)\)/)
      if (bannerMatch) {
        banner = bannerMatch[1]
        continue
      }
    }

    if (
      !foundTitle &&
      !line.startsWith("![") &&
      !line.startsWith("[author-") &&
      !line.startsWith("`")
    ) {
      title = line.replace(/^#+\s+/, "")
      foundTitle = true
      continue
    }

    const authorMatch = line.match(/\[author-(.*?)\]/)
    if (authorMatch) {
      author = authorMatch[1]
      continue
    }

    const dateMatch = line.match(/`[^\d]*(\d+)\s+(\w+)\s+(\d+)`/)
    if (dateMatch) {
      const [, day, month, year] = dateMatch
      timestamp = new Date(`${month} ${day}, ${year}`).getTime()
      continue
    }

    cleanContent.push(line)
  }

  return {
    title,
    author,
    date: timestamp,
    banner,
    ...(needContent && { content: cleanContent.join("\n").trim() }),
  }
}

export function parseHour(a: TimeFormat): undefined | boolean {
  return a === "auto" ? undefined : a === 12
}
