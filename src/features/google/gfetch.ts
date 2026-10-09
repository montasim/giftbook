import { GoogleError } from "./errors"

// সব গুগল কল এখান দিয়ে। 429 → backoff ৩ বার।
export async function gfetch<T>(token: string | null, url: string, init: RequestInit = {}, tries = 3): Promise<T> {
  if (!token) throw new GoogleError(401, "no-token")
  const res = await fetch(url, { ...init, headers: { ...(init.headers ?? {}), Authorization: `Bearer ${token}`, "Content-Type": "application/json" } })
  if (res.status === 429 && tries > 0) {
    await new Promise((r) => setTimeout(r, 2 ** (4 - tries) * 1000))
    return gfetch<T>(token, url, init, tries - 1)
  }
  if (!res.ok) throw new GoogleError(res.status, await res.text())
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T)
}
