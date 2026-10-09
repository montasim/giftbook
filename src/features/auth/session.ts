import { useSyncExternalStore } from "react"
import type { GoogleUser } from "@/features/google/types"

// localStorage-এ সেশন (PWA-তে প্রতিবার লগইন নয়)
export type Session = { user: GoogleUser | null; fileId: string | null; redirect: string | null }
const KEY = "uk-session"
const EMPTY: Session = { user: null, fileId: null, redirect: null }
const read = (): Session => {
  if (typeof localStorage === "undefined") return EMPTY
  try {
    return { ...EMPTY, ...JSON.parse(localStorage.getItem(KEY) ?? "{}") }
  } catch {
    return EMPTY
  }
}
let state: Session = read()
const listeners = new Set<() => void>()
const set = (patch: Partial<Session>) => {
  state = { ...state, ...patch }
  localStorage.setItem(KEY, JSON.stringify(state))
  listeners.forEach((l) => l())
}
if (typeof window !== "undefined") window.addEventListener("storage", (e) => { if (e.key === KEY) { state = read(); listeners.forEach((l) => l()) } })

export const getSession = () => state
export const useSession = () => useSyncExternalStore((l) => (listeners.add(l), () => listeners.delete(l)), getSession, () => EMPTY)
export const login = (user: GoogleUser) => { localStorage.setItem("uk-last-email", user.email); set({ user, fileId: null }) }
export const logout = () => set(EMPTY)
export const setActiveFile = (fileId: string | null) => set({ fileId })
export const setRedirect = (redirect: string | null) => set({ redirect })
export const takeRedirect = () => { const r = state.redirect; if (r) set({ redirect: null }); return r }
export const lastEmail = () => (typeof localStorage === "undefined" ? null : localStorage.getItem("uk-last-email"))

// dev: সব মুছে শুরু থেকে
export function resetEverything() {
  for (const k of Object.keys(localStorage)) if (/^(uk-|sheet-)/.test(k)) localStorage.removeItem(k)
}
