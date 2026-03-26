"use server"
import { EndpointHTTP, EndpointKey } from "./endpoint"

export default async function handshake(): Promise<boolean> {
  try {
    const response = await fetch(EndpointHTTP, {
      headers: {
        Authorization: `Pona! ${EndpointKey}`,
      },
    })
    return response.ok
  } catch {
    return false
  }
}
