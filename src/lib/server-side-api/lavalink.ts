"use server"
import { EndpointHTTP } from "./endpoint"

export type LavalinkServiceStatus = "operational" | "degraded" | "down"

export default async function handshake(): Promise<LavalinkServiceStatus> {
  try {
    const response = await fetch(`${EndpointHTTP}/v1/lavalink`, {
      cache: "no-store",
    })
    const data = await response.json().catch(() => null)
    if (data?.status === "operational") return "operational"
    if (data?.status === "degraded") return "degraded"
    if (data?.status === "down" || !response.ok) return "down"
    return response.ok ? "operational" : "down"
  } catch {
    return "down"
  }
}

