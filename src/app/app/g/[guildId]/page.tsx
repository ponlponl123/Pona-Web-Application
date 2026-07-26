"use client"
import { useDiscordGuildInfo } from "@/contexts/discordGuildInfo"
import { data, data01, data02, default_data } from "@/consts/guild/stats"
import React, { useMemo } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"

import { getRandomColor } from "@/components/data/charts/service-status"
import { useDiscordUserInfo } from "@/contexts/discordUserInfo"
import guild_stats from "@/lib/server-side-api/guild/stats"
import ImageWithSkeleton from "@/components/ui/custom/image"
import { getCookie } from "cookies-next"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { TrendDownIcon, TrendUpIcon } from "@phosphor-icons/react"
import { motion } from "motion/react"
import { useAppStore } from "@/store/coreStore"

interface ActiveUsageChart {
  date: string
  played?: number
}

type ChannelId = {
  [key: string]: number
}

interface MemberInChannel {
  date: string
  channels: ChannelId
}

function Page() {
  const language = useAppStore((state) => state.language)
  const userSetting = useAppStore((state) => state.userSetting)
  const { guild } = useDiscordGuildInfo()
  const { userInfo } = useDiscordUserInfo()

  const [activeStats, setActiveStats] = React.useState<
    ActiveUsageChart[] | null
  >(null)
  const [memberInChannel, setMemberInChannel] = React.useState<
    MemberInChannel[] | null
  >(null)
  const [memberInChannelConfig, setMemberInChannelConfig] =
    React.useState<ChartConfig>({})

  const token = getCookie("LOGIN_") as string | undefined
  const tokenType = getCookie("LOGIN_TYPE_") as string | undefined

  const backdropBg = useMemo(() => {
    if (guild?.bannerURL) return `${guild.bannerURL}?size=640`
    if (guild?.iconURL) return `${guild.iconURL}?size=640`
    if (userInfo?.banner)
      return `https://cdn.discordapp.com/banners/${userInfo.id}/${userInfo.banner}?size=640`
    if (userInfo?.avatar)
      return `https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}?size=640`
    return "/static/backdrop.png"
  }, [guild, userInfo])

  const formattedPastDate = useMemo(() => {
    const pastDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    return new Intl.DateTimeFormat(language.key, {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(pastDate)
  }, [language])

  React.useEffect(() => {
    if (!token || !tokenType || !guild?.id) return

    async function fetchActiveStats() {
      const res = await guild_stats(
        { token: token as string, type: tokenType as string },
        guild!.id
      )

      if (!res) return

      const data = JSON.parse(res) as {
        active: ActiveUsageChart[]
        members: MemberInChannel[]
      }

      const aggregatedMembers = data.members.map((entry) => {
        const consolidatedChannels: ChannelId = {}

        if (entry.channels) {
          Object.entries(entry.channels).forEach(([channel, count]) => {
            consolidatedChannels[channel] =
              (consolidatedChannels[channel] || 0) + count
          })
        }

        return { ...entry, channels: consolidatedChannels }
      })

      setActiveStats(data.active)
      setMemberInChannel(aggregatedMembers)

      const uniqueChannels = Array.from(
        new Set(aggregatedMembers.flatMap((item) => Object.keys(item.channels)))
      )

      const chartConfig = uniqueChannels.reduce((config, channel, index) => {
        config[channel] = {
          label: channel.charAt(0).toUpperCase() + channel.slice(1),
          color: `hsl(var(--chart-${(index % 5) + 1}))`,
        }
        return config
      }, {} as ChartConfig)

      setMemberInChannelConfig(chartConfig)
    }

    fetchActiveStats()
  }, [guild?.id, token, tokenType])

  const channelColors = React.useMemo(() => {
    const colors: { [key: string]: string } = {}
    if (memberInChannel) {
      memberInChannel.forEach((data) => {
        if (data.channels) {
          Object.keys(data.channels).forEach((channel) => {
            if (!colors[channel]) {
              colors[channel] = getRandomColor(channel)
            }
          })
        }
      })
    }
    return colors
  }, [memberInChannel])

  const activeChannels = useMemo(() => {
    const keys = Object.keys(channelColors)
    if (keys.length > 0) return keys
    return ["Voice Channels"]
  }, [channelColors])

  const effectiveChannelColors = useMemo(() => {
    if (Object.keys(channelColors).length > 0) return channelColors
    return { "Voice Channels": "hsl(var(--primary))" }
  }, [channelColors])

  const flattenedData = React.useMemo(() => {
    const baseData: MemberInChannel[] =
      memberInChannel ||
      default_data.map((d): MemberInChannel => ({ date: d.date, channels: {} }))

    return baseData.map((item) => {
      const flatItem: Record<string, string | number> = { date: item.date }

      activeChannels.forEach((channel) => {
        flatItem[channel] =
          ("channels" in item && item.channels && item.channels[channel]) || 0
      })

      return flatItem
    })
  }, [memberInChannel, activeChannels])

  const activeTrend = useMemo(() => {
    const dataset = activeStats || (default_data as ActiveUsageChart[])
    const total = dataset.reduce((acc, curr) => acc + (curr.played || 0), 0)
    if (total === 0) {
      return {
        isUp: true,
        percentage: 0,
        text: language.data.app.guilds.stats.average_usage.trending_up.replace(
          "[percentage]",
          "0"
        ),
      }
    }

    const maxPlayed = Math.max(...dataset.map((d) => d.played || 0))
    const avgPlayed = total / dataset.length
    const pct =
      avgPlayed > 0
        ? Math.round(((maxPlayed - avgPlayed) / avgPlayed) * 100)
        : 0
    const isUp = pct >= 0
    const absPct = Math.abs(pct)

    const template = isUp
      ? language.data.app.guilds.stats.average_usage.trending_up
      : language.data.app.guilds.stats.average_usage.trending_down

    return {
      isUp,
      percentage: absPct,
      text: template.replace("[percentage]", absPct.toString()),
    }
  }, [activeStats, language])

  const voiceTrend = useMemo(() => {
    if (!flattenedData || flattenedData.length === 0) {
      return {
        isUp: true,
        percentage: 0,
        text: language.data.app.guilds.stats.members_in_voice_channel.trending_up.replace(
          "[percentage]",
          "0"
        ),
      }
    }

    const totalMembers = flattenedData.reduce((acc, row) => {
      let sum = 0
      Object.entries(row).forEach(([key, val]) => {
        if (key !== "date" && typeof val === "number") {
          sum += val
        }
      })
      return acc + sum
    }, 0)

    if (totalMembers === 0) {
      return {
        isUp: true,
        percentage: 0,
        text: language.data.app.guilds.stats.members_in_voice_channel.trending_up.replace(
          "[percentage]",
          "0"
        ),
      }
    }

    const intervalTotals = flattenedData.map((row) => {
      let sum = 0
      Object.entries(row).forEach(([key, val]) => {
        if (key !== "date" && typeof val === "number") {
          sum += val
        }
      })
      return sum
    })

    const maxMembers = Math.max(...intervalTotals)
    const avgMembers = totalMembers / flattenedData.length
    const pct =
      avgMembers > 0
        ? Math.round(((maxMembers - avgMembers) / avgMembers) * 100)
        : 0
    const isUp = pct >= 0
    const absPct = Math.abs(pct)

    const template = isUp
      ? language.data.app.guilds.stats.members_in_voice_channel.trending_up
      : language.data.app.guilds.stats.members_in_voice_channel.trending_down

    return {
      isUp,
      percentage: absPct,
      text: template.replace("[percentage]", absPct.toString()),
    }
  }, [flattenedData, language])

  return (
    <main id="app-panel">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ duration: 1, delay: 0.48 }}
        className="pointer-events-none absolute top-0 left-0 z-1 h-max max-h-[48vh] min-h-48 w-full scale-[2] mask-[linear-gradient(to_bottom,black,transparent)] opacity-40 select-none [-webkit-mask-image:linear-gradient(to_bottom,black,transparent)]"
      >
        {userSetting.transparency ? (
          <ImageWithSkeleton
            src={`/api/proxy/image?r=${encodeURIComponent(backdropBg)}&s=512&blur=16&saturation=96&contrast=12`}
            alt={guild?.name || "Guild Backdrop"}
            width={"100%"}
            height={undefined}
            classNames={{
              wrapper: "w-full top-0 left-0",
            }}
            className="pointer-events-none h-full max-h-[48vh] w-full -translate-y-1 object-cover brightness-110 saturate-200"
          />
        ) : (
          <div className="h-96 w-full bg-linear-to-t from-transparent to-[hsl(var(--pona-app-music-accent-color-500))]" />
        )}
        <div className="to-playground-background absolute top-[unset] bottom-0 left-0 z-10 h-2/4 w-full bg-linear-to-b from-transparent" />
      </motion.div>

      <main id="app-workspace" className="relative z-10">
        {guild ? (
          <>
            <h1 className="text-base text-foreground/40">{guild.id}</h1>
            <h1 className="mb-4 text-3xl">{guild.name}</h1>
            <div className="guild-profile flex flex-col">
              <div className="bg-foreground-50 pointer-events-none h-48 w-full rounded-3xl select-none max-md:h-32 max-md:overflow-hidden">
                {guild.bannerURL ? (
                  <ImageWithSkeleton
                    alt={guild.name || "Guild Banner"}
                    src={`${guild.bannerURL}?size=480`}
                    width={"100%"}
                    height={192}
                    className="h-full w-full bg-primary object-cover"
                  />
                ) : (
                  <div className="h-full w-full overflow-hidden rounded-3xl">
                    <ImageWithSkeleton
                      alt={guild.name || "Default Banner"}
                      src={
                        guild.iconURL
                          ? `${guild.iconURL}?size=320`
                          : "/static/app/default.png"
                      }
                      width={"100%"}
                      height={192}
                      className="h-full w-full bg-primary object-cover blur-2xl"
                    />
                  </div>
                )}
              </div>
              <div className="z-10 -mt-12 flex px-12">
                <div className="outline-playground-background overflow-hidden rounded-full outline-4">
                  <Avatar className="size-24 bg-primary object-cover">
                    <AvatarImage
                      alt={`${guild?.name} Avatar`}
                      src={
                        guild.iconURL
                          ? `${guild.iconURL}?size=128`
                          : "/static/app/default.png"
                      }
                    />
                    <AvatarFallback>
                      {guild?.name ? guild.name.charAt(0).toUpperCase() : "G"}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>

            <section className="flex flex-col gap-4 max-sm:mt-6 sm:p-8">
              <h1 className="flex items-center gap-3 text-3xl">
                {language.data.app.guilds.stats.title}{" "}
                <Badge className="pointer-events-none mt-1 h-max rounded-full bg-primary/20 px-3 py-1 text-xs font-bold text-primary">
                  {language.data.app.guilds.stats.in.replace("[day]", "7")}
                </Badge>
              </h1>

              <div className="flex w-full gap-6 max-lg:flex-wrap">
                <div className="z-10 flex h-fit w-full flex-col rounded-2xl border border-border/80 bg-card/80 py-4 backdrop-blur-sm backdrop-saturate-200">
                  <h1 className="px-6 text-2xl">
                    {language.data.app.guilds.stats.average_usage.title}
                  </h1>
                  <span className="mb-2 px-6 text-base text-foreground/40">
                    {formattedPastDate} - {language.data.common.time.today}
                  </span>
                  <ChartContainer
                    className="px-4"
                    config={{
                      played: {
                        label: "Played (mins)",
                        color: "var(--primary)",
                      },
                    }}
                  >
                    <ResponsiveContainer
                      width={"100%"}
                      height={256}
                      className="px-4"
                    >
                      <BarChart
                        width={730}
                        height={250}
                        accessibilityLayer
                        data={
                          activeStats || (default_data as ActiveUsageChart[])
                        }
                      >
                        <CartesianGrid vertical={false} />
                        <XAxis
                          dataKey="date"
                          tickLine={false}
                          tickMargin={10}
                          axisLine={false}
                          tickFormatter={(value: string) => value.split(" ")[0]}
                        />
                        <ChartTooltip
                          animationEasing="linear"
                          animationDuration={96}
                          cursor={false}
                          content={
                            <ChartTooltipContent
                              className="linear rounded-xl duration-0"
                              indicator="dashed"
                            />
                          }
                        />
                        <Bar
                          dataKey="played"
                          fill="var(--color-played)"
                          radius={4}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                  <div className="mt-2 flex items-center gap-1.5 px-6 text-base">
                    <h2 className="m-0">{activeTrend.text}</h2>
                    {activeTrend.isUp ? (
                      <TrendUpIcon
                        weight="bold"
                        className="mt-1 size-3 text-emerald-400"
                      />
                    ) : (
                      <TrendDownIcon
                        weight="bold"
                        className="mt-1 size-3 text-amber-400"
                      />
                    )}
                  </div>
                  <span className="px-6 text-sm text-foreground/40">
                    {language.data.app.guilds.stats.average_usage.note}
                  </span>
                </div>

                <div className="z-10 flex h-fit w-full flex-col rounded-2xl border border-border/80 bg-card/80 py-4 backdrop-blur-sm backdrop-saturate-200">
                  <h1 className="px-6 text-2xl">
                    {
                      language.data.app.guilds.stats.members_in_voice_channel
                        .title
                    }
                  </h1>
                  <span className="mb-2 px-6 text-base text-foreground/40">
                    {formattedPastDate} - {language.data.common.time.today}
                  </span>
                  <ChartContainer
                    className="px-4"
                    config={memberInChannelConfig}
                  >
                    <ResponsiveContainer
                      width={"100%"}
                      height={256}
                      className="px-4"
                    >
                      <AreaChart data={flattenedData} accessibilityLayer>
                        <defs>
                          {activeChannels.map((channel, index) => (
                            <linearGradient
                              key={channel}
                              id={`fill-${index}`}
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor={
                                  effectiveChannelColors[channel] ||
                                  "hsl(var(--primary))"
                                }
                                stopOpacity={0.8}
                              />
                              <stop
                                offset="95%"
                                stopColor={
                                  effectiveChannelColors[channel] ||
                                  "hsl(var(--primary))"
                                }
                                stopOpacity={0.1}
                              />
                            </linearGradient>
                          ))}
                        </defs>
                        <CartesianGrid vertical={false} />
                        <XAxis
                          dataKey="date"
                          tickLine={false}
                          tickMargin={10}
                          axisLine={false}
                          tickFormatter={(value: string) => value.split(" ")[0]}
                        />
                        <ChartTooltip
                          animationEasing="linear"
                          animationDuration={96}
                          cursor={false}
                          content={
                            <ChartTooltipContent
                              className="linear rounded-xl duration-0"
                              indicator="dot"
                            />
                          }
                        />
                        {activeChannels.map((channel, index) => (
                          <Area
                            key={channel}
                            type="monotone"
                            dataKey={channel}
                            name={channel}
                            stroke={
                              effectiveChannelColors[channel] ||
                              "hsl(var(--primary))"
                            }
                            fill={`url(#fill-${index})`}
                            stackId="a"
                          />
                        ))}
                        <ChartLegend content={<ChartLegendContent />} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                  <div className="mt-2 flex items-center gap-1.5 px-6 text-base">
                    <h2 className="m-0">{voiceTrend.text}</h2>
                    {voiceTrend.isUp ? (
                      <TrendUpIcon
                        weight="bold"
                        className="mt-1 size-3 text-emerald-400"
                      />
                    ) : (
                      <TrendDownIcon
                        weight="bold"
                        className="mt-1 size-3 text-amber-400"
                      />
                    )}
                  </div>
                  <span className="px-6 text-sm text-foreground/40">
                    {
                      language.data.app.guilds.stats.members_in_voice_channel
                        .note
                    }
                  </span>
                </div>
              </div>


              <div className="pointer-events-none relative rounded-2xl border border-border/80 bg-card/80 pt-4 backdrop-blur-sm backdrop-saturate-200 select-none">
                <h1 className="absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2 text-2xl">
                  {language.data.extensions.comingsoon}!
                </h1>
                <div className="pointer-events-none -z-10 mb-6 flex w-full gap-6 blur-sm max-lg:flex-wrap">
                  <div className="h-fit w-full px-6">
                    <h1 className="mb-6 text-2xl">
                      {language.data.app.guilds.stats.genre}
                    </h1>
                    <ChartContainer config={{}}>
                      <ResponsiveContainer
                        width={"100%"}
                        height={256}
                        className="px-4"
                      >
                        <RadarChart
                          outerRadius={90}
                          width={730}
                          height={250}
                          data={data}
                        >
                          <PolarGrid />
                          <PolarAngleAxis dataKey="subject" />
                          <PolarRadiusAxis angle={30} domain={[0, 150]} />
                          <Radar
                            name="Mike"
                            dataKey="A"
                            stroke="#8884d8"
                            fill="#8884d8"
                            fillOpacity={0.6}
                          />
                          <Radar
                            name="Lily"
                            dataKey="B"
                            stroke="#82ca9d"
                            fill="#82ca9d"
                            fillOpacity={0.6}
                          />
                          <Legend />
                        </RadarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                  <div className="h-fit w-full px-6">
                    <h1 className="mb-6 text-2xl">
                      {language.data.app.guilds.stats.top_artist}
                    </h1>
                    <ChartContainer config={{}}>
                      <ResponsiveContainer
                        width={"100%"}
                        height={256}
                        className="px-4"
                      >
                        <PieChart width={730} height={250}>
                          <Pie
                            data={data01}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={50}
                            fill="#8884d8"
                          />
                          <Pie
                            data={data02}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#82ca9d"
                            label
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : (
          <Spinner />
        )}
      </main>
    </main>
  )
}

export default Page
