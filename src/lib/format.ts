import { dict, lang, type Lang } from "./i18n/index.ts"

const BN = "০১২৩৪৫৬৭৮৯"
export const toBanglaDigits = (s: string | number | null | undefined) =>
  String(s ?? "").replace(/\d/g, (d) => BN[Number(d)] ?? d)
export const toAsciiDigits = (s: string | number | null | undefined) =>
  String(s ?? "").replace(/[০-৯]/g, (d) => String(BN.indexOf(d)))
// UI-র সংখ্যা: bn → বাংলা অঙ্ক, en → ASCII
export const digits = (s: string | number | null | undefined, l: Lang = lang) => (l === "bn" ? toBanglaDigits(s) : String(s ?? ""))
export const months = (l: Lang = lang) => dict(l).months

export function parseAmount(s: string): number | null {
  const d = toAsciiDigits(s).replace(/\D/g, "")
  return d === "" ? null : parseInt(d, 10)
}

// ৳২,০০,০০০ — লাখ গ্রুপিং দুই ভাষাতেই (Intl bn-BD ব্রাউজারভেদে অনিশ্চিত), অঙ্ক ভাষামতো
export function formatTaka(n: number | null | undefined, l: Lang = lang): string {
  if (n == null) return ""
  return (n < 0 ? "-" : "") + "৳" + digits(Math.abs(n).toLocaleString("en-IN"), l)
}

// "2018" → "২০১৮", "2018-03" → "মার্চ ২০১৮", "2018-03-12" → "১২ মার্চ ২০১৮"
export function formatPartialDate(d: string | null | undefined, l: Lang = lang): string {
  if (!d) return ""
  const [y, m, day] = d.split("-")
  const parts: string[] = []
  if (day) parts.push(digits(Number(day), l))
  if (m) parts.push(months(l)[Number(m) - 1] ?? m)
  parts.push(digits(y, l))
  return parts.join(" ")
}

export type DatePrecision = "day" | "month" | "year"
export const datePrecision = (d: string): DatePrecision => (!d ? "day" : d.length === 4 ? "year" : d.length === 7 ? "month" : "day")

// "+880 1711-000000" → "01711000000"
export function normalizePhone(s: string): string {
  let d = toAsciiDigits(s).replace(/\D/g, "")
  if (d.startsWith("880")) d = "0" + d.slice(3)
  return d
}
export const formatPhone = (p: string, l: Lang = lang) => digits(p, l)

export function formatDateTime(iso: string | null | undefined, l: Lang = lang): string {
  if (!iso) return ""
  const d = new Date(iso)
  const hh = String(d.getHours()).padStart(2, "0")
  const mm = String(d.getMinutes()).padStart(2, "0")
  return digits(`${d.getDate()} ${months(l)[d.getMonth()]}, ${hh}:${mm}`, l)
}

export function timeAgo(iso: string | null | undefined, l: Lang = lang): string {
  if (!iso) return ""
  const tt = dict(l).time
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return tt.justNow
  if (s < 3600) return tt.minutesAgo(digits(Math.floor(s / 60), l))
  if (s < 86400) return tt.hoursAgo(digits(Math.floor(s / 3600), l))
  return tt.daysAgo(digits(Math.floor(s / 86400), l))
}

// নাম সাজানো — ভাষামতো collation
export const collate = (a: string, b: string) => a.localeCompare(b, lang)

export const today = () => new Date().toISOString().slice(0, 10)
export const initials = (name: string | null | undefined) => (name ?? "?").trim().slice(0, 1).toUpperCase()
