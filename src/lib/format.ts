const BN = "০১২৩৪৫৬৭৮৯"
export const toBanglaDigits = (s: string | number | null | undefined) =>
  String(s ?? "").replace(/\d/g, (d) => BN[Number(d)] ?? d)
export const toAsciiDigits = (s: string | number | null | undefined) =>
  String(s ?? "").replace(/[০-৯]/g, (d) => String(BN.indexOf(d)))

export function parseAmount(s: string): number | null {
  const digits = toAsciiDigits(s).replace(/\D/g, "")
  return digits === "" ? null : parseInt(digits, 10)
}

// ৳২,০০,০০০ — লাখ গ্রুপিং, বাংলা সংখ্যা (Intl bn-BD ব্রাউজারভেদে অনিশ্চিত)
export function formatTaka(n: number | null | undefined): string {
  if (n == null) return ""
  return (n < 0 ? "-" : "") + "৳" + toBanglaDigits(Math.abs(n).toLocaleString("en-IN"))
}

export const MONTHS = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"]

// "2018" → "২০১৮", "2018-03" → "মার্চ ২০১৮", "2018-03-12" → "১২ মার্চ ২০১৮"
export function formatPartialDate(d: string | null | undefined): string {
  if (!d) return ""
  const [y, m, day] = d.split("-")
  const parts: string[] = []
  if (day) parts.push(toBanglaDigits(Number(day)))
  if (m) parts.push(MONTHS[Number(m) - 1] ?? m)
  parts.push(toBanglaDigits(y))
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
export const formatPhone = (p: string) => toBanglaDigits(p)

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return ""
  const d = new Date(iso)
  const hh = String(d.getHours()).padStart(2, "0")
  const mm = String(d.getMinutes()).padStart(2, "0")
  return toBanglaDigits(`${d.getDate()} ${MONTHS[d.getMonth()]}, ${hh}:${mm}`)
}

export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return ""
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return "এইমাত্র"
  if (s < 3600) return toBanglaDigits(Math.floor(s / 60)) + " মিনিট আগে"
  if (s < 86400) return toBanglaDigits(Math.floor(s / 3600)) + " ঘণ্টা আগে"
  return toBanglaDigits(Math.floor(s / 86400)) + " দিন আগে"
}

export const today = () => new Date().toISOString().slice(0, 10)
export const initials = (name: string | null | undefined) => (name ?? "?").trim().slice(0, 1).toUpperCase()
