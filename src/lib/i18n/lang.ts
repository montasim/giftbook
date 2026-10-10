// ভাষা: localStorage("uk-lang") → navigator.language → en। বদলালে reload — t module-init-এ একবারই ঠিক হয়।
export const LANGS = ["bn", "en"] as const
export type Lang = (typeof LANGS)[number]
export const LANG_KEY = "uk-lang"

const isLang = (s: unknown): s is Lang => (LANGS as readonly string[]).includes(s as string)

export function pickLang(stored: string | null, navLang: string | undefined): Lang {
  if (isLang(stored)) return stored
  return navLang?.toLowerCase().startsWith("bn") ? "bn" : "en"
}

export function getLang(): Lang {
  if (typeof window === "undefined") return "bn" // prerender shell: বাংলা
  return pickLang(localStorage.getItem(LANG_KEY), navigator.language)
}

export function setLang(l: Lang) {
  localStorage.setItem(LANG_KEY, l)
  location.reload()
}
