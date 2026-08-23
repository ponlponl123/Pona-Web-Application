"use server"
const API_ENDPOINT = "https://discord.com/api/v10"

export interface UserInfo {
  id: string
  username: string
  avatar: string
  discriminator: string
  public_flags: number
  flags: number
  banner: string
  email?: string
  accent_color: number
  global_name: string
  avatar_decoration_data: {
    asset: string
    sku_id: string
    expires_at: string
  }
  banner_color: string
  mfa_enabled: boolean
  locale: string
  premium_type: number
}

export interface Login {
  key: string
  type: string
}

const COMMON_HEADERS = {
  "User-Agent": "Pona! Application (OpenPonlponl123.com/v1)",
}

export async function fetchByAccessToken(
  key: string,
  keyType: string
): Promise<false | Omit<UserInfo, "email">> {
  try {
    const response = await fetch(`${API_ENDPOINT}/users/@me`, {
      method: "GET",
      headers: {
        ...COMMON_HEADERS,
        Authorization: `${keyType} ${key}`,
      },
      signal: AbortSignal.timeout(10000),
    })

    if (response.ok) {
      const userData = (await response.json()) as UserInfo

      return {
        id: userData.id,
        username: userData.username,
        avatar: userData.avatar,
        discriminator: userData.discriminator,
        public_flags: userData.public_flags,
        flags: userData.flags,
        banner: userData.banner,
        accent_color: userData.accent_color,
        global_name: userData.global_name,
        avatar_decoration_data: userData.avatar_decoration_data,
        banner_color: userData.banner_color,
        mfa_enabled: userData.mfa_enabled,
        locale: userData.locale,
        premium_type: userData.premium_type,
      }
    }
    return false
  } catch (error) {
    console.error(
      "[FetchByAccessToken] Error:",
      error instanceof Error ? error.message : "Unknown"
    )
    return false
  }
}

export async function authorizeUserAccessToken(
  key: string,
  type: "auth_only" | "invite"
): Promise<false | Login> {
  const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID
  const clientSecret = process.env.DISCORD_CLIENT_SECRET
  const redirect_uri =
    process.env.NEXT_PUBLIC_DISCORD_REDIRECT_ENDPOINT ||
    "https://pona.ponlponl123.com/app/callback"

  if (!key || !clientId || !clientSecret) return false

  try {
    const params = new URLSearchParams()
    params.append("grant_type", "authorization_code")
    params.append(
      "redirect_uri",
      `${redirect_uri}${type === "invite" ? "?from=invite" : ""}`
    )
    params.append("code", key)

    const credentials = btoa(`${clientId}:${clientSecret}`)

    const response = await fetch(`${API_ENDPOINT}/oauth2/token`, {
      method: "POST",
      headers: {
        ...COMMON_HEADERS,
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
      },
      body: params.toString(),
      signal: AbortSignal.timeout(15000),
    })

    if (response.ok) {
      const data = await response.json()
      if (data.access_token) {
        return {
          key: data.access_token,
          type: data.token_type,
        }
      }
    }
    return false
  } catch (error) {
    console.error(
      "[AuthorizeUserAccessToken] Error:",
      error instanceof Error ? error.message : "Unknown"
    )
    return false
  }
}

export async function revokeUserAccessToken(key: string): Promise<boolean> {
  const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID
  const clientSecret = process.env.DISCORD_CLIENT_SECRET

  if (!key || !clientId || !clientSecret) return false

  try {
    const params = new URLSearchParams()
    params.append("token_type_hint", "access_token")
    params.append("token", key)

    const credentials = btoa(`${clientId}:${clientSecret}`)

    const response = await fetch(`${API_ENDPOINT}/oauth2/token/revoke`, {
      method: "POST",
      headers: {
        ...COMMON_HEADERS,
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
      },
      body: params.toString(),
      signal: AbortSignal.timeout(15000),
    })

    return response.ok
  } catch (error) {
    console.error(
      "[RevokeUserAccessToken] Error:",
      error instanceof Error ? error.message : "Unknown"
    )
    return false
  }
}
