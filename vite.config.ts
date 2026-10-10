import { defineConfig, type Plugin } from "vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { existsSync } from "node:fs"
import { generateSW } from "workbox-build"

// PWA service worker: vite-plugin-pwa TanStack Start-এর environment build-এ sw.js বানায় না (TanStack/router#4988),
// তাই workbox-build সরাসরি। buildApp post: Start-এর prerender `_shell.html` লেখার পরে চলে, নইলে shell precache-এ ঢোকে না।
// manifest: public/manifest.webmanifest · register: src/routes/__root.tsx
function serviceWorker(): Plugin {
  return {
    name: "giftbook-sw",
    enforce: "post",
    buildApp: {
      order: "post",
      async handler(builder) {
        const out = builder.environments.client.config.build.outDir
        // হুক-অর্ডার ভুল হলে (prerender-এর আগে চললে) বিল্ডই ফেল করুক, নিঃশব্দে shell-ছাড়া PWA নয়
        if (!existsSync(`${out}/_shell.html`)) throw new Error("[sw] _shell.html missing — must run after Start prerender")
        const { count, warnings } = await generateSW({
          globDirectory: out,
          swDest: `${out}/sw.js`,
          globPatterns: ["**/*.{js,css,html,svg,woff2,png,ico,webmanifest}"],
          globIgnores: ["og-v2.png"],
          navigateFallback: "/_shell.html",
          skipWaiting: true,
          clientsClaim: true,
          cleanupOutdatedCaches: true,
          inlineWorkboxRuntime: true,
          sourcemap: false,
          runtimeCaching: [
            { urlPattern: /^https:\/\/(accounts|apis)\.google\.com\//, handler: "StaleWhileRevalidate", options: { cacheName: "google-scripts" } },
          ],
        })
        warnings.forEach((w) => console.warn(`[sw] ${w}`))
        console.log(`[sw] ${count} files precached → ${out}/sw.js`)
      },
    },
  }
}

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    tailwindcss(),
    // SPA: সার্ভার নেই; shell প্রি-রেন্ডার, বাকি সব ব্রাউজারে
    tanstackStart({ spa: { enabled: true } }),
    viteReact(),
    serviceWorker(),
  ],
})
