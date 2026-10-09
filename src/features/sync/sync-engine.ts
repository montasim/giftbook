import { useSyncExternalStore } from "react"
import { auth, drive, sheets, isMock } from "@/features/google"
import { createMockSheets } from "@/features/google/mock/sheets"
import { getSession, lastEmail } from "@/features/auth/session"
import { openLedger } from "@/features/ledger/db"
import { dexieAdapter } from "./dexie-adapter"
import { syncOnce, type CycleResult } from "./sync-cycle"

export type SyncStatus = "synced" | "syncing" | "offline" | "needs-token" | "tampered" | "revoked" | "paused" | "error"
export type Simulate = { offline: boolean; tokenExpired: boolean; tampered: boolean }
export type SyncState = {
  pending: number
  lastSyncAt: string | null
  paused: boolean
  error: "revoked" | "tampered" | "error" | null
  last: CycleResult | null
  running: boolean
  simulate: Simulate // শুধু dev/mock
}

const DEBOUNCE_MS = 3000
let state: SyncState = { pending: 0, lastSyncAt: null, paused: false, error: null, last: null, running: false, simulate: { offline: false, tokenExpired: false, tampered: false } }
const listeners = new Set<() => void>()
const set = (patch: Partial<SyncState>) => {
  state = { ...state, ...patch }
  listeners.forEach((l) => l())
}
let timer: ReturnType<typeof setTimeout> | null = null
let started = false

const online = () => (typeof navigator === "undefined" ? true : navigator.onLine) && !state.simulate.offline
const hasToken = () => !state.simulate.tokenExpired && auth.currentToken() !== null

export function statusOf(s: SyncState): SyncStatus {
  if (s.error === "revoked") return "revoked"
  if (s.error === "tampered") return "tampered"
  if (s.paused) return "paused"
  if (!hasToken()) return "needs-token"
  if (!online()) return "offline"
  if (s.running) return "syncing"
  if (s.error === "error") return "error"
  return "synced"
}

export const getSyncState = () => state
export const useSync = () => useSyncExternalStore((l) => (listeners.add(l), () => listeners.delete(l)), getSyncState, getSyncState)

export function onWrite() {
  set({ pending: state.pending + 1 })
  if (timer) clearTimeout(timer)
  timer = setTimeout(run, DEBOUNCE_MS)
}

export async function run() {
  const { fileId, user } = getSession()
  if (!fileId || !user || state.running) return
  if (state.paused || !online() || !hasToken() || state.error === "tampered") return set({})
  set({ running: true })
  try {
    await drive.getFile(fileId, user.email) // 403/404 → অনুমতি নেই / ফাইল নেই
    const api = isMock ? createMockSheets(undefined, { tamper: state.simulate.tampered }) : sheets
    const result = await syncOnce({ api, db: dexieAdapter(openLedger(fileId)), fileId })
    set({ pending: 0, lastSyncAt: new Date().toISOString(), error: null, last: result, running: false })
  } catch (e) {
    const status = (e as { status?: number }).status
    const msg = String((e as Error).message ?? "")
    const error: SyncState["error"] = status === 403 || status === 404 ? "revoked" : msg.startsWith("sheet-tampered") ? "tampered" : "error"
    if (status === 401) auth.clear()
    set({ error, running: false })
  }
}

// ইউজারের চাপে: টোকেন নেই → Google পপআপ (hint দিলে প্রায় নিঃশব্দ)
export async function syncNow() {
  if (state.simulate.tokenExpired) set({ simulate: { ...state.simulate, tokenExpired: false } })
  if (!auth.currentToken()) {
    try {
      await auth.requestToken(lastEmail() ?? undefined)
    } catch {
      return set({})
    }
  }
  if (state.error === "tampered" || state.error === "error") set({ error: null })
  await run()
}
export const pause = () => set({ paused: true, error: null })
export const reset = () => set({ pending: 0, error: null, paused: false, lastSyncAt: null, last: null })
export const setSimulate = (patch: Partial<Simulate>) => {
  set({ simulate: { ...state.simulate, ...patch }, error: patch.tampered === false ? null : state.error })
  void run()
}

export function startSync() {
  if (started || typeof window === "undefined") return
  started = true
  window.addEventListener("online", () => void run())
  window.addEventListener("offline", () => set({}))
  setInterval(() => document.visibilityState === "visible" && void run(), 60000)
  void run()
}
