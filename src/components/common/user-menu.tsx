import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AppIcon } from "./app-icon"
import { AvatarInitial } from "./avatar-initial"
import { ConfirmDialog } from "./confirm-dialog"
import { t } from "@/lib/i18n"
import { auth } from "@/features/google"
import { logout } from "@/features/auth/session"
import type { GoogleUser } from "@/features/google/types"

// navbar-এর অ্যাভাটার → মেনু: সেটিংস · লগ আউট (কনফার্ম মডাল)
export function UserMenu({ user }: { user: GoogleUser }) {
  const navigate = useNavigate()
  const [confirm, setConfirm] = useState(false)
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" aria-label={t.settings.account} className="hidden rounded-full focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none sm:block">
            <AvatarInitial name={user.name} size="sm" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-56">
          <DropdownMenuLabel className="flex flex-col">
            <span className="font-medium">{user.name}</span>
            <span className="text-xs font-normal text-stone-500">{user.email}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => void navigate({ to: "/settings" })}>
            <AppIcon name="settings" size={16} />
            {t.nav.settings}
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onSelect={() => setConfirm(true)}>
            <AppIcon name="logout" size={16} />
            {t.settings.signOut}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmDialog open={confirm} onOpenChange={setConfirm} title={t.settings.signOutTitle} description={t.settings.signOutDesc} confirmText={t.settings.signOut} onConfirm={() => { logout(); auth.clear(); void navigate({ to: "/login", replace: true }) }} />
    </>
  )
}
