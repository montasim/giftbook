import { Link, useLocation } from "@tanstack/react-router"
import { AppIcon } from "./app-icon"
import { NAV_ITEMS } from "@/config/nav"
import { t } from "@/lib/i18n/bn"
import { cn } from "@/lib/utils"

const isActive = (path: string, current: string) => current.startsWith(path)

// top: navbar-এর পাতার নাম (sm+) · bottom: মোবাইল tab bar
export function Nav({ variant }: { variant: "bottom" | "top" }) {
  const current = useLocation().pathname
  const items = NAV_ITEMS.map((it) => {
    const active = isActive(it.path, current)
    return variant === "top" ? (
      <Link key={it.path} to={it.path} aria-current={active ? "page" : undefined} className={cn("rounded-lg px-3 py-1.5 text-sm font-medium transition-colors lg:text-[15px]", active ? "bg-emerald-50 text-emerald-800" : "text-stone-600 hover:bg-stone-100 hover:text-stone-900")}>
        {t.nav[it.key]}
      </Link>
    ) : (
      <Link key={it.path} to={it.path} aria-current={active ? "page" : undefined} className={cn("flex h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium", active ? "text-emerald-700" : "text-stone-500")}>
        <AppIcon name={it.icon} size={24} strokeWidth={active ? 2 : 1.75} />
        {t.nav[it.key]}
      </Link>
    )
  })
  if (variant === "top") return <nav className="pointer-events-auto flex items-center gap-1">{items}</nav>
  return <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-stone-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden print:hidden">{items}</nav>
}
