"use server"

import { EndpointHTTP, EndpointKey } from "../endpoint"
import { fetchGuild } from "../discord/fetchGuild"

interface Period {
  start_time: string
  end_time: string
}

interface Interval {
  date: string
  played: number
}

interface DatasetItem {
  from: string
  to: string
  channels: {
    id: string | null
    name: string | null
    members: string[] | null
  }[]
}

interface ChartItem {
  date: string
  channels: Record<string, number>
}

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

  for (const period of rawData) {
    const start = new Date(period.start_time).getTime()
    const end = new Date(period.end_time).getTime()

    for (const interval of intervals) {
      const [startTimeStr] = interval.date.split(" - ")
      const [hours] = startTimeStr.split(":").map(Number)

      const intervalStart = new Date(start)
      intervalStart.setUTCHours(hours, 0, 0, 0)
      const intervalStartTime = intervalStart.getTime()
      const intervalEndTime = intervalStartTime + 3 * 60 * 60 * 1000

      const activeStart = Math.max(start, intervalStartTime)
      const activeEnd = Math.min(end, intervalEndTime)

      if (activeStart < activeEnd) {
        interval.played += Math.round((activeEnd - activeStart) / 60000)
      }
    }
  }
  return intervals
}

function convertToChartFormat(dataset: DatasetItem[]): ChartItem[] {
  const chartItems: ChartItem[] = Array.from({ length: 8 }, (_, i) => {
    const startHour = i * 3
    const endHour = startHour + 2
    const date = `${startHour.toString().padStart(2, "0")}:00 - ${endHour.toString().padStart(2, "0")}:59`
    return { date, channels: {} }
  })

  for (const item of dataset) {
    const startHour = item.from.split(":")[0].padStart(2, "0")
    const endHour = (parseInt(startHour) + 2).toString().padStart(2, "0")
    const targetRange = `${startHour}:00 - ${endHour}:59`

    const chartItem = chartItems.find((ci) => ci.date === targetRange)
    if (chartItem) {
      for (const channel of item.channels) {
        if (channel.name) {
          chartItem.channels[channel.name] = channel.members?.length || 0
        }
      }
    }
  }
  return chartItems
}

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
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (data.active) {
      const averageUsage = calculateActiveIntervals(data.active)
      const membersInChannel = convertToChartFormat(
        data.history as DatasetItem[]
      )

      return JSON.stringify({
        active: averageUsage,
        members: membersInChannel,
      })
    }

    return null
  } catch (err) {
    console.error(
      "Failed to get Guild Active Usage Stats:",
      err instanceof Error ? err.message : err
    )
    return null
  }
}
