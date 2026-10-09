import { env } from "@/config/env"
import { gfetch } from "../gfetch"
import { GoogleError } from "../errors"
import type { AuthApi, GoogleUser } from "../types"

const SCOPE = "https://www.googleapis.com/auth/drive.file"
const KEY = "uk-token"
type Token = { value: string; expiresAt: number }

const load = (): Token | null => {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "null")
  } catch {
    return null
  }
}
let token: Token | null = null

export const realAuth: AuthApi = {
  currentToken() {
    token ??= load()
    return token && token.expiresAt > Date.now() ? token.value : null
  },
  requestToken(hint) {
    return new Promise((resolve, reject) => {
      if (typeof google === "undefined" || !google.accounts?.oauth2) return reject(new GoogleError(0, "gsi-not-loaded"))
      const client = google.accounts.oauth2.initTokenClient({
        client_id: env.VITE_GOOGLE_CLIENT_ID,
        scope: SCOPE,
        login_hint: hint,
        callback: (r) => {
          if (r.error) return reject(new GoogleError(401, r.error))
          token = { value: r.access_token, expiresAt: Date.now() + (Number(r.expires_in) - 60) * 1000 }
          localStorage.setItem(KEY, JSON.stringify(token))
          resolve(token.value)
        },
        error_callback: (e) => reject(new GoogleError(401, e.type)),
      })
      client.requestAccessToken({ prompt: hint ? "" : "consent" })
    })
  },
  async fetchUser(): Promise<GoogleUser> {
    const r = await gfetch<{ user: { emailAddress: string; displayName: string } }>(this.currentToken(), "https://www.googleapis.com/drive/v3/about?fields=user")
    return { email: r.user.emailAddress.toLowerCase(), name: r.user.displayName }
  },
  clear() {
    token = null
    localStorage.removeItem(KEY)
  },
}
