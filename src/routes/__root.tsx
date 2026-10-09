import { HeadContent, Outlet, Scripts, createRootRoute } from "@tanstack/react-router"
import { Toaster } from "@/components/ui/sonner"
import { NotFound } from "@/components/common/not-found"
import { isMock } from "@/features/google"
import { site } from "@/config/site"
import appCss from "../styles.css?url"

export const Route = createRootRoute({
  ssr: false, // পুরো অ্যাপ ব্রাউজারে: Dexie, localStorage, Google সব ক্লায়েন্টে
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#047857" },
      { title: site.title },
      { name: "description", content: site.description },
      // সোশ্যাল প্রিভিউ (Open Graph + Twitter) — brand/og.html → public/og-v1.png; ছবি বদলালে নাম বদলাও (v2) যাতে ক্রলার ক্যাশ ফেলে
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: site.name },
      { property: "og:locale", content: "bn_BD" },
      { property: "og:title", content: site.title },
      { property: "og:description", content: site.description },
      { property: "og:url", content: site.url },
      { property: "og:image", content: site.image.url },
      ...(site.secure ? [{ property: "og:image:secure_url", content: site.image.url }] : []),
      { property: "og:image:type", content: site.image.type },
      { property: "og:image:width", content: String(site.image.width) },
      { property: "og:image:height", content: String(site.image.height) },
      { property: "og:image:alt", content: site.image.alt },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: site.title },
      { name: "twitter:description", content: site.description },
      { name: "twitter:image", content: site.image.url },
      { name: "twitter:image:alt", content: site.image.alt },
    ],
    links: [
      { rel: "canonical", href: site.url },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "stylesheet", href: appCss },
    ],
    scripts: isMock
      ? []
      : [
          { src: "https://accounts.google.com/gsi/client", async: true },
          { src: "https://apis.google.com/js/api.js", async: true },
        ],
  }),
  notFoundComponent: NotFound,
  shellComponent: RootDocument,
  component: () => (
    <>
      <Outlet />
      <Toaster position="bottom-center" offset={{ bottom: 80 }} mobileOffset={{ bottom: 80 }} />
    </>
  ),
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="min-h-dvh">
        {children}
        <Scripts />
      </body>
    </html>
  )
}
