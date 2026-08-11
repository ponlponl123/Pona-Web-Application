import { headers as getNextHeaders } from "next/headers"

export const Endpoint = process.env.PONA_APPLICATION_ENDPOINT_HOST
export const EndpointPort = process.env.PONA_APPLICATION_ENDPOINT_PORT
export const EndpointKey = process.env.PONA_APPLICATION_ENDPOINT_KEY

export const EndpointHTTP = `http://${Endpoint}:${EndpointPort}`

export async function getForwardHeaders(): Promise<Record<string, string>> {
  const forward: Record<string, string> = {}
  try {
    const reqHeaders = await getNextHeaders()
    const keys = [
      "user-agent",
      "accept-language",
      "x-forwarded-for",
      "x-real-ip",
      "x-user-lang",
      "x-user-country",
      "cf-ipcountry",
      "x-user-timezone",
      "x-time-zone",
      "sec-ch-ua",
      "sec-ch-ua-mobile",
      "sec-ch-ua-platform",
      "cookie",
      "x-ytmusic-cookie",
    ]
    for (const key of keys) {
      const val = reqHeaders.get(key)
      if (val) forward[key] = val
    }
  } catch {
    // Silence errors when invoked outside request lifecycle
  }
  return forward
}

export async function fetchWithForwardHeaders(
  input: string | URL,
  init?: RequestInit
): Promise<Response> {
  const forwardHeaders = await getForwardHeaders()
  const combinedHeaders = {
    ...forwardHeaders,
    ...init?.headers,
  }
  return fetch(input, {
    ...init,
    headers: combinedHeaders,
  })
}
