export interface SSLConfig {
  rejectUnauthorized: boolean
  trustedDomains: Set<string>
  fallbackToHTTP: boolean
  timeout: number
}

let cachedConfig: SSLConfig | null = null

const TRUSTED_DOMAINS_LIST = [
  "img.youtube.com",
  "i.ytimg.com",
  "ytimg.com",
  "yt3.ggpht.com",
  "yt3.googleusercontent.com",
  "cdn.discordapp.com",
  "githubusercontent.com",
  "github.com",
  "lh3.googleusercontent.com",
  "avatars.githubusercontent.com",
]

export function getSSLConfig(): SSLConfig {
  if (cachedConfig) return cachedConfig

  const isProduction =
    (process.env.NODE_ENV || process.env.NODE_ENV) === "production"

  cachedConfig = {
    rejectUnauthorized:
      (process.env.NODE_TLS_REJECT_UNAUTHORIZED ||
        process.env.NODE_TLS_REJECT_UNAUTHORIZED) !== "0",
    trustedDomains: new Set(TRUSTED_DOMAINS_LIST),
    fallbackToHTTP: isProduction,
    timeout: parseInt(
      process.env.SSL_TIMEOUT || process.env.SSL_TIMEOUT || "15000",
      10
    ),
  }

  return cachedConfig
}

export function isSSLError(error: Error): boolean {
  const sslPattern =
    /certificate|SSL|TLS|issuer|self signed|CERT_UNTRUSTED|UNABLE_TO_GET_ISSUER_CERT|CERT_AUTHORITY_INVALID|DEPTH_ZERO_SELF_SIGNED_CERT/i
  return sslPattern.test(error.message)
}

export function isTrustedDomain(url: string): boolean {
  try {
    const { hostname } = new URL(url)
    const host = hostname.toLowerCase()
    const config = getSSLConfig()

    return Array.from(config.trustedDomains).some(
      (domain) => host === domain || host.endsWith(`.${domain}`)
    )
  } catch {
    return false
  }
}
