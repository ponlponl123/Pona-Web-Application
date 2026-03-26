"use server"
import { EndpointHTTP } from "./endpoint"

export default async function handshake(): Promise<boolean> {
  try {
    const response = await fetch(`${EndpointHTTP}/v1/lavalink`)
    return response.ok
  } catch {
    return false
  }
}
