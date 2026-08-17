"use client"
import clsx from "clsx"
import React from "react"
import MyButton from "@/components/ui/custom/button"
import { CubeIcon } from "@phosphor-icons/react/dist/ssr"
import ManagerChart from "@/components/data/charts/service-status"
import clusterInfo, { ClusterInfo } from "@/lib/server-side-api/clusterInfo"
import ponlponl123apiHandshake from "@/lib/server-side-api/ponlponl123api"
import handshake from "@/lib/server-side-api/handshake"
import socketio from "@/lib/server-side-api/socketio"
import lavalink from "@/lib/server-side-api/lavalink"
import redis from "@/lib/server-side-api/redis"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/store/coreStore"

export type viewType =
  | "24h"
  | "12h"
  | "9h"
  | "6h"
  | "3h"
  | "1h"
  | "45min"
  | "30min"
  | "15min"

const filterOptions: viewType[] = ["24h", "12h", "9h", "6h", "3h", "1h"]

function Status() {
  const language = useAppStore((state) => state.language)
  const [fetching, setFetching] = React.useState<boolean>(false)
  const [lastRefresh, setLastRefresh] = React.useState<Date | null>(null)
  const [overallStatus, setOverallStatus] = React.useState<
    "operational" | "degraded" | "down" | "unknown"
  >("unknown")
  const [viewMode, setViewMode] = React.useState<viewType>("6h")

  const [handshakeStatus, setHandshakeStatus] = React.useState<boolean | null>(
    null
  )
  const [ponlponl123ApiStatus, setPonlponl123ApiStatus] = React.useState<
    boolean | null
  >(null)
  const [redisStatus, setRedisStatus] = React.useState<boolean | null>(null)
  const [websocketStatus, setWebsocketStatus] = React.useState<boolean | null>(
    null
  )
  const [lavalinkStatus, setLavalinkStatus] = React.useState<boolean | null>(
    null
  )
  const [clusterInfoStatus, setClusterInfoStatus] = React.useState<
    false | ClusterInfo | null
  >(null)

  function setOverallServiceStatus(
    handshake: boolean,
    ponlponl123api: boolean,
    redis: boolean,
    websocket: boolean,
    lavalink: boolean,
    cluster: false | ClusterInfo
  ) {
    setHandshakeStatus(handshake)
    setPonlponl123ApiStatus(ponlponl123api)
    setRedisStatus(redis)
    setWebsocketStatus(websocket)
    setLavalinkStatus(lavalink)
    setClusterInfoStatus(cluster)
    if (
      !handshake &&
      !ponlponl123api &&
      !redis &&
      !websocket &&
      !lavalink &&
      !cluster
    )
      return setOverallStatus("down")
    if (!handshake || !ponlponl123api || !redis || !lavalink || !cluster)
      return setOverallStatus("degraded")
    return setOverallStatus("operational")
  }

  const refresh = async (): Promise<void> => {
    if (fetching) return
    setFetching(true)

    const handshakeReq = await handshake()
    const ponlponl123api = await ponlponl123apiHandshake()
    const redisReq = await redis()
    const socketioReq = await socketio()
    const lavalinkReq = await lavalink()
    const clusterInfoReq = await clusterInfo()

    setOverallServiceStatus(
      handshakeReq,
      ponlponl123api,
      redisReq,
      socketioReq,
      lavalinkReq,
      clusterInfoReq
    )

    setLastRefresh(new Date())
    setFetching(false)
  }

  React.useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <main className="-mb-8 min-h-dvh w-full">
      <div className="pointer-events-none absolute top-0 left-0 z-0 h-full w-full bg-[radial-gradient(var(--foreground)_1px,transparent_1px)] bg-size-[16px_16px] opacity-6 dark:opacity-5" />
      <div className="flex min-h-dvh grid-rows-[20px_1fr_20px] flex-col items-center gap-8 p-8 pb-28 sm:p-20 sm:pb-32">
        <div className="mt-16"></div>
        <main className="flex w-full max-w-5xl flex-col justify-start gap-10">
          <div className="flex flex-row items-center justify-between">
            <div className="flex flex-col gap-4">
              <h1 className="flex items-center gap-4 text-5xl max-lg:text-4xl max-md:text-3xl max-sm:text-2xl">
                <CubeIcon size={48} className="max-md:size-8" />
                {language.data.status.title}
                <div className={`service-status-badge ${overallStatus}`}></div>
              </h1>
              <p className="text-lg max-lg:text-base max-md:text-sm max-sm:text-xs">
                {language.data.status.last_refreshed}:{" "}
                {!fetching && lastRefresh
                  ? lastRefresh.toLocaleString()
                  : language.data.status.refreshing}
              </p>
            </div>
            <div className="flex flex-row items-center gap-4">
              <a onClick={refresh}>
                <MyButton className="max-md:scale-95 max-sm:scale-90">
                  {fetching ? <Spinner /> : language.data.status.refresh}
                </MyButton>
              </a>
            </div>
          </div>
          <div className="status-block">
            <h1 className="text-3xl">{language.data.status.overall}</h1>
            <div className="mt-4 flex flex-col gap-4">
              <div className="service-list">
                <h1>Internal APIs</h1>
                <div
                  className={`service-status-badge ${handshakeStatus ? "operational" : handshakeStatus === null ? "unknown" : "down"}`}
                ></div>
              </div>
              <div className="service-list">
                <h1>Ponlponl123 APIs</h1>
                <div
                  className={`service-status-badge ${ponlponl123ApiStatus ? "operational" : ponlponl123ApiStatus === null ? "unknown" : "down"}`}
                ></div>
              </div>
              <div className="service-list">
                <h1>Web Socket Connections</h1>
                <div
                  className={`service-status-badge ${websocketStatus ? "operational" : websocketStatus === null ? "unknown" : "down"}`}
                ></div>
              </div>
              <div className="service-list">
                <h1>Redis networks Connections</h1>
                <div
                  className={`service-status-badge ${redisStatus ? "operational" : redisStatus === null ? "unknown" : "down"}`}
                ></div>
              </div>
              <div className="service-list">
                <h1>Lavalink Connection</h1>
                <div
                  className={`service-status-badge ${lavalinkStatus ? "operational" : lavalinkStatus === null ? "unknown" : "down"}`}
                ></div>
              </div>
              <div className="service-list">
                <h1>Cloudflare Workers</h1>
                <div className={`service-status-badge operational`}></div>
              </div>
              <div className="service-list">
                <h1>Shards Connection</h1>
                <div
                  className={`service-status-badge ${clusterInfoStatus && clusterInfoStatus.totalShards > 0 ? "operational" : clusterInfoStatus === null ? "unknown" : "down"}`}
                ></div>
              </div>
              <div className="service-list">
                <h1>Cluster Connections</h1>
                <div
                  className={`service-status-badge ${clusterInfoStatus && clusterInfoStatus.totalShards > 0 ? "operational" : clusterInfoStatus === null ? "unknown" : "down"}`}
                ></div>
              </div>
              <div className="service-list">
                <h1>Discord Gateway Connection</h1>
                <div className={`service-status-badge operational`}></div>
              </div>
            </div>
          </div>
          <div className="flex gap-3 max-lg:flex-col">
            <div className="status-block">
              <h1 className="text-3xl">{language.data.status.regionsloads}</h1>
              <div className="mt-4 flex flex-col gap-1">
                <div className="service-list">
                  <div className="flex flex-1 flex-col items-start justify-start">
                    <h1>AP-TH_TH-10.0</h1>
                    <span className="text-xs tracking-widest text-foreground/40! select-all">
                      th.bangkok.ponl.fun
                    </span>
                  </div>
                  <div className={`service-status-badge`}></div>
                </div>
                <div className="service-list">
                  <div className="flex flex-1 flex-col items-start justify-start">
                    <h1>AP-TH_TH-11.6</h1>
                    <span className="text-xs tracking-widest text-foreground/40! select-all">
                      th.samutprakan.ponl.fun
                    </span>
                  </div>
                  <div className={`service-status-badge operational`}></div>
                </div>
                <div className="service-list">
                  <div className="flex flex-1 flex-col items-start justify-start">
                    <h1>AP-SG_1</h1>
                    <span className="text-xs tracking-widest text-foreground/40! select-all">
                      sg.singapore.ponl.fun
                    </span>
                  </div>
                  <div className={`service-status-badge`}></div>
                </div>
                <div className="service-list">
                  <div className="flex flex-1 flex-col items-start justify-start">
                    <h1>AP-HK_1</h1>
                    <span className="text-xs tracking-widest text-foreground/40! select-all">
                      hk.hongkong.ponl.fun
                    </span>
                  </div>
                  <div className={`service-status-badge`}></div>
                </div>
                <div className="service-list">
                  <div className="flex flex-1 flex-col items-start justify-start">
                    <h1>AP-JP_1</h1>
                    <span className="text-xs tracking-widest text-foreground/40! select-all">
                      jp.tokyo.ponl.fun
                    </span>
                  </div>
                  <div className={`service-status-badge`}></div>
                </div>
              </div>
            </div>
            <div className="status-block">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h1 className="-mt-1 text-3xl">
                    {language.data.status.app_res_ms}
                  </h1>
                  <div className={`service-status-badge operational no-label`}>
                    {language.data.status.unit}
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-start gap-2">
                  <div className="flex items-center justify-start gap-1 rounded-2xl border-2 border-foreground/5! p-1">
                    <span className="mr-1 ml-2 text-sm text-foreground/40!">
                      Filter:{" "}
                    </span>
                    {
                      // create all viewType buttons
                      filterOptions.map((mode, index) => (
                        <Button
                          key={index}
                          variant={viewMode === mode ? "default" : "ghost"}
                          size="sm"
                          className={clsx(
                            "min-h-0 min-w-0 rounded-md px-3 text-xs font-bold",
                            viewMode === mode
                              ? "bg-primary text-primary-foreground!"
                              : "bg-background text-foreground",
                            index === 0
                              ? "rounded-l-xl"
                              : index === filterOptions.length - 1
                                ? "rounded-r-xl"
                                : ""
                          )}
                          onClick={() => {
                            setViewMode(mode as viewType)
                          }}
                        >
                          {mode}
                        </Button>
                      ))
                    }
                  </div>
                </div>
              </div>
              <div className="relative h-full w-full">
                <ManagerChart mode={viewMode} />
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="status-block flex-row! items-center! justify-between!">
              <h1 className="text-3xl max-md:text-xl max-sm:text-lg">
                {language.data.status.active_shards}
              </h1>
              <div
                className={clsx(
                  `service-status-badge no-label m-0! text-lg!`,
                  clusterInfoStatus && clusterInfoStatus.totalShards > 0
                    ? "operational"
                    : clusterInfoStatus === null
                      ? "unknown"
                      : "down"
                )}
              >
                {clusterInfoStatus ? clusterInfoStatus.totalShards : "0"}
              </div>
            </div>
            <div className="status-block flex-row! items-center! justify-between!">
              <h1 className="text-3xl max-md:text-xl max-sm:text-lg">
                {language.data.status.active_clusters}
              </h1>
              <div
                className={clsx(
                  `service-status-badge no-label m-0! text-lg!`,
                  1 > 0
                    ? "operational"
                    : clusterInfoStatus === null
                      ? "unknown"
                      : "down"
                )}
              >
                1
              </div>
            </div>
          </div>
        </main>
      </div>
      <br />
    </main>
  )
}

export default Status
