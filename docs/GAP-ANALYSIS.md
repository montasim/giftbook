# প্ল্যান বনাম প্রোটোটাইপ — গ্যাপ বিশ্লেষণ (২০২৬-১০-০৯)

> **আপডেট:** PLAN v2 লেখার পর §৭-এর গ্যাপ বন্ধ: `rows.js`, `merge.js`, `sync-cycle.js` প্রোটোটাইপে আছে, মক Sheets API-র বিরুদ্ধে আসল pull→merge→push চলে, `test/sync.test.js` ৯টা টেস্ট (ডুপ্লিকেট append, LWW, tampered সহ)। আইকনের নাম `@hugeicons/core-free-icons`-এ যাচাই করে PLAN.md-তে বসানো। নিচের টেবিল ঐতিহাসিক।

চিহ্ন: ✅ আছে, প্ল্যানমতো · 🟡 আছে, কিন্তু মক/সরল · ❌ নেই · ➕ প্ল্যানে ছিল না, প্রোটোটাইপে যোগ হয়েছে

## §০ বড় সিদ্ধান্ত

| প্ল্যান | প্রোটোটাইপ | গ্যাপ |
|---|---|---|
| SPA, সার্ভার নেই | ✅ hash router, static | — |
| আসল খাতা = Google Sheet | 🟡 `localStorage` `ledger-<fileId>` | শিট নেই; পোর্টে Sheets API |
| অ্যাপ পড়ে Dexie থেকে | 🟡 localStorage স্টোর | Dexie নেই; আকার সীমা ~5MB |
| `useLiveQuery` লাইভ আপডেট | ✅ `uk:change` → re-render, `island()` | — |
| Pull→merge→push, last-write-wins | ❌ merge.ts নেই | মক সিঙ্ক শুধু অনুমতি চেক + fake latency |
| Soft delete (`deletedAt`) | ✅ repo + queries | — |
| শুধু `drive.file` | 🟡 মক: Picker-এর আগে 403 | আচরণ সিমুলেট করা |
| Drive permission + QR + Picker | 🟡 মক Drive/Picker | — |
| QR = URL, ফোনের ক্যামেরা | ✅ `#/join?f=` | — |
| TanStack Form + Zod | 🟡 হাতে লেখা `validateEvent/validatePerson` | Zod স্কিমা নেই → কলাম তালিকা আলাদা হাতে রাখা (`COLUMNS`) |

## §১ কাঠামো ও নিয়ম

| প্ল্যান | প্রোটোটাইপ |
|---|---|
| routes / components(ui, common) / features / config / lib | ✅ একই গাছ (`features/google/` = plan-এর `sync/drive.ts` + `sharing/picker.ts`) |
| Single responsibility, dependency direction | ✅ UI → repo/queries; UI কখনো drive.js সরাসরি ডাকে না — ব্যতিক্রম: `routes/share.js`, `routes/setup.js`, `routes/join.js`, `settings.js` সরাসরি `drive.js` ডাকে (প্ল্যানে hook/feature স্তর) |
| config/ থেকে ধরন ও আইকন | ✅ `event-types.js`, `icons.js`, ➕ `nav.js` |
| এক জায়গায় সত্য: স্কিমা → টাইপ+ভ্যালিডেশন+কলাম | 🟡 `COLUMNS` আর validator আলাদা |
| ESLint `forbid-elements` | ❌ ESLint নেই; নিয়ম হাতে মানা (`ui/` বাইরে raw `button`/`input` নেই — grep দিয়ে যাচাই করা) |
| ইন্টারফেস শুধু দরকার হলে | ✅ |

## §২ Google Cloud (ফেজ ০) — ❌ পুরোটা বাইরে (প্রোটোটাইপের আওতায় না)

## §৩ প্রজেক্ট শুরু (ফেজ ১)

| প্ল্যান | প্রোটোটাইপ |
|---|---|
| TanStack Start + shadcn + Hugeicons | 🟡 Tailwind CDN + হাতে লেখা shadcn-ধাঁচের কম্পোনেন্ট + হাতে আঁকা আইকন |
| shadcn লিস্ট: button card input textarea label field input-group select toggle-group dialog drawer sheet table tabs badge sonner dropdown-menu command popover alert skeleton separator empty spinner avatar | ✅ ১৯টা · ❌ আলাদা ফাইল নেই: `drawer`/`sheet` (Dialog-এর ভেতরে), `command`/`popover` (Combobox-এর ভেতরে), `input-group`, `skeleton` |
| বাংলা ফন্ট Hind Siliguri | ✅ Google Fonts |
| গুগল স্ক্রিপ্ট head-এ | ❌ (মক) |

## §৪ ডাটা মডেল (ফেজ ২)

| প্ল্যান | প্রোটোটাইপ |
|---|---|
| meta: id, updatedAt, updatedBy, deletedAt | ✅ |
| event/person/gift ফিল্ড | ✅ হুবহু |
| `date` regex `^\d{4}(-\d{2}(-\d{2})?)?$` | ✅ `DATE_RE` |
| `amount` int ≥0 \| null, `isPending` | ✅ |
| `columnsOf(t)` | ✅ `COLUMNS[t]` |
| EVENT_TYPES ৭টা | ✅ |
| LedgerDB per fileId | ✅ `openLedger(fileId)` |
| repo: stamp, fresh, mergePeople transaction | ✅ (transaction = একটা `set`) |
| format: formatTaka (Intl bn-BD) | 🟡 নিজে বানানো: `৳` + লাখ গ্রুপিং + বাংলা সংখ্যা (Intl-এর আউটপুট অনিশ্চিত বলে) |
| formatPartialDate, toAsciiDigits, normalizePhone | ✅ ➕ toBanglaDigits, parseAmount, timeAgo, formatDateTime |
| format/rows টেস্ট | ❌ টেস্ট নেই |

## §৫ UI (ফেজ ৩)

| পাতা | প্ল্যান | প্রোটোটাইপ |
|---|---|---|
| `/` | কার্ড, মোট, নতুন | ✅ ➕ সব-মিলিয়ে ৪ স্ট্যাট, FAB, খাম-বাকি ব্যাজ |
| নতুন অনুষ্ঠান | নাম, ধরন, তারিখ (শুধু সাল টগল), জায়গা | ✅ ➕ নোট, বাংলা তারিখ প্রিভিউ |
| `/events/$id` | মোট, দ্রুত যোগ, টেবিল, খাম-বাকি ফিল্টার, রপ্তানি/প্রিন্ট মেনু | ✅ ➕ পেলাম/দিলাম ট্যাব, মোবাইলে কার্ড-লিস্ট, ডেস্কটপে ২-কলাম |
| দ্রুত যোগ | Enter → সেভ, খালি, ফোকাস ফেরে | ✅ ➕ দিক মনে রাখে |
| Combobox | নাম/ফোন খোঁজ, "নতুন: X", একই ফোনে সতর্ক | ✅ নাম/ফোন খোঁজ, নতুন · 🟡 ফোন-ডুপ্লিকেট সতর্কতা শুধু PersonForm-এ (দ্রুত যোগে ফোন ঘরই নেই, তাই Combobox-এ লাগে না) |
| `/people` | খোঁজ + তালিকা | ✅ ➕ প্রতিজনের পেলাম/দিলাম |
| `/people/$id` | মোট, ইতিহাস, মার্জ | ✅ ➕ ব্যবধান, এডিট/মুছে ফেলো |
| `/settings` | অ্যাকাউন্ট, খাতার নাম, Sheets লিংক, সাইন আউট | ✅ ➕ নাম বদলানো, এক্সেল, অন্য খাতা, সিঙ্ক সিমুলেশন, নমুনা ডাটা, রিসেট |
| মাপকাঠি: রিলোডে ডাটা থাকে | ✅ |

## §৬ লগইন (ফেজ ৪)

| প্ল্যান | প্রোটোটাইপ |
|---|---|
| GIS token client, `drive.file` | 🟡 মক অ্যাকাউন্ট চুজার |
| নাম/ইমেইল `drive/v3/about` | 🟡 প্রিসেট নাম / ইমেইলের local part |
| ইমেইল localStorage → `login_hint` | ✅ `uk-last-email` → চুজারে "শেষবার" উপরে |
| টোকেন পপআপ শুধু ইউজারের চাপে; "সিঙ্ক করতে চাপুন" | ✅ `needs-token` অবস্থা + বাটন (মক) |
| `gfetch` 429 backoff, GoogleError | 🟡 `GoogleError(status)` আছে; fetch/backoff নেই |
| `_app` guard: লগইন → `/login`, খাতা → `/setup` | ✅ `app.js` render guard + redirect মনে রাখা |
| `/setup`: appProperties query; ০/১/অনেক | ✅ `listLedgers` মক; ০ → বানাও, ১ → নিজে খোলে, অনেক → তালিকা (`?pick=1`) |
| টোকেন `sessionStorage` | 🟡 সেশন `sessionStorage` (ট্যাব-ভিত্তিক) — ইচ্ছা করে, A/B টেস্টের জন্য |

## §৭ সিঙ্ক (ফেজ ৫) — সবচেয়ে বড় গ্যাপ

| প্ল্যান | প্রোটোটাইপ |
|---|---|
| খাতা বানানো: Sheets POST + Drive PATCH appProperties | 🟡 `createLedger` মক |
| `rows.ts` toRow/fromRow/assertHeaders | ❌ |
| `merge.ts` last-write-wins | ❌ |
| এক চক্র: batchGet → merge → bulkPut → batchUpdate/append | ❌ (fake 800ms + `getFile` অনুমতি চেক) |
| কখন: খুললে, ৩ সে debounce, online, প্রতি ৬০ সে | ✅ খুললে, online, ৬০ সে · 🟡 debounce ১.৫ সে (প্ল্যান ৩ সে) |
| একসাথে একটাই চক্র | ✅ `running` |
| স্ট্যাটাস: ✅ ⏳ 📴(n) 🔑 ⚠️ | ✅ ➕ `paused` |
| 401 → চাপুন | ✅ (সিমুলেট টগল) |
| 403/404 → ব্যানার [কপি রাখো] [মুছে ফেলো] | ✅ আসল মক-ফ্লো: মালিক বাদ দিলে পরের সিঙ্কে ব্যানার |
| sheet-tampered → থামাও | ✅ (সিমুলেট টগল; আসল হেডার যাচাই নেই) |
| দুই ব্রাউজারে ৬০ সে-র মধ্যে দেখা যায় | 🟡 একই ব্রাউজারের দুই ট্যাবে `storage` ইভেন্টে তাৎক্ষণিক; আলাদা ব্রাউজার/ডিভাইসে কিছু যায় না |
| A ও B একই উপহার একসাথে | ❌ পরীক্ষা অসম্ভব (merge নেই) |

## §৮ শেয়ার + QR + join (ফেজ ৬)

| প্ল্যান | প্রোটোটাইপ |
|---|---|
| `/share` শুধু ownedByMe | ✅ |
| জিমেইল + Zod যাচাই | ✅ regex |
| addEditor (writer, notification email) | 🟡 মক; ইমেইল যায় না |
| QR কার্ড: QRCodeSVG, কপি, `navigator.share` | ✅ qrcode-generator SVG; share → wa.me fallback |
| সদস্য তালিকা + বাদ দাও (Confirm) | ✅ |
| QR-এ শুধু fileId; "anyone with link" কখনো না | ✅ |
| `/join` validateSearch `f` ≥10 | ✅ |
| লগইন নেই → login → ফেরত | ✅ redirect |
| GET সরাসরি ✅ → সক্রিয়; ❌ → কার্ড → Picker | ✅ পুরো গাছ, Picker মক (`setFileIds` আচরণ) |
| C অ্যাকাউন্ট → "যোগ করা নেই" | ✅ |

## §৯ রপ্তানি + প্রিন্ট (ফেজ ৭)

| প্ল্যান | প্রোটোটাইপ |
|---|---|
| এক অনুষ্ঠানের xlsx, বাংলা কলাম, মোট সারি | ✅ SheetJS CDN · 🟡 ফাইল নামানো হাতে যাচাই করিনি |
| পুরো খাতার xlsx (+অনুষ্ঠান, তারিখ) | ✅ |
| `/events/$id/print`, `window.print()`, nav লুকানো | ✅ `print:hidden` · 🟡 আসল প্রিন্ট আউটপুট দেখিনি |
| ব্যাকআপ = শিট, "Sheets-এ খোলো" | 🟡 লিংক মক আইডি → খুলবে না |

## §১০ PWA (ফেজ ৮) — ✅ হয়েছে (২০২৬-১০-১০): `public/manifest.webmanifest`, `workbox-build` দিয়ে `sw.js` (vite.config.ts `buildApp` post hook), `_shell.html` navigateFallback, রেজিস্টার `__root.tsx`-এ। `vite-plugin-pwa` বাদ — TanStack Start-এর environment build-এ sw.js বানায় না (TanStack/router#4988)।

## §১১ টেস্ট (ফেজ ৯) — ❌ `merge/rows/format` টেস্ট নেই (merge/rows মডিউলই নেই)

## §১২ দুই-অ্যাকাউন্ট চেকলিস্ট (১৩টা)

| # | আইটেম | প্রোটোটাইপে |
|---|---|---|
| 1 | A খাতা বানায়; শিটে ৩ ট্যাব | 🟡 খাতা হয়, শিট নেই |
| 2 | A অনুষ্ঠান + ৫ উপহার; শিটে দেখা যায় | 🟡 অ্যাপে দেখা যায় |
| 3 | এয়ারপ্লেন মোডে ৩টা → নেট এলে যায় | ✅ অফলাইন টগল → pending কাউন্ট → অন করলে সিঙ্ক |
| 4 | A B-র জিমেইল যোগ; ইমেইল; QR | ✅ (ইমেইল ছাড়া) |
| 5 | B QR → join → লগইন → Picker → খাতা | ✅ |
| 6 | B উপহার → A-তে ৬০ সে, `updatedBy = B` | ✅ (টেবিলে updatedBy দেখায়) |
| 7 | একই উপহার একসাথে | ❌ |
| 8 | C → "যোগ করা নেই" | ✅ |
| 9 | A B-কে বাদ → B-তে "অনুমতি নেই" | ✅ |
| 10 | শিটে কলাম মুছলে সিঙ্ক থামে | 🟡 সিমুলেট টগল |
| 11 | A নতুন ব্রাউজারে → setup খাতা পায় | ✅ (নতুন ট্যাব) |
| 12 | এক্সেলে বাংলা, প্রিন্ট খাতার মতো | 🟡 UI আছে, আউটপুট হাতে যাচাই বাকি |
| 13 | B দুই "রহিম" মার্জ; A-তেও আপডেট | ✅ |

## ➕ প্ল্যানে ছিল না, প্রোটোটাইপে যোগ

তিন লেআউট (মোবাইল bottom tabs + FAB + কার্ড-লিস্ট, ট্যাব top nav, ডেস্কটপ sidebar + ২-কলাম) · মোবাইলে bottom-sheet ডায়ালগ · সিঙ্ক সিমুলেশন টগল · নমুনা ডাটা · প্রোটোটাইপ রিসেট · `cnm()` class-merge · `novalidate` + বাংলা এরর · ডেভ সার্ভার no-store · 404 পাতা · `paused` সিঙ্ক অবস্থা।

## সারাংশ — আসল গ্যাপ (পোর্টের সময় বানাতে হবে)

1. **সিঙ্ক ইঞ্জিনের মূল:** `rows.ts`, `merge.ts`, Sheets batchGet/batchUpdate/append, হেডার যাচাই — ফেজ ৫।
2. **আসল গুগল:** GIS টোকেন, `gfetch` (backoff), Drive files/permissions, Picker, appProperties — ফেজ ৪/৬।
3. **Dexie + Zod:** localStorage → Dexie; validator → Zod স্কিমা (কলাম তালিকা স্কিমা থেকেই)।
4. ~~**PWA/offline shell** — ফেজ ৮।~~ হয়েছে (§১০)।
5. **টেস্ট** — merge/rows/format।
6. **ESLint forbid-elements** — এখন শুধু নিয়ম, যন্ত্র নেই।
7. ছোট: debounce ৩ সে; `formatTaka` Intl কি না ঠিক করা; share/setup/join routes সরাসরি drive ডাকে — feature হুকে নেওয়া; xlsx/প্রিন্ট আউটপুট হাতে যাচাই।

UI/ফ্লো স্তরে (ফেজ ৩ + ৬-এর পর্দা) প্ল্যানের কিছু বাদ নেই; বরং বেশি আছে।
