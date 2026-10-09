# উপহারের খাতা — ফ্রন্টএন্ড প্রোটোটাইপ

HTML + Tailwind (CDN) + vanilla JS। বিল্ড নেই, ফ্রেমওয়ার্ক নেই। গুগল লগইন / Drive / Picker / সিঙ্ক সব **মক** — `localStorage`/`sessionStorage`-এ।

## চালানো

```bash
npm run dev
```

টেস্ট (সিঙ্কের rows / merge / cycle, ৯টা):

```bash
npm test
```

তারপর http://localhost:4173 খুলুন। (`dev-server.py` = `Cache-Control: no-store` দেওয়া static server, তাই ফাইল বদলালে সাধারণ reload-এই দেখা যায়। `file://` দিয়ে খুললে ES module চলবে না।)

## ওয়ার্কফ্লো (পাতা থেকে পাতা)

```
খোলা ──► লগইন নেই? ──► /login ──► Google চুজার ──► /setup
                                                      ├─ ০ খাতা → "খাতা বানাও" → /
                                                      ├─ ১ খাতা → নিজে খুলে / 
                                                      └─ অনেক  → তালিকা → /
/ (অনুষ্ঠান) ──► নতুন অনুষ্ঠান (ডায়ালগ) ──► /events/:id, ফোকাস সোজা "নাম" ঘরে
/events/:id ──► দ্রুত যোগ: নাম ⏎ টাকা ⏎ (ফর্ম খালি, ফোকাস ফেরে) · সারি চাপ → উপহার বদলাও · ⋮ → এডিট / এক্সেল / প্রিন্ট / মুছে ফেলো
/people ──► /people/:id (ইতিহাস, মার্জ) ──► সারি চাপ → উপহার বদলাও · অনুষ্ঠানের নামে → /events/:id
/share (শুধু মালিক) ──► জিমেইল যোগ → QR/লিংক ──► অন্য অ্যাকাউন্টে /join?f= → Picker → /
/settings ──► সাইন আউট → /login · অন্য খাতা → /setup?pick=1 · ফোনের কপি মুছো → /setup · প্রোটোটাইপ রিসেট → শুরু থেকে
সিঙ্ক ব্যানার: অনুমতি নেই → [কপি রাখো] (সিঙ্ক বন্ধ) / [মুছে ফেলো] → /setup
```

লগইন **ট্যাব-ভিত্তিক** (sessionStorage): একই ট্যাবে reload করলে লগইন থাকে (আসল অ্যাপের মতো), নতুন ট্যাব = নতুন অ্যাকাউন্ট। শুরু থেকে দেখতে: সেটিংস → প্রোটোটাইপ রিসেট।

## টেস্ট করার পথ

1. **লগইন** → "Google দিয়ে সাইন ইন" → `ma@gmail.com` (A = মা)।
2. **/setup** → নতুন খাতা বানান।
3. **সেটিংস → নমুনা ডাটা ভরো** → হোমে ৩টা অনুষ্ঠান।
4. **অনুষ্ঠান পাতা** → দ্রুত যোগ: নাম লিখুন → Enter → টাকা → Enter। ফোকাস নামের ঘরে ফেরে।
5. **মানুষ → রহিম মামা → মার্জ করো** → "রহিম" বাছুন।
6. **শেয়ার** → `baba@gmail.com` যোগ করুন → QR / লিংক।
7. **নতুন ট্যাবে** (session আলাদা, তাই আলাদা অ্যাকাউন্ট) join লিংক খুলুন → `baba@gmail.com` → "খাতাটি খুলুন" → Picker-এ ফাইল বাছুন → B খাতা দেখে।
8. A ট্যাবে শেয়ার → B-কে বাদ দিন → B ট্যাবে উপরের সিঙ্ক বাটনে চাপ → "অনুমতি নেই" ব্যানার।
9. **সেটিংস → সিঙ্ক পরীক্ষা**: অফলাইন / টোকেন ফুরিয়েছে / শিটের কলাম বদলে গেছে — উপরের স্ট্যাটাস আর ব্যানার দেখুন।
10. অনুষ্ঠান মেনু (⋮) → এক্সেল / প্রিন্ট।

## কাঠামো

```
src/
├─ app.js                  # hash router + guard + render loop
├─ lib/                    # dom.js (h, island, focus), store.js, router.js, format.js, i18n/bn.js
├─ config/                 # icons.js, event-types.js, nav.js
├─ components/ui/          # shadcn-ধাঁচের কম্পোনেন্ট: Button, Input, Dialog, Table, Tabs…
├─ components/common/      # AppShell, Nav, PageHeader, SyncStatus, Money, PartialDate…
├─ features/
│  ├─ auth/                # মক সেশন (per-tab)
│  ├─ google/              # মক Drive + Picker (cross-tab, localStorage)
│  ├─ ledger/              # schema, db, repo (একমাত্র লেখার দরজা), queries, seed
│  ├─ sync/                # rows · merge · sync-cycle (আসল pull→merge→push, টেস্টেড) · sheets-api (মক Sheets, localStorage) · sync-engine (কখন চলবে, অবস্থা)
│  ├─ events/ people/ gifts/ sharing/ export/
└─ routes/                 # পাতলা: ডাটা আনে + কম্পোনেন্ট জোড়ে
```

**নিয়ম:** প্রতিটা কম্পোনেন্ট একটা ফাংশন `(props, ...children) => Element`। পাতায় কখনো raw `<button>`/`<input>` না — `Button`, `Input` ব্যবহার। সব লেখা `lib/i18n/bn.js`-এ, সব আইকন `config/icons.js`-এ, সব সংখ্যা/তারিখ `lib/format.js`-এ।

**লাইভ আপডেট:** স্টোরে লিখলে `uk:change` ইভেন্ট → পুরো রুট re-render (≈ `useLiveQuery`)। সিঙ্ক স্ট্যাটাস/ব্যানার `island()` — নিজেরা আপডেট হয়, টাইপ করা লেখা হারায় না।

**ডিজাইন টোকেন:** আইকন 12 / 16 / 20 / 24 / 32 · টেক্সট রং: body `stone-900`, secondary `stone-600`, muted `stone-500`, faint `stone-400` · লিস্ট-কার্ড `p-3`, কন্টেন্ট-কার্ড `p-4` · বাটন সাইজ সব পাতায় `default`, শুধু আইকন-বাটন `icon`/`iconSm`।

**ক্লাস override:** `Button`/`Card` `cnm()` ব্যবহার করে — পরের ক্লাস আগেরটাকে হারায় (`justify-start` > `justify-center`)। অন্য কম্পোনেন্টে override লাগলে `cnm` নাও, `cn` না।

**ফর্ম:** `h('form')` নিজে থেকেই `novalidate` — ব্রাউজারের ইংরেজি বাবল কখনো আসবে না, সব এরর `Field.setError()` দিয়ে বাংলায়।

**রেসপন্সিভ:** `<640` মোবাইল (bottom tabs, bottom-sheet dialog, কার্ড লিস্ট, FAB) · `640–1023` ট্যাব (top nav, 2-col grid) · `≥1024` ডেস্কটপ (sidebar, 2-column পাতা)।
