"use server"
import { EndpointHTTP, EndpointKey } from "./endpoint"

export interface ClusterInfo {
  message: string
  lastShard: number
  firstShard: number
  totalShards: number
  shardList: number[]
}

export default async function clusterInfo(): Promise<false | ClusterInfo> {
  try {
    const response = await fetch(`${EndpointHTTP}/v1/cluster`, {
      headers: {
        Authorization: `Pona! ${EndpointKey}`,
      },
    })

    if (response.ok) {
      return (await response.json()) as ClusterInfo
    }
    return false
  } catch {
    return false
  }
}
