# i18n (বাংলা + English) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** পুরো অ্যাপ (প্রতিটা পেজ, কম্পোনেন্ট, ফরম্যাটার, এক্সপোর্ট, প্রিন্ট) বাংলা ও ইংরেজি দুই ভাষায় চলবে; ইউজার সেটিং/হেডার থেকে ভাষা বদলাতে পারবে, পছন্দ localStorage-এ থাকবে।

**Architecture:** এখনকার `t` অবজেক্ট-প্যাটার্নই থাকছে। `src/lib/i18n/bn.ts` থেকে `Dict` টাইপ, `en.ts` একই আকারে ইংরেজি, `index.ts`-এ পেজ লোডের সময় একবার ভাষা ঠিক করে `t` export। ভাষা বদল = `localStorage` + `location.reload()` — তাই ৩৩২টা `t.x.y` কল-সাইট, module-scope কনজিউমার (`site.ts`, `to-xlsx.ts`, `event-types.ts`) কিছুই বদলাতে হয় না। সংখ্যা/মাস/তারিখ/collation ভাষা-সচেতন ফরম্যাটার দিয়ে। URL অপরিবর্তিত, SEO/প্রি-রেন্ডার shell বাংলাই (ডিফল্ট)।

**Tech Stack:** TypeScript (`typeof bn` → `Dict`, কম্পাইল-টাইমে key parity), node:test, বিদ্যমান shadcn `ToggleGroup`/`Button`, TanStack Router। নতুন ডিপেন্ডেন্সি নেই।

## Global Constraints

- সিদ্ধান্ত (ইউজার, ২০২৬-১০-১০): ভাষা = সেটিং + `localStorage` (`uk-lang`), URL-এ নয়।
- ডিফল্ট: stored না থাকলে `navigator.language` `bn` দিয়ে শুরু হলে `bn`, নইলে `en`; server/prerender-এ সবসময় `bn`।
- English মোডে: ASCII সংখ্যা, English মাসের নাম, টাকা `৳` + লাখ গ্রুপিং (`৳2,00,000`) — গ্রুপিং দুই ভাষায় একই (`toLocaleString("en-IN")`)।
- Google Sheet-এর কলাম হেডার schema key (`id`, `name`, …) — ভাষা-নিরপেক্ষ, ছোঁয়া যাবে না। Excel এক্সপোর্ট ও প্রিন্ট UI ভাষায়।
- ডেমো/সিড ডাটা (`seed.ts`, mock account নাম) ডাটা, অনুবাদ নয় — অপরিবর্তিত।
- `en.ts`-এ কোনো বাংলা অক্ষর থাকবে না (`/[ঀ-৿]/`), শুধু `appName`-এর পাশে ব্র্যান্ড হিসেবে `(উপহারের খাতা)` ব্যতিক্রম নয় — appName = `Upohar Khata`।
- `Dict`-এর প্রতিটা key দুই ভাষায় থাকবে, একই টাইপ (string / function / array); ফাংশনের arity সমান। টেস্ট এটা পাহারা দেয়।
- প্রতিটা টাস্ক শেষে: `pnpm typecheck && pnpm lint && pnpm test` সবুজ, তারপর কমিট।
- কমিট মেসেজ ইংরেজিতে, Conventional Commits, শেষে `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`।

## ফাইল-ম্যাপ

| ফাইল | দায়িত্ব |
|---|---|
| `src/lib/i18n/lang.ts` (নতুন) | `Lang` টাইপ, `pickLang()` (pure), `getLang()`, `setLang()` (store + reload) |
| `src/lib/i18n/bn.ts` | `export const bn`, `export type Dict = typeof bn`; নতুন key: `months`, `time`, `eventTypes`, `lang`, `settings.demoMode`, `settings.language`, `seo.features` |
| `src/lib/i18n/en.ts` (নতুন) | `export const en: Dict` — পুরো ইংরেজি |
| `src/lib/i18n/index.ts` (নতুন) | `lang`, `dicts`, `dict(l)`, `t` — সব কনজিউমার এখান থেকে import করে |
| `src/lib/format.ts` | `digits()`, `months(l)`, `formatPartialDate/Taka/DateTime/Phone/timeAgo` ভাষা-সচেতন, `collate()` |
| `src/components/common/lang-switch.tsx` (নতুন) | অন্য ভাষায় যাওয়ার বাটন |
| `src/test/i18n.test.ts`, `src/test/format.test.ts` (নতুন) | parity/no-Bangla, ফরম্যাট দুই ভাষায় |
| `src/config/event-types.ts`, `src/config/site.ts`, `src/routes/__root.tsx`, `src/routes/_app/settings.tsx`, `src/routes/privacy.tsx`, `src/components/common/sync-status.tsx`, `src/features/google/real/picker.ts` | হার্ডকোডেড বাংলা / `"bn"` → i18n |
| `toBanglaDigits` ব্যবহারকারী ১০ ফাইল, `localeCompare(…, "bn")` ৪ ফাইল | `digits()` / `collate()` |
| `src/routes/index.tsx`, `src/routes/login.tsx`, `src/components/common/public-layout.tsx`, `src/routes/_app/settings.tsx` | `LangSwitch` বসানো |
| `README.md`, `docs/GAP-ANALYSIS.md` | ডকস |

---

### Task 1: `lang.ts` — ভাষা বাছাই (pure + storage)

**Files:**
- Create: `src/lib/i18n/lang.ts`
- Test: `src/test/i18n.test.ts`

**Interfaces:**
- Produces: `type Lang = "bn" | "en"`, `LANGS: readonly Lang[]`, `pickLang(stored: string | null, navLang: string | undefined): Lang`, `getLang(): Lang`, `setLang(l: Lang): void`, `LANG_KEY = "uk-lang"`.

- [ ] **Step 1: failing test**

```ts
// src/test/i18n.test.ts
import { test } from "node:test"
import assert from "node:assert/strict"
import { pickLang } from "../lib/i18n/lang.ts"

test("pickLang: stored জেতে, নইলে navigator, নইলে en", () => {
  assert.equal(pickLang("en", "bn-BD"), "en")
  assert.equal(pickLang("bn", "en-US"), "bn")
  assert.equal(pickLang("xx", "bn-BD"), "bn") // অচেনা stored উপেক্ষা
  assert.equal(pickLang(null, "bn-BD"), "bn")
  assert.equal(pickLang(null, "bn"), "bn")
  assert.equal(pickLang(null, "en-US"), "en")
  assert.equal(pickLang(null, undefined), "en")
})
```

- [ ] **Step 2: run, expect FAIL** — `pnpm test` → `Cannot find module '../lib/i18n/lang.ts'`

- [ ] **Step 3: implement**

```ts
// src/lib/i18n/lang.ts
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
```

- [ ] **Step 4: run, expect PASS** — `pnpm test`
- [ ] **Step 5: commit** — `feat(i18n): language picker (stored → navigator → en)`

---

### Task 2: `Dict` টাইপ, `index.ts`, import মাইগ্রেশন (en = bn placeholder নয় — en.ts পরের টাস্কে; এই টাস্কে build সবুজ রাখতে `en` সাময়িকভাবে `bn` রেফারেন্স করে)

**Files:**
- Modify: `src/lib/i18n/bn.ts:1-3` (export নাম), শেষ লাইন
- Create: `src/lib/i18n/index.ts`, `src/lib/i18n/en.ts` (সাময়িক)
- Modify: ৪১টা ফাইল — `from "@/lib/i18n/bn"` → `from "@/lib/i18n"`

**Interfaces:**
- Produces: `export const bn`, `export type Dict = typeof bn` (bn.ts); `export const lang: Lang`, `export const dicts: Record<Lang, Dict>`, `export const dict = (l: Lang) => Dict`, `export const t: Dict` (index.ts).

- [ ] **Step 1: bn.ts export বদলাও**

```ts
// src/lib/i18n/bn.ts (লাইন ১-৩ এর বদলে)
// বাংলা — রেফারেন্স ডিকশনারি; en.ts একই আকারে (Dict)। কনজিউমার import করে "@/lib/i18n" থেকে।
export const bn = {
  appName: 'উপহারের খাতা',
```

শেষ লাইনের পরে:

```ts
export type Dict = typeof bn
```

- [ ] **Step 2: সাময়িক en.ts + index.ts**

```ts
// src/lib/i18n/en.ts (Task 3-এ পুরো অনুবাদে বদলাবে)
import { bn, type Dict } from "./bn"
export const en: Dict = bn
```

```ts
// src/lib/i18n/index.ts
import { bn, type Dict } from "./bn"
import { en } from "./en"
import { getLang, type Lang } from "./lang"

export type { Dict, Lang }
export { setLang, LANGS } from "./lang"
export const dicts: Record<Lang, Dict> = { bn, en }
export const dict = (l: Lang): Dict => dicts[l]
export const lang: Lang = getLang()
export const t: Dict = dict(lang)
```

- [ ] **Step 3: import মাইগ্রেশন**

```bash
grep -rl 'from "@/lib/i18n/bn"' src | xargs sed -i 's#from "@/lib/i18n/bn"#from "@/lib/i18n"#'
grep -rn 'i18n/bn"' src   # expected: no output
```

- [ ] **Step 4: verify** — `pnpm typecheck && pnpm lint && pnpm test` সবুজ; `pnpm build` সবুজ (`[sw] … precached`)।
- [ ] **Step 5: commit** — `refactor(i18n): Dict type, i18n index, import path`

---

### Task 3: `en.ts` — পুরো ইংরেজি অনুবাদ (parity টেস্ট গেট)

**Files:**
- Modify: `src/lib/i18n/bn.ts` (নতুন key যোগ, নিচে), `src/lib/i18n/en.ts` (পুরো), `src/test/i18n.test.ts`

**Interfaces:**
- Produces (দুই ডিকশনারিতেই নতুন key):
  - `months: string[]` (১২টা)
  - `time: { justNow: string; minutesAgo: (n: string) => string; hoursAgo: (n: string) => string; daysAgo: (n: string) => string }`
  - `eventTypes: Record<"wedding"|"holud"|"walima"|"aqiqah"|"khatna"|"birthday"|"other", string>`
  - `lang: { label: string; other: string; otherCode: "en" | "bn" }` — `other` = অন্য ভাষার নাম তার নিজের লিপিতে (bn-এ `'English'`, en-এ `'বাংলা'`)
  - `settings.demoMode: string`, `settings.language: string`
  - `seo.features: string[]` (JSON-LD featureList)
  - (bn.ts-এ ইতিমধ্যে আছে, en-এ লাগবে) `about.*` — /about পাতা (title, link, lead, sections[4], developerTitle, developerName, developerNote)

- [ ] **Step 1: failing tests**

```ts
// src/test/i18n.test.ts-এ যোগ
import { bn } from "../lib/i18n/bn.ts"
import { en } from "../lib/i18n/en.ts"

type Leaf = { path: string; kind: string; arity?: number }
const leaves = (o: unknown, path = ""): Leaf[] => {
  if (typeof o === "function") return [{ path, kind: "function", arity: o.length }]
  if (Array.isArray(o)) return [{ path, kind: "array" }]
  if (o && typeof o === "object") return Object.entries(o).flatMap(([k, v]) => leaves(v, path ? `${path}.${k}` : k))
  return [{ path, kind: typeof o }]
}
const strings = (o: unknown): string[] => {
  if (typeof o === "string") return [o]
  if (typeof o === "function") return [String((o as (...a: string[]) => string)("5", "5", "5"))]
  if (Array.isArray(o)) return o.flatMap(strings)
  if (o && typeof o === "object") return Object.values(o).flatMap(strings)
  return []
}

test("i18n: en-এর key/টাইপ/arity bn-এর সমান", () => {
  assert.deepEqual(leaves(en), leaves(bn))
})

test("i18n: en-এ বাংলা অক্ষর নেই (privacy.english বাদে), ফাঁকা নেই", () => {
  const { privacy, ...rest } = en
  const { english: _e, ...privacyRest } = privacy
  const all = strings({ ...rest, privacy: privacyRest })
  const bangla = all.filter((s) => /[ঀ-৿]/.test(s))
  assert.deepEqual(bangla, [])
  assert.deepEqual(all.filter((s) => s.trim() === ""), [])
})

test("i18n: নতুন key দুই ভাষায়", () => {
  for (const d of [bn, en]) {
    assert.equal(d.months.length, 12)
    assert.equal(Object.keys(d.eventTypes).length, 7)
    assert.ok(d.lang.other && d.settings.language && d.time.justNow)
  }
  assert.equal(bn.lang.otherCode, "en"); assert.equal(en.lang.otherCode, "bn")
})
```

- [ ] **Step 2: run, expect FAIL** — `bn.months` undefined / `leaves` mismatch।

- [ ] **Step 3: bn.ts-এ নতুন key**

```ts
// bn.ts: যথাস্থানে যোগ
  months: ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'],
  time: { justNow: 'এইমাত্র', minutesAgo: (n: string) => `${n} মিনিট আগে`, hoursAgo: (n: string) => `${n} ঘণ্টা আগে`, daysAgo: (n: string) => `${n} দিন আগে` },
  eventTypes: { wedding: 'বিয়ে', holud: 'গায়ে হলুদ', walima: 'বউভাত', aqiqah: 'আকিকা', khatna: 'খতনা', birthday: 'জন্মদিন', other: 'অন্যান্য' },
  lang: { label: 'ভাষা', other: 'English', otherCode: 'en' as const },
  // settings-এর ভেতরে:
    demoMode: 'ডেমো মোড', language: 'ভাষা / Language',
  // seo-এর ভেতরে:
    features: ['অনুষ্ঠান ও উপহারের হিসাব', 'Google Sheet-এ ডাটা', 'অফলাইনেও চলে', 'QR দিয়ে পরিবারের সাথে শেয়ার', 'এক্সেল ও প্রিন্ট'],
```

- [ ] **Step 4: en.ts পুরো লেখো**

`en.ts` = `bn.ts`-এর হুবহু কাঠামো, প্রতিটা string ইংরেজি। এটা প্ল্যানে লিটারালি না দেওয়ার কারণ আকার (~৩২ KB); parity + no-Bangla টেস্টই সম্পূর্ণতার গেট। নিয়ম:

- শুরু: `export const en: Dict = {` — `Dict` থেকে import `./bn`; কোনো key বাদ পড়লে/বাড়লে tsc ফেল করে।
- শব্দভাণ্ডার (সব জায়গায় একই): খাতা → *ledger*; অনুষ্ঠান → *event*; উপহার → *gift*; মানুষ → *people* (nav) / *person*; পেলাম/দিলাম → *Received / Given*; খাম খোলা বাকি → *Envelope pending*; শিট → *Sheet*; ফোনের কপি → *local copy*; সিঙ্ক → *sync*; শেয়ার → *share*; join → *join*; নমুনা ডাটা → *sample data*; মালিক → *owner*।
- টোন: ছোট, বন্ধুসুলভ, বাটনে imperative (`Save`, `Cancel`, `Delete`), টাইটেলে Title Case নয় — Sentence case।
- টেমপ্লেট ফাংশন: একই প্যারামিটার ক্রম, `n` যেমন আসে তেমন বসাও (সংখ্যা ফরম্যাট কলার করে)। যেমন `offline: (n) => \`Offline${n ? \` (${n} pending)\` : ''}\``, `rejected: (n) => \`${n} rows could not be read\``, `lastCycle: (p, u, a) => \`${p} gifts in the sheet, this run ${u} updated / ${a} new\``।
- `appName: 'Upohar Khata'`, `tagline: 'Your family gift ledger, in one place'`।
- `months`: `['January', …, 'December']`; `time`: `justNow: 'just now'`, `minutesAgo: (n) => \`${n} min ago\``, `hoursAgo: (n) => \`${n} h ago\``, `daysAgo: (n) => \`${n} d ago\``।
- `eventTypes`: `wedding: 'Wedding', holud: 'Gaye holud', walima: 'Walima', aqiqah: 'Aqiqah', khatna: 'Khatna', birthday: 'Birthday', other: 'Other'`।
- `lang: { label: 'Language', other: 'বাংলা', otherCode: 'bn' as const }`।
- `privacy.sections`: ইংরেজিতে পুরো নীতি (bn-এর ৬ সেকশনই অনুবাদ); `privacy.english: ''` (en মোডে ডুপ্লিকেট ব্লক দেখানো হবে না — Task 5); `privacy.updated: 'Last updated: 9 October 2026'`।
- `landing.*`: হিরো, ফিচার, how-to, FAQ — পূর্ণ অনুবাদ; `demoEvent`/`demoRows` ডেমো কার্ডের নাম ইংরেজি (যেমন `Sakib's wedding`, `Rahim mama`)।
- `xlsx.*`/`print.*`: কলাম হেডার ইংরেজি (`Name, Phone, Received/Given, Amount, Item, Note, Event, Date, Total`)।

- [ ] **Step 5: run, expect PASS** — `pnpm test`; `pnpm typecheck`।
- [ ] **Step 6: commit** — `feat(i18n): English dictionary`

---

### Task 4: ভাষা-সচেতন ফরম্যাটার + collation

**Files:**
- Modify: `src/lib/format.ts`
- Modify (`toBanglaDigits` → `digits`): `src/routes/events.$eventId.print.tsx`, `src/routes/_app/people.$personId.tsx`, `src/routes/index.tsx`, `src/routes/_app/events.$eventId.tsx`, `src/routes/_app/settings.tsx`, `src/features/events/event-totals.tsx`, `src/routes/_app/events.index.tsx`, `src/components/common/pagination.tsx`, `src/features/events/event-card.tsx`, `src/features/gifts/gift-form.tsx`
- Modify (`localeCompare(…, "bn")` → `collate`): `src/features/ledger/queries.ts:11`, `src/routes/events.$eventId.print.tsx:33`, `src/features/gifts/gift-table.tsx:17`, `src/features/people/person-history.tsx:20`
- Modify: `src/features/google/real/picker.ts:18` (`.setLocale(lang)`), `src/components/common/sync-status.tsx:12` (`String(s.pending)` → `digits(s.pending)`)
- Test: `src/test/format.test.ts`

**Interfaces:**
- Produces: `digits(s, l = lang): string`, `months(l = lang): string[]`, `formatTaka(n, l = lang)`, `formatPartialDate(d, l = lang)`, `formatDateTime(iso, l = lang)`, `formatPhone(p, l = lang)`, `timeAgo(iso, l = lang)`, `collate(a: string, b: string): number`। `toBanglaDigits`/`toAsciiDigits` থাকে (ইনপুট পার্সিং)। `MONTHS` export মুছে যায় (কনজিউমার নেই)।

- [ ] **Step 1: failing test**

```ts
// src/test/format.test.ts
import { test } from "node:test"
import assert from "node:assert/strict"
import { digits, formatTaka, formatPartialDate, timeAgo } from "../lib/format.ts"

test("digits: bn বাংলা, en ASCII", () => {
  assert.equal(digits(1234, "bn"), "১২৩৪")
  assert.equal(digits(1234, "en"), "1234")
})
test("formatTaka: লাখ গ্রুপিং দুই ভাষায়, সংখ্যা ভাষামতো", () => {
  assert.equal(formatTaka(200000, "bn"), "৳২,০০,০০০")
  assert.equal(formatTaka(200000, "en"), "৳2,00,000")
  assert.equal(formatTaka(-500, "en"), "-৳500")
})
test("formatPartialDate: year/month/day দুই ভাষায়", () => {
  assert.equal(formatPartialDate("2018-03-12", "bn"), "১২ মার্চ ২০১৮")
  assert.equal(formatPartialDate("2018-03-12", "en"), "12 March 2018")
  assert.equal(formatPartialDate("2018-03", "en"), "March 2018")
  assert.equal(formatPartialDate("2018", "en"), "2018")
})
test("timeAgo: en", () => {
  const ago = (s: number) => new Date(Date.now() - s * 1000).toISOString()
  assert.equal(timeAgo(ago(10), "en"), "just now")
  assert.equal(timeAgo(ago(120), "en"), "2 min ago")
  assert.equal(timeAgo(ago(120), "bn"), "২ মিনিট আগে")
})
```

- [ ] **Step 2: run, expect FAIL** — `digits` is not exported।

- [ ] **Step 3: format.ts**

```ts
// src/lib/format.ts
import { dict, lang, type Lang } from "@/lib/i18n"

const BN = "০১২৩৪৫৬৭৮৯"
export const toBanglaDigits = (s: string | number | null | undefined) =>
  String(s ?? "").replace(/\d/g, (d) => BN[Number(d)] ?? d)
export const toAsciiDigits = (s: string | number | null | undefined) =>
  String(s ?? "").replace(/[০-৯]/g, (d) => String(BN.indexOf(d)))
// UI-র সংখ্যা: bn → বাংলা অঙ্ক, en → ASCII
export const digits = (s: string | number | null | undefined, l: Lang = lang) => (l === "bn" ? toBanglaDigits(s) : String(s ?? ""))
export const months = (l: Lang = lang) => dict(l).months

export function parseAmount(s: string): number | null {
  const digits = toAsciiDigits(s).replace(/\D/g, "")
  return digits === "" ? null : parseInt(digits, 10)
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
```

- [ ] **Step 4: কল-সাইট মাইগ্রেশন**

```bash
# toBanglaDigits → digits (format.ts বাদে)
grep -rl "toBanglaDigits" src --include=*.tsx --include=*.ts | grep -v lib/format.ts | xargs sed -i 's/\btoBanglaDigits\b/digits/g'
# localeCompare(x, y, "bn") → collate(x, y)
sed -i 's/a\.name\.localeCompare(b\.name, "bn")/collate(a.name, b.name)/' src/features/ledger/queries.ts
sed -i 's/(a\.person?\.name ?? "")\.localeCompare(b\.person?\.name ?? "", "bn")/collate(a.person?.name ?? "", b.person?.name ?? "")/' src/routes/events.\$eventId.print.tsx
sed -i 's/a\.localeCompare(b, "bn")/collate(a, b)/' src/features/gifts/gift-table.tsx src/features/people/person-history.tsx
grep -rn 'localeCompare' src   # expected: শুধু select.tsx/select-search.ts-এর toLocaleLowerCase, কোনো "bn" নেই
```

তারপর যে ফাইলে `collate` ব্যবহার হলো সেখানে `import { collate } from "@/lib/format"` যোগ (queries.ts, print, gift-table, person-history); `digits`-এর import নাম sed-এ বদলে গেছে, যাচাই `pnpm typecheck`।

`src/features/google/real/picker.ts`: লাইন ১-এর পরে `import { lang } from "@/lib/i18n"`, লাইন ১৮ `.setLocale("bn")` → `.setLocale(lang)`।
`src/components/common/sync-status.tsx:12`: `t.sync.offline(s.pending ? String(s.pending) : "")` → `t.sync.offline(s.pending ? digits(s.pending) : "")` (+ import)। একই ফাইলে অন্য `String(` থাকলে একইভাবে।

- [ ] **Step 5: run, expect PASS** — `pnpm test && pnpm typecheck && pnpm lint`
- [ ] **Step 6: commit** — `feat(i18n): locale-aware digits, months, dates, collation`

---

### Task 5: বাকি হার্ডকোডেড বাংলা / `"bn"` → i18n

**Files:**
- Modify: `src/config/event-types.ts`, `src/config/site.ts:25,28`, `src/routes/__root.tsx:93`, `src/routes/_app/settings.tsx:118`, `src/routes/privacy.tsx` (english ব্লক), `src/routes/__root.tsx` (`document.documentElement.lang`)

- [ ] **Step 1: event-types.ts**

```ts
import type { IconName } from "./icons.ts"
import { t } from "@/lib/i18n"

// ধরন যোগ/বদল শুধু এখানে; লেবেল i18n-এ (t.eventTypes)
export const EVENT_TYPES = {
  wedding: { label: t.eventTypes.wedding, icon: "wedding" },
  holud: { label: t.eventTypes.holud, icon: "holud" },
  walima: { label: t.eventTypes.walima, icon: "walima" },
  aqiqah: { label: t.eventTypes.aqiqah, icon: "baby" },
  khatna: { label: t.eventTypes.khatna, icon: "star" },
  birthday: { label: t.eventTypes.birthday, icon: "cake" },
  other: { label: t.eventTypes.other, icon: "other" },
} as const satisfies Record<string, { label: string; icon: IconName }>
```

(বাকি export অপরিবর্তিত। `as const` থাকলেও label টাইপ `string`-ই হয় কারণ `t.eventTypes.*` string।)

- [ ] **Step 2: site.ts** — `inLanguage: "bn"` → `inLanguage: lang`, `featureList: [...]` → `featureList: t.seo.features`; উপরে `import { lang, t } from "@/lib/i18n"` (আগের `t` import বদলে)।

- [ ] **Step 3: __root.tsx** — `import { lang, t } from "@/lib/i18n"`; `<html lang="bn"` → `<html lang={lang}`; `App`-এর useEffect-এ এক লাইন: `document.documentElement.lang = lang` (prerendered shell bn, ক্লায়েন্টে ঠিক হয়)।

- [ ] **Step 4: settings.tsx:118** — `"ডেমো মোড"` → `t.settings.demoMode`।

- [ ] **Step 5: privacy.tsx:32** — `<p>{p.english}</p>` (ও তার উপরের "English" heading, থাকলে) `{p.english && (<>…</>)}` দিয়ে মোড়াও (en মোডে `english: ""` → ব্লক নেই)।

- [ ] **Step 6: যাচাই**

```bash
grep -rnP '[\x{0980}-\x{09FF}]' src --include=*.tsx --include=*.ts | grep -v "src/lib/i18n/bn.ts" | grep -v "src/test/" | grep -v "seed.ts\|mock/store.ts" | grep -vP '^\S+:\d+:\s*//|//\s' 
# expected: শুধু lib/format.ts-এর BN অঙ্কের স্ট্রিং
pnpm typecheck && pnpm lint && pnpm test
```

- [ ] **Step 7: commit** — `refactor(i18n): move remaining hardcoded Bangla to dictionary`

---

### Task 6: `LangSwitch` + বসানো (ল্যান্ডিং, লগইন, পাবলিক ফুটার, সেটিংস)

**Files:**
- Create: `src/components/common/lang-switch.tsx`
- Modify: `src/routes/index.tsx` (হেডার nav, Button-এর আগে), `src/routes/login.tsx:56-60` (ফুটার লিংক সারি), `src/components/common/public-layout.tsx` (footer), `src/routes/_app/settings.tsx` (অ্যাকাউন্ট কার্ডের পরে নতুন কার্ড)

**Interfaces:**
- Produces: `LangSwitch({ className?, variant? = "ghost" })` — ক্লিক করলে `setLang(t.lang.otherCode)`; লেবেল `t.lang.other`; `aria-label={t.lang.label}`; `lang={t.lang.otherCode}` attribute (স্ক্রিন রিডার/ফন্ট)।

- [ ] **Step 1: কম্পোনেন্ট**

```tsx
// src/components/common/lang-switch.tsx
import { Button } from "@/components/ui/button"
import { setLang, t } from "@/lib/i18n"

// অন্য ভাষায় যাওয়ার বাটন: bn-এ "English", en-এ "বাংলা"। বদলালে reload (t module-init-এ ঠিক হয়)।
export function LangSwitch({ className, variant = "ghost" }: { className?: string; variant?: "ghost" | "outline" }) {
  return (
    <Button type="button" variant={variant} size="sm" className={className} lang={t.lang.otherCode} aria-label={t.lang.label} onClick={() => setLang(t.lang.otherCode)}>
      {t.lang.other}
    </Button>
  )
}
```

(`src/components/ui/button.tsx`-এ variants: default/outline/secondary/ghost/destructive — `link` নেই।)

- [ ] **Step 2: ল্যান্ডিং হেডার** — `src/routes/index.tsx`-এ `<nav …>`-এর পরে, লগইন `Button`-এর আগে: `<LangSwitch className="ml-auto sm:ml-0" />`; লগইন বাটনের `className="ml-auto sm:ml-0"` → `""` (এখন LangSwitch-ই `ml-auto` নেয়)।
- [ ] **Step 3: লগইন ফুটার** — `login.tsx`-এর `<p className="flex gap-3 text-xs …">` সারির শেষে `<LangSwitch className="h-auto p-0 text-xs" />`।
- [ ] **Step 4: পাবলিক ফুটার** — `public-layout.tsx` footer-এর শেষে একই `<LangSwitch className="h-auto p-0 text-xs" />`।
- [ ] **Step 5: সেটিংস কার্ড** — অ্যাকাউন্ট `<Card>`-এর পরে:

```tsx
<Card>
  <CardHeader><CardTitle>{t.settings.language}</CardTitle></CardHeader>
  <CardContent className="flex items-center justify-between gap-3">
    <span className="text-sm text-stone-600">{lang === "bn" ? "বাংলা" : "English"}</span>
    <LangSwitch variant="outline" />
  </CardContent>
</Card>
```

(`import { lang, t } from "@/lib/i18n"`, `import { LangSwitch } from "@/components/common/lang-switch"`।)

- [ ] **Step 6: যাচাই** — `pnpm typecheck && pnpm lint && pnpm build`; `pnpm dev:mock` → লগইন পাতায় "English" চাপলে reload, সব ইংরেজি; সেটিংসে "বাংলা" চাপলে ফেরে; reload-এর পরেও ভাষা থাকে; নতুন ইনকগনিটো (en-US ব্রাউজার) → ইংরেজি।
- [ ] **Step 7: commit** — `feat(i18n): language switch on landing, login, public footer, settings`

---

### Task 7: E2E যাচাই + ডকস

**Files:**
- Modify: `README.md` (স্ট্যাক লাইন + i18n অনুচ্ছেদ), `docs/GAP-ANALYSIS.md` (i18n এন্ট্রি)

- [ ] **Step 1: হেডলেস যাচাই** — `vite build --mode mock`, `dist/client` SPA সার্ভারে (`/tmp/spa-serve.mjs` প্যাটার্ন: আসল ফাইল, নইলে `_shell.html`), playwright-core + system Chrome:
  - `localStorage.uk-lang` খালি, `locale: "en-US"` context → `/` → body-তে বাংলা অক্ষর নেই, `document.documentElement.lang === "en"`; মক লগইন → `/events` → `New event` বাটন, `Received`/`Given`; তারিখ `10 October 2026`; টাকা `৳5,000`।
  - `locale: "bn-BD"` → সব বাংলা, `lang === "bn"`।
  - en-এ সেটিংস → "বাংলা" ক্লিক → reload → বাংলা; `localStorage.uk-lang === "bn"`।
  - অফলাইন (`setOffline(true)`) reload `/events` → ভাষা অপরিবর্তিত (SW থেকে shell, localStorage থেকে ভাষা)।
- [ ] **Step 2: README** — স্ট্যাক লাইনে `i18n (bn/en, src/lib/i18n)`; "ভাষা" অনুচ্ছেদ: কোথায় ডিকশনারি, নতুন টেক্সট দুই ফাইলে যোগ করতে হয়, টেস্ট কী পাহারা দেয়, ভাষা কীভাবে ঠিক হয়।
- [ ] **Step 3: commit** — `docs: i18n notes`

---

## ঝুঁকি / সচেতনতা

- **Reload-on-switch:** ইনপুটে অসংরক্ষিত লেখা থাকলে হারাবে। সুইচ শুধু হেডার/ফুটার/সেটিংসে, ফর্মের ভেতরে নয় — গ্রহণযোগ্য।
- **প্রি-রেন্ডার shell বাংলা:** en ইউজারের প্রথম পেইন্টে `<title>`/meta বাংলা, JS চালু হলে `HeadContent` ইংরেজি করে। SEO এক ভাষায় (bn) — সিদ্ধান্তমতো।
- **Picker `setLocale`:** Google Picker UI ভাষা `lang`-এর সাথে যাবে; `en` সমর্থিত।
- **ফন্ট:** Hind Siliguri-তে Latin glyph আছে, ইংরেজি UI-তে আলাদা ফন্ট লাগে না।
- **ভবিষ্যৎ ভাষা:** `LANGS`-এ কোড + নতুন `xx.ts: Dict` — আর কিছু না; তখন `LangSwitch` দুই-ভাষার টগল থেকে ড্রপডাউন হবে (এখন YAGNI)।
