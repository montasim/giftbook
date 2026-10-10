# উপহারের খাতা — ইমপ্লিমেন্টেশন প্ল্যান v2

**ভিত্তি:** `upohar-khata/` প্রোটোটাইপ (HTML + Tailwind + JS) = অনুমোদিত স্পেক। এই প্ল্যান সেটাকে হুবহু ক্লোন করে, পছন্দের স্ট্যাকে, আর ব্যাকএন্ড (আসল Google + সিঙ্ক) জুড়ে দেয়।
**স্ট্যাক:** TanStack Start (SPA mode) · TypeScript · Tailwind v4 · shadcn/ui · Hugeicons · Dexie · Zod · TanStack Form · Google Sheets/Drive/Picker API · SheetJS · qrcode.react · vite-plugin-pwa
**নিয়ম:** সন্দেহ হলে প্রোটোটাইপ খুলে দেখো (`npm run dev` → http://localhost:4173)। প্রোটোটাইপ যা করে, অ্যাপ তা-ই করবে; পর্দায় যা দেখায়, তা-ই দেখাবে। এই দলিলে "→ proto:" মানে প্রোটোটাইপের ফাইল, যেটা থেকে লজিক/লেখা সরাসরি নেওয়া যায়।

---

## ০. সিদ্ধান্ত (v1 থেকে যা বদলেছে, তারকা দিয়ে)

| বিষয় | সিদ্ধান্ত |
|---|---|
| রেন্ডারিং | SPA, স্ট্যাটিক হোস্টিং, hash নয় — TanStack Router history routing + SPA rewrite |
| আসল খাতা | Google Sheet (মালিকের ড্রাইভে), appProperties দিয়ে চিহ্নিত |
| ফোনের কপি | Dexie, প্রতি খাতায় আলাদা DB `ledger-<fileId>` |
| লাইভ আপডেট | `useLiveQuery` (ক্রস-ট্যাবও Dexie নিজে করে) |
| সিঙ্ক | pull → merge (LWW `updatedAt`) → push; ★ ডুপ্লিকেট-append গার্ড; ★ হেডার যাচাই শুধু প্রথম N কলাম |
| মুছে ফেলা | soft delete `deletedAt`; সারি কখনো মোছে না |
| অনুমতি | শুধু `drive.file`; শেয়ার করা ফাইল Picker দিয়ে একবার |
| ★ সেশন | টোকেন + ইউজার + fileId সব **localStorage** (PWA-তে প্রতিবার লগইন নয়)। প্রোটোটাইপের sessionStorage শুধু A/B টেস্টের সুবিধার জন্য ছিল। |
| ★ লেআউট | তিনটা: মোবাইল `<640` (bottom tabs, bottom-sheet, কার্ড-লিস্ট, FAB) · ট্যাব `640–1023` (top nav, 2-col grid) · ডেস্কটপ `≥1024` (sidebar, 2-column পাতা) |
| ★ ফর্ম | সব `<form noValidate>`; এরর শুধু Zod → বাংলা, Field-এর নিচে। ব্রাউজারের ইংরেজি বাবল কখনো না |
| ★ তারিখ | native `date`/`month`/`text` input + নিচে বাংলা প্রিভিউ লাইন ("২০ ডিসেম্বর ২০২৪") |
| ★ টাকা | `'৳' + toBanglaDigits(n.toLocaleString('en-IN'))` — লাখ গ্রুপিং, Intl `bn-BD` নয় (ব্রাউজারভেদে অনিশ্চিত) |
| QR | URL `${origin}/join?f=<fileId>`, ফোনের ক্যামেরা |
| ★ মার্জ | dup-এর ফোন/ঠিকানা/সম্পর্ক/নোট keep-এর ফাঁকা ঘরে কপি হয় |

সীমাবদ্ধতা অপরিবর্তিত: প্রথম লগইনে নেট লাগে; তারপর অফলাইনে লেখা যায়, নেট এলে সিঙ্ক।

---

## ১. ফোল্ডার কাঠামো (প্রোটোটাইপ → স্ট্যাক ম্যাপ)

```
src/
├─ routes/
│  ├─ __root.tsx                 # html lang=bn, ফন্ট, গুগল স্ক্রিপ্ট, Toaster, 404
│  ├─ login.tsx                  → proto routes/login.js
│  ├─ join.tsx                   → proto routes/join.js   (search: { f })
│  ├─ setup.tsx                  → proto routes/setup.js  (search: { pick? })
│  ├─ _app.tsx                   # guard + AppShell        → proto app.js render() + components/common/app-shell.js
│  ├─ _app/index.tsx             → proto routes/home.js
│  ├─ _app/events.$eventId.tsx   → proto routes/event.js
│  ├─ _app/people.index.tsx      → proto routes/people.js
│  ├─ _app/people.$personId.tsx  → proto routes/person.js
│  ├─ _app/share.tsx             → proto routes/share.js
│  ├─ _app/settings.tsx          → proto routes/settings.js
│  └─ events.$eventId.print.tsx  → proto routes/print.js  (_app-এর বাইরে: shell নেই)
├─ components/
│  ├─ ui/                        # shadcn জেনারেটেড (হাতে বদলানো নিষেধ)
│  └─ common/                    → proto components/common/*
│     app-icon · app-shell · bare-layout · fab · money · nav · page-header · partial-date · stat · sync-banner · sync-status · empty-state · confirm-dialog · responsive-dialog · field
├─ features/
│  ├─ auth/      google-auth.ts · use-auth.ts · session.ts       → proto features/auth/auth.js
│  ├─ google/    gfetch.ts · drive.ts · sheets.ts · picker.ts     → proto features/google/* (মক) + v1 §৬–৭
│  ├─ ledger/    schema.ts · db.ts · repo.ts · queries.ts · hooks.ts · seed.ts → proto features/ledger/*
│  ├─ sync/      rows.ts · merge.ts · sync-engine.ts · use-sync.ts → proto features/sync/sync-engine.js (অবস্থা-মেশিন) + v1 §৭
│  ├─ events/    event-card · event-form · event-totals            → proto features/events/*
│  ├─ gifts/     direction-toggle · gift-form · gift-table · quick-add → proto features/gifts/*
│  ├─ people/    person-combobox · person-form · person-history · merge-person-dialog → proto features/people/*
│  ├─ sharing/   qr-card · member-list                              → proto features/sharing/*
│  └─ export/    to-xlsx.ts                                        → proto features/export/to-xlsx.js
├─ config/       env.ts · icons.ts · event-types.ts · nav.ts        → proto config/*
├─ lib/          i18n/bn.ts · format.ts · utils.ts (cn = clsx+tailwind-merge)  → proto lib/*
└─ styles.css
```

**নিয়ম (অপরিবর্তিত + নতুন):**
- প্রতিটা ফাইলের একটা কাজ। `routes/` পাতলা: হুক দিয়ে ডাটা আনে, কম্পোনেন্ট জোড়ে। ★ route কখনো `drive.ts`/`sheets.ts` সরাসরি ডাকে না — `features/*/use-*.ts` হুকের ভেতর দিয়ে (প্রোটোটাইপে share/setup/join সরাসরি ডাকত; এখানে না)।
- লেখা: শুধু `repo.ts`। পড়া: শুধু `queries.ts` (pure) + `hooks.ts` (`useLiveQuery` মোড়ক)। `deletedAt` queries-এ বাদ, কম্পোনেন্টে না।
- সব বাংলা লেখা `lib/i18n/bn.ts` — proto `src/lib/i18n/bn.js` **হুবহু কপি** (১৪টা গ্রুপ: nav, common, login, setup, home, event, gift, people, share, join, settings, sync, print, xlsx)। ফাংশন-স্ট্রিং (`(n) => ...`) টাইপ করে নাও।
- সব আইকন `config/icons.ts`, সব সংখ্যা/তারিখ `lib/format.ts`, সব ধরন `config/event-types.ts`, নেভ আইটেম `config/nav.ts`।
- ★ Dependency direction: `routes → features/<x>/components → features/<x>/use-*.ts → ledger/repo|queries, sync, google → gfetch`।

ESLint (`eslint.config.js`): `react/forbid-elements` — `button input textarea select label table dialog hr a` → `Button Input Textarea Select Label Table Dialog Separator Link`, ignores `src/components/ui/**`। ★ `a` যোগ হয়েছে: সব লিংক `<Link>` (TanStack) — proto `components/ui/link.js`।

---

## ২. ফেজ ০ — Google Cloud (অপরিবর্তিত)

1. প্রজেক্ট → Sheets API, Drive API, Picker API চালু।
2. OAuth consent: External, নাম "উপহারের খাতা", scope শুধু `https://www.googleapis.com/auth/drive.file`, test users।
3. OAuth Client ID (Web): origins `http://localhost:3000` + প্রোড ডোমেইন।
4. API Key: শুধু Picker API, HTTP referrer সীমাবদ্ধ।
5. Project **number** → `VITE_GOOGLE_APP_ID`। ★ প্রথম দিনেই Picker দিয়ে একটা শেয়ার করা ফাইল বেছে `drive.file` অ্যাক্সেস মিলছে কি না যাচাই করো — ভুল `setAppId` নিঃশব্দে ব্যর্থ হয়।

```bash
# .env  (config/env.ts Zod দিয়ে যাচাই করে, না থাকলে বুটে থামে)
VITE_GOOGLE_CLIENT_ID=
VITE_GOOGLE_API_KEY=
VITE_GOOGLE_APP_ID=
```

---

## ৩. ফেজ ১ — প্রজেক্ট শুরু + ডিজাইন সিস্টেম

```bash
npm create @tanstack/start@latest upohar-khata
npx shadcn@latest init
npx shadcn@latest add button card input textarea label select toggle-group dialog drawer table tabs badge sonner dropdown-menu command popover alert separator avatar skeleton switch
npm i dexie dexie-react-hooks zod @tanstack/react-form @hugeicons/react @hugeicons/core-free-icons qrcode.react @fontsource/hind-siliguri clsx tailwind-merge
npm i -D @types/google.accounts @types/google.picker @types/gapi vitest eslint-plugin-react vite-plugin-pwa
npm i https://cdn.sheetjs.com/xlsx-latest/xlsx-latest.tgz
```

`vite.config.ts`: `tanstackStart({ spa: { enabled: true } })` (অপশনের নাম ডকে মিলিয়ে নিও) + `VitePWA` (§১০)। `__root.tsx` head: `accounts.google.com/gsi/client`, `apis.google.com/js/api.js`।

### ৩.১ ডিজাইন টোকেন (proto index.html + README "ডিজাইন টোকেন")

| টোকেন | মান |
|---|---|
| ফন্ট | `Hind Siliguri` 400/500/600/700, `font-sans` |
| রং | primary `emerald-700` (hover 800), bg `stone-50`, surface `white`, border `stone-200/300`; পেলাম `emerald-700`, দিলাম `amber-700`, খাম-বাকি `amber` (badge `amber-100/800`, row `amber-50/60`), danger `red-600` |
| টেক্সট রং | body `stone-900` · secondary `stone-600` · muted `stone-500` · faint/placeholder/dash `stone-400` |
| টাইপ | title `text-lg sm:text-xl lg:text-2xl font-bold` · card title `text-base font-semibold` · body `text-sm` · meta `text-xs` · stat value `text-lg font-semibold` |
| আইকন স্কেল | 12 (ব্যাজের ভেতরে) · 16 (মেনু, ছোট বাটন, লিস্ট) · 20 (বাটন, নেভ, ডিফল্ট) · 24 (ফিচার টাইল) · 32 (হিরো) — অন্য মান নিষেধ |
| radius | কার্ড/ডায়ালগ `rounded-xl`, বাটন/ইনপুট `rounded-lg`, ব্যাজ/অ্যাভাটার `rounded-full`, bottom-sheet `rounded-t-2xl` |
| প্যাডিং | লিস্ট-কার্ড `p-3`, কন্টেন্ট-কার্ড `p-4` (CardHeader `p-4 pb-2`, CardContent `p-4 pt-2`), ডায়ালগ `px-5` |
| gap | ফিল্ডের ভেতরে 1.5, inline 2, কার্ডের মধ্যে 3, সেকশন 4, ডেস্কটপ কলাম 6 |
| কন্টেইনার | `max-w-3xl px-4 sm:px-6 py-4`, `lg:max-w-5xl lg:px-10 lg:py-8`; মোবাইলে `pb-32` (bottom nav + FAB-এর জায়গা) |
| ব্রেকপয়েন্ট | sm 640 · md 768 · lg 1024 |
| বাটন সাইজ | সব পাতায় `default` (h-10); আইকন-বাটন `icon` (h-10 w-10) / `iconSm` (h-8 w-8); হিরো `lg` (h-12) |

### ৩.২ কম্পোনেন্ট তালিকা (proto `components/ui` + `common` → shadcn/নিজের)

| প্রোটোটাইপ | স্ট্যাকে | বিশেষ আচরণ |
|---|---|---|
| Button | shadcn `button` + `iconSm` সাইজ যোগ, `link` ভ্যারিয়েন্ট | — |
| Input / Textarea / Label / Select | shadcn | Select native-ধাঁচ রাখলেও চলে |
| Field | নিজের `common/field.tsx` | label + control + hint + error (`setError` ≈ TanStack Form field.state.meta.errors) |
| ToggleGroup | shadcn `toggle-group` (single) | `activeClass` প্রতি আইটেমে (পেলাম সবুজ, দিলাম হলুদ) |
| Card family | shadcn | CardHeader-এ `flex-row` override লাগে (ইতিহাস হেডার) — `cn` = tailwind-merge, তাই চলবে |
| Badge | shadcn + ভ্যারিয়েন্ট `success warning destructive outline secondary` | — |
| Dialog | ★ `common/responsive-dialog.tsx`: `<640` shadcn Drawer (bottom sheet, হ্যান্ডেল, `pb-safe`), `≥640` Dialog `max-w-md` (size lg → `max-w-2xl`); Esc/overlay বন্ধ; খুললে প্রথম input ফোকাস; `footer(close)` | — |
| ConfirmDialog | `common/confirm-dialog.tsx` | cancel outline + confirm (default destructive) |
| Table primitives | shadcn table | — |
| Tabs | shadcn tabs (segmented) + count pill | — |
| DropdownMenu | shadcn (Radix: Esc, ↑↓, ফোকাস নিজে করে) | `destructive` আইটেম লাল |
| Alert | shadcn + ভ্যারিয়েন্ট `info warning destructive` + actions স্লট | — |
| EmptyState | `common/empty-state.tsx` | dashed border, আইকন বৃত্ত, title, description, actions |
| Switch | shadcn | — |
| Avatar | shadcn + নামের hash → ৫ রঙের প্যালেট, প্রথম অক্ষর | → proto `ui/avatar.js` |
| Spinner / Separator / Skeleton | shadcn | — |
| Toast | sonner, position bottom-center, মোবাইলে bottom nav-এর উপরে | ২.৫ সে |
| Link | TanStack `Link` + ফোকাস রিং | — |
| AppIcon | `common/app-icon.tsx`: `HugeiconsIcon icon={icons[name]} size strokeWidth={1.75}` | — |
| Money | `common/money.tsx` tone `default received given muted`; null → "—" | → proto `common/money.js` |
| PartialDate | `<time dateTime>` + `formatPartialDate` | — |
| PageHeader | back Link (icon btn) · আইকন টাইল `emerald-100` · h1 truncate · subtitle `line-clamp-2` · actions ডানে | → proto `common/page-header.js` |
| Stat | Card p-3: label xs muted + value lg | — |
| Fab | `fixed bottom-[calc(4rem+safe)] right-4 h-14 rounded-full shadow-lg sm:hidden` | — |
| Nav | ৩ ভ্যারিয়েন্ট: `bottom` (fixed, h-14 আইটেম, 11px লেবেল, safe-area, `sm:hidden`) · `top` (`hidden sm:flex`, pill active) · `side` (ডেস্কটপ sidebar, pill active) | active: `/` এর জন্য `/` ও `/events/*`; বাকি prefix |
| AppShell | §৫.০ | — |
| BareLayout | ব্র্যান্ড উপরে, `max-w-md` সেন্টার — login/setup/join | — |
| SyncStatus / SyncBanner | §৮.৫ | — |

**আইকন ম্যাপ (`config/icons.ts`)** — `@hugeicons/core-free-icons` (v4.3.5, ১৪,৮২৪ export) থেকে যাচাই করা নাম; proto `config/icons.js`-এর key একই:

```ts
import { Home01Icon, UserGroupIcon, Share08Icon, Settings01Icon, PlusSignIcon, GiftIcon, ArrowDown01Icon, ArrowUp01Icon, PrinterIcon, Download01Icon, Delete02Icon, GitMergeIcon, QrCodeIcon, Copy01Icon, ArrowLeft01Icon, Search01Icon, Tick02Icon, Cancel01Icon, RefreshIcon, Alert02Icon, CloudOffIcon, Key01Icon, MoreVerticalIcon, Edit02Icon, Call02Icon, Mail01Icon, GoogleSheetIcon, Book02Icon, Logout01Icon, UserIcon, Calendar03Icon, Location01Icon, ArrowRight01Icon, Clock01Icon, Link01Icon, SentIcon, GoogleIcon, InformationCircleIcon, InboxIcon, DiamondIcon, Sun01Icon, Restaurant01Icon, Baby01Icon, StarIcon, BirthdayCakeIcon, MoreHorizontalIcon } from '@hugeicons/core-free-icons'

export const icons = {
  home: Home01Icon, people: UserGroupIcon, share: Share08Icon, settings: Settings01Icon,
  plus: PlusSignIcon, gift: GiftIcon, in: ArrowDown01Icon, out: ArrowUp01Icon,
  print: PrinterIcon, download: Download01Icon, trash: Delete02Icon, merge: GitMergeIcon,
  qr: QrCodeIcon, copy: Copy01Icon, back: ArrowLeft01Icon, search: Search01Icon,
  check: Tick02Icon, x: Cancel01Icon, sync: RefreshIcon, warning: Alert02Icon,
  cloudOff: CloudOffIcon, key: Key01Icon, more: MoreVerticalIcon, edit: Edit02Icon,
  phone: Call02Icon, mail: Mail01Icon, sheet: GoogleSheetIcon, book: Book02Icon,
  logout: Logout01Icon, user: UserIcon, calendar: Calendar03Icon, location: Location01Icon,
  chevronDown: ArrowDown01Icon, chevronRight: ArrowRight01Icon, clock: Clock01Icon,
  link: Link01Icon, send: SentIcon, google: GoogleIcon, info: InformationCircleIcon, inbox: InboxIcon,
  wedding: DiamondIcon, holud: Sun01Icon, walima: Restaurant01Icon, baby: Baby01Icon,
  star: StarIcon, cake: BirthdayCakeIcon, other: MoreHorizontalIcon,
} as const
```

**ফেজ ১ মাপকাঠি:** খালি অ্যাপ চলে, বাংলা ফন্ট, ESLint forbid-elements ধরে, `AppShell` তিন সাইজে ঠিক নেভ দেখায়।

---

## ৪. ফেজ ২ — ডাটা মডেল, Dexie, repo, format

### ৪.১ স্কিমা (→ proto `features/ledger/schema.js`; Zod-এ)

```ts
const meta = { id: z.string(), updatedAt: z.string(), updatedBy: z.string(), deletedAt: z.string().nullable() }
// ⚠️ শিটের কলামের ক্রম = key-এর ক্রম। নতুন ফিল্ড শেষে।
export const eventSchema  = z.object({ ...meta, name: z.string().trim().min(1), type: z.enum(EVENT_TYPE_KEYS), date: z.string().regex(/^\d{4}(-\d{2}(-\d{2})?)?$/), location: z.string(), note: z.string() })
export const personSchema = z.object({ ...meta, name: z.string().trim().min(1), phone: z.string(), address: z.string(), relation: z.string(), note: z.string() })
export const giftSchema   = z.object({ ...meta, eventId: z.string(), personId: z.string(), direction: z.enum(['received','given']), amount: z.number().int().nonnegative().nullable(), item: z.string(), note: z.string() })
export const TABLES = { events: eventSchema, people: personSchema, gifts: giftSchema } as const
export const columnsOf = (t: TableName) => Object.keys(TABLES[t].shape)
export const isPending = (g: Gift) => g.amount === null && g.item.trim() === ''
export const emptyEvent = () => ({ name: '', type: 'wedding', date: today(), location: '', note: '' })
export const emptyPerson = () => ({ name: '', phone: '', address: '', relation: '', note: '' })
```
এরর বার্তা (Zod `message`): name → `t.common.required`, date → `t.event.invalidDate`।

`config/event-types.ts`: wedding বিয়ে · holud গায়ে হলুদ · walima বউভাত · aqiqah আকিকা · khatna খতনা · birthday জন্মদিন · other অন্যান্য (label + icon name)।

### ৪.২ Dexie (`db.ts`)
```ts
class LedgerDB extends Dexie { events!: Table<LedgerEvent,string>; people!: Table<Person,string>; gifts!: Table<Gift,string>
  constructor(fileId: string) { super(`ledger-${fileId}`); this.version(1).stores({ events: 'id, date, updatedAt', people: 'id, name, phone, updatedAt', gifts: 'id, eventId, personId, updatedAt' }) } }
export const openLedger = memo((fileId) => new LedgerDB(fileId))
export const deleteLedgerLocal = (fileId) => Dexie.delete(`ledger-${fileId}`)
```

### ৪.৩ repo (→ proto `repo.js`, হুবহু)
`createRepo(db, me, onWrite)`: `addEvent/updateEvent/removeEvent`, `addPerson/…`, `addGift/…` (add = `{...data, id: uuid, deletedAt: null, updatedAt, updatedBy}`; update = patch + stamp; remove = `deletedAt` + stamp), `mergePeople(keepId, dupId)` এক ট্রানজ্যাকশনে: dup-এর gifts → keep; dup soft delete; ★ keep-এর ফাঁকা phone/address/relation/note-এ dup-এর মান। `bulkAdd(seed)`। প্রতিটা লেখার পর `onWrite()` → sync debounce।

### ৪.৪ queries (→ proto `queries.js`, হুবহু; pure)
`selectEvents` (date desc, updatedAt desc) · `selectEvent` · `selectPeople` (bn locale sort) · `selectPerson` · `selectGifts` · `selectEventGifts(eventId)` (+person, updatedAt desc) · `selectPersonHistory(personId)` (+event, মুছে যাওয়া event বাদ, event.date desc) · `totals(gifts) → {received, given, net, count, pending}` · `totalsByEvent` · `totalsByPerson` · `findByPhone(phone, exceptId)`।
`hooks.ts`: `useEvents() useEvent(id) usePeople() usePerson(id) useEventGifts(id) usePersonHistory(id) useAllTotals()` = `useLiveQuery` + query।

### ৪.৫ format (→ proto `lib/format.js`, হুবহু)
`toBanglaDigits` · `toAsciiDigits` · `parseAmount(s) → int|null` (বাংলা সংখ্যা মেনে) · `formatTaka(n)` (`-`? + `৳` + lakh grouping + বাংলা) · `MONTHS` ১২ বাংলা · `formatPartialDate` ("২০১৮" / "মার্চ ২০১৮" / "১২ মার্চ ২০১৮") · `datePrecision(d) → day|month|year` · `normalizePhone` (+880 → 0…) · `formatPhone` · `formatDateTime` ("৯ অক্টোবর, ০২:০৮") · `timeAgo` (এইমাত্র / n মিনিট আগে / ঘণ্টা / দিন) · `today()` · `initials()`।

### ৪.৬ seed (`seed.ts`, dev-only) → proto `seed.js` হুবহু (৫ মানুষ, ৩ অনুষ্ঠান, ৮ উপহার; "রহিম" + "রহিম মামা" মার্জ টেস্টের জন্য)।

**ফেজ ২ মাপকাঠি:** `format.test.ts`, `queries.test.ts`, `repo.test.ts` (fake-indexeddb) পাস।

---

## ৫. ফেজ ৩ — পুরো UI (`fileId = 'local-dev'`, গুগল ছাড়া)

★ v2.3 সব পাতায়:
- **স্কেলেটন** (`common/skeletons.tsx`): প্রতিটা পাতার কাঠামো নকল করা — Home (স্ট্যাট ৪ + কার্ড গ্রিড), Event (স্ট্যাট ৩ + ট্যাব + টেবিল/সারি), People (খোঁজ + কার্ড গ্রিড), Person (স্ট্যাট + ইতিহাস টেবিল), Share (QR কার্ড + সদস্য), Settings (৪ কার্ড), Print। `LedgerGate` Dexie লোডের সময় shell-এর ভেতরে পথ অনুযায়ী দেখায়। dev-এ `?skeleton=1` দিলে স্থায়ীভাবে দেখা যায়।
- **সাজানো** (`gift-table.tsx` `sortGifts`): টেবিলের হেডারে চাপলে মানুষ (bn locale) / পেলাম-দিলাম / টাকা (null শেষে) / জিনিস / নোট; একই হেডারে আবার চাপলে উল্টো; `aria-sort`; মোবাইল সারিও একই ক্রমে। ডিফল্ট: নতুন আগে।
- **পেজিনেশন** (`common/pagination.tsx`): ২০/পাতা, "১–২০ / ৩০", ‹ ১ … n ›; ট্যাব/সাজানো বদলালে পাতা ১-এ।
- মক ডেমো সার্ভার: `pnpm dev:mock` (`--mode mock`, `.env.mock`, port 3101) — credential ছাড়া।


### ৫.০ AppShell (★ v2.1: সাইডবার নেই — সব সাইজে উপরে navbar)

| সাইজ | কাঠামো |
|---|---|
| সব | sticky navbar h-14: বামে ব্র্যান্ড (বই টাইল + খাতার নাম) · **একদম মাঝখানে** পাতার নাম অনুষ্ঠান / মানুষ / শেয়ার / সেটিংস (`sm+`, absolute-centered, pill active) · ডানে SyncStatus + ইউজার Avatar → `/settings` (`sm+`) |
| `<640` | navbar-এ পাতার নাম নেই; নিচে fixed bottom tab bar (৪ আইটেম, আইকন+লেবেল)। main `pb-32`। |

★ v2.2: **breadcrumb নেই** (কম্পোনেন্ট `common/breadcrumbs.tsx` রাখা আছে, PageHeader রেন্ডার করে না)। PageHeader = h1 (**আইকন নেই**, back-arrow নেই) + subtitle + actions।

<details><summary>v2.0 (পুরনো, সাইডবার)</summary>


| সাইজ | কাঠামো |
|---|---|
| `<640` | sticky header h-14: ব্র্যান্ড (বই আইকন টাইল + খাতার নাম, লিংক `/`) · spacer · SyncStatus। নিচে fixed bottom Nav (৪ আইটেম)। main `pb-32`। |
| `640–1023` | একই header, মাঝে top Nav (pill)। bottom nav নেই। |
| `≥1024` | sidebar `w-64 h-dvh sticky`: ব্র্যান্ড · side Nav · নিচে SyncStatus + ইউজার ব্লক (Avatar, নাম, ইমেইল → `/settings`)। header নেই। main `max-w-5xl`। |

header/sidebar/nav সব `print:hidden`। header-এর নিচে `SyncBanner`। প্রিন্ট route shell-এর বাইরে।
</details>

Nav আইটেম (`config/nav.ts`): `/` অনুষ্ঠান (home) · `/people` মানুষ · `/share` শেয়ার · `/settings` সেটিংস।

### ৫.১ `/` হোম (→ proto `routes/home.js`, `features/events/event-card.js`)
- PageHeader: "অনুষ্ঠান", subtitle "Nটি উপহার" (অনুষ্ঠান থাকলে)। ডানে "নতুন অনুষ্ঠান" বাটন `hidden sm:inline-flex`; মোবাইলে Fab।
- স্ট্যাট গ্রিড `grid-cols-2 md:grid-cols-4`: "সব অনুষ্ঠান মিলিয়ে · পেলাম", "… · দিলাম", "ব্যবধান" (tone চিহ্ন অনুযায়ী), "খাম খোলা বাকি" (সংখ্যা, >0 হলে amber)।
- EventCard গ্রিড `md:grid-cols-2`; কার্ড `flex min-w-0 flex-1` (সারির দুই কার্ড সমান উচ্চতা, overflow নেই)।
- EventCard: ধরনের আইকন টাইল (`h-11 w-11 bg-emerald-100`) · নাম truncate · meta "ধরন · তারিখ · জায়গা" truncate · নিচের সারি: `count===0` → "এখনো উপহার লেখা হয়নি" muted; নইলে ↓ পেলাম Money · ↑ দিলাম Money · "Nটি উপহার" faint · (pending>0) warning badge "nটা খাম বাকি" · ডানে chevron।
- খালি: EmptyState(gift, "এখনো কোনো অনুষ্ঠান নেই", hint) + বাটন।

### ৫.২ অনুষ্ঠান ফর্ম (→ proto `features/events/event-form.js`) — ResponsiveDialog
ফিল্ড: নাম (placeholder "যেমন: সাকিবের বিয়ে") · ধরন Select · তারিখ: ToggleGroup `পুরো তারিখ | মাস ও সাল | শুধু সাল` (sm, full width) → native `date` / `month` / `text inputmode=numeric placeholder ২০১৮` (বাংলা সংখ্যা → ascii) → নিচে প্রিভিউ লাইন `formatPartialDate` · জায়গা (ঐচ্ছিক, placeholder) · নোট (ঐচ্ছিক, textarea, placeholder "কিছু মনে রাখার থাকলে…") · "সেভ করো" lg।
সাবমিট: Zod; এরর Field-এর নিচে। **create:** `repo.addEvent` → toast "সেভ হয়েছে" → `navigate('/events/$id', { state: { focus: 'quick-add' } })` → অনুষ্ঠান পাতা মাউন্ট হয়ে নামের ঘরে ফোকাস (★ প্রোটোটাইপে এটাই সবচেয়ে বড় বাগ ছিল; `useEffect` + `location.state` দিয়ে, মোবাইলে autoFocus কীবোর্ড তুলবে — গ্রহণযোগ্য)। **edit:** `updateEvent` → toast → বন্ধ।

### ৫.৩ `/events/$eventId` (★ v2.1 লেআউট: এক কলাম — উপরে সারাংশ, নিচে ট্যাব+তালিকা; দ্রুত যোগ = মডাল)
- PageHeader: breadcrumb `অনুষ্ঠান › <নাম>`, নাম, subtitle, ডানে **"উপহার যোগ"** (sm+; মোবাইলে FAB) + ⋮ মেনু।
- EventTotals ৩ কলাম → Tabs → Card-এ GiftTable। দুই-কলাম/sticky নেই।
- **QuickAddDialog** (`features/gifts/quick-add.tsx`): ResponsiveDialog "উপহার যোগ" — পেলাম/দিলাম (full ToggleGroup) → নাম * (Combobox) → ফোন (ঐচ্ছিক, আলাদা লাইন) → টাকা | জিনিস → নোট → [বন্ধ] [যোগ করো]। যোগের পর ফর্ম খালি, ফোকাস নামে, **মডাল খোলা থাকে** (ভিড়ে পরপর লেখা)। নতুন অনুষ্ঠান বানানোর পর এই মডাল নিজে খোলে।

<details><summary>v2.0 (পুরনো)</summary>

- PageHeader: back `/`, ধরনের আইকন, নাম, subtitle "ধরন · তারিখ · জায়গা" (২ লাইন clamp), ডানে ⋮ DropdownMenu: এডিট · এক্সেল · প্রিন্ট · মুছে ফেলো (destructive → Confirm "অনুষ্ঠান মুছবেন?" + বর্ণনা → `removeEvent` → toast → `/`)।
- লেআউট: `<1024` স্ট্যাক; `≥1024` `grid-cols-[22rem_1fr] gap-6`, বাম কলাম `sticky top-8`।
- বাম: EventTotals (৩ Stat: পেলাম, দিলাম, খাম খোলা বাকি; `lg:grid-cols-1`) + QuickAdd।
- ডান: Tabs `সব (count) | পেলাম | দিলাম | খাম বাকি (count)` — ট্যাব অবস্থা route-level state (re-render-এ থাকে) · নিচে Card-এ GiftTable। gifts শূন্য → EmptyState(gift, "এখনো উপহার লেখা হয়নি", "উপরের ঘরে নাম লিখে Enter চাপুন।"); ফিল্টারে শূন্য → EmptyState(search, "এই ফিল্টারে কিছু নেই")।

</details>

### ৫.৪ QuickAdd (v2.0 ইনলাইন কার্ড — v2.1-এ মডাল, উপরে দেখো)
Card p-3 · উপরে "দ্রুত যোগ" লেবেল + DirectionToggle (ডানে; **মান শেষ যোগের পরেও থাকে**, module/zustand state) · ★ **দুটো ঘর:** PersonCombobox = নাম (বাধ্যতামূলক, placeholder "নাম *") এবং তার **নিচের লাইনে** ফোন Input (ঐচ্ছিক, full width)। ফোন লিখলে আগে থেকে থাকা মানুষ মিললে তাকেই বাছা হয় (amber hint); নতুন মানুষ হলে ফোনসহ তৈরি; আগের মানুষের ফোন ফাঁকা থাকলে ভরে দেয় (বদলায় না) · এরর লাইন ঠিক নিচে (hidden; "কার কাছ থেকে / কাকে — নামটা লাগবে" + ইনপুটে লাল বর্ডার) · সারি: টাকা Input (`inputmode=numeric`, `sm:w-28`) · জিনিস Input flex-1 (placeholder "জিনিস (শাড়ি, আংটি…)") · "যোগ" বাটন (plus)।
সাবমিট: নাম নেই → এরর + ফোকাস। `personId` নেই → নাম exact match (case-insensitive) থাকলে সেটা, নইলে `addPerson({name})`। `addGift({direction, amount: parseAmount, item, note:''})` → toast "যোগ হলো" → ফর্ম খালি → ফোকাস নামে। কীবোর্ড: Combobox-এ Enter = বাছাই → ফোকাস টাকায়; টাকা/জিনিসে Enter = সাবমিট।

### ৫.৫ PersonCombobox (→ proto `features/people/person-combobox.js`) — shadcn Command + Popover
- `value: { personId: string|null, name: string }`, `onChange`, `onPick`, `excludeId`, `allowNew` (ডিফল্ট true)।
- খোঁজ: নাম substring (lowercase) বা ফোন (query-র সংখ্যা ≥৩ অঙ্ক হলে); সর্বোচ্চ ৮। আইটেম: user আইকন · নাম · ডানে ফোন (বাংলা অঙ্ক) · সম্পর্ক। শেষে "নতুন: <query>" (plus) যদি query আছে ও exact নাম মেলে না। কিছু না মিললে "কাউকে পাওয়া যায়নি"।
- আচরণ: টাইপ করলে `personId=null`; ↑↓ highlight; Enter = বাছাই (open থাকলে); Esc বন্ধ; mousedown-এ blur আটকাও; ফোকাসে খোলে **শুধু যদি কিছু বাছা না থাকে**; ★ ড্রপডাউন **ডায়ালগের ভেতরে ক্লিপ হবে না** (Popover portal — Radix নিজে করে); স্ক্রলে বন্ধ।

### ৫.৬ GiftTable (→ proto `features/gifts/gift-table.js`)
- `<640`: সারি-বাটন: দিকের বৃত্ত আইকন (emerald-100/amber-100) · নাম · সেকেন্ডারি লাইন (জিনিস | "খাম বাকি" badge | নোট) **শুধু থাকলে** · Money (tone) · chevron। pending সারি `bg-amber-50/60`।
- `≥640`: Table: মানুষ (নিচে ছোট `updatedBy`) · পেলাম/দিলাম badge · টাকা (ডানে) · জিনিস/খাম-বাকি badge · নোট (`md+`)। সারি ক্লিক/Enter → উপহার ফর্ম।

### ৫.৭ উপহার ফর্ম (→ proto `features/gifts/gift-form.js`) — ResponsiveDialog "উপহার বদলাও"
মানুষ (Combobox, prefilled) · পেলাম/দিলাম (ToggleGroup full) · টাকা | জিনিস (`grid-cols-2`) · hint "টাকা আর জিনিস দুটোই ফাঁকা রাখলে “খাম খোলা বাকি”…" · নোট · নিচে: "মুছে ফেলো" (outline লাল → Confirm) + "সেভ করো" flex-1।

### ৫.৮ `/people` (→ proto `routes/people.js`)
PageHeader "মানুষ" + "নতুন মানুষ" outline। খালি → EmptyState(people, "এখনো কেউ নেই", "উপহার লিখলে মানুষ নিজে থেকেই যোগ হবে।")। নইলে: খোঁজার Input (বাম search আইকন, `type=search`, placeholder; query local state) + গ্রিড `md:grid-cols-2`: কার্ড p-3 — Avatar · নাম · meta "সম্পর্ক · ফোন · ঠিকানা" (নইলে "—") · ডানে ↓ পেলাম / ↑ দিলাম ছোট Money · chevron। না মিললে EmptyState(search, "কাউকে পাওয়া যায়নি", `md:col-span-2`)।

### ৫.৯ `/people/$personId` (→ proto `routes/person.js`)
- PageHeader: back `/people`, user আইকন, নাম, subtitle meta, ⋮: তথ্য বদলাও · মুছে ফেলো (Confirm → `removePerson` → `/people`)।
- `≥1024` `grid-cols-[18rem_1fr]`; বাম sticky: নোট (থাকলে) · ৩ Stat (মোট পেলাম, মোট দিলাম, ব্যবধান tone চিহ্নে; `lg:grid-cols-1`) · "একই মানুষ? মার্জ করো" outline (merge আইকন)।
- ডান Card: header `flex-row justify-between` "ইতিহাস" + "Nটি লেনদেন" · খালি → EmptyState(gift, "এই মানুষের সাথে এখনো কোনো লেনদেন নেই") · PersonHistory।
- PersonHistory (→ proto `person-history.js`): `<640` সারি: দিকের বৃত্ত · অনুষ্ঠানের নাম · "তারিখ · জিনিস/খাম-বাকি" · Money; `≥640` Table: তারিখ · অনুষ্ঠান (দিক আইকন + Link `/events/$id`, stopPropagation) · টাকা · জিনিস। সারি ক্লিক → উপহার ফর্ম।

### ৫.১০ মানুষ ফর্ম (→ proto `person-form.js`) — "নতুন মানুষ" / "তথ্য বদলাও"
নাম (placeholder "যেমন: রহিম মামা") · ফোন (`type=tel`, placeholder "০১৭১১০০০০০০"; **লাইভ** `findByPhone(normalizePhone, exceptSelf)` → Field এরর "এই ফোন নম্বর আগে থেকে “X”-এর নামে আছে" — সতর্ক করে, আটকায় না) · সম্পর্ক (placeholder "মামা, বন্ধু, প্রতিবেশী…") · ঠিকানা (placeholder "গ্রাম/এলাকা, জেলা") · নোট। সেভ: `normalizePhone`; create → `/people/$id`।

### ৫.১১ মার্জ ডায়ালগ (→ proto `merge-person-dialog.js`)
শিরোনাম "মার্জ করো", বর্ণনা `mergeDesc(name)`। Field "কার সাথে মার্জ?" Combobox (`excludeId=self`, `allowNew=false`)। existing না বাছলে এরর "তালিকা থেকে একজনকে বাছুন"। `mergePeople(keep=current, dup=picked)` → toast "মার্জ হয়েছে"।

### ৫.১২ `/settings` (→ proto `routes/settings.js`)
`md+` দুই **আলাদা কলাম স্ট্যাক** (grid না — সারির উচ্চতায় ফাঁক হয়): বাম [অ্যাকাউন্ট, সিঙ্ক], ডান [খাতা, ডাটা]।
- **অ্যাকাউন্ট:** Avatar · নাম · ইমেইল · "সাইন আউট" outline → `logout()` → `/login`।
- **খাতা:** description "গুগল শিটটাই আপনার ব্যাকআপ…" · খাতার নাম · "মালিক: X" · বাটন গ্রিড (`grid-cols-2 sm:flex`): নাম বদলাও (শুধু মালিক; ডায়ালগ, খালি → এরর) · Google Sheets-এ খোলো (`https://docs.google.com/spreadsheets/d/<fileId>`, নতুন ট্যাব) · ফাইল আইডি কপি (clipboard + toast) · পুরো খাতার এক্সেল · অন্য খাতা → `/setup?pick=1`।
- **সিঙ্ক** (★ প্রোটোটাইপের "সিঙ্ক পরীক্ষা" টগল → প্রোডে **সিঙ্ক তথ্য**): শেষ সিঙ্ক (formatDateTime) · "nটা লেখা শিটে যাওয়া বাকি" · "এখনই সিঙ্ক" বাটন। dev build-এ টগল ৩টা (অফলাইন / টোকেন ফুরিয়েছে / শিটের কলাম বদলে গেছে) রাখো `import.meta.env.DEV` গার্ডে।
- **ডাটা:** dev-only: নমুনা ডাটা ভরো · join লিংক খোলো · প্রোটোটাইপ রিসেট; সবার জন্য: "ফোনের কপি মুছে ফেলো" (Confirm → `deleteLedgerLocal` → `setActiveFile(null)` → `sync.reset()` → `/setup?pick=1`) · ভার্সন লাইন।

### ৫.১৩ 404 — EmptyState(search, "পাতাটা পাওয়া যায়নি") + "হোমে যান"।

**ফেজ ৩ মাপকাঠি (proto README "টেস্ট করার পথ" ধাপ ৩–৫):** অনুষ্ঠান বানানো → নামের ঘরে ফোকাস → কীবোর্ডে ৩০ উপহার → ইতিহাস → মার্জ; রিলোডে থাকে; তিন সাইজে horizontal overflow শূন্য (`scrollWidth === innerWidth`); কনসোল এরর শূন্য।

---

## ৬. ফেজ ৪ — লগইন, সেশন, `/setup`

### ৬.১ সেশন (`features/auth/session.ts`, → proto `auth.js`)
localStorage: `{ user: {email, name} | null, fileId: string | null, redirect: string | null }` + `last-email`। API: `getSession useSession login(user) logout() setActiveFile(id) setRedirect takeRedirect lastEmail`। টোকেন আলাদা key-তে `{ value, expiresAt }`।

### ৬.২ Google (`google-auth.ts`, v1 অনুযায়ী)
`requestToken(hint?)` → GIS `initTokenClient` `prompt: hint ? '' : 'consent'`; `currentToken()`; ইউজার `GET drive/v3/about?fields=user` → `login({email, name})`, `last-email` সেভ। ★ টোকেন পপআপ **শুধু ইউজারের চাপে** → "Google দিয়ে সাইন ইন" বাটন, আর SyncStatus-এর "সিঙ্ক করতে চাপুন"।
`gfetch.ts` (v1): Bearer, `Content-Type`, 429 → backoff ৩ বার, `!ok` → `GoogleError(status, text)`, 204 → undefined।

### ৬.৩ `/login` (→ proto `routes/login.js`)
BareLayout → Card: gift আইকন টাইল (`h-16 w-16 bg-emerald-100`) · h1 "উপহারের খাতা" · subtitle · "Google দিয়ে সাইন ইন" lg full (google আইকন) · ছোট লাইন permissionNote · flowNote faint। নিচে info Alert (প্রোডে বাদ, dev-এ "প্রোটোটাইপ" নোট)। লগইন থাকলে → `takeRedirect() ?? '/'`। চাপ → `requestToken()` → `login` → `navigate(takeRedirect() ?? '/setup')`।

### ৬.৪ `_app.tsx` guard (→ proto `app.js render()`)
`beforeLoad`: user নেই → `setRedirect(pathname+search)` → `/login`; fileId নেই → `/setup`। loader: `openLedger(fileId)`, `repo`, `file` (Drive meta, cache)। ★ fileId আছে কিন্তু ফাইল 404 → সিঙ্ক `revoked` → ব্যানার (§৮.৫), পাতা ফাঁকা নয়।

### ৬.৫ `/setup` (→ proto `routes/setup.js`; search `pick?: '1'`)
BareLayout; উপরে "email · সাইন আউট" লাইন। `listLedgers()` = Drive `files?q=appProperties has {key='app' and value='upohar-khata'} and trashed=false&fields=files(id,name,ownedByMe,owners(displayName,emailAddress))` (লোড হতে Spinner "আপনার ড্রাইভে খাতা খোঁজা হচ্ছে…")।
- ০ → EmptyState(sheet, "আপনার কোনো খাতা নেই", hint) + "নতুন খাতা" Card (নাম Input ডিফল্ট "উপহারের খাতা", placeholder) → `createLedger` (§৮.১) → activate।
- ১ এবং `pick` নেই → activate।
- অনেক / `pick=1` → Card "আপনার খাতাগুলো": ghost সারি (sheet আইকন · নাম · "আপনার" / "শেয়ার করেছেন X" · editor badge) + নিচে "নতুন খাতা" Card।
`activateLedger(id)` = `setActiveFile(id)` → `sync.reset()` → `/`।

**ফেজ ৪ মাপকাঠি:** লগইন → রিলোড (থাকে) → টোকেন ফুরানো → "চাপুন" → আবার। `/login`-এ লগইন থাকা অবস্থায় গেলে রিডাইরেক্ট, ফাঁকা পাতা নয়।

---

## ৭. ফেজ ৫ — আসল সিঙ্ক ইঞ্জিন

### ৭.১ খাতা বানানো (`sheets.ts createLedger(name)`)
Sheets `POST /v4/spreadsheets` {title: name, sheets: events/people/gifts, হেডার = `columnsOf`, `frozenRowCount: 1`} → Drive `PATCH files/{id}` `appProperties: { app: 'upohar-khata', schemaVersion: '1' }` → `{id, name}`।

### ৭.২ `rows.ts` → proto `features/sync/rows.js` **হুবহু** (টেস্ট: `test/sync.test.js`)
`toRow(t, o)` · `fromRow(t, row) → {ok, value} | {ok:false, row}` (`''`→null deletedAt/amount; Zod `safeParse` দিয়ে validate) · `assertHeaders(t, header)`: শুধু `columnsOf(t)` প্রথম N কলাম মেলাও → `Error('sheet-tampered:<t>')`।

### ৭.৩ `merge.ts` → proto `features/sync/merge.js` **হুবহু** (pure, টেস্টেড) — `merge(local, remote) → { toPush, toSave }`।

### ৭.৪ চক্র `sync-cycle.ts` → proto `features/sync/sync-cycle.js` **হুবহু** (`syncOnce({ api, db, fileId })`, টেস্টেড: প্রথম চক্র append / দ্বিতীয় noop · দুই ডিভাইস LWW একটাই সারি · append লেগে কল ব্যর্থ → ডুপ্লিকেট নয় · ডুপ্লিকেট id → প্রথম সারি · tampered → কিছু লেখা হয় না)।
`db` = Dexie মোড়ক `{ get(): {events,people,gifts} (সব সারি, deleted সহ), set(fn) → transaction('rw') + bulkPut }`।

`api` = `sheets.ts`, proto `sheets-api.js`-এর মকের **একই ৪টা মেথড**, আসল REST-এ (`gfetch` দিয়ে, `S = https://sheets.googleapis.com/v4/spreadsheets`):

| মেথড | HTTP | body / query | response → মক-এর আকারে |
|---|---|---|---|
| `createSpreadsheet(title)` | `POST S` | `{ properties:{title}, sheets:[{properties:{title:'events', gridProperties:{frozenRowCount:1}}, data:[{rowData:[{values: header.map(v=>({userEnteredValue:{stringValue:v}}))}]}]}, …people, …gifts] }` → তারপর Drive `PATCH files/{id}` `{ appProperties:{ app:'upohar-khata', schemaVersion:'1' } }` | `spreadsheetId` |
| `batchGet(fileId)` | `GET S/{id}/values:batchGet?ranges=events!A:Z&ranges=people!A:Z&ranges=gifts!A:Z&majorDimension=ROWS` | — | `{ valueRanges:[{range, values:[[header],[row]…]}] }` — ক্রম events, people, gifts (query-র ক্রমে আসে) |
| `batchUpdate(fileId, data)` | `POST S/{id}/values:batchUpdate` | `{ valueInputOption:'RAW', data:[{ range:'gifts!A7', values:[[…]] }] }` | `{ totalUpdatedRows }` |
| `append(fileId, t, values)` | `POST S/{id}/values/{t}!A:Z:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS` | `{ values:[[…],[…]] }` | `{ updates:{updatedRows} }` |

ভুল সারি: `rejected` তালিকা → কনসোল + সেটিংসে "nটা সারি পড়া যায়নি"। খালি ট্যাব: `values` undefined → `[]` ধরো (কোডে আছে)।

### ৭.৪ক ইঞ্জিন `sync-engine.ts` → proto `features/sync/sync-engine.js` (অবস্থা-মেশিন হুবহু; `getFile` + মক api-র জায়গায় আসল)
```
run():
  guard: !fileId || !user || running || paused || offline → status, return
  !currentToken() → status needs-token, return          (পপআপ শুধু syncNow-এ)
  running=true; emit
  try   : getFile(fileId)  → 403/404 throw
          result = await syncOnce({ api: sheets, db: dexieAdapter(fileId), fileId })
          pending=0, lastSyncAt=now, error=null, last=result
  catch : 401 → needs-token · 403/404 → revoked · 'sheet-tampered*' → tampered · else → error (পরের চক্রে আবার)
  running=false; emit
```
কখন: অ্যাপ খুললে · লেখার **৩ সে** পর (debounce) · `online` · সামনে থাকলে প্রতি ৬০ সে · `syncNow()`। একসাথে একটাই।
অবস্থা `{ status, pending, lastSyncAt, error, last }`, `status ∈ synced|syncing|offline|needs-token|tampered|revoked|paused` (প্রাধান্য এই ক্রমে: revoked > tampered > paused > needs-token > offline > syncing > synced)।
`syncNow()`: টোকেন নেই → `requestToken(lastEmail())` → run; tampered হলে error মুছে আবার চেষ্টা। `pause()` · `reset()`।

### ৭.৫ SyncStatus + SyncBanner (→ proto `common/sync-status.js`, `sync-banner.js`)
SyncStatus = ghost sm বাটন, আইকন + xs লেবেল, `title` "শেষ সিঙ্ক: n মিনিট আগে / এখনো হয়নি", ক্লিক → `syncNow`:

| status | আইকন | লেবেল | রং |
|---|---|---|---|
| synced | check | সিঙ্ক হয়েছে | emerald-700 |
| syncing | sync (spin) | সিঙ্ক হচ্ছে | stone-500 |
| offline | cloudOff | অফলাইন (nটা বাকি) | stone-500 |
| needs-token | key | সিঙ্ক করতে চাপুন | amber-700, bg amber-50 |
| tampered / revoked | warning | খাতায় সমস্যা / অনুমতি নেই | red-700 |
| paused | cloudOff | সিঙ্ক বন্ধ | stone-500 |

SyncBanner (header-এর নিচে, কন্টেইনার প্রস্থে): tampered → destructive Alert "খাতায় সমস্যা" + tamperedBanner · revoked → destructive Alert "অনুমতি নেই" + [ফোনের কপি রেখে দাও → `pause()`] [মুছে ফেলো → deleteLedgerLocal + setActiveFile(null) + reset + `/setup`] · paused → warning Alert "সিঙ্ক বন্ধ" + pausedBanner · নইলে কিছু না।

**ফেজ ৫ মাপকাঠি:** `test/sync.test.js`-এর ৯টা টেস্ট (proto থেকে কপি) পাস; দুই ব্রাউজার, ৬০ সে-র মধ্যে; অফলাইন লেখা ফিরে যায়; push মাঝপথে ব্যর্থ করালে ডুপ্লিকেট সারি হয় না; শিটে ডানে কলাম যোগ করলে ভাঙে না, কলাম মুছলে থামে।

---

## ৮. ফেজ ৬ — শেয়ার, QR, join, Picker

### ৮.১ Drive (`drive.ts`, v1): `addEditor(fileId, email)` (`permissions` POST `{type:'user', role:'writer', emailAddress}`, `sendNotificationEmail=true`) · `listMembers` (`permissions(id,emailAddress,displayName,role)`) · `removeMember(permissionId)` · `getFile(id)` (`spreadsheets/{id}?fields=spreadsheetId,properties.title` → 403/404 throw) · `renameLedger` (`PATCH files/{id} {name}`) · `listLedgers`।

### ৮.২ `/share` (→ proto `routes/share.js`)
`!ownedByMe` → PageHeader + info Alert "শুধু খাতার মালিক শেয়ার করতে পারেন" + "এই খাতার মালিক X।"।
মালিক: `≥1024` ২ কলাম — **বামে QrCard, ডানে [যোগ করো কার্ড, সদস্য তালিকা]**; ছোট পর্দায় স্ট্যাক: যোগ → সদস্য → QR।
- যোগ Card: Field "যাকে যোগ করবেন তার জিমেইল" — Input email + "যোগ করো"। এরর: ঠিক জিমেইল নয় / নিজের জিমেইল / আগে থেকেই আছে। সফল → `addEditor` → toast "X যোগ হয়েছে, ইমেইল গেছে"।
- MemberList Card "যাদের সাথে শেয়ার করা" (→ proto `member-list.js`): সারি Avatar · নাম · ইমেইল · badge মালিক/এডিটর · (এডিটর) trash iconSm লাল → Confirm "বাদ দেবেন?" → `removeMember` → toast। সদস্য নেই → Alert "এখনো কাউকে যোগ করা হয়নি"।
- QrCard (→ proto `qr-card.js`): title "QR কোড", hint · `QRCodeSVG value={joinUrl} size={200}` · URL truncate xs · "লিংক কপি" outline (clipboard → toast "কপি হয়েছে") + "পাঠাও" (`navigator.share({title, text, url})`, নইলে `https://wa.me/?text=`) · securityNote।
🔐 লিংকে শুধু fileId; "anyone with link" কখনো না।

### ৮.৩ `/join?f=` (→ proto `routes/join.js`; `validateSearch: z.object({ f: z.string().min(10) })`)
BareLayout।
```
f ভুল → destructive Alert "লিংকটা ঠিক নেই"
লগইন নেই → setRedirect(`/join?f=`) → /login → ফেরত
Spinner "খাতা খোলার চেষ্টা হচ্ছে…"
  getFile(f) ✅ → toast "খাতা খুলেছে" → activateLedger(f)
  403/404 → Card: sheet টাইল · "আপনার সাথে একটি খাতা শেয়ার করা হয়েছে" · "সাইন ইন করা আছে: email" · "খাতাটি খুলুন" lg (ইউজারের চাপ → Picker) · "অন্য অ্যাকাউন্টে যান" outline (logout + redirect রেখে /login)
      Picker PICKED এবং id === f → activate
      CANCEL / খালি → Card: key টাইল (amber) · "এই খাতায় ঢোকার অনুমতি নেই" · notMember(email) · "অন্য অ্যাকাউন্টে যান"
```
★ রেন্ডার/রি-রেন্ডারে চেক দুবার না চলে (effect cleanup / `useQuery` once)।

### ৮.৪ Picker (`picker.ts`, v1): `gapi.load('picker')` একবার · `DocsView(SPREADSHEETS).setFileIds(f)` · `setOAuthToken` · `setDeveloperKey` · `setAppId` · `setLocale('bn')` · PICKED → `docs[0].id`, CANCEL → null।

**ফেজ ৬ মাপকাঠি:** §১২ চেকলিস্ট #4–#9।

---

## ৯. ফেজ ৭ — এক্সেল + প্রিন্ট (→ proto `features/export/to-xlsx.js`, `routes/print.js`)

- `exportEventXlsx(event, gifts)`: সারি {নাম, ফোন, পেলাম/দিলাম, টাকা, জিনিস, নোট} + মোট সারি (নাম="মোট", পেলাম/দিলাম কলামে "পেলাম X / দিলাম Y", টাকা = net) → `json_to_sheet` → `writeFile('<অনুষ্ঠানের নাম>.xlsx')`।
- `exportLedgerXlsx(name, events, giftsOf)`: প্রতি অনুষ্ঠানে উপরের সারি + "অনুষ্ঠান", "তারিখ" (formatPartialDate) কলাম + মোট সারি।
- `/events/$eventId/print`: shell নেই, `max-w-3xl p-6 print:p-0`। উপরে (`print:hidden`) back লিংক + "প্রিন্ট" বাটন (`window.print()`)। h1 নাম, meta লাইন, `border-b-2 border-stone-900`। Table `text-base`: ক্রম · নাম (+ "(সম্পর্ক)" ছোট) · পেলাম/দিলাম · টাকা (ডানে) · জিনিস/"খাম বাকি" muted — **মানুষের নামে সাজানো**। tfoot: "মোট — পেলাম" / "মোট — দিলাম"। নিচে "উপহারের খাতা থেকে ছাপানো"। `@media print { body { background: white } }`।
- ব্যাকআপ: শিটই; সেটিংসে লিংক।

**মাপকাঠি:** xlsx খুলে বাংলা ঠিক; প্রিন্ট প্রিভিউ খাতার মতো, nav নেই।

---

## ১০. ফেজ ৮ — PWA (v1 অপরিবর্তিত)
`vite-plugin-pwa` generateSW: manifest {name "উপহারের খাতা", lang bn, display standalone, theme `#047857`}, precache, গুগল স্ক্রিপ্ট `StaleWhileRevalidate`। না চললে `public/sw.js` cache-first। হোস্টিং SPA rewrite। **বাস্তবে (২০২৬-১০-১০):** `vite-plugin-pwa` TanStack Start-এর environment build-এ `sw.js` বানায় না (TanStack/router#4988) → `workbox-build` সরাসরি, `vite.config.ts`-এর `buildApp` post hook-এ (prerender-এর পরে, যাতে `_shell.html` precache-এ ঢোকে); manifest স্ট্যাটিক `public/manifest.webmanifest` (start_url `/events`); রেজিস্টার `__root.tsx`। **মাপকাঠি:** এয়ারপ্লেন মোডে খোলে, ১০টা উপহার, নেট এলে শিটে।

## ১১. ফেজ ৯ — টেস্ট
`format.test.ts` (২০০০→2000; +880; "2018-03"→"মার্চ ২০১৮"; formatTaka লাখ) · `rows.test.ts` (রাউন্ডট্রিপ; ''→null; হেডার: কম কলাম ফেল, বাড়তি কলাম পাস) · `sync.test.ts` (proto `test/sync.test.js` হুবহু: rows ৩, merge ১, cycle ৫) · `queries.test.ts` (totals, pending, history sort) · `repo.test.ts` (mergePeople ফিল্ড কপি)। UI: §১২ হাতে।

## ১২. চেকলিস্ট (A = মা, B = বাবা, C = তৃতীয়)
v1-এর ১৩টা অপরিবর্তিত + ★:
- [ ] A খাতা বানায়; শিটে ৩ ট্যাব + হেডার।
- [ ] A অনুষ্ঠান + ৫ উপহার কীবোর্ডে (Enter-ফ্লো); শিটে দেখা যায়।
- [ ] A এয়ারপ্লেন মোডে ৩টা; স্ট্যাটাসে "(৩টা বাকি)"; নেট এলে যায়।
- [ ] A B-র জিমেইল যোগ; B ইমেইল পায়; QR দেখায়।
- [ ] B QR স্ক্যান → `/join` → লগইন → Picker → খাতা।
- [ ] B উপহার; A-তে ৬০ সে-র মধ্যে; `updatedBy = B` টেবিলে দেখা যায়।
- [ ] A ও B একই উপহার প্রায় একসাথে; পরেরটা জেতে, ডুপ্লিকেট সারি নেই।
- [ ] C একই QR → "অনুমতি নেই" কার্ড।
- [ ] A B-কে বাদ → B-র পরের সিঙ্কে ব্যানার; "কপি রেখে দাও" → paused; "মুছে ফেলো" → `/setup`।
- [ ] শিটে কলাম মুছলে থামে, ডাটা নষ্ট হয় না; ডানে কলাম যোগ করলে চলে।
- [ ] A নতুন ব্রাউজারে → `/setup` নিজেই খাতা পায়।
- [ ] এক্সেলে বাংলা ঠিক; প্রিন্ট খাতার মতো।
- [ ] B দুই "রহিম" মার্জ; ফোন/ঠিকানা কপি হয়; A-তেও আপডেট।
- [ ] ★ ফর্মে কোথাও ইংরেজি ব্রাউজার-বাবল নেই; সব এরর বাংলায় ফিল্ডের নিচে।
- [ ] ★ ৩ সাইজে প্রতিটা পাতা: horizontal overflow নেই, FAB শেষ কার্ড ঢাকে না, ড্রপডাউন ডায়ালগে ক্লিপ হয় না।
- [ ] ★ লগইন থাকা অবস্থায় `/login`, `/setup` (১ খাতা) → রিডাইরেক্ট, ফাঁকা পাতা নয়।

## ১৩. ফেজের ক্রম
০ Cloud → ১ প্রজেক্ট + ডিজাইন সিস্টেম + AppShell → ২ স্কিমা/Dexie/repo/format (+টেস্ট) → ৩ পুরো UI (local-dev) → ৪ লগইন/সেশন/setup → ৫ সিঙ্ক → ৬ শেয়ার/QR/join → ৭ এক্সেল/প্রিন্ট → ৮ PWA → ৯ চেকলিস্ট/ডিপ্লয়।

## ১৪. প্রোটোটাইপ থেকে যা **হুবহু** নেওয়া যায়
`lib/i18n/bn.js` → `bn.ts` · `lib/format.js` → `format.ts` · `features/ledger/queries.js`, `repo.js`, `seed.js`, `schema.js` (Zod-এ) · `features/sync/rows.js`, `merge.js`, `sync-cycle.js` + `test/sync.test.js` (সিঙ্কের পুরো লজিক, টেস্টেড) · `config/event-types.js`, `nav.js`, `icons.js` (নাম) · প্রতিটা কম্পোনেন্টের Tailwind class string (JSX-এ পেস্ট) · `README.md`-এর ওয়ার্কফ্লো ম্যাপ · `QA-REPORT.md`-এর ৩৩টা ফিক্স (রিগ্রেশন চেকলিস্ট)।

## ১৫. প্রোটোটাইপ থেকে শেখা ফাঁদ (আগে থেকে এড়াও)
1. নতুন অনুষ্ঠানের পর ফোকাস: নেভিগেশনের পর মাউন্টে ফোকাস দাও (`location.state`), রেন্ডার-অর্ডারে ভরসা নয়।
2. `required`/`type=email` দিলে ইংরেজি বাবল — `noValidate` সব ফর্মে।
3. Tailwind class override: shadcn-এর `cn` (tailwind-merge) ব্যবহার করো, কখনো `clsx` একা না।
4. grid-এ কার্ডের উচ্চতা: `Link` cell স্ট্রেচ হয়, ভেতরের Card না — Card-এ `flex-1 min-w-0`; সেটিংসের মতো অসমান কার্ডে grid না, দুই কলাম-স্ট্যাক।
5. native date input ইংরেজি দেখায় — নিচে বাংলা প্রিভিউ।
6. মোবাইলে টেবিল না — কার্ড সারি (`sm:hidden` / `hidden sm:block` দুটোই রেন্ডার, ছোট ডাটা)।
7. `Intl` `bn-BD` currency-র আউটপুট ব্রাউজারভেদে — নিজের `formatTaka`।
8. Combobox ড্রপডাউন ডায়ালগে ক্লিপ — Portal।
9. join পাতায় side-effect দুবার — effect cleanup।
10. ফাইল আইডি পর্দায় না — "কপি" বাটন।

## বাদ রাখা (v1 অপরিবর্তিত)
অ্যাপের ভেতরের QR স্ক্যানার · সার্ভার-সাইড OAuth · একাধিক খাতা একসাথে, পিন লক, ছবি থেকে লেখা তোলা।
