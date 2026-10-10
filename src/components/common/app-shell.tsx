import { Link } from "@tanstack/react-router"
import type { ReactNode } from "react"
import { UserMenu } from "./user-menu"
import { Nav } from "./nav"
import { SyncStatus } from "./sync-status"
import { SyncBanner } from "./sync-banner"
import { t } from "@/lib/i18n/bn"
import type { GoogleUser, LedgerFile } from "@/features/google/types"

// সব সাইজে উপরে navbar: বামে ব্র্যান্ড · মাঝখানে পাতার নাম · ডানে সিঙ্ক+ইউজার; মোবাইলে পাতার নাম নিচের tab bar-এ
export function AppShell({ user, file, fileId, children }: { user: GoogleUser; file: LedgerFile | null; fileId: string; children: ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/90 backdrop-blur print:hidden">
        <div className="relative mx-auto flex h-14 max-w-3xl items-center gap-3 px-4 sm:px-6 lg:max-w-5xl lg:px-10">
          <Link to="/events" className="flex min-w-0 items-center gap-2 font-bold">
            <img src="/logo.svg" alt="" className="h-8 w-8 shrink-0" />
            <span className="truncate">{file?.name ?? t.appName}</span>
          </Link>
          {/* মেনু একদম মাঝখানে — ব্র্যান্ড/সিঙ্কের প্রস্থে সরে না */}
          <div className="absolute inset-x-0 hidden justify-center sm:flex">
            <Nav variant="top" />
          </div>
          <div className="flex-1" />
          <SyncStatus />
          <UserMenu user={user} />
        </div>
      </header>
      <SyncBanner fileId={fileId} />
      <main className="mx-auto w-full max-w-3xl px-4 py-4 pb-32 sm:px-6 sm:pb-10 lg:max-w-5xl lg:px-10 lg:py-8">{children}</main>
      <Nav variant="bottom" />
    </div>
  )
}
