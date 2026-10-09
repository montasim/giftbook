import { defineConfig } from "vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { VitePWA } from "vite-plugin-pwa"

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    tailwindcss(),
    // SPA: সার্ভার নেই; shell প্রি-রেন্ডার, বাকি সব ব্রাউজারে
    tanstackStart({ spa: { enabled: true } }),
    viteReact(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "logo.svg", "apple-touch-icon.png"],
      manifest: {
        name: "উপহারের খাতা",
        short_name: "উপহারের খাতা",
        description: "পরিবারের উপহারের হিসাব, এক জায়গায়",
        lang: "bn",
        display: "standalone",
        start_url: "/",
        theme_color: "#047857",
        background_color: "#fafaf9",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
      workbox: {
        navigateFallback: "/",
        globPatterns: ["**/*.{js,css,html,svg,woff2,png}"],
        runtimeCaching: [
          { urlPattern: /^https:\/\/(accounts\.google\.com|apis\.google\.com)\//, handler: "StaleWhileRevalidate", options: { cacheName: "google-scripts" } },
          { urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\//, handler: "StaleWhileRevalidate", options: { cacheName: "fonts" } },
        ],
      },
    }),
  ],
})
