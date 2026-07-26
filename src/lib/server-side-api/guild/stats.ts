"use server"

import { EndpointHTTP, EndpointKey } from "../endpoint"
import { fetchGuild } from "../discord/fetchGuild"

export interface Period {
  start_time: string
  end_time: string
}

export interface Interval {
  date: string
  played: number
}

export interface ChannelData {
  id: string | null
  name: string | null
  members: string[] | null
}

export interface DatasetItem {
  from: string
  to: string
  channels: ChannelData[]
}

export interface ChartItem {
  date: string
  channels: Record<string, number>
}

/**
 * Calculates active listening time (in minutes) for each 3-hour daily time block
 * aggregated across all sessions in the raw data window.
 *
 * @param rawData List of active music playback periods with start_time and end_time.
 * @returns Array of 8 3-hour time blocks with total active minutes played.
 */
function calculateActiveIntervals(rawData: Period[]): Interval[] {
  const intervals: Interval[] = [
    { date: "00:00 - 02:59", played: 0 },
    { date: "03:00 - 05:59", played: 0 },
    { date: "06:00 - 08:59", played: 0 },
    { date: "09:00 - 11:59", played: 0 },
    { date: "12:00 - 14:59", played: 0 },
    { date: "15:00 - 17:59", played: 0 },
    { date: "18:00 - 20:59", played: 0 },
    { date: "21:00 - 23:59", played: 0 },
  ]

  if (!Array.isArray(rawData) || rawData.length === 0) {
    return intervals
  }

  for (const period of rawData) {
    if (!period?.start_time || !period?.end_time) continue

    const startTime = new Date(period.start_time).getTime()
    const endTime = new Date(period.end_time).getTime()

    if (isNaN(startTime) || isNaN(endTime) || startTime >= endTime) continue

    const startDay = new Date(startTime)
    const endDay = new Date(endTime)

    const curDate = new Date(
      Date.UTC(
        startDay.getUTCFullYear(),
        startDay.getUTCMonth(),
        startDay.getUTCDate()
      )
    )
    const lastDate = new Date(
      Date.UTC(
        endDay.getUTCFullYear(),
        endDay.getUTCMonth(),
        endDay.getUTCDate()
      )
    )

    while (curDate.getTime() <= lastDate.getTime()) {
      const year = curDate.getUTCFullYear()
      const month = curDate.getUTCMonth()
      const day = curDate.getUTCDate()

      for (let i = 0; i < 8; i++) {
        const intervalStart = Date.UTC(year, month, day, i * 3, 0, 0, 0)
        const intervalEnd = Date.UTC(year, month, day, (i + 1) * 3, 0, 0, 0)

        const activeStart = Math.max(startTime, intervalStart)
        const activeEnd = Math.min(endTime, intervalEnd)

        if (activeStart < activeEnd) {
          intervals[i].played += Math.round((activeEnd - activeStart) / 60000)
        }
      }

      curDate.setUTCDate(curDate.getUTCDate() + 1)
    }
  }

  return intervals
}

/**
 * Transforms voice channel member history dataset into standard Recharts format.
 * Safely handles stringified JSON arrays and missing channel identifiers.
 *
 * @param dataset Raw voice channel history returned from the API.
 * @returns Array of chart interval items formatted with channel member counts.
 */
function convertToChartFormat(dataset: DatasetItem[]): ChartItem[] {
  const chartItems: ChartItem[] = Array.from({ length: 8 }, (_, i) => {
    const startHour = i * 3
    const endHour = startHour + 2
    const date = `${startHour.toString().padStart(2, "0")}:00 - ${endHour.toString().padStart(2, "0")}:59`
    return { date, channels: {} }
  })

  if (!Array.isArray(dataset)) {
    return chartItems
  }

  for (const item of dataset) {
    if (!item || typeof item.from !== "string") continue

    const startHour = item.from.split(":")[0].padStart(2, "0")
    const endHour = (parseInt(startHour, 10) + 2).toString().padStart(2, "0")
    const targetRange = `${startHour}:00 - ${endHour}:59`

    const chartItem = chartItems.find((ci) => ci.date === targetRange)
    if (!chartItem) continue

    let channelsList = item.channels
    if (typeof channelsList === "string") {
      try {
        channelsList = JSON.parse(channelsList)
      } catch {
        channelsList = []
      }
    }

    if (Array.isArray(channelsList)) {
      for (const ch of channelsList) {
        if (!ch) continue
        const channelName =
          ch.name || (ch.id ? `Channel ${ch.id}` : "Voice Channel")

        let membersList = ch.members
        if (typeof membersList === "string") {
          try {
            membersList = JSON.parse(membersList)
          } catch {
            membersList = []
          }
        }
        const memberCount = Array.isArray(membersList) ? membersList.length : 0

        chartItem.channels[channelName] =
          (chartItem.channels[channelName] || 0) + memberCount
      }
    }
  }

  return chartItems
}

/**
 * Fetches and processes active usage and voice channel member statistics for a Discord guild.
 *
 * @param auth Credentials containing login token and token type.
 * @param auth.token User/bot session token.
 * @param auth.type Token authorization type.
 * @param guildid Discord guild identifier.
 * @returns JSON string containing active stats and voice channel member stats, or null on failure.
 */
export default async function guild_stats(
  { token, type }: { token: string; type: string },
  guildid: string
): Promise<string | null> {
  try {
    const guild = await fetchGuild(token, type, guildid)
    if (!guild) return null

    const response = await fetch(`${EndpointHTTP}/v1/guild/${guild.id}/stats`, {
      method: "GET",
      headers: {
        Authorization: `Pona! ${EndpointKey}`,
        "Content-Type": "application/json",
        "User-Agent": "Pona! Application (OpenPonlponl123.com/v1)",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error status: ${response.status}`)
    }

    const data = await response.json()

    if (data && (data.active || data.history)) {
      const averageUsage = calculateActiveIntervals(data.active || [])
      const membersInChannel = convertToChartFormat(
        (data.history as DatasetItem[]) || []
      )

      return JSON.stringify({
        active: averageUsage,
        members: membersInChannel,
      })
    }

    return null
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    if (process.env.NODE_ENV !== "production") {
      process.stderr.write(`[guild_stats] Failed to fetch stats: ${errorMessage}\n`)
    }
    return null
  }
}

