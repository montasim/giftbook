import { bn, type Dict } from "./bn.ts"
import { en } from "./en.ts"
import { getLang, type Lang } from "./lang.ts"

export type { Dict, Lang }
export { setLang, LANGS } from "./lang.ts"
export const dicts: Record<Lang, Dict> = { bn, en }
export const dict = (l: Lang): Dict => dicts[l]
export const lang: Lang = getLang()
export const t: Dict = dict(lang)
