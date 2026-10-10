import { env } from "./env"
import { t } from "@/lib/i18n/bn"

// সাইট-ব্যাপী মেটাডাটার একমাত্র উৎস (title, description, canonical, সোশ্যাল প্রিভিউ)। SPA shell-এ প্রি-রেন্ডার হয় — সব রুট একই কার্ড পায়।
const origin = env.VITE_SITE_URL.replace(/\/+$/, "") // "" → root-relative (প্রোডে VITE_SITE_URL দাও)
export const site = {
  supportEmail: "montasimmamun@gmail.com",
  name: t.appName,
  title: `${t.appName} — ${t.tagline}`,
  description: t.seo.description,
  url: `${origin}/`,
  image: { url: `${origin}/og-v2.png`, type: "image/png", width: 1200, height: 630, alt: t.seo.imageAlt },
  secure: origin.startsWith("https://"),
  jsonLd: {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: t.appName,
    alternateName: "Giftbook",
    description: t.seo.description,
    url: `${origin}/`,
    image: `${origin}/og-v2.png`,
    logo: `${origin}/icon-512.png`,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any (web, PWA)",
    inLanguage: "bn",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "BDT" },
    featureList: ["অনুষ্ঠান ও উপহারের হিসাব", "Google Sheet-এ ডাটা", "অফলাইনেও চলে", "QR দিয়ে পরিবারের সাথে শেয়ার", "এক্সেল ও প্রিন্ট"],
  },
}
