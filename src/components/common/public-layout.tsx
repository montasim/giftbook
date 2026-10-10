import { Link } from "@tanstack/react-router"
import type { ReactNode } from "react"
import { t } from "@/lib/i18n"

// লগইন-ছাড়া পাতা (privacy, contact, 404, 500): উপরে ব্র্যান্ড, main-এর প্রস্থ AppShell-এর সমান, নিচে লিংক
export const PublicLayout = ({ children }: { children: ReactNode }) => (
  <div className="flex min-h-dvh flex-col">
    <header className="border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-3xl items-center px-4 sm:px-6 lg:max-w-5xl lg:px-10">
        <Link to="/" className="flex items-center gap-2 font-bold">
          <img src="/logo.svg" alt="" className="h-8 w-8" />
          {t.appName}
        </Link>
      </div>
    </header>
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:px-6 lg:max-w-5xl lg:px-10 lg:py-8">{children}</main>
    <footer className="mx-auto flex w-full max-w-3xl gap-4 px-4 py-6 text-xs text-stone-400 sm:px-6 lg:max-w-5xl lg:px-10">
      <Link to="/about" className="hover:underline">{t.about.link}</Link>
      <Link to="/privacy" className="hover:underline">{t.privacy.link}</Link>
      <Link to="/contact" className="hover:underline">{t.contact.link}</Link>
    </footer>
  </div>
)
