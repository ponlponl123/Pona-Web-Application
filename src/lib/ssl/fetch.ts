import { isSSLError, isTrustedDomain } from "./config"

interface FetchWithFallbackOptions extends RequestInit {
  timeout?: number
  ignoreSSLErrors?: boolean
}

interface BunRequestInit extends RequestInit {
  tls?: {
    rejectUnauthorized?: boolean
  }
}

export async function fetchWithSSLFallback(
  url: string,
  options: FetchWithFallbackOptions = {}
): Promise<Response> {
  const { timeout = 15000, ignoreSSLErrors = false, ...fetchOptions } = options

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  const getOptions = (relaxSSL: boolean = false): BunRequestInit => ({
    ...fetchOptions,
    signal: controller.signal,
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; Pona-Image-Proxy/1.0)",
      Accept: "image/*,*/*;q=0.8",
      "Accept-Encoding": "gzip, deflate, br",
      ...fetchOptions.headers,
    },
    tls: {
      rejectUnauthorized: !relaxSSL,
    },
  })

  try {
    return await fetch(url, getOptions(ignoreSSLErrors))
  } catch (error) {
    if (
      !(error instanceof Error) ||
      !isSSLError(error) ||
      !isTrustedDomain(url)
    ) {
      throw error
    }

    console.warn(`[Bun SSL Fallback] Issue detected for: ${url}`)
    const urlObj = new URL(url)

    try {
      console.log(`Retrying with relaxed TLS...`)
      return await fetch(url, getOptions(true))
    } catch (retryError) {
      console.warn("[Bun SSL Fallback] Relaxed TLS failed, err:", retryError)
    }

    const isYouTube =
      urlObj.hostname.includes("youtube.com") ||
      urlObj.hostname.includes("ytimg.com")
    if (urlObj.protocol === "https:" && isYouTube) {
      urlObj.protocol = "http:"
      console.log(`[Bun SSL Fallback] Attempting HTTP: ${urlObj.toString()}`)

      try {
        return await fetch(urlObj.toString(), getOptions())
      } catch (httpError) {
        console.error(
          "[Bun SSL Fallback] HTTP fallback failed, err:",
          httpError
        )
      }
    }

    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}
