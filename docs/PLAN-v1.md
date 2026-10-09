# উপহারের খাতা: ইমপ্লিমেন্টেশন প্ল্যান

> **রিভিউ নোট (প্রোটোটাইপ বানানোর সময়):**
> 1. **merge.ts**: `l.updatedAt > r.updatedAt` ISO string তুলনা ঠিক আছে, কিন্তু push ব্যর্থ হলে পরের চক্রে `append` আবার হবে → শিটে ডুপ্লিকেট সারি। `id → row` ম্যাপে প্রথম সারিটা নাও, আর push-এর আগে pull-এ id আছে কি না দেখো।
> 2. **login_hint + prompt ''**: গুগল তবু পপআপ দেখাতে পারে (৩য় পক্ষের কুকি বন্ধ থাকলে)। "সিঙ্ক করতে চাপুন" বাটনটাই fallback, ঠিক আছে।
> 3. **Picker + drive.file**: B-এর জন্য GET সরাসরি 403 দেবে (প্রোটোটাইপে এটাই সিমুলেট করা)। Picker-এর পরে ফাইল `listLedgers`-এ আসবে। `setAppId` project **number** — ভুল হলে নিঃশব্দে ব্যর্থ হয়, আগে একবার যাচাই করো।
> 4. **sessionStorage টোকেন**: ট্যাব বন্ধ হলে যায়। মোবাইলে PWA হিসেবে এটা প্রতিবার খুললে লগইন মানে। `localStorage` + expiry ভালো।
> 5. **assertHeaders** এক্সট্রা কলাম (ইউজার ডানদিকে নোট কলাম যোগ করল) ভাঙবে — শুধু প্রথম N কলাম মেলাও।
> 6. **mergePeople**: dupId-এর ফোন/ঠিকানা keep-এ কপি হয় না। keep-এর ফাঁকা ফিল্ডে dup-এর মান বসাও।
> 7. প্রোটোটাইপে পাওয়া UX জিনিস যা প্ল্যানে ছিল না: দ্রুত যোগে দিক (পেলাম/দিলাম) আগের মান মনে রাখা; মোবাইলে টেবিল না, কার্ড লিস্ট; FAB; ডেস্কটপে সাইডবার + ২-কলাম অনুষ্ঠান পাতা (হিসাব+দ্রুত যোগ বামে, তালিকা ডানে)।

**স্ট্যাক:** TanStack Start (SPA mode) · TypeScript · shadcn/ui · Hugeicons · Dexie (ফোনের ডাটাবেস) · Google Sheets/Drive/Picker API

---

## ০. বড় সিদ্ধান্তগুলো

| সিদ্ধান্ত | কী বেছেছি | কেন |
|---|---|---|
| রেন্ডারিং | **SPA mode** (সার্ভার নেই) | গুগল লগইন, Picker, ফোনের ডাটাবেস সব ব্রাউজারেই চলে। স্ট্যাটিক হোস্টিং ফ্রি। |
| আসল খাতা | **গুগল শিট** (মালিকের ড্রাইভে) | শেয়ার আর ব্যাকআপ গুগল করে দেয় |
| অ্যাপ কোথা থেকে পড়ে | **Dexie (IndexedDB)**, ফোনের কপি | নেট ছাড়া চলে, দ্রুত চলে |
| "এক জায়গায় বদলালে সব জায়গায় আপডেট" | Dexie `useLiveQuery` | ডাটা বদলালে সব স্ক্রিন নিজেই আপডেট হয় |
| সিঙ্ক | Pull → merge → push, **last-write-wins** (`updatedAt` দিয়ে) | সহজ, আর পরিবারের খাতার জন্য যথেষ্ট |
| মুছে ফেলা | **Soft delete** (`deletedAt`) | শিটের সারির নম্বর কখনো সরে না, তাই সিঙ্ক নিরাপদ থাকে |
| গুগল অনুমতি | শুধু `drive.file` | ভয়ের পর্দা নেই, লম্বা যাচাই নেই |
| শেয়ার | Drive permission (এডিটর) + QR/লিংক + Picker-এ এক চাপ | |
| QR স্ক্যান | **ফোনের নিজের ক্যামেরা** | QR-এর ভেতরে URL। ক্যামেরা স্ক্যান করলেই `/join` খুলবে। |
| ফর্ম | TanStack Form + Zod | একটাই স্কিমা থেকে টাইপ, ভ্যালিডেশন আর শিটের কলাম |

**সীমাবদ্ধতা:** প্রথমবার লগইন করতে নেট লাগবে। এরপর নেট ছাড়াই লেখা যাবে, নেট এলে সিঙ্ক হবে।

---

## ১. ফোল্ডার কাঠামো

```
src/
├─ routes/                      # পাতলা: শুধু ডাটা আনা + কম্পোনেন্ট জোড়া
│  ├─ __root.tsx · login.tsx · join.tsx (?f=<fileId>) · _app.tsx (guard)
│  └─ _app/ index.tsx · setup.tsx · events.$eventId.tsx · events.$eventId.print.tsx
│            people.index.tsx · people.$personId.tsx · share.tsx · settings.tsx
├─ components/ui/               # shadcn জেনারেটেড। হাতে বদলাবে না।
├─ components/common/           # app-icon · money · partial-date · page-header · responsive-dialog · confirm-dialog · empty-state · sync-status
├─ features/
│  ├─ auth/      google-auth.ts · use-auth.ts · login-card.tsx
│  ├─ ledger/    schema.ts · db.ts · repo.ts · use-ledger.ts
│  ├─ events/    event-form · event-card · event-list · event-totals
│  ├─ people/    person-combobox · person-form · person-history · merge-person-dialog
│  ├─ gifts/     gift-form · quick-add · gift-table · direction-toggle
│  ├─ sync/      google-fetch · sheets · drive · rows · merge · sync-engine · use-sync
│  ├─ sharing/   share-panel · qr-card · member-list · picker · join-flow
│  └─ export/    to-xlsx · print-view
├─ config/   env.ts · icons.ts · event-types.ts
├─ lib/      i18n/bn.ts · format.ts · utils.ts
└─ styles.css
```

নিয়ম: Single Responsibility · Dependency direction `routes → features → hooks → repo/sync → google-fetch` · Open/Closed (`config/`) · এক জায়গায় সত্য (স্কিমা, bn.ts, icons.ts, format.ts) · ইন্টারফেস শুধু দরকার হলে।

ESLint `react/forbid-elements`: `button input textarea select label table dialog hr` → shadcn কম্পোনেন্ট (ignores `src/components/ui/**`)।

---

## ২. Google Cloud (ফেজ ০)

1. নতুন প্রজেক্ট। 2. Sheets, Drive, Picker API চালু। 3. OAuth consent (External, নাম "উপহারের খাতা", scope শুধু `drive.file`, test users)। 4. OAuth Client ID (Web), origins: `http://localhost:3000` + প্রোডাকশন। 5. API Key (শুধু Picker, HTTP referrer সীমাবদ্ধ)। 6. Project **number** → Picker `setAppId`।

```bash
# .env
VITE_GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=AIza...
VITE_GOOGLE_APP_ID=123456789012
```

---

## ৩. প্রজেক্ট শুরু (ফেজ ১)

```bash
npm create @tanstack/start@latest upohar-khata
npx shadcn@latest init
npx shadcn@latest add button card input textarea label field input-group select toggle-group dialog drawer sheet table tabs badge sonner dropdown-menu command popover alert skeleton separator empty spinner avatar
npm i dexie dexie-react-hooks zod @tanstack/react-form @hugeicons/react @hugeicons/core-free-icons qrcode.react @fontsource/hind-siliguri
npm i -D @types/google.accounts @types/google.picker @types/gapi vitest
npm i https://cdn.sheetjs.com/xlsx-latest/xlsx-latest.tgz
```

`vite.config.ts`: `tanstackStart({ spa: { enabled: true } })` (অপশনের নাম ডকে মিলিয়ে নিও)। `__root.tsx` head-এ `accounts.google.com/gsi/client` আর `apis.google.com/js/api.js`।

**মাপকাঠি:** অ্যাপ চলে, বাংলা ফন্ট দেখায়, ESLint নিয়ম কাজ করে।

---

## ৪. ডাটা মডেল (ফেজ ২)

```ts
const meta = { id, updatedAt, updatedBy, deletedAt: nullable }   // শিটের কলাম = key-এর ক্রম; নতুন ফিল্ড শেষে
eventSchema  = meta + { name, type: enum(EVENT_TYPE_KEYS), date: /^\d{4}(-\d{2}(-\d{2})?)?$/, location, note }
personSchema = meta + { name (required), phone (normalizePhone), address, relation, note }
giftSchema   = meta + { eventId, personId, direction: 'received'|'given', amount: int|null, item, note }
isPending = g => g.amount === null && g.item.trim() === ''   // "খাম খোলা বাকি"
columnsOf(t) = Object.keys(TABLES[t].shape)
```

`config/event-types.ts`: wedding · holud · walima · aqiqah · khatna · birthday · other (label + icon)।
`db.ts`: `class LedgerDB extends Dexie` per fileId (`ledger-${fileId}`), indexes `events: id,date,updatedAt · people: id,name,phone,updatedAt · gifts: id,eventId,personId,updatedAt`।
`repo.ts`: লেখার একমাত্র দরজা — `stamp()` দিয়ে `updatedAt/updatedBy`; `removeX` = soft delete; `mergePeople(keepId, dupId)` এক ট্রানজ্যাকশনে।
`format.ts`: `formatTaka` · `formatPartialDate("2018-03") → "মার্চ ২০১৮"` · `toAsciiDigits("২০০০") → "2000"` · `normalizePhone("+880 1711-000000") → "01711000000"`।

**মাপকাঠি:** স্কিমা, DB, repo, format তৈরি; `format` আর `rows` টেস্ট পাস।

---

## ৫. পুরো UI, শুধু ফোনের ডাটা দিয়ে (ফেজ ৩)

| পাতা | যা থাকবে |
|---|---|
| `/` | অনুষ্ঠানের কার্ড (নতুন উপরে), মোট পেলাম/দিলাম, "নতুন অনুষ্ঠান" |
| নতুন অনুষ্ঠান | নাম, ধরন, তারিখ ("শুধু সাল" টগল), জায়গা — ResponsiveDialog |
| `/events/$id` | মোট হিসাব, **দ্রুত যোগ**, উপহারের টেবিল, "খাম খোলা বাকি" ফিল্টার, রপ্তানি/প্রিন্ট মেনু |
| দ্রুত যোগ | Combobox + পেলাম/দিলাম + টাকা + জিনিস; Enter → সেভ, ফর্ম খালি, ফোকাস নামে |
| Combobox | নাম/ফোন খোঁজে; "নতুন: রহিম"; একই ফোন থাকলে সতর্ক |
| `/people` | খোঁজ + তালিকা |
| `/people/$id` | মোট পেলাম বনাম দিলাম, তারিখ অনুযায়ী ইতিহাস, "একই মানুষ? মার্জ করো" |
| `/settings` | অ্যাকাউন্ট, খাতার নাম, "Google Sheets-এ খোলো", সাইন আউট |

সব পড়া `useLiveQuery` হুকে (`useEvents`, `useEventGifts`, `usePersonHistory`); `deletedAt` হুকেই বাদ।

**মাপকাঠি:** অনুষ্ঠান, ৩০টা উপহার দ্রুত যোগ, ইতিহাস, মার্জ — রিলোডেও ডাটা থাকে।

---

## ৬. গুগল লগইন (ফেজ ৪)

`google-auth.ts`: `initTokenClient({ scope: drive.file, login_hint })` → `requestAccessToken({ prompt: hint ? '' : 'consent' })`; টোকেন + expiry সেভ; `currentToken()`।
ইউজার: `GET drive/v3/about?fields=user`। ইমেইল `localStorage`-এ → পরেরবার `login_hint`।
⚠️ টোকেন পপআপ শুধু ইউজারের চাপে → ফুরালে "সিঙ্ক করতে চাপুন", লেখা থামে না।
`google-fetch.ts`: `gfetch(url, init, tries=3)` — Bearer, 429-এ exponential backoff, `GoogleError(status)`।
`_app.tsx` guard: লগইন নেই → `/login`; খাতা নেই → `/setup`।
`/setup`: `GET drive/v3/files?q=appProperties has {key='app' and value='upohar-khata'} and trashed=false` → ০: বানাও · ১: খোলো · অনেক: তালিকা।

**মাপকাঠি:** লগইন, রিলোড, টোকেন ফুরানো, আবার চাপ — সব কাজ করে।

---

## ৭. সিঙ্ক ইঞ্জিন (ফেজ ৫)

খাতা বানানো: Sheets `POST /v4/spreadsheets` (৩ ট্যাব, হেডার `columnsOf()`, প্রথম সারি frozen) → Drive `PATCH files/{id}` `appProperties: { app: 'upohar-khata', schemaVersion: '1' }`।
`rows.ts`: `toRow` / `fromRow` (`'' → null` deletedAt/amount, `safeParse`) / `assertHeaders` → `sheet-tampered:${t}`।
`merge.ts` (pure): নতুন লোকাল বা লোকাল নতুনতর → `toPush`; রিমোট নতুনতর বা শুধু রিমোটে → `toSave`।

এক চক্র ≤ ৩ কল: `values:batchGet` (৩ রেঞ্জ) → merge → Dexie `bulkPut` → `values:batchUpdate` (আছে এমন সারি) + `values:append` (নতুন)।
কখন: খুললে · বদলের ৩ সে পরে (debounce) · `online` · সামনে থাকলে প্রতি ৬০ সে। একসাথে একটাই (`running`)। সারি নম্বর স্থির (কখনো মোছে না)।

`<SyncStatus/>`: ✅ সিঙ্ক হয়েছে · ⏳ হচ্ছে · 📴 অফলাইন (n বাকি) · 🔑 চাপুন · ⚠️ খাতায় সমস্যা।
401 → চাপুন · 403/404 → "অনুমতি নেই" ব্যানার [ফোনের কপি রেখে দাও] [মুছে ফেলো] · `sheet-tampered` → সিঙ্ক থামাও, কিছু লিখো না।

**মাপকাঠি:** দুই ব্রাউজার, ৬০ সে-র মধ্যে দেখা যায়; অফলাইনে লেখা নেট ফিরলে শিটে যায়।

---

## ৮. শেয়ার + QR + যোগ দেওয়া (ফেজ ৬)

`drive.ts`: `addEditor` (`permissions` POST writer, `sendNotificationEmail=true`) · `listMembers` · `removeMember`।
`/share` (শুধু `ownedByMe`): জিমেইল + যোগ করো (Zod) → QR কার্ড (`${origin}/join?f=${fileId}`, কপি, `navigator.share`) → সদস্য তালিকা + বাদ দাও (Confirm)।
🔐 QR/লিংকে শুধু ফাইল আইডি। "Anyone with the link" কখনো না।

`/join?f=`: লগইন নেই → login (f মনে রাখা) → ফেরত। `GET spreadsheets/{f}?fields=spreadsheetId` ✅ → সক্রিয় → সিঙ্ক → হোম। ❌ 403/404 → কার্ড "খাতাটি খুলুন" (ইউজারের চাপ) → Picker (`DocsView(SPREADSHEETS).setFileIds(f)`, `setAppId`) → মিললে সক্রিয়; খালি/বাতিল → "আপনার জিমেইল (x) এই খাতায় যোগ করা নেই।"

**মাপকাঠি:** §১২ দুই-অ্যাকাউন্ট চেকলিস্ট পাস।

---

## ৯. রপ্তানি আর প্রিন্ট (ফেজ ৭)

এক অনুষ্ঠানের এক্সেল (`XLSX.utils.json_to_sheet`, বাংলা কলাম, মোটের সারি) · পুরো খাতার এক্সেল (+ অনুষ্ঠান, তারিখ) · `/events/$id/print` (`window.print()`, `print:` ভ্যারিয়েন্ট, খাতার মতো) · ব্যাকআপ = শিটটাই।

## ১০. PWA (ফেজ ৮)

`vite-plugin-pwa` (generateSW): manifest, precache, গুগল স্ক্রিপ্ট `StaleWhileRevalidate`। না চললে হাতে লেখা `public/sw.js`। হোস্টিংয়ে SPA rewrite।
**মাপকাঠি:** এয়ারপ্লেন মোডে অ্যাপ খোলে, ১০টা উপহার লেখা যায়, নেট এলে শিটে যায়।

## ১১. টেস্ট (ফেজ ৯)

`merge.test.ts` · `rows.test.ts` · `format.test.ts`। UI হাতে করা চেকলিস্ট।

## ১২. শেষ চেকলিস্ট (A = মা, B = বাবা)

- [ ] A খাতা বানায়; শিটে ৩ ট্যাব + হেডার।
- [ ] A অনুষ্ঠান + ৫ উপহার; শিটে দেখা যায়।
- [ ] A এয়ারপ্লেন মোডে ৩টা; নেট এলে যায়।
- [ ] A B-র জিমেইল যোগ করে; B ইমেইল পায়; QR দেখায়।
- [ ] B QR স্ক্যান → `/join` → লগইন → Picker → খাতা দেখে।
- [ ] B উপহার যোগ; A-তে ৬০ সে-র মধ্যে, `updatedBy = B`।
- [ ] A ও B একই উপহার প্রায় একসাথে; পরেরটা জেতে।
- [ ] C একই QR → "যোগ করা নেই"।
- [ ] A B-কে বাদ দেয় → B-তে "অনুমতি নেই"।
- [ ] শিটে কলাম মুছলে সিঙ্ক থামে, ডাটা নষ্ট হয় না।
- [ ] A নতুন ব্রাউজারে → `/setup` নিজেই খাতা পায়।
- [ ] এক্সেলে বাংলা ঠিক; প্রিন্ট খাতার মতো।
- [ ] B দুই "রহিম" মার্জ; A-তেও আপডেট।

## ১৩. ফেজের ক্রম

০ Cloud → ১ প্রজেক্ট → ২ স্কিমা/Dexie/repo → ৩ পুরো UI (গুগল ছাড়া) → ৪ লগইন/setup → ৫ সিঙ্ক → ৬ শেয়ার/QR/join → ৭ এক্সেল/প্রিন্ট → ৮ PWA → ৯ টেস্ট/ডিপ্লয়।

**ইচ্ছা করে বাদ:** অ্যাপের ভেতরের QR স্ক্যানার · সার্ভার-সাইড OAuth (refresh token) · একাধিক খাতা একসাথে, পিন লক, ছবি থেকে লেখা তোলা।
