import { Button } from "@/components/ui/button"
import { AppIcon } from "./app-icon"
import type { IconName } from "@/config/icons"
import { t } from "@/lib/i18n/bn"
import { timeAgo } from "@/lib/format"
import { cn } from "@/lib/utils"
import { statusOf, syncNow, useSync, type SyncState, type SyncStatus as Status } from "@/features/sync/sync-engine"

const VIEW: Record<Status, { icon: IconName; cls: string; label: (s: SyncState) => string }> = {
  synced: { icon: "check", cls: "text-emerald-700", label: () => t.sync.synced },
  syncing: { icon: "sync", cls: "text-stone-500 [&_svg]:animate-spin", label: () => t.sync.syncing },
  offline: { icon: "cloudOff", cls: "text-stone-500", label: (s) => t.sync.offline(s.pending ? String(s.pending) : "") },
  "needs-token": { icon: "key", cls: "bg-amber-50 text-amber-700", label: () => t.sync.needsToken },
  tampered: { icon: "warning", cls: "text-red-700", label: () => t.sync.tampered },
  revoked: { icon: "warning", cls: "text-red-700", label: () => t.sync.revoked },
  paused: { icon: "cloudOff", cls: "text-stone-500", label: () => t.sync.paused },
  error: { icon: "warning", cls: "text-amber-700", label: () => t.sync.error },
}

export function SyncStatus() {
  const s = useSync()
  const v = VIEW[statusOf(s)]
  return (
    <Button variant="ghost" size="xs" className={cn("h-8 gap-1.5 px-2", v.cls)} title={`${t.sync.lastSync}: ${s.lastSyncAt ? timeAgo(s.lastSyncAt) : t.sync.never}`} onClick={() => void syncNow()}>
      <AppIcon name={v.icon} size={16} />
      <span className="text-xs">{v.label(s)}</span>
    </Button>
  )
}
